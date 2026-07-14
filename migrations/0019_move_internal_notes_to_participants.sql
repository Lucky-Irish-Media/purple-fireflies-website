ALTER TABLE participants ADD COLUMN internal_notes TEXT;

UPDATE participants
SET internal_notes = (
  SELECT ms.internal_notes
  FROM meal_signups ms
  WHERE ms.participant_id = participants.id
    AND ms.internal_notes IS NOT NULL
    AND ms.internal_notes != ''
  ORDER BY ms.created_at DESC
  LIMIT 1
);

PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS meal_signups_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  participant_id INTEGER NOT NULL REFERENCES participants(id),
  regular_quantity INTEGER NOT NULL DEFAULT 0,
  vegan_quantity INTEGER NOT NULL DEFAULT 0,
  delivery_day TEXT NOT NULL CHECK (delivery_day IN ('wednesday', 'thursday')),
  delivery_date TEXT NOT NULL,
  comments TEXT,
  bag_number TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO meal_signups_new (id, participant_id, regular_quantity, vegan_quantity, delivery_day, delivery_date, comments, bag_number, created_at)
SELECT id, participant_id, regular_quantity, vegan_quantity, delivery_day, delivery_date, comments, bag_number, created_at
FROM meal_signups;

DROP TABLE meal_signups;
ALTER TABLE meal_signups_new RENAME TO meal_signups;

CREATE INDEX IF NOT EXISTS idx_meal_signups_participant_id ON meal_signups(participant_id);
CREATE INDEX IF NOT EXISTS idx_meal_signups_delivery_date ON meal_signups(delivery_date);

PRAGMA foreign_keys = ON;
