ALTER TABLE meal_signups ADD COLUMN contact_method TEXT NOT NULL DEFAULT 'call'
  CHECK (contact_method IN ('call', 'text', 'email'));
