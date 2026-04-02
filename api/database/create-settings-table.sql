-- Settings Table for System Configuration
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Payment Settings (Razorpay)
    razorpay_key_id VARCHAR(255),
    razorpay_key_secret VARCHAR(255),
    razorpay_enabled BOOLEAN DEFAULT false,
    
    -- SMTP Email Settings
    smtp_mailer VARCHAR(50) DEFAULT 'SMTP',
    smtp_host VARCHAR(255),
    smtp_port INTEGER DEFAULT 587,
    smtp_username VARCHAR(255),
    smtp_password VARCHAR(255),
    smtp_from_address VARCHAR(255),
    smtp_from_name VARCHAR(255),
    smtp_encryption VARCHAR(20) DEFAULT 'TLS',
    
    -- Branding
    site_logo TEXT, -- File path or URL
    site_name VARCHAR(255) DEFAULT 'Protect32',
    favicon TEXT, -- File path or URL
    
    -- Footer/Copyright
    footer_text TEXT DEFAULT 'Copyright © 2026, All rights reserved',
    
    -- Invoice Settings
    invoice_prefix VARCHAR(20) DEFAULT 'INV',
    invoice_starting_number INTEGER DEFAULT 1,
    invoice_number_format VARCHAR(50) DEFAULT '[prefix]-[number]',
    
    -- Analytics/Tracking
    google_analytics_code TEXT,
    facebook_pixel_code TEXT,
    custom_tracking_code TEXT,
    
    -- SMS & WhatsApp Settings
    sms_provider VARCHAR(50), -- 'twilio', 'msg91', etc.
    sms_api_key VARCHAR(255),
    sms_api_secret VARCHAR(255),
    sms_sender_id VARCHAR(50),
    sms_enabled BOOLEAN DEFAULT false,
    
    whatsapp_api_key VARCHAR(255),
    whatsapp_api_secret VARCHAR(255),
    whatsapp_enabled BOOLEAN DEFAULT false,
    
    -- SEO Settings
    seo_meta_title VARCHAR(255),
    seo_meta_description TEXT,
    seo_meta_keywords TEXT,
    seo_og_image TEXT, -- Open Graph image
    
    -- System
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_updated_at ON settings(updated_at);

-- Insert default settings (only one row should exist)
INSERT INTO settings (id) 
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Add comment
COMMENT ON TABLE settings IS 'System-wide settings and configurations';
