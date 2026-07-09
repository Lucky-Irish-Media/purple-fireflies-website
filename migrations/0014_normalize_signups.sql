PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS meal_signups_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  participant_id INTEGER NOT NULL REFERENCES participants(id),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('regular', 'vegan')),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity IN (1, 2)),
  delivery_day TEXT NOT NULL CHECK (delivery_day IN ('wednesday', 'thursday')),
  delivery_date TEXT NOT NULL,
  comments TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO meal_signups_new (id, participant_id, meal_type, quantity, delivery_day, delivery_date, comments, created_at)
SELECT id, participant_id, meal_type, quantity, delivery_day, delivery_date, comments, created_at
FROM meal_signups;

DROP TABLE meal_signups;
ALTER TABLE meal_signups_new RENAME TO meal_signups;

CREATE TABLE IF NOT EXISTS driver_volunteers_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  participant_id INTEGER NOT NULL REFERENCES participants(id),
  on_signal TEXT NOT NULL DEFAULT 'no' CHECK (on_signal IN ('yes', 'no', 'willing')),
  regions TEXT NOT NULL DEFAULT '',
  delivery_day TEXT NOT NULL CHECK (delivery_day IN ('wednesday', 'thursday')),
  delivery_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO driver_volunteers_new (id, participant_id, on_signal, regions, delivery_day, delivery_date, created_at)
SELECT id, participant_id, on_signal, regions, delivery_day, delivery_date, created_at
FROM driver_volunteers;

DROP TABLE driver_volunteers;
ALTER TABLE driver_volunteers_new RENAME TO driver_volunteers;

CREATE INDEX IF NOT EXISTS idx_meal_signups_participant_id ON meal_signups(participant_id);
CREATE INDEX IF NOT EXISTS idx_driver_volunteers_participant_id ON driver_volunteers(participant_id);

PRAGMA foreign_keys = ON;
