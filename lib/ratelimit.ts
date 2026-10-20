import { HttpError } from "@/lib/api";

// Fixed-window limiter held in memory. It is per server instance: on serverless hosting each
// instance counts separately, so treat it as a first line of defence and pair it with the
// DB-backed checks (e.g. open orders per phone) for anything that matters.
const buckets = new Map<string, { n: number; reset: number }>();

export function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown").trim();
}

/** Throws a 429 when `key` has been used more than `limit` times within `windowMs`. */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (buckets.size > 5000) for (const [k, b] of buckets) if (b.reset < now) buckets.delete(k);
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return;
  }
  if (++b.n > limit) throw new HttpError(429, `Too many requests. Please try again in ${Math.ceil((b.reset - now) / 60000)} min.`);
}
