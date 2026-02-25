-- Fix date_prescribed to have a default value
-- This prevents the NOT NULL constraint error when date_prescribed is not provided

ALTER TABLE prescriptions 
ALTER COLUMN date_prescribed SET DEFAULT CURRENT_DATE;

-- Update any existing NULL values (if any)
UPDATE prescriptions 
SET date_prescribed = CURRENT_DATE 
WHERE date_prescribed IS NULL;

-- Verify the change
SELECT column_name, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'prescriptions' AND column_name = 'date_prescribed';
