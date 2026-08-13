import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { parseBody, conflict, serverError, tooManyRequests } from "@/lib/api";
import { registerSchema } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Public self-registration. Always creates a STUDENT (booking access only,
// never dashboard). Rate-limited by IP to deter abuse.
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit({ key: `register:${ip}`, limit: 5, windowMs: 60 * 60_000 });
    if (!rl.ok) return tooManyRequests(rl.retryAfter);

    const parsed = await parseBody(req, registerSchema);
    if ("error" in parsed) return parsed.error;

    const name = parsed.data.name.trim();
    const email = parsed.data.email.trim().toLowerCase();
    const { password } = parsed.data;

    const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) return conflict("Email already registered");

    const passwordHash = await bcrypt.hash(password, 12);
    await db.user.create({
      data: { name, email, passwordHash, role: "STUDENT" },
      select: { id: true },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    return serverError("register", err);
  }
}

export const dynamic = "force-dynamic";
