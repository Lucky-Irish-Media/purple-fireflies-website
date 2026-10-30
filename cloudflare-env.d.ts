interface CloudflareEnv {
  purple_fireflies_db: D1Database;
  PURPLE_FIREFLIES_KV: KVNamespace;
  NEWSLETTER_IMAGES: R2Bucket;
  EMAIL_API_KEY?: string;
  EMAIL_FROM?: string;
  EMAIL_API_URL?: string;
  SPRINGFIELD_BOXES_DELIVERED?: string;
  GIVEBUTTER_WIDGET_ACCOUNT_ID?: string;
}
