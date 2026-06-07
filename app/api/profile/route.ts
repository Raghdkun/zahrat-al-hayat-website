import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSessionUser, unauthorized, badRequest, notFound, parseBody, serverError } from "@/lib/api";
import { updateProfileSchema } from "@/lib/validations";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return unauthorized();

    const user = await db.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, name: true, email: true, image: true, role: true },
    });

    if (!user) return notFound("User not found");

    return NextResponse.json(user);
  } catch (err) {
    return serverError("profile.GET", err);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return unauthorized();

    const parsed = await parseBody(request, updateProfileSchema);
    if ("error" in parsed) return parsed.error;
    const { name, image, currentPassword, newPassword } = parsed.data;

    const updateData: Record<string, string> = {};

    if (name !== undefined) updateData.name = name;
    if (image !== undefined && image !== null) updateData.image = image;

    if (newPassword) {
      if (!currentPassword) {
        return badRequest("Current password is required");
      }
      const user = await db.user.findUnique({ where: { id: sessionUser.id } });
      if (!user) return notFound("User not found");
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return badRequest("Current password is incorrect");
      }
      updateData.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    const updated = await db.user.update({
      where: { id: sessionUser.id },
      data: updateData,
      select: { id: true, name: true, email: true, image: true, role: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return serverError("profile.PUT", err);
  }
}
