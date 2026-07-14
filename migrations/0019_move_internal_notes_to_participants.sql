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
