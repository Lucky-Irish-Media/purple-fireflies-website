ALTER TABLE driver_volunteers ADD COLUMN on_signal TEXT NOT NULL DEFAULT 'no' CHECK (on_signal IN ('yes', 'no', 'willing'));

UPDATE driver_volunteers SET on_signal = 'no' WHERE on_signal IS NULL;