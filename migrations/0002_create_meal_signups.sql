CREATE TABLE IF NOT EXISTS meal_signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('regular', 'vegan')),
  delivery_day TEXT NOT NULL CHECK (delivery_day IN ('wednesday', 'thursday')),
  comments TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_meal_signups_delivery_day ON meal_signups(delivery_day);
CREATE INDEX IF NOT EXISTS idx_meal_signups_meal_type ON meal_signups(meal_type);
CREATE INDEX IF NOT EXISTS idx_meal_signups_created_at ON meal_signups(created_at DESC);