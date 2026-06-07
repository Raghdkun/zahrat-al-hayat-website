/**
 * Lightweight in-memory fixed-window rate limiter.
 *
 * NOTE: state lives in the process, so it protects a single instance. For a
 * multi-instance deployment behind a load balancer, back this with a shared
 * store (e.g. Redis / Upstash) — the call sites stay the same.
 */

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

// Opportunistic cleanup so the map does not grow unbounded.
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  retryAfter: number; // seconds
}

export function rateLimit(opts: {
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const entry = store.get(opts.key);
  if (!entry || entry.resetAt <= now) {
    store.set(opts.key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (entry.count >= opts.limit) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { ok: true, retryAfter: 0 };
}

/** Best-effort client IP from common proxy headers. */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
