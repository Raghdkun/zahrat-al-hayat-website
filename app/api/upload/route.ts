import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getSessionUser, unauthorized, forbidden, badRequest, serverError, tooManyRequests } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Map of canonical media type -> { ext, kind }. The type is determined from the
 * file's magic bytes (below), NOT from the client-supplied MIME type or
 * filename, so a "evil.html" with a spoofed image/jpeg header cannot be saved
 * with an executable/HTML extension.
 */
const SIGNATURES: { ext: string; kind: "IMAGE" | "VIDEO"; match: (b: Buffer) => boolean }[] = [
  { ext: ".jpg", kind: "IMAGE", match: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: ".png", kind: "IMAGE", match: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { ext: ".gif", kind: "IMAGE", match: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38 },
  {
    ext: ".webp",
    kind: "IMAGE",
    match: (b) =>
      b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP",
  },
  { ext: ".mp4", kind: "VIDEO", match: (b) => b.toString("ascii", 4, 8) === "ftyp" },
  { ext: ".webm", kind: "VIDEO", match: (b) => b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3 },
];

function detect(buffer: Buffer) {
  for (const sig of SIGNATURES) {
    if (sig.match(buffer)) return sig;
  }
  return null;
}

export async function POST(req: Request) {
  try {
    // Auth: only authenticated staff (ADMIN/TEACHER) may upload.
    const user = await getSessionUser();
    if (!user) return unauthorized();
    if (user.role !== "ADMIN" && user.role !== "TEACHER") return forbidden();

    // Rate limit per user to prevent disk-fill abuse.
    const rl = rateLimit({ key: `upload:${user.id}`, limit: 30, windowMs: 60_000 });
    if (!rl.ok) return tooManyRequests(rl.retryAfter);

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return badRequest("No file provided");
    }
    if (file.size > MAX_FILE_SIZE) {
      return badRequest("File too large (max 50MB)");
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate by content, not by client-claimed type/extension.
    const sig = detect(buffer);
    if (!sig) {
      return badRequest("Unsupported or invalid file (allowed: jpg, png, gif, webp, mp4, webm)");
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const safeName = `${crypto.randomUUID()}${sig.ext}`;
    const filePath = path.join(UPLOAD_DIR, safeName);
    await writeFile(filePath, buffer);

    return NextResponse.json({ url: `/uploads/${safeName}`, type: sig.kind });
  } catch (err) {
    return serverError("upload", err);
  }
}

// Avoid Next trying to statically optimize; uploads are always dynamic.
export const dynamic = "force-dynamic";
