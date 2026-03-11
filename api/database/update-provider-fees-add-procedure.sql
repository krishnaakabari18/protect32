-- Add procedure_id column to provider_fees table
ALTER TABLE provider_fees 
ADD COLUMN IF NOT EXISTS procedure_id UUID REFERENCES procedures(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_provider_fees_procedure_id ON provider_fees(procedure_id);

-- Update existing records to set procedure_id based on procedure_name if needed
-- This is optional and depends on your data migration needs
