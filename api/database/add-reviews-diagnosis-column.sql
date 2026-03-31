-- Add diagnosis (procedures) column to provider_reviews table
ALTER TABLE provider_reviews
ADD COLUMN IF NOT EXISTS diagnosis TEXT;
