-- Add time_slots column to providers table
-- This stores the complete weekly schedule as JSON

ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS time_slots JSONB;

-- Add comment
COMMENT ON COLUMN providers.time_slots IS 'Weekly time slots in JSON format: {monday: {enabled: bool, start: "HH:mm", end: "HH:mm"}, ...}';

-- Display updated table structure
\d providers
