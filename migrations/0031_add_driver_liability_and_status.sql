-- Track driver-specific attributes on participants (the person who volunteers
-- to drive). These describe the driver, not any individual delivery-day entry,
-- so they live on participants like bag_number does.
ALTER TABLE participants ADD COLUMN driver_liability INTEGER NOT NULL DEFAULT 0;
ALTER TABLE participants ADD COLUMN driver_status TEXT NOT NULL DEFAULT 'active' CHECK (driver_status IN ('active', 'inactive'));
