import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { createAppointmentNotifications } from "@/lib/notifications";
import { sendAppointmentConfirmationEmail, sendTeacherNotificationEmail } from "@/lib/resend";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    console.error("[payments.webhook] signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const appointmentId = session.metadata?.appointmentId;

    if (!appointmentId) return NextResponse.json({ received: true });

    try {
      // Idempotency: Stripe retries webhooks. If this payment is already PAID,
      // don't re-confirm or re-send notifications/emails.
      const existingPayment = await db.payment.findUnique({
        where: { appointmentId },
        select: { status: true },
      });
      if (existingPayment?.status === "PAID") {
        return NextResponse.json({ received: true });
      }

      // Update appointment to CONFIRMED
      const appointment = await db.appointment.update({
        where: { id: appointmentId },
        data: { status: "CONFIRMED" },
        include: {
          student: true,
          teacher: true,
        },
      });

      // Update payment to PAID
      await db.payment.update({
        where: { appointmentId },
        data: {
          status: "PAID",
          stripePaymentIntentId: session.payment_intent as string,
        },
      });

      // Create in-app notifications
      await createAppointmentNotifications(appointmentId);

      // Send emails
      const emailData = {
        studentName: appointment.student.name,
        teacherName: appointment.teacher.name,
        date: appointment.slotDate.toLocaleDateString("ar-SY"),
        time: appointment.slotTime,
        amount: appointment.amountPaid ?? 0,
        currency: appointment.currency,
      };

      await Promise.allSettled([
        sendAppointmentConfirmationEmail(appointment.student.email, emailData, "ar"),
        sendTeacherNotificationEmail(appointment.teacher.email, emailData, "ar"),
      ]);
    } catch (err) {
      console.error("[payments.webhook.completed]", err instanceof Error ? err.message : "unknown error");
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    const appointmentId = session.metadata?.appointmentId;
    if (appointmentId) {
      try {
        // Don't override an already-completed payment.
        const payment = await db.payment.findUnique({
          where: { appointmentId },
          select: { status: true },
        });
        if (payment?.status !== "PAID") {
          await db.appointment.update({
            where: { id: appointmentId },
            data: { status: "CANCELLED" },
          });
          await db.payment.update({
            where: { appointmentId },
            data: { status: "FAILED" },
          });
        }
      } catch (err) {
        console.error("[payments.webhook.expired]", err instanceof Error ? err.message : "unknown error");
      }
    }
  }

  return NextResponse.json({ received: true });
}
