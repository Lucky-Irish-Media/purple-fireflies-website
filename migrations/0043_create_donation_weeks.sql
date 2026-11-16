-- Create donation weeks, requests, signups, and participant_programs.

CREATE TABLE IF NOT EXISTS donation_weeks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_start_date TEXT NOT NULL,
  title TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  dropoff_location TEXT,
  dropoff_hours TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_donation_weeks_week_start_date ON donation_weeks(week_start_date);
CREATE INDEX IF NOT EXISTS idx_donation_weeks_status ON donation_weeks(status);

CREATE TABLE IF NOT EXISTS donation_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_id INTEGER NOT NULL REFERENCES donation_weeks(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  requested_qty INTEGER NOT NULL,
  unit TEXT NOT NULL DEFAULT 'items',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_donation_requests_week_id ON donation_requests(week_id);

CREATE TABLE IF NOT EXISTS donation_signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER NOT NULL REFERENCES donation_requests(id) ON DELETE CASCADE,
  participant_id INTEGER NOT NULL REFERENCES participants(id),
  quantity_pledged INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_donation_signups_request_id ON donation_signups(request_id);
CREATE INDEX IF NOT EXISTS idx_donation_signups_participant_id ON donation_signups(participant_id);
CREATE INDEX IF NOT EXISTS idx_donation_signups_status ON donation_signups(status);

CREATE TABLE IF NOT EXISTS participant_programs (
  participant_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  program TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (participant_id, program)
);