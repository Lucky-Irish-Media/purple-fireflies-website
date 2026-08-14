-- Tracks delivery dates that admins have closed early (before reaching the signup cap).
-- A closed date behaves like a full date: new signups are routed to the waitlist.
CREATE TABLE IF NOT EXISTS closed_delivery_dates (
  delivery_date TEXT PRIMARY KEY,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
