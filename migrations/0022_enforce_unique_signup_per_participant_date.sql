-- Remove duplicate signups, keeping the earliest id per participant + delivery date.
-- Any delivery assignments referencing removed rows are cascade-deleted via the FK.
DELETE FROM meal_signups
WHERE id NOT IN (
  SELECT MIN(id)
  FROM meal_signups
  GROUP BY participant_id, delivery_date
);

-- Enforce one signup per participant per delivery date regardless of entry point.
CREATE UNIQUE INDEX IF NOT EXISTS idx_meal_signups_participant_date_unique ON meal_signups(participant_id, delivery_date);
