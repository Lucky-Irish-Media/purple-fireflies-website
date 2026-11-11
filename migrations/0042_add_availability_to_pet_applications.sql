-- Add availability column to pet_applications for owner availability slots.

ALTER TABLE pet_applications ADD COLUMN availability TEXT;