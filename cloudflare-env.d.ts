interface CloudflareEnv {
  purple_fireflies_db: D1Database;
  PURPLE_FIREFLIES_KV: KVNamespace;
  EMAIL_API_KEY?: string;
  EMAIL_FROM?: string;
  EMAIL_API_URL?: string;
}
