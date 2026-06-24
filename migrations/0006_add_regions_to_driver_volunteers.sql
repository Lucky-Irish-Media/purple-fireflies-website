ALTER TABLE driver_volunteers ADD COLUMN regions TEXT NOT NULL DEFAULT '';

UPDATE driver_volunteers SET regions = '' WHERE regions IS NULL;