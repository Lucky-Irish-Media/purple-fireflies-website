CREATE TABLE IF NOT EXISTS delivery_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meal_signup_id INTEGER NOT NULL UNIQUE,
  driver_volunteer_id INTEGER NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (meal_signup_id) REFERENCES meal_signups(id) ON DELETE CASCADE,
  FOREIGN KEY (driver_volunteer_id) REFERENCES driver_volunteers(id) ON DELETE CASCADE
);

CREATE INDEX idx_delivery_assignments_meal_signup_id ON delivery_assignments(meal_signup_id);
CREATE INDEX idx_delivery_assignments_driver_volunteer_id ON delivery_assignments(driver_volunteer_id);
