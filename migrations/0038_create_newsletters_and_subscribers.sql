CREATE TABLE IF NOT EXISTS newsletters (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  body            TEXT NOT NULL DEFAULT '',
  excerpt         TEXT,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'sent')),
  published_at    TEXT,
  sent_at         TEXT,
  recipient_count  INTEGER NOT NULL DEFAULT 0,
  author_user_id  INTEGER,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_newsletters_status ON newsletters(status);
CREATE INDEX IF NOT EXISTS idx_newsletters_published ON newsletters(published_at);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  email            TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name             TEXT,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'unsubscribed')),
  tags             TEXT NOT NULL DEFAULT '',
  confirm_token    TEXT NOT NULL,
  unsubscribe_token TEXT NOT NULL,
  confirmed_at     TEXT,
  unsubscribed_at  TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_confirm ON newsletter_subscribers(confirm_token);
CREATE INDEX IF NOT EXISTS idx_subscribers_unsub ON newsletter_subscribers(unsubscribe_token);