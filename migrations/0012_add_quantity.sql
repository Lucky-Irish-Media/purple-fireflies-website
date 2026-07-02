ALTER TABLE meal_signups ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1
  CHECK (quantity IN (1, 2));
