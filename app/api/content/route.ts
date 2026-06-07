import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSessionUser, forbidden, parseBody, serverError } from "@/lib/api";
import { createContentSchema, updateContentSchema, deleteByIdSchema } from "@/lib/validations";

export async function GET() {
  try {
    const content = await db.contentBlock.findMany({
      orderBy: [{ section: "asc" }, { sortOrder: "asc" }],
    });
    return NextResponse.json(content);
  } catch (err) {
    return serverError("content.GET", err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (user?.role !== "ADMIN") return forbidden();

    const parsed = await parseBody(req, createContentSchema);
    if ("error" in parsed) return parsed.error;
    const { key, valueAr, valueEn, imageUrl, section, sortOrder } = parsed.data;

    const block = await db.contentBlock.create({
      data: {
        key,
        valueAr: valueAr ?? "",
        valueEn: valueEn ?? "",
        imageUrl: imageUrl ?? null,
        section: section ?? "general",
        sortOrder: sortOrder ?? 0,
      },
    });
    return NextResponse.json(block, { status: 201 });
  } catch (err) {
    return serverError("content.POST", err);
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getSessionUser();
    if (user?.role !== "ADMIN") return forbidden();

    const parsed = await parseBody(req, updateContentSchema);
    if ("error" in parsed) return parsed.error;
    const { id, valueAr, valueEn, imageUrl, sortOrder, section } = parsed.data;

    const block = await db.contentBlock.update({
      where: { id },
      data: {
        ...(valueAr !== undefined && { valueAr }),
        ...(valueEn !== undefined && { valueEn }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(section !== undefined && { section }),
      },
    });
    return NextResponse.json(block);
  } catch (err) {
    return serverError("content.PUT", err);
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getSessionUser();
    if (user?.role !== "ADMIN") return forbidden();

    const parsed = await parseBody(req, deleteByIdSchema);
    if ("error" in parsed) return parsed.error;

    await db.contentBlock.delete({ where: { id: parsed.data.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError("content.DELETE", err);
  }
}
