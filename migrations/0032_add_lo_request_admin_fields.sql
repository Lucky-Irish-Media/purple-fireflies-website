-- Add admin-only status tracking and internal notes to legal observer coverage
-- requests, plus an updated_at timestamp.
--
-- SQLite only allows CONSTANT defaults on ALTER TABLE ADD COLUMN, so the
-- production D1 backend rejects `DEFAULT (datetime('now'))` on a new column.
-- Rebuild the table instead so updated_at can carry a datetime default.

PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS legal_observer_requests_new (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_name   TEXT NOT NULL,
  contact_email  TEXT NOT NULL,
  contact_phone  TEXT NOT NULL,
  event_date     TEXT NOT NULL,
  event_time     TEXT,
  event_location TEXT NOT NULL,
  event_type     TEXT,
  special_notes  TEXT,
  status         TEXT NOT NULL DEFAULT 'pending',
  internal_notes TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO legal_observer_requests_new (id, contact_name, contact_email, contact_phone, event_date, event_time, event_location, event_type, special_notes, status, internal_notes, created_at, updated_at)
SELECT id, contact_name, contact_email, contact_phone, event_date, event_time, event_location, event_type, special_notes,
       'pending', NULL, created_at, datetime('now')
FROM legal_observer_requests;

DROP TABLE legal_observer_requests;
ALTER TABLE legal_observer_requests_new RENAME TO legal_observer_requests;

PRAGMA foreign_keys = ON;