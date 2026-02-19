-- Add provider_id column to plans table
ALTER TABLE plans ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_plans_provider ON plans(provider_id);
