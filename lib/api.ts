import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { z } from "zod";

export type Role = "ADMIN" | "TEACHER" | "STUDENT";

export interface SessionUser {
  id: string;
  role: Role;
  email?: string | null;
  name?: string | null;
}

/**
 * Resolve the authenticated user from the session, with a typed role.
 * Returns null when there is no valid session.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  const id = session?.user?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!id || !role) return null;
  if (role !== "ADMIN" && role !== "TEACHER" && role !== "STUDENT") return null;
  return {
    id,
    role,
    email: session?.user?.email,
    name: session?.user?.name,
  };
}

// --- Standard JSON responses (no internal detail leakage) ---

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export function badRequest(message = "Invalid request") {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function conflict(message = "Conflict") {
  return NextResponse.json({ error: message }, { status: 409 });
}

export function tooManyRequests(retryAfter: number) {
  return NextResponse.json(
    { error: "Too many requests" },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}

/**
 * Generic 500 that never leaks the underlying error to the client.
 * The real error is logged server-side with a short, non-sensitive context tag.
 */
export function serverError(context: string, err: unknown) {
  console.error(`[${context}]`, err instanceof Error ? err.message : "unknown error");
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

/**
 * Parse and validate a JSON request body against a Zod schema.
 * Returns either the typed data or a ready-to-send error response.
 */
export async function parseBody<T extends z.ZodTypeAny>(
  req: Request,
  schema: T
): Promise<{ data: z.infer<T> } | { error: NextResponse }> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return { error: badRequest("Invalid JSON body") };
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    const issues = result.error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    return {
      error: NextResponse.json(
        // Surface the first specific message as `error` so existing clients that
        // display `data.error` show something actionable (e.g. the password rule).
        { error: issues[0]?.message ?? "Validation failed", issues },
        { status: 400 }
      ),
    };
  }
  return { data: result.data };
}

/** Validate query/search params against a Zod schema. */
export function parseQuery<T extends z.ZodTypeAny>(
  searchParams: URLSearchParams,
  schema: T
): { data: z.infer<T> } | { error: NextResponse } {
  const result = schema.safeParse(Object.fromEntries(searchParams.entries()));
  if (!result.success) {
    return { error: badRequest("Invalid query parameters") };
  }
  return { data: result.data };
}
