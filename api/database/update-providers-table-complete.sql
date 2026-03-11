-- Add all missing fields to providers table for complete provider profile

-- Clinic Equipment fields
ALTER TABLE providers ADD COLUMN IF NOT EXISTS dental_chairs INTEGER DEFAULT 2;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS iopa_xray_type VARCHAR(50) DEFAULT 'Digital';
ALTER TABLE providers ADD COLUMN IF NOT EXISTS has_opg BOOLEAN DEFAULT false;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS has_ultrasonic_cleaner BOOLEAN DEFAULT true;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS intraoral_camera_type VARCHAR(100) DEFAULT 'USB Model';
ALTER TABLE providers ADD COLUMN IF NOT EXISTS rct_equipment VARCHAR(100) DEFAULT 'Endomotor';
ALTER TABLE providers ADD COLUMN IF NOT EXISTS autoclave_type VARCHAR(100) DEFAULT 'Pressure cooker type';
ALTER TABLE providers ADD COLUMN IF NOT EXISTS sterilization_protocol VARCHAR(100) DEFAULT 'Autoclave';
ALTER TABLE providers ADD COLUMN IF NOT EXISTS disinfection_protocol VARCHAR(100) DEFAULT 'Chemical based';

-- Specialists Availability (stored as JSONB array)
ALTER TABLE providers ADD COLUMN IF NOT EXISTS specialists_availability JSONB DEFAULT '[]'::jsonb;

-- Clinic Bank Details
ALTER TABLE providers ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS bank_branch_name VARCHAR(255);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(255);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS bank_account_type VARCHAR(50);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS bank_micr_no VARCHAR(50);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS bank_ifsc_code VARCHAR(20);

-- Clinic Details (support for multiple clinics via JSONB array)
ALTER TABLE providers ADD COLUMN IF NOT EXISTS number_of_clinics INTEGER DEFAULT 1;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS clinics JSONB DEFAULT '[]'::jsonb;

-- Provider Personal Details
ALTER TABLE providers ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS pincode VARCHAR(10);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS state_dental_council_reg_number VARCHAR(100);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS state_dental_council_reg_photo TEXT;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS profile_photo TEXT;

-- Add indexes for new searchable fields
CREATE INDEX IF NOT EXISTS idx_providers_pincode ON providers(pincode);
CREATE INDEX IF NOT EXISTS idx_providers_mobile ON providers(mobile_number);
CREATE INDEX IF NOT EXISTS idx_providers_email ON providers(email);

-- Add comments
COMMENT ON COLUMN providers.specialists_availability IS 'JSON array of specialists with type and availability: [{"type": "Endodontist", "availability": "On Call"}]';
COMMENT ON COLUMN providers.clinics IS 'JSON array of clinic details for providers with multiple clinics';
COMMENT ON COLUMN providers.number_of_clinics IS 'Number of clinics operated by the provider';
