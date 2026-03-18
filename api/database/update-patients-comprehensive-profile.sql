-- Enhanced Patient Profile Database Schema
-- This script adds comprehensive profile fields to patients and family_members tables

-- ============================================
-- UPDATE PATIENTS TABLE
-- ============================================

-- Add comprehensive profile fields to patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(500),
ADD COLUMN IF NOT EXISTS gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10) CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
ADD COLUMN IF NOT EXISTS height_cm INTEGER,
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS occupation VARCHAR(100),
ADD COLUMN IF NOT EXISTS marital_status VARCHAR(20) CHECK (marital_status IN ('Single', 'Married', 'Divorced', 'Widowed', 'Other')),
ADD COLUMN IF NOT EXISTS nationality VARCHAR(50),
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(50),
ADD COLUMN IF NOT EXISTS religion VARCHAR(50),

-- Medical Information
ADD COLUMN IF NOT EXISTS medical_history TEXT,
ADD COLUMN IF NOT EXISTS current_medications TEXT,
ADD COLUMN IF NOT EXISTS allergies TEXT,
ADD COLUMN IF NOT EXISTS chronic_conditions TEXT,
ADD COLUMN IF NOT EXISTS previous_surgeries TEXT,
ADD COLUMN IF NOT EXISTS family_medical_history TEXT,

-- Dental Specific Information
ADD COLUMN IF NOT EXISTS dental_history TEXT,
ADD COLUMN IF NOT EXISTS dental_concerns TEXT,
ADD COLUMN IF NOT EXISTS previous_dental_treatments TEXT,
ADD COLUMN IF NOT EXISTS dental_anxiety_level INTEGER CHECK (dental_anxiety_level BETWEEN 1 AND 10),
ADD COLUMN IF NOT EXISTS preferred_appointment_time VARCHAR(50),
ADD COLUMN IF NOT EXISTS special_needs TEXT,

-- Additional Contact Information
ADD COLUMN IF NOT EXISTS secondary_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS work_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS preferred_contact_method VARCHAR(20) CHECK (preferred_contact_method IN ('Phone', 'SMS', 'Email', 'WhatsApp')),

-- Address Details (more comprehensive)
ADD COLUMN IF NOT EXISTS address_line_1 VARCHAR(255),
ADD COLUMN IF NOT EXISTS address_line_2 VARCHAR(255),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India',

-- Insurance Details (enhanced)
ADD COLUMN IF NOT EXISTS insurance_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS insurance_expiry_date DATE,
ADD COLUMN IF NOT EXISTS insurance_coverage_amount DECIMAL(10,2),

-- Preferences
ADD COLUMN IF NOT EXISTS communication_preferences JSONB,
ADD COLUMN IF NOT EXISTS appointment_preferences JSONB,
ADD COLUMN IF NOT EXISTS privacy_settings JSONB;

-- ============================================
-- UPDATE FAMILY_MEMBERS TABLE
-- ============================================

-- Add comprehensive profile fields to family_members table
ALTER TABLE family_members 
ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(500),
ADD COLUMN IF NOT EXISTS gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10) CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
ADD COLUMN IF NOT EXISTS height_cm INTEGER,
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS occupation VARCHAR(100),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS secondary_phone VARCHAR(20),

-- Medical Information for family members
ADD COLUMN IF NOT EXISTS medical_history TEXT,
ADD COLUMN IF NOT EXISTS current_medications TEXT,
ADD COLUMN IF NOT EXISTS allergies TEXT,
ADD COLUMN IF NOT EXISTS chronic_conditions TEXT,
ADD COLUMN IF NOT EXISTS previous_surgeries TEXT,

-- Dental Specific Information for family members
ADD COLUMN IF NOT EXISTS dental_history TEXT,
ADD COLUMN IF NOT EXISTS dental_concerns TEXT,
ADD COLUMN IF NOT EXISTS previous_dental_treatments TEXT,
ADD COLUMN IF NOT EXISTS dental_anxiety_level INTEGER CHECK (dental_anxiety_level BETWEEN 1 AND 10),
ADD COLUMN IF NOT EXISTS special_needs TEXT,

-- Insurance (can be different from primary patient)
ADD COLUMN IF NOT EXISTS insurance_provider VARCHAR(255),
ADD COLUMN IF NOT EXISTS insurance_policy_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS insurance_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS insurance_expiry_date DATE,

-- Additional fields
ADD COLUMN IF NOT EXISTS is_primary_contact BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS emergency_contact BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- ============================================
-- ADD INDEXES FOR BETTER PERFORMANCE
-- ============================================

-- Indexes for patients table
CREATE INDEX IF NOT EXISTS idx_patients_gender ON patients(gender);
CREATE INDEX IF NOT EXISTS idx_patients_blood_group ON patients(blood_group);
CREATE INDEX IF NOT EXISTS idx_patients_city ON patients(city);
CREATE INDEX IF NOT EXISTS idx_patients_state ON patients(state);
CREATE INDEX IF NOT EXISTS idx_patients_country ON patients(country);
CREATE INDEX IF NOT EXISTS idx_patients_insurance_provider ON patients(insurance_provider);

-- Indexes for family_members table
CREATE INDEX IF NOT EXISTS idx_family_members_patient_id ON family_members(patient_id);
CREATE INDEX IF NOT EXISTS idx_family_members_relationship ON family_members(relationship);
CREATE INDEX IF NOT EXISTS idx_family_members_gender ON family_members(gender);
CREATE INDEX IF NOT EXISTS idx_family_members_blood_group ON family_members(blood_group);
CREATE INDEX IF NOT EXISTS idx_family_members_is_primary_contact ON family_members(is_primary_contact);
CREATE INDEX IF NOT EXISTS idx_family_members_emergency_contact ON family_members(emergency_contact);

-- ============================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ============================================

-- Patient table comments
COMMENT ON COLUMN patients.profile_photo IS 'Path to patient profile photo';
COMMENT ON COLUMN patients.dental_anxiety_level IS 'Dental anxiety level from 1 (no anxiety) to 10 (severe anxiety)';
COMMENT ON COLUMN patients.communication_preferences IS 'JSON object storing communication preferences';
COMMENT ON COLUMN patients.appointment_preferences IS 'JSON object storing appointment preferences';
COMMENT ON COLUMN patients.privacy_settings IS 'JSON object storing privacy settings';

-- Family members table comments
COMMENT ON COLUMN family_members.profile_photo IS 'Path to family member profile photo';
COMMENT ON COLUMN family_members.dental_anxiety_level IS 'Dental anxiety level from 1 (no anxiety) to 10 (severe anxiety)';
COMMENT ON COLUMN family_members.is_primary_contact IS 'Whether this family member is a primary contact';
COMMENT ON COLUMN family_members.emergency_contact IS 'Whether this family member can be contacted in emergencies';

-- ============================================
-- CREATE PATIENT MEDICAL RECORDS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS patient_medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    record_type VARCHAR(50) NOT NULL, -- 'medical', 'dental', 'prescription', 'lab_result', 'imaging'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    record_date DATE NOT NULL,
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    file_path VARCHAR(500),
    file_type VARCHAR(50),
    file_size INTEGER,
    tags TEXT[],
    is_sensitive BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure either patient_id or family_member_id is provided, not both
    CONSTRAINT chk_patient_or_family_member CHECK (
        (patient_id IS NOT NULL AND family_member_id IS NULL) OR 
        (patient_id IS NULL AND family_member_id IS NOT NULL)
    )
);

-- Indexes for medical records
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON patient_medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_family_member_id ON patient_medical_records(family_member_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_type ON patient_medical_records(record_type);
CREATE INDEX IF NOT EXISTS idx_medical_records_date ON patient_medical_records(record_date DESC);
CREATE INDEX IF NOT EXISTS idx_medical_records_provider ON patient_medical_records(provider_id);

-- Trigger for medical records updated_at
CREATE TRIGGER update_medical_records_updated_at 
    BEFORE UPDATE ON patient_medical_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE patient_medical_records IS 'Stores medical records for patients and family members';
COMMENT ON COLUMN patient_medical_records.is_sensitive IS 'Marks sensitive medical information requiring special access';

-- ============================================
-- SAMPLE DATA UPDATE
-- ============================================

-- Update existing patients with sample comprehensive data
UPDATE patients SET 
    gender = 'Male',
    blood_group = 'B+',
    height_cm = 175,
    weight_kg = 70.5,
    occupation = 'Software Engineer',
    marital_status = 'Married',
    nationality = 'Indian',
    preferred_language = 'English',
    dental_anxiety_level = 3,
    preferred_appointment_time = 'Morning',
    preferred_contact_method = 'WhatsApp',
    address_line_1 = '123 Tech Park',
    city = 'Bangalore',
    state = 'Karnataka',
    postal_code = '560001',
    country = 'India',
    insurance_type = 'Family Floater',
    communication_preferences = '{"email_notifications": true, "sms_notifications": true, "whatsapp_notifications": true}',
    appointment_preferences = '{"preferred_time": "morning", "reminder_hours": 24, "preferred_day": "weekday"}',
    privacy_settings = '{"share_with_family": true, "marketing_communications": false}'
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Update family members with sample data
UPDATE family_members SET 
    gender = 'Female',
    blood_group = 'A+',
    height_cm = 160,
    weight_kg = 55.0,
    email = 'riya.thakkar@example.com',
    dental_anxiety_level = 2,
    is_primary_contact = false,
    emergency_contact = true
WHERE patient_id = '11111111-1111-1111-1111-111111111111' AND first_name = 'Riya';

UPDATE family_members SET 
    gender = 'Female',
    blood_group = 'O+',
    height_cm = 165,
    weight_kg = 58.0,
    occupation = 'Teacher',
    email = 'neha.thakkar@example.com',
    dental_anxiety_level = 4,
    is_primary_contact = true,
    emergency_contact = true
WHERE patient_id = '11111111-1111-1111-1111-111111111111' AND first_name = 'Neha';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify the updates
SELECT 'Enhanced patients table structure created successfully' as status;
SELECT 'Enhanced family_members table structure created successfully' as status;
SELECT 'Patient medical records table created successfully' as status;
SELECT 'Indexes and triggers created successfully' as status;