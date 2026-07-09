CREATE TABLE IF NOT EXISTS participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  address1 TEXT NOT NULL DEFAULT '',
  address2 TEXT,
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  zip_code TEXT NOT NULL DEFAULT '',
  contact_method TEXT NOT NULL DEFAULT 'call' CHECK (contact_method IN ('call', 'text', 'email')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

ALTER TABLE meal_signups ADD COLUMN participant_id INTEGER REFERENCES participants(id);
ALTER TABLE driver_volunteers ADD COLUMN participant_id INTEGER REFERENCES participants(id);
