-- Create specialties table
CREATE TABLE IF NOT EXISTS specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_specialties_name ON specialties(name);
CREATE INDEX IF NOT EXISTS idx_specialties_is_active ON specialties(is_active);

-- Insert default specialties
INSERT INTO specialties (name, description) VALUES
    ('Endodontist', 'Root canal treatment specialist'),
    ('Periodontist', 'Gum disease and dental implants specialist'),
    ('Prosthodontist', 'Dental prosthetics and restoration specialist'),
    ('OMFS', 'Oral and Maxillofacial Surgery specialist'),
    ('Orthodontist', 'Teeth alignment and braces specialist'),
    ('Pedodontist', 'Pediatric dentistry specialist'),
    ('General Dentist', 'General dental care'),
    ('Cosmetic Dentist', 'Aesthetic dental procedures')
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE specialties IS 'Dental specialties for providers';
