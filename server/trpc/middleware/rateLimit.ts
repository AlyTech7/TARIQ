import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { isUpstashConfigured } from "@/server/lib/env";

const redis = isUpstashConfigured()
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

export const reserveRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      prefix: "tariq:reserve",
    })
  : null;

export async function checkRateLimit(
  identifier: string,
): Promise<{ success: boolean; remaining?: number }> {
  if (!reserveRateLimit) return { success: true };
  const result = await reserveRateLimit.limit(identifier);
  return { success: result.success, remaining: result.remaining };
}
