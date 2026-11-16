-- Create donation requests, signups, and participant_programs.

CREATE TABLE IF NOT EXISTS donation_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_name TEXT NOT NULL,
  requested_qty INTEGER NOT NULL,
  unit TEXT NOT NULL DEFAULT 'items',
  notes TEXT,
  received_qty INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

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