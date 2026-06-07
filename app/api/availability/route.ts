import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { parseQuery, badRequest, serverError } from "@/lib/api";
import { availabilityQuerySchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = parseQuery(searchParams, availabilityQuerySchema);
    if ("error" in parsed) return parsed.error;
    const { teacherId, date } = parsed.data;

    const day = new Date(date + "T00:00:00");
    if (Number.isNaN(day.getTime())) return badRequest("Invalid date");
    const dayOfWeek = day.getDay();

    const availability = await db.availability.findMany({
      where: { teacherId, dayOfWeek, isActive: true },
    });

    // Get already booked slots for that date
    const booked = await db.appointment.findMany({
      where: {
        teacherProfileId: teacherId,
        slotDate: day,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: { slotTime: true },
    });

    const bookedTimes = new Set(booked.map((a) => a.slotTime));

    // Generate slots
    const slots: string[] = [];
    for (const avail of availability) {
      const [startH, startM] = avail.startTime.split(":").map(Number);
      const [endH, endM] = avail.endTime.split(":").map(Number);
      let current = startH * 60 + startM;
      const end = endH * 60 + endM;
      while (current + avail.slotDuration <= end) {
        const h = Math.floor(current / 60).toString().padStart(2, "0");
        const m = (current % 60).toString().padStart(2, "0");
        const time = `${h}:${m}`;
        if (!bookedTimes.has(time)) slots.push(time);
        current += avail.slotDuration;
      }
    }

    return NextResponse.json(slots);
  } catch (err) {
    return serverError("availability.GET", err);
  }
}
