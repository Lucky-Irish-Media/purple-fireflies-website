-- 0029_create_legal_observers.sql
CREATE TABLE IF NOT EXISTS legal_observer_signups (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT NOT NULL,
  background   TEXT,
  motivation   TEXT,
  skills       TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_legal_observer_signups_email ON legal_observer_signups(email);
CREATE INDEX IF NOT EXISTS idx_legal_observer_signups_created ON legal_observer_signups(created_at);

CREATE TABLE IF NOT EXISTS legal_observer_requests (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_name  TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  event_date    TEXT NOT NULL,
  event_time    TEXT,
  event_location TEXT NOT NULL,
  event_type    TEXT,
  special_notes TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_legal_observer_requests_event_date ON legal_observer_requests(event_date);
CREATE INDEX IF NOT EXISTS idx_legal_observer_requests_created ON legal_observer_requests(created_at);
