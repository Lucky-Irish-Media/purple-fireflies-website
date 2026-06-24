ALTER TABLE meal_signups ADD COLUMN delivery_date TEXT NOT NULL DEFAULT '';

UPDATE meal_signups SET delivery_date = date(created_at) WHERE delivery_date = '';

CREATE INDEX IF NOT EXISTS idx_meal_signups_delivery_date ON meal_signups(delivery_date);