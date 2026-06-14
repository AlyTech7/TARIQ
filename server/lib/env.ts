/** True when an env value is set and not a placeholder like "..." or "change-me". */
export function isConfiguredEnv(value: string | undefined | null): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "..." || trimmed.includes("...")) return false;
  if (trimmed === "change-me" || trimmed.startsWith("change-me-")) return false;
  return true;
}

export function isUpstashConfigured(): boolean {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return (
    isConfiguredEnv(url) &&
    isConfiguredEnv(token) &&
    url!.startsWith("https://")
  );
}

export function isRedisUrlConfigured(): boolean {
  const url = process.env.REDIS_URL;
  return (
    isConfiguredEnv(url) &&
    (url!.startsWith("redis://") || url!.startsWith("rediss://"))
  );
}
