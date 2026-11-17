-- Create volunteer days and kitchen volunteer signups for Winter Food Drive.
CREATE TABLE IF NOT EXISTS volunteer_days (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  title TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_volunteer_days_date ON volunteer_days(date);
CREATE INDEX IF NOT EXISTS idx_volunteer_days_status ON volunteer_days(status);

CREATE TABLE IF NOT EXISTS volunteer_signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_id INTEGER NOT NULL REFERENCES volunteer_days(id) ON DELETE CASCADE,
  participant_id INTEGER NOT NULL REFERENCES participants(id),
  role TEXT NOT NULL CHECK (role IN ('cooking', 'cleaning', 'packing')),
  is_group INTEGER NOT NULL DEFAULT 0,
  group_name TEXT,
  headcount INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_volunteer_signups_day_id ON volunteer_signups(day_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_signups_participant_id ON volunteer_signups(participant_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_signups_role ON volunteer_signups(role);
CREATE INDEX IF NOT EXISTS idx_volunteer_signups_status ON volunteer_signups(status);