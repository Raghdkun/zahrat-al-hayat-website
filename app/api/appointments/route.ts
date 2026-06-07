import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, unauthorized, forbidden, notFound, parseBody, serverError } from "@/lib/api";
import { updateAppointmentSchema, deleteByIdSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorized();

    const status = req.nextUrl.searchParams.get("status");
    const statusFilter = status ? { status: status as never } : {};

    const where =
      user.role === "ADMIN"
        ? statusFilter
        : user.role === "TEACHER"
        ? { teacherId: user.id, ...statusFilter }
        : { studentId: user.id, ...statusFilter };

    const appointments = await db.appointment.findMany({
      where,
      include: {
        student: { select: { name: true, email: true } },
        teacher: { select: { name: true, email: true } },
        teacherProfile: true,
        payment: true,
      },
      orderBy: { slotDate: "desc" },
    });

    return NextResponse.json(appointments);
  } catch (err) {
    return serverError("appointments.GET", err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorized();
    if (user.role !== "ADMIN" && user.role !== "TEACHER") return forbidden();

    const parsed = await parseBody(req, updateAppointmentSchema);
    if ("error" in parsed) return parsed.error;
    const { id, status, notes, meetingLink } = parsed.data;

    // Verify existence + ownership (teachers may only touch their own).
    const apt = await db.appointment.findUnique({ where: { id } });
    if (!apt) return notFound("Appointment not found");
    if (user.role !== "ADMIN" && apt.teacherId !== user.id) return forbidden();

    const appointment = await db.appointment.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(meetingLink !== undefined && { meetingLink }),
      },
    });

    return NextResponse.json(appointment);
  } catch (err) {
    return serverError("appointments.PUT", err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (user?.role !== "ADMIN") return forbidden();

    const parsed = await parseBody(req, deleteByIdSchema);
    if ("error" in parsed) return parsed.error;

    const existing = await db.appointment.findUnique({ where: { id: parsed.data.id } });
    if (!existing) return notFound("Appointment not found");

    await db.appointment.delete({ where: { id: parsed.data.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError("appointments.DELETE", err);
  }
}
