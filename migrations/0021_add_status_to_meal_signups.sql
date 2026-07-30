ALTER TABLE meal_signups ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'out_of_range'));

CREATE INDEX IF NOT EXISTS idx_meal_signups_status ON meal_signups(status);
CREATE INDEX IF NOT EXISTS idx_meal_signups_date_status ON meal_signups(delivery_date, status);
