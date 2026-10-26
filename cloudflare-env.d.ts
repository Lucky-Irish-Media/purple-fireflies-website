interface CloudflareEnv {
  purple_fireflies_db: D1Database;
  PURPLE_FIREFLIES_KV: KVNamespace;
  MEDIA_BUCKET: R2Bucket;
  EMAIL_API_KEY?: string;
  EMAIL_FROM?: string;
  EMAIL_API_URL?: string;
  ADMIN_EMAIL?: string;
  SPRINGFIELD_BOXES_DELIVERED?: string;
  COMMUNITY_PETS_DONATIONS_ENABLED?: string;
  NONPROFIT_STATUS?: string;
  GIVEBUTTER_WIDGET_ACCOUNT_ID?: string;
  GIVEBUTTER_API_KEY?: string;
  GIVEBUTTER_WEBHOOK_SECRET?: string;
}
