ALTER TABLE meal_signups ADD COLUMN address1 TEXT NOT NULL DEFAULT '';
ALTER TABLE meal_signups ADD COLUMN address2 TEXT;
ALTER TABLE meal_signups ADD COLUMN city TEXT NOT NULL DEFAULT '';
ALTER TABLE meal_signups ADD COLUMN state TEXT NOT NULL DEFAULT '';
ALTER TABLE meal_signups ADD COLUMN zip_code TEXT NOT NULL DEFAULT '';

UPDATE meal_signups
SET
  address1 = address,
  address2 = NULL,
  city = '',
  state = '',
  zip_code = ''
WHERE address1 = '';

ALTER TABLE meal_signups DROP COLUMN address;