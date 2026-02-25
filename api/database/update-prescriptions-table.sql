-- Update prescriptions table to match API requirements
-- Add missing columns and rename medication to medication_name

-- Add new columns
ALTER TABLE prescriptions 
ADD COLUMN IF NOT EXISTS frequency VARCHAR(100),
ADD COLUMN IF NOT EXISTS duration VARCHAR(100),
ADD COLUMN IF NOT EXISTS instructions TEXT,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Rename medication to medication_name
ALTER TABLE prescriptions 
RENAME COLUMN medication TO medication_name;

-- Update comments
COMMENT ON COLUMN prescriptions.medication_name IS 'Name of the medication prescribed';
COMMENT ON COLUMN prescriptions.frequency IS 'How often to take the medication (e.g., Twice daily)';
COMMENT ON COLUMN prescriptions.duration IS 'Duration of the prescription (e.g., 7 days)';
COMMENT ON COLUMN prescriptions.instructions IS 'Special instructions for taking the medication';
COMMENT ON COLUMN prescriptions.start_date IS 'Date when prescription starts';
COMMENT ON COLUMN prescriptions.end_date IS 'Date when prescription ends';

-- Display updated table structure
\d prescriptions
