-- Create community pet fund tables: pet profiles, photos, expenses, Givebutter
-- sponsorships, and webhook idempotency.
--
-- Load-bearing constraints:
--   animal_sponsorships.gb_transaction_id UNIQUE and givebutter_events.event_id
--   PRIMARY KEY together make webhook retries a no-op instead of a second gift.
--   animals.is_published is guarded in the app layer (owner_consent_at +
--   gb_campaign_code) rather than by a constraint, so drafts can be saved
--   before either exists.

CREATE TABLE IF NOT EXISTS animals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  age_text TEXT,
  sex TEXT,
  tagline TEXT,
  bio TEXT NOT NULL,
  story TEXT,
  needs_json TEXT,
  goal_cents INTEGER NOT NULL DEFAULT 0,
  gb_campaign_code TEXT,
  gb_campaign_url TEXT,
  gb_raised_cents INTEGER NOT NULL DEFAULT 0,
  gb_supporters INTEGER NOT NULL DEFAULT 0,
  gb_synced_at TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  is_published INTEGER NOT NULL DEFAULT 0,
  owner_consent_at TEXT,
  owner_consent_note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_animals_published ON animals(is_published, sort_order);

CREATE TABLE IF NOT EXISTS animal_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  animal_id INTEGER NOT NULL,
  photo_key TEXT NOT NULL,
  alt TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_animal_photos_animal ON animal_photos(animal_id, sort_order);

CREATE TABLE IF NOT EXISTS animal_expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  animal_id INTEGER NOT NULL,
  label TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  vendor TEXT,
  spent_on TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_animal_expenses_animal ON animal_expenses(animal_id);

CREATE TABLE IF NOT EXISTS animal_sponsorships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  animal_id INTEGER,
  gb_transaction_id TEXT NOT NULL UNIQUE,
  gb_plan_id TEXT,
  gb_campaign_code TEXT,
  amount_cents INTEGER NOT NULL,
  fee_cents INTEGER,
  donated_cents INTEGER,
  is_recurring INTEGER NOT NULL DEFAULT 0,
  donor_first_name TEXT,
  donor_last_name TEXT,
  donor_email TEXT,
  display_name TEXT,
  show_publicly INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'succeeded',
  occurred_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (animal_id) REFERENCES animals(id)
);

CREATE INDEX IF NOT EXISTS idx_animal_sponsorships_animal ON animal_sponsorships(animal_id, status);
CREATE INDEX IF NOT EXISTS idx_animal_sponsorships_email ON animal_sponsorships(donor_email);

CREATE TABLE IF NOT EXISTS givebutter_events (
  event_id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  animal_id INTEGER,
  received_at TEXT NOT NULL DEFAULT (datetime('now'))
);
