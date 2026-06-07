import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSessionUser, forbidden, badRequest, parseBody, serverError } from "@/lib/api";
import { createGallerySchema, updateGallerySchema } from "@/lib/validations";

export async function GET() {
  try {
    const items = await db.galleryItem.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(items);
  } catch (err) {
    return serverError("gallery.GET", err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (user?.role !== "ADMIN") return forbidden();

    const parsed = await parseBody(req, createGallerySchema);
    if ("error" in parsed) return parsed.error;
    const { url, thumbnailUrl, type, titleAr, titleEn, sortOrder, isPublished } = parsed.data;

    const item = await db.galleryItem.create({
      data: {
        url,
        thumbnailUrl: thumbnailUrl ?? null,
        type: type ?? "IMAGE",
        titleAr: titleAr ?? "",
        titleEn: titleEn ?? "",
        sortOrder: sortOrder ?? 0,
        isPublished: isPublished ?? true,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    return serverError("gallery.POST", err);
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getSessionUser();
    if (user?.role !== "ADMIN") return forbidden();

    const parsed = await parseBody(req, updateGallerySchema);
    if ("error" in parsed) return parsed.error;
    const { id, ...fields } = parsed.data;

    const item = await db.galleryItem.update({
      where: { id },
      data: {
        ...(fields.url !== undefined && { url: fields.url }),
        ...(fields.thumbnailUrl !== undefined && { thumbnailUrl: fields.thumbnailUrl }),
        ...(fields.type !== undefined && { type: fields.type }),
        ...(fields.titleAr !== undefined && { titleAr: fields.titleAr }),
        ...(fields.titleEn !== undefined && { titleEn: fields.titleEn }),
        ...(fields.sortOrder !== undefined && { sortOrder: fields.sortOrder }),
        ...(fields.isPublished !== undefined && { isPublished: fields.isPublished }),
      },
    });
    return NextResponse.json(item);
  } catch (err) {
    return serverError("gallery.PUT", err);
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getSessionUser();
    if (user?.role !== "ADMIN") return forbidden();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return badRequest("Missing id");

    await db.galleryItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError("gallery.DELETE", err);
  }
}
