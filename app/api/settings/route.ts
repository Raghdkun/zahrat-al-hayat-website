import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, forbidden, parseBody, serverError } from "@/lib/api";
import { updateSettingsSchema } from "@/lib/validations";

export async function GET() {
  const settings = await db.siteSettings.findFirst({ where: { id: "default" } });
  if (!settings) {
    const created = await db.siteSettings.create({ data: { id: "default" } });
    return NextResponse.json(created);
  }
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (user?.role !== "ADMIN") return forbidden();

    const parsed = await parseBody(req, updateSettingsSchema);
    if ("error" in parsed) return parsed.error;
    const { logoUrl, facebookUrl, instagramUrl, whatsappNumber } = parsed.data;

    const settings = await db.siteSettings.upsert({
      where: { id: "default" },
      update: {
        ...(logoUrl !== undefined && { logoUrl }),
        ...(facebookUrl !== undefined && { facebookUrl }),
        ...(instagramUrl !== undefined && { instagramUrl }),
        ...(whatsappNumber !== undefined && { whatsappNumber }),
      },
      create: {
        id: "default",
        logoUrl: logoUrl ?? null,
        facebookUrl: facebookUrl ?? "",
        instagramUrl: instagramUrl ?? "",
        whatsappNumber: whatsappNumber ?? "",
      },
    });

    return NextResponse.json(settings);
  } catch (err) {
    return serverError("settings.PUT", err);
  }
}
