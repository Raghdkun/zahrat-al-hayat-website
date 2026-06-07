import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSessionUser, unauthorized, notFound, conflict, parseBody, serverError, tooManyRequests } from "@/lib/api";
import { createCheckoutSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorized();

    const rl = rateLimit({ key: `checkout:${user.id}`, limit: 10, windowMs: 60_000 });
    if (!rl.ok) return tooManyRequests(rl.retryAfter);

    const parsed = await parseBody(req, createCheckoutSchema);
    if ("error" in parsed) return parsed.error;
    const { teacherProfileId, slotDate, slotTime, durationMinutes = 60 } = parsed.data;

    const teacherProfile = await db.teacherProfile.findUnique({
      where: { id: teacherProfileId },
      include: { user: true },
    });

    if (!teacherProfile || !teacherProfile.isActive) {
      return notFound("Teacher not found");
    }

    const slotDateOnly = new Date(slotDate.split("T")[0] + "T00:00:00");
    if (Number.isNaN(slotDateOnly.getTime())) {
      return NextResponse.json({ error: "Invalid slot date" }, { status: 400 });
    }

    const amount = Math.round(teacherProfile.hourlyRate * 100); // cents

    // Create the pending appointment with a double-booking guard. The unique
    // index on (teacherProfileId, slotDate, slotTime) for active appointments
    // makes this race-safe even under concurrent requests.
    let appointment;
    try {
      appointment = await db.$transaction(async (tx) => {
        const clash = await tx.appointment.findFirst({
          where: {
            teacherProfileId,
            slotDate: slotDateOnly,
            slotTime,
            status: { in: ["PENDING", "CONFIRMED"] },
          },
          select: { id: true },
        });
        if (clash) throw new SlotTakenError();

        return tx.appointment.create({
          data: {
            studentId: user.id,
            teacherId: teacherProfile.userId,
            teacherProfileId,
            slotDate: slotDateOnly,
            slotTime,
            durationMinutes,
            status: "PENDING",
            amountPaid: teacherProfile.hourlyRate,
            currency: teacherProfile.currency,
          },
        });
      });
    } catch (e) {
      if (
        e instanceof SlotTakenError ||
        (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      ) {
        return conflict("This time slot is no longer available");
      }
      throw e;
    }

    // Create Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: teacherProfile.currency.toLowerCase(),
            product_data: {
              name: `Consultation with ${teacherProfile.user.name}`,
              description: `${slotDate} at ${slotTime} (${durationMinutes} min)`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId: appointment.id,
        studentId: user.id,
        teacherId: teacherProfile.userId,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/ar/book/success?appointment=${appointment.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/ar/book/cancel?appointment=${appointment.id}`,
    });

    await db.appointment.update({
      where: { id: appointment.id },
      data: { stripeSessionId: checkoutSession.id },
    });

    await db.payment.create({
      data: {
        appointmentId: appointment.id,
        stripeSessionId: checkoutSession.id,
        amount: teacherProfile.hourlyRate,
        currency: teacherProfile.currency,
        status: "PENDING",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    return serverError("payments.create-session", err);
  }
}

class SlotTakenError extends Error {}
