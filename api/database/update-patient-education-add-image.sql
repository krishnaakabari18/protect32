-- Add feature_image column to patient_education_content table
ALTER TABLE patient_education_content 
ADD COLUMN IF NOT EXISTS feature_image VARCHAR(500);

COMMENT ON COLUMN patient_education_content.feature_image IS 'Path to the feature/cover image for the content';
