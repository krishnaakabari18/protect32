-- Create Procedures Master Table
CREATE TABLE IF NOT EXISTS procedures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_procedures_name ON procedures(name);
CREATE INDEX IF NOT EXISTS idx_procedures_category ON procedures(category);
CREATE INDEX IF NOT EXISTS idx_procedures_active ON procedures(is_active);

-- Insert default procedures
INSERT INTO procedures (name, category, is_active) VALUES
('Initial Check-up', 'Diagnostic', TRUE),
('Teeth Cleaning & Polishing', 'Preventive', TRUE),
('Dental X-Ray (IOPA)', 'Diagnostic', TRUE),
('Tooth Filling (Composite)', 'Restorative', TRUE),
('Root Canal Treatment (RCT)', 'Endodontics', TRUE),
('Dental Crown (Zirconia/Porcelain)', 'Restorative', TRUE),
('Wisdom Tooth Extraction', 'Oral Surgery', TRUE),
('Metal Braces', 'Orthodontics', TRUE),
('Teeth Whitening (In-Office)', 'Cosmetic', TRUE),
('Dental Implant', 'Oral Surgery', TRUE),
('Teeth Scaling', 'Preventive', TRUE),
('Gum Treatment', 'Periodontics', TRUE),
('Dentures (Complete)', 'Prosthodontics', TRUE),
('Dentures (Partial)', 'Prosthodontics', TRUE),
('Tooth Extraction (Simple)', 'Oral Surgery', TRUE),
('Tooth Extraction (Surgical)', 'Oral Surgery', TRUE)
ON CONFLICT (name) DO NOTHING;
