// lib/rateLimit.js
// Server-only, in-memory fixed-window rate limiter.
//
// LIMITATION: state lives in this serverless instance's memory. On Vercel each warm
// instance keeps its own counters and a cold start resets them, so this caps casual
// abuse and runaway scripts hitting one instance — it is NOT a hard global limit.
// For a hard limit, back this with a shared store (Vercel KV / Upstash Redis) and
// keep the same rateLimit(key) interface.

const buckets = new Map();
const MAX_TRACKED_KEYS = 10_000;

/**
 * Counts one hit for `key`. Returns { allowed, retryAfterSeconds }.
 * @param {string} key       e.g. "chatbot:<ip>"
 * @param {number} limit     max hits per window
 * @param {number} windowMs  window length in ms
 */
export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    if (buckets.size >= MAX_TRACKED_KEYS) pruneExpired(now);
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

function pruneExpired(now) {
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
  // Still full (e.g. a flood of distinct IPs): drop the oldest entries.
  if (buckets.size >= MAX_TRACKED_KEYS) {
    const excess = buckets.size - MAX_TRACKED_KEYS + 1;
    let i = 0;
    for (const key of buckets.keys()) {
      if (i++ >= excess) break;
      buckets.delete(key);
    }
  }
}

/** Best-effort client IP. On Vercel, x-forwarded-for is set by the platform edge. */
export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
