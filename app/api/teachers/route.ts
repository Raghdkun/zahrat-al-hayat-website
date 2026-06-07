import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSessionUser, forbidden, notFound, conflict, parseBody, serverError } from "@/lib/api";
import { createTeacherSchema, updateTeacherSchema, deleteByIdSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const active = request.nextUrl.searchParams.get("active");
    const where = active === "true" ? { isActive: true } : {};

    const teachers = await db.teacherProfile.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, image: true } },
        availability: { where: { isActive: true } },
      },
    });
    return NextResponse.json(teachers);
  } catch (err) {
    return serverError("teachers.GET", err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (user?.role !== "ADMIN") return forbidden();

    const parsed = await parseBody(request, createTeacherSchema);
    if ("error" in parsed) return parsed.error;
    const { name, email, password, bioAr, bioEn, specialties, avatarUrl, hourlyRate, currency, availability } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return conflict("Email already in use");

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { name, email, passwordHash, role: "TEACHER" },
      });

      const profile = await tx.teacherProfile.create({
        data: {
          userId: newUser.id,
          bioAr: bioAr ?? "",
          bioEn: bioEn ?? "",
          specialties: specialties ?? [],
          avatarUrl: avatarUrl ?? null,
          hourlyRate: hourlyRate ?? 0,
          currency: currency ?? "USD",
        },
      });

      if (availability && availability.length > 0) {
        await tx.availability.createMany({
          data: availability.map((slot) => ({
            teacherId: profile.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            slotDuration: slot.slotDuration ?? 60,
          })),
        });
      }

      return tx.teacherProfile.findUnique({
        where: { id: profile.id },
        include: {
          user: { select: { name: true, email: true, image: true } },
          availability: true,
        },
      });
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return serverError("teachers.POST", err);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (user?.role !== "ADMIN") return forbidden();

    const parsed = await parseBody(request, updateTeacherSchema);
    if ("error" in parsed) return parsed.error;
    const { id, name, email, bioAr, bioEn, specialties, avatarUrl, hourlyRate, currency, isActive, availability } = parsed.data;

    const profile = await db.teacherProfile.findUnique({ where: { id }, select: { userId: true } });
    if (!profile) return notFound("Teacher not found");

    if (email) {
      const existing = await db.user.findFirst({ where: { email, NOT: { id: profile.userId } } });
      if (existing) return conflict("Email already in use");
    }

    const result = await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: profile.userId },
        data: {
          ...(name !== undefined && { name }),
          ...(email !== undefined && { email }),
        },
      });

      await tx.teacherProfile.update({
        where: { id },
        data: {
          ...(bioAr !== undefined && { bioAr }),
          ...(bioEn !== undefined && { bioEn }),
          ...(specialties !== undefined && { specialties }),
          ...(avatarUrl !== undefined && { avatarUrl }),
          ...(hourlyRate !== undefined && { hourlyRate }),
          ...(currency !== undefined && { currency }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      if (availability) {
        await tx.availability.deleteMany({ where: { teacherId: id } });
        if (availability.length > 0) {
          await tx.availability.createMany({
            data: availability.map((slot) => ({
              teacherId: id,
              dayOfWeek: slot.dayOfWeek,
              startTime: slot.startTime,
              endTime: slot.endTime,
              slotDuration: slot.slotDuration ?? 60,
            })),
          });
        }
      }

      return tx.teacherProfile.findUnique({
        where: { id },
        include: {
          user: { select: { name: true, email: true, image: true } },
          availability: true,
        },
      });
    });

    return NextResponse.json(result);
  } catch (err) {
    return serverError("teachers.PUT", err);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (user?.role !== "ADMIN") return forbidden();

    const parsed = await parseBody(request, deleteByIdSchema);
    if ("error" in parsed) return parsed.error;
    const { id } = parsed.data;

    const profile = await db.teacherProfile.findUnique({ where: { id } });
    if (!profile) return notFound("Teacher not found");

    await db.teacherProfile.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError("teachers.DELETE", err);
  }
}
