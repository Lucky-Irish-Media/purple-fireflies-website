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
  internal_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

UPDATE delivery_assignments
SET meal_signup_id = (
  SELECT MIN(id) FROM meal_signups
  WHERE participant_id = (
    SELECT participant_id FROM meal_signups WHERE id = delivery_assignments.meal_signup_id
  )
  AND delivery_date = (
    SELECT delivery_date FROM meal_signups WHERE id = delivery_assignments.meal_signup_id
  )
)
WHERE meal_signup_id IN (
  SELECT id FROM meal_signups
  WHERE id NOT IN (
    SELECT MIN(id) FROM meal_signups GROUP BY participant_id, delivery_date
  )
);

INSERT INTO meal_signups_new (id, participant_id, regular_quantity, vegan_quantity, delivery_day, delivery_date, comments, bag_number, internal_notes, created_at)
SELECT
  MIN(id) as id,
  participant_id,
  COALESCE(SUM(CASE WHEN meal_type = 'regular' THEN quantity ELSE 0 END), 0) as regular_quantity,
  COALESCE(SUM(CASE WHEN meal_type = 'vegan' THEN quantity ELSE 0 END), 0) as vegan_quantity,
  delivery_day,
  delivery_date,
  MIN(comments) as comments,
  MIN(bag_number) as bag_number,
  MIN(internal_notes) as internal_notes,
  MIN(created_at) as created_at
FROM meal_signups
GROUP BY participant_id, delivery_date;

DROP TABLE meal_signups;
ALTER TABLE meal_signups_new RENAME TO meal_signups;

CREATE INDEX IF NOT EXISTS idx_meal_signups_participant_id ON meal_signups(participant_id);
CREATE INDEX IF NOT EXISTS idx_meal_signups_delivery_date ON meal_signups(delivery_date);

PRAGMA foreign_keys = ON;
