-- Rebuild users table to add 'meal_coordinator' role.
-- SQLite can't alter a CHECK constraint, so rebuild. No FK references point at users, so this is safe.

PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'member', 'volunteer', 'meal_coordinator')),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'pending')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO users_new (id, email, name, password_hash, role, status, created_at)
SELECT id, email, name, password_hash, role, status, created_at
FROM users;

DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

PRAGMA foreign_keys = ON;