-- Allow meal deliveries to be scheduled on any day of the week so admins can add
-- signups for any date from the admin panel. The public signup forms still only
-- offer Wednesdays and Thursdays.

PRAGMA foreign_keys = OFF;

-- Rebuild meal_signups without the wednesday/thursday-only CHECK constraint.
CREATE TABLE IF NOT EXISTS meal_signups_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  participant_id INTEGER NOT NULL REFERENCES participants(id),
  regular_quantity INTEGER NOT NULL DEFAULT 0,
  vegan_quantity INTEGER NOT NULL DEFAULT 0,
  delivery_day TEXT NOT NULL CHECK (delivery_day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  delivery_date TEXT NOT NULL,
  comments TEXT,
  bag_number TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'out_of_range')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO meal_signups_new (id, participant_id, regular_quantity, vegan_quantity, delivery_day, delivery_date, comments, bag_number, status, created_at)
SELECT id, participant_id, regular_quantity, vegan_quantity,
       COALESCE(NULLIF(delivery_day, ''), lower(strftime('%A', delivery_date)), 'thursday'),
       delivery_date, comments, bag_number, status, created_at
FROM meal_signups;

DROP TABLE meal_signups;
ALTER TABLE meal_signups_new RENAME TO meal_signups;

-- Rebuild driver_volunteers the same way.
CREATE TABLE IF NOT EXISTS driver_volunteers_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  participant_id INTEGER NOT NULL REFERENCES participants(id),
  on_signal TEXT NOT NULL DEFAULT 'no' CHECK (on_signal IN ('yes', 'no', 'willing')),
  regions TEXT NOT NULL DEFAULT '',
  delivery_day TEXT NOT NULL CHECK (delivery_day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  delivery_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO driver_volunteers_new (id, participant_id, on_signal, regions, delivery_day, delivery_date, created_at)
SELECT id, participant_id, on_signal, regions,
       COALESCE(NULLIF(delivery_day, ''), lower(strftime('%A', delivery_date)), 'thursday'),
       delivery_date, created_at
FROM driver_volunteers;

DROP TABLE driver_volunteers;
ALTER TABLE driver_volunteers_new RENAME TO driver_volunteers;

-- Correct any existing rows whose stored delivery_day doesn't match the actual date
-- (previously any non-Wednesday was stored as 'thursday'). Uses strftime('%w')
-- which follows SQLite convention (0 = Sunday). COALESCE keeps the stored value
-- when the date can't be parsed.
UPDATE meal_signups
SET delivery_day = COALESCE(
  CASE strftime('%w', delivery_date)
    WHEN '0' THEN 'sunday'
    WHEN '1' THEN 'monday'
    WHEN '2' THEN 'tuesday'
    WHEN '3' THEN 'wednesday'
    WHEN '4' THEN 'thursday'
    WHEN '5' THEN 'friday'
    WHEN '6' THEN 'saturday'
  END,
  delivery_day
)
WHERE delivery_date != '';

UPDATE driver_volunteers
SET delivery_day = COALESCE(
  CASE strftime('%w', delivery_date)
    WHEN '0' THEN 'sunday'
    WHEN '1' THEN 'monday'
    WHEN '2' THEN 'tuesday'
    WHEN '3' THEN 'wednesday'
    WHEN '4' THEN 'thursday'
    WHEN '5' THEN 'friday'
    WHEN '6' THEN 'saturday'
  END,
  delivery_day
)
WHERE delivery_date != '';

-- Recreate indexes.
CREATE INDEX IF NOT EXISTS idx_meal_signups_participant_id ON meal_signups(participant_id);
CREATE INDEX IF NOT EXISTS idx_meal_signups_delivery_date ON meal_signups(delivery_date);
CREATE INDEX IF NOT EXISTS idx_meal_signups_participant_date_unique ON meal_signups(participant_id, delivery_date);
CREATE INDEX IF NOT EXISTS idx_meal_signups_status ON meal_signups(status);
CREATE INDEX IF NOT EXISTS idx_meal_signups_date_status ON meal_signups(delivery_date, status);
CREATE INDEX IF NOT EXISTS idx_driver_volunteers_participant_id ON driver_volunteers(participant_id);
CREATE INDEX IF NOT EXISTS idx_driver_volunteers_delivery_day ON driver_volunteers(delivery_day);
CREATE INDEX IF NOT EXISTS idx_driver_volunteers_delivery_date ON driver_volunteers(delivery_date);
CREATE INDEX IF NOT EXISTS idx_driver_volunteers_created_at ON driver_volunteers(created_at DESC);

PRAGMA foreign_keys = ON;
