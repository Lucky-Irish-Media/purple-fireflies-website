CREATE TABLE IF NOT EXISTS driver_volunteers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  delivery_day TEXT NOT NULL CHECK (delivery_day IN ('wednesday', 'thursday')),
  delivery_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_driver_volunteers_delivery_day ON driver_volunteers(delivery_day);
CREATE INDEX IF NOT EXISTS idx_driver_volunteers_delivery_date ON driver_volunteers(delivery_date);
CREATE INDEX IF NOT EXISTS idx_driver_volunteers_created_at ON driver_volunteers(created_at DESC);