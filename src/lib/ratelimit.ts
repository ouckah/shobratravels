import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasUpstash ? Redis.fromEnv() : null;

function makeLimiter(tokens: number, window: `${number} ${"s" | "m" | "h" | "d"}`) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window),
    analytics: false,
    prefix: "st_rl",
  });
}

// Public, anonymous endpoints — tuned for a boutique site with low real volume.
export const limiters = {
  // Payment + DB write — very strict
  register: makeLimiter(3, "10 m"),
  // Contact form
  contact: makeLimiter(5, "10 m"),
  // Reviews
  review: makeLimiter(3, "1 h"),
  // Admin login — brute force defense
  adminLogin: makeLimiter(5, "10 m"),
};

export function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export async function checkLimit(
  limiter: Ratelimit | null,
  key: string,
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  if (!limiter) return { ok: true }; // no-op fallback in dev
  const res = await limiter.limit(key);
  if (res.success) return { ok: true };
  const retryAfterSec = Math.max(1, Math.ceil((res.reset - Date.now()) / 1000));
  return { ok: false, retryAfterSec };
}
