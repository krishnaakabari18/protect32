-- PostgreSQL Database Schema for Dental Application
-- Complete schema for patient, provider, and admin functionality

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- AUTHENTICATION & USER MANAGEMENT
-- ============================================

-- Users Table (Core authentication and profile)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Authentication Methods
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    mobile_number VARCHAR(20) UNIQUE,
    mobile_verified BOOLEAN DEFAULT FALSE,
    
    -- Social Login Fields
    google_id VARCHAR(255) UNIQUE,
    facebook_id VARCHAR(255) UNIQUE,
    apple_id VARCHAR(255) UNIQUE,
    
    -- Online Status
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP,
    
    -- User Profile
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_picture TEXT,
    date_of_birth DATE,
    address TEXT,
    
    -- User Type
    user_type VARCHAR(20) CHECK (user_type IN ('patient', 'provider', 'admin')) NOT NULL,
    
    -- Account Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT email_or_social_required CHECK (
        email IS NOT NULL OR 
        google_id IS NOT NULL OR 
        facebook_id IS NOT NULL OR 
        apple_id IS NOT NULL OR
        mobile_number IS NOT NULL
    )
);

-- OTP Verification Table
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mobile_number VARCHAR(20) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    purpose VARCHAR(50) CHECK (purpose IN ('registration', 'login', 'password_reset', 'mobile_verification')),
    is_verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    attempts INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- JWT Refresh Tokens Table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    device_info JSONB,
    ip_address INET,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP
);

-- Chat Rooms Table
CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_type VARCHAR(20) CHECK (room_type IN ('direct', 'group', 'support')),
    name VARCHAR(255),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat Participants Table
CREATE TABLE chat_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,
    is_muted BOOLEAN DEFAULT FALSE,
    UNIQUE(room_id, user_id)
);

-- Chat Messages Table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    message_type VARCHAR(20) CHECK (message_type IN ('text', 'image', 'file', 'audio', 'video', 'system')),
    content TEXT,
    media_url TEXT,
    metadata JSONB,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Message Read Receipts Table
CREATE TABLE message_read_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id)
);

-- App Version Management Table
CREATE TABLE app_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(20) CHECK (platform IN ('ios', 'android', 'web')) NOT NULL,
    version_number VARCHAR(20) NOT NULL,
    build_number INT NOT NULL,
    min_supported_version VARCHAR(20),
    force_update BOOLEAN DEFAULT FALSE,
    update_priority VARCHAR(20) CHECK (update_priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
    release_notes TEXT,
    download_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    released_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(platform, version_number)
);

-- Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_mobile ON users(mobile_number);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_is_online ON users(is_online);
CREATE INDEX idx_users_user_type ON users(user_type);

CREATE INDEX idx_otp_mobile ON otp_verifications(mobile_number);
CREATE INDEX idx_otp_expires ON otp_verifications(expires_at);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

CREATE INDEX idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);

CREATE INDEX idx_chat_participants_room ON chat_participants(room_id);
CREATE INDEX idx_chat_participants_user ON chat_participants(user_id);

CREATE INDEX idx_app_versions_platform ON app_versions(platform);
CREATE INDEX idx_app_versions_active ON app_versions(is_active);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON chat_rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PROVIDER PROFILES
-- ============================================

-- Provider Details Table
CREATE TABLE providers (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    specialty VARCHAR(100) NOT NULL,
    experience_years INT NOT NULL,
    clinic_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    location VARCHAR(255) NOT NULL,
    coordinates JSONB, -- {lat: number, lng: number}
    about TEXT,
    clinic_photos TEXT[], -- Array of image URLs
    clinic_video_url TEXT,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    availability VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Provider Schedule Table
CREATE TABLE provider_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    day_of_week VARCHAR(10) CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Morning slot
    morning_active BOOLEAN DEFAULT FALSE,
    morning_start_time TIME,
    morning_end_time TIME,
    
    -- Afternoon slot
    afternoon_active BOOLEAN DEFAULT FALSE,
    afternoon_start_time TIME,
    afternoon_end_time TIME,
    
    -- Evening slot
    evening_active BOOLEAN DEFAULT FALSE,
    evening_start_time TIME,
    evening_end_time TIME,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider_id, day_of_week)
);

-- Provider Fees Table
CREATE TABLE provider_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    procedure VARCHAR(255) NOT NULL,
    fee DECIMAL(10,2) NOT NULL,
    discount_percent INT DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('approved', 'pending')) DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider_id, procedure)
);

-- Provider Reviews Table
CREATE TABLE provider_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    appointment_id UUID,
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Operatories Table (for provider scheduling)
CREATE TABLE operatories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    doctor_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PATIENT PROFILES & FAMILY MEMBERS
-- ============================================

-- Patient Details Table
CREATE TABLE patients (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    emergency_contact_name VARCHAR(255),
    emergency_contact_number VARCHAR(20),
    insurance_provider VARCHAR(255),
    insurance_policy_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Family Members Table
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    mobile_number VARCHAR(20),
    date_of_birth DATE,
    gifted_plan_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PLANS & SUBSCRIPTIONS
-- ============================================

-- Plans Table
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    features TEXT[] NOT NULL,
    is_popular BOOLEAN DEFAULT FALSE,
    max_members INT DEFAULT 1,
    discount_percent INT DEFAULT 0,
    free_checkups_annually INT DEFAULT 0,
    free_cleanings_annually INT DEFAULT 0,
    free_xrays_annually INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    color_scheme JSONB, -- {bg, buttonBg, buttonHoverBg, textColor, buttonTextColor}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patient Plans (Subscriptions)
CREATE TABLE patient_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
    status VARCHAR(20) CHECK (status IN ('Active', 'Expired', 'Cancelled')) DEFAULT 'Active',
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    auto_renew BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- APPOINTMENTS & SCHEDULING
-- ============================================

-- Appointments Table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    operatory_id UUID REFERENCES operatories(id) ON DELETE SET NULL,
    
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    service VARCHAR(255) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Upcoming', 'Completed', 'Cancelled', 'No-Show')) DEFAULT 'Upcoming',
    
    notes TEXT,
    cancellation_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointment Forms Table
CREATE TABLE appointment_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('Pending', 'Completed')) DEFAULT 'Pending',
    
    -- Medical History
    allergies TEXT,
    medications TEXT,
    medical_conditions TEXT[],
    
    -- Dental History
    last_dental_visit DATE,
    dental_issues TEXT,
    dental_habits TEXT[],
    
    consent_given BOOLEAN DEFAULT FALSE,
    submission_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TREATMENT PLANS & PROCEDURES
-- ============================================

-- Treatment Plans Table
CREATE TABLE treatment_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    
    status VARCHAR(20) CHECK (status IN ('Proposed', 'Consented', 'Paid', 'Rejected')) DEFAULT 'Proposed',
    total_estimate DECIMAL(10,2) NOT NULL,
    
    consent_date TIMESTAMP,
    payment_requested BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Treatment Plan Items Table
CREATE TABLE treatment_plan_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    treatment_plan_id UUID REFERENCES treatment_plans(id) ON DELETE CASCADE,
    procedure VARCHAR(255) NOT NULL,
    fee DECIMAL(10,2) NOT NULL,
    discount_percent INT DEFAULT 0,
    final_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Post Treatment Records Table
CREATE TABLE post_treatment_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    
    -- Oral Health Status
    plaque_index VARCHAR(20) CHECK (plaque_index IN ('Good', 'Fair', 'Poor')),
    gum_health VARCHAR(50) CHECK (gum_health IN ('Healthy', 'Gingivitis', 'Mild Periodontitis')),
    cavity_risk VARCHAR(20) CHECK (cavity_risk IN ('Low', 'Medium', 'High')),
    notes TEXT,
    
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PAYMENTS & SETTLEMENTS
-- ============================================

-- Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    treatment_plan_id UUID REFERENCES treatment_plans(id) ON DELETE SET NULL,
    
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    status VARCHAR(20) CHECK (status IN ('Paid', 'Pending', 'Failed', 'Refunded')) DEFAULT 'Pending',
    
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settlements Table (Provider claims)
CREATE TABLE settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    
    service VARCHAR(255) NOT NULL,
    appointment_date DATE NOT NULL,
    settlement_amount DECIMAL(10,2) NOT NULL,
    
    status VARCHAR(50) CHECK (status IN ('Pending Submission', 'Processing', 'Settled', 'Rejected')) DEFAULT 'Pending Submission',
    
    submitted_date TIMESTAMP,
    settled_date TIMESTAMP,
    rejection_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DOCUMENTS & PRESCRIPTIONS
-- ============================================

-- Documents Table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) CHECK (document_type IN ('X-Ray', 'Note', 'Treatment Plan', 'Insurance', 'Other')) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INT, -- in bytes
    mime_type VARCHAR(100),
    
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions Table
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    
    medication VARCHAR(255) NOT NULL,
    dosage TEXT NOT NULL,
    refills_left INT DEFAULT 0,
    
    date_prescribed DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- REFERRALS & NETWORK PROVIDERS
-- ============================================

-- Network Providers Table
CREATE TABLE network_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    provider_type VARCHAR(50) CHECK (provider_type IN ('Dentist', 'Radiology Center', 'Lab', 'Specialist')) NOT NULL,
    specialty VARCHAR(100),
    contact_number VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referrals Table
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    from_provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    to_provider_id UUID REFERENCES network_providers(id) ON DELETE CASCADE,
    
    reason TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Sent', 'Accepted', 'Completed', 'Rejected')) DEFAULT 'Sent',
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    notification_type VARCHAR(50) CHECK (notification_type IN (
        'REVIEW_REQUEST', 
        'GENERAL_INFO', 
        'PLAN_EXPIRING', 
        'ORAL_HEALTH_UPDATE', 
        'REFERRAL_NOTIFICATION', 
        'PAYMENT_REQUEST',
        'APPOINTMENT_REMINDER',
        'APPOINTMENT_CONFIRMED',
        'APPOINTMENT_CANCELLED'
    )) NOT NULL,
    
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    is_read BOOLEAN DEFAULT FALSE,
    
    related_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    related_record_id UUID,
    related_referral_id UUID REFERENCES referrals(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ADMIN FORMS
-- ============================================

-- Admin Forms Table
CREATE TABLE admin_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    form_type VARCHAR(50) CHECK (form_type IN ('Self-assessment', 'Declaration', 'Agreement', 'Other')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Pending', 'Completed', 'Rejected')) DEFAULT 'Pending',
    
    form_data JSONB,
    form_url TEXT,
    
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submission_date TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- ============================================

-- Provider indexes
CREATE INDEX idx_providers_specialty ON providers(specialty);
CREATE INDEX idx_providers_location ON providers(location);
CREATE INDEX idx_providers_rating ON providers(rating DESC);

-- Appointment indexes
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_provider ON appointments(provider_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Treatment plan indexes
CREATE INDEX idx_treatment_plans_patient ON treatment_plans(patient_id);
CREATE INDEX idx_treatment_plans_provider ON treatment_plans(provider_id);
CREATE INDEX idx_treatment_plans_status ON treatment_plans(status);

-- Payment indexes
CREATE INDEX idx_payments_patient ON payments(patient_id);
CREATE INDEX idx_payments_provider ON payments(provider_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Notification indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- ADDITIONAL TRIGGERS FOR AUTO-UPDATE
-- ============================================

-- Apply triggers to new tables with updated_at column
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_schedules_updated_at BEFORE UPDATE ON provider_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_fees_updated_at BEFORE UPDATE ON provider_fees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_plans_updated_at BEFORE UPDATE ON patient_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointment_forms_updated_at BEFORE UPDATE ON appointment_forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatment_plans_updated_at BEFORE UPDATE ON treatment_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settlements_updated_at BEFORE UPDATE ON settlements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_forms_updated_at BEFORE UPDATE ON admin_forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER FOR UPDATING PROVIDER RATING
-- ============================================

CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE providers
    SET rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM provider_reviews
        WHERE provider_id = NEW.provider_id
    ),
    total_reviews = (
        SELECT COUNT(*)
        FROM provider_reviews
        WHERE provider_id = NEW.provider_id
    )
    WHERE id = NEW.provider_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_provider_rating_trigger
AFTER INSERT OR UPDATE ON provider_reviews
FOR EACH ROW EXECUTE FUNCTION update_provider_rating();
