CREATE TABLE IF NOT EXISTS waitlist (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  participant_id  INTEGER NOT NULL REFERENCES participants(id),
  delivery_date   TEXT NOT NULL,
  regular_quantity INTEGER NOT NULL DEFAULT 0,
  vegan_quantity  INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'converted', 'expired')),
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_waitlist_date_status ON waitlist(delivery_date, status);
CREATE INDEX IF NOT EXISTS idx_waitlist_participant_date ON waitlist(participant_id, delivery_date);
