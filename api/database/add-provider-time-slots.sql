-- Add time_slots column to providers table to store weekly availability as JSON

ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS time_slots JSONB;

-- Add comment
COMMENT ON COLUMN providers.time_slots IS 'Weekly availability schedule stored as JSON with day-wise time slots';

-- Display updated table structure
\d providers
