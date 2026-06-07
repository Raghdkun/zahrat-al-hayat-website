import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, forbidden, parseBody, serverError } from "@/lib/api";
import { createBlogSchema, updateBlogSchema, deleteByIdSchema } from "@/lib/validations";
import { sanitizeRichText } from "@/lib/sanitize";

export async function GET(request: NextRequest) {
  try {
    const publishedOnly = request.nextUrl.searchParams.get("published");
    const slug = request.nextUrl.searchParams.get("slug");

    if (slug) {
      const post = await db.blogPost.findFirst({
        where: {
          OR: [{ slugAr: slug }, { slugEn: slug }],
        },
      });
      if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
      // Defense in depth: sanitize on output too (covers any legacy content
      // stored before write-time sanitization existed).
      return NextResponse.json({
        ...post,
        contentAr: sanitizeRichText(post.contentAr),
        contentEn: sanitizeRichText(post.contentEn),
      });
    }

    const where = publishedOnly === "true" ? { isPublished: true } : {};
    const posts = await db.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(posts);
  } catch (err) {
    return serverError("blog.GET", err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (user?.role !== "ADMIN") return forbidden();

    const parsed = await parseBody(request, createBlogSchema);
    if ("error" in parsed) return parsed.error;
    const { titleAr, titleEn, excerptAr, excerptEn, contentAr, contentEn, coverImage, authorName, isPublished } = parsed.data;

    const suffix = Date.now().toString(36);
    const slugAr = generateSlug(titleAr || titleEn || "post") + "-" + suffix;
    const slugEn = generateSlug(titleEn || titleAr || "post") + "-" + suffix;

    const post = await db.blogPost.create({
      data: {
        titleAr: titleAr ?? "",
        titleEn: titleEn ?? "",
        slugAr,
        slugEn,
        excerptAr: excerptAr ?? "",
        excerptEn: excerptEn ?? "",
        contentAr: contentAr ? sanitizeRichText(contentAr) : "",
        contentEn: contentEn ? sanitizeRichText(contentEn) : "",
        coverImage: coverImage ?? null,
        authorName: authorName ?? "",
        isPublished: isPublished ?? false,
        publishedAt: isPublished ? new Date() : null,
      },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    return serverError("blog.POST", err);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (user?.role !== "ADMIN") return forbidden();

    const parsed = await parseBody(request, updateBlogSchema);
    if ("error" in parsed) return parsed.error;
    const { id, titleAr, titleEn, excerptAr, excerptEn, contentAr, contentEn, coverImage, authorName, isPublished } = parsed.data;

    const existing = await db.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {
      ...(titleAr !== undefined && { titleAr }),
      ...(titleEn !== undefined && { titleEn }),
      ...(excerptAr !== undefined && { excerptAr }),
      ...(excerptEn !== undefined && { excerptEn }),
      ...(contentAr !== undefined && { contentAr: sanitizeRichText(contentAr) }),
      ...(contentEn !== undefined && { contentEn: sanitizeRichText(contentEn) }),
      ...(coverImage !== undefined && { coverImage }),
      ...(authorName !== undefined && { authorName }),
      ...(isPublished !== undefined && { isPublished }),
    };

    if (isPublished && !existing.publishedAt) {
      data.publishedAt = new Date();
    }

    const post = await db.blogPost.update({ where: { id }, data });
    return NextResponse.json(post);
  } catch (err) {
    return serverError("blog.PUT", err);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (user?.role !== "ADMIN") return forbidden();

    const parsed = await parseBody(request, deleteByIdSchema);
    if ("error" in parsed) return parsed.error;

    await db.blogPost.delete({ where: { id: parsed.data.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError("blog.DELETE", err);
  }
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 60);
}
