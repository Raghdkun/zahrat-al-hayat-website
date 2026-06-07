import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getSessionUser, forbidden, badRequest, notFound, conflict, parseBody, serverError } from "@/lib/api";
import { createUserSchema, updateUserSchema, deleteByIdSchema } from "@/lib/validations";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  image: true,
  createdAt: true,
};

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (user?.role !== "ADMIN") return forbidden();

    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get("role");
    const search = (searchParams.get("search") || "").slice(0, 100);

    const where: Record<string, unknown> = {};
    if (roleFilter && ["ADMIN", "TEACHER", "STUDENT"].includes(roleFilter)) {
      where.role = roleFilter;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await db.user.findMany({
      where,
      select: userSelect,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (err) {
    return serverError("users.GET", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (user?.role !== "ADMIN") return forbidden();

    const parsed = await parseBody(req, createUserSchema);
    if ("error" in parsed) return parsed.error;
    const { name, email, password, role: userRole } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return conflict("Email already exists");

    const passwordHash = await bcrypt.hash(password, 12);
    const created = await db.user.create({
      data: { name, email, passwordHash, role: userRole },
      select: userSelect,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return serverError("users.POST", err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (user?.role !== "ADMIN") return forbidden();

    const parsed = await parseBody(req, updateUserSchema);
    if ("error" in parsed) return parsed.error;
    const { id, name, email, password, role: userRole } = parsed.data;

    const existingUser = await db.user.findUnique({ where: { id } });
    if (!existingUser) return notFound("User not found");

    if (email && email !== existingUser.email) {
      const emailTaken = await db.user.findUnique({ where: { email } });
      if (emailTaken) return conflict("Email already exists");
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (userRole !== undefined) updateData.role = userRole;
    if (password) updateData.passwordHash = await bcrypt.hash(password, 12);

    const updated = await db.user.update({
      where: { id },
      data: updateData,
      select: userSelect,
    });

    return NextResponse.json(updated);
  } catch (err) {
    return serverError("users.PUT", err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (user?.role !== "ADMIN") return forbidden();

    const parsed = await parseBody(req, deleteByIdSchema);
    if ("error" in parsed) return parsed.error;
    const { id } = parsed.data;

    if (id === user.id) return badRequest("Cannot delete yourself");

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) return notFound("User not found");

    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError("users.DELETE", err);
  }
}
