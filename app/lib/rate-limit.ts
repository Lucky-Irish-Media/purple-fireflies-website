import { getCloudflareContext } from "@opennextjs/cloudflare";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

async function getKV(): Promise<KVNamespace> {
  const { env } = await getCloudflareContext({ async: true });
  return (env as unknown as Record<string, unknown>).CACHE as KVNamespace;
}

export async function checkRateLimit(key: string): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const kv = await getKV();
    const now = Date.now();
    const cacheKey = `rate_limit:${key}`;

    const raw = await kv.get(cacheKey);
    const windowStart = now - WINDOW_MS;

    let attempts: number[] = [];
    if (raw) {
      try {
        attempts = JSON.parse(raw) as number[];
        attempts = attempts.filter((t: number) => t > windowStart);
      } catch {
        attempts = [];
      }
    }

    const allowed = attempts.length < MAX_ATTEMPTS;
    const remaining = Math.max(0, MAX_ATTEMPTS - attempts.length);

    if (allowed) {
      attempts.push(now);
      const ttl = Math.ceil(WINDOW_MS / 1000);
      await kv.put(cacheKey, JSON.stringify(attempts), { expirationTtl: ttl });
    }

    return { allowed, remaining };
  } catch {
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }
}
