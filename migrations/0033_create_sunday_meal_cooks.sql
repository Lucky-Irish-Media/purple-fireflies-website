-- 0033_create_sunday_meal_cooks.sql
CREATE TABLE IF NOT EXISTS sunday_meal_cooks (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT NOT NULL,
  availability    TEXT NOT NULL DEFAULT '[]',
  cooking_details TEXT,
  dietary_notes   TEXT,
  servings        INTEGER,
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'active',
  internal_notes  TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sunday_meal_cooks_email ON sunday_meal_cooks(email);
CREATE INDEX IF NOT EXISTS idx_sunday_meal_cooks_created ON sunday_meal_cooks(created_at);
CREATE INDEX IF NOT EXISTS idx_sunday_meal_cooks_status ON sunday_meal_cooks(status);
