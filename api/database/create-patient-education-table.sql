-- Create Patient Education Content Table
CREATE TABLE IF NOT EXISTS patient_education_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    tags TEXT[],
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_education_category ON patient_education_content(category);
CREATE INDEX IF NOT EXISTS idx_education_status ON patient_education_content(status);
CREATE INDEX IF NOT EXISTS idx_education_author ON patient_education_content(author_id);
CREATE INDEX IF NOT EXISTS idx_education_created_at ON patient_education_content(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_education_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_education_updated_at_trigger
    BEFORE UPDATE ON patient_education_content
    FOR EACH ROW
    EXECUTE FUNCTION update_education_updated_at();

-- Insert sample data
INSERT INTO patient_education_content (title, category, content, summary, tags, status) VALUES
('Understanding Dental Hygiene', 'Dental Care', 'Proper dental hygiene is essential for maintaining healthy teeth and gums. Brush twice daily, floss regularly, and visit your dentist every six months.', 'Learn the basics of dental hygiene', ARRAY['dental', 'hygiene', 'teeth', 'oral health'], 'Active'),
('Managing Diabetes', 'Chronic Conditions', 'Diabetes management involves monitoring blood sugar levels, maintaining a healthy diet, regular exercise, and taking prescribed medications.', 'Essential tips for diabetes management', ARRAY['diabetes', 'blood sugar', 'chronic disease'], 'Active'),
('Heart Health Tips', 'Cardiovascular', 'Maintain heart health through regular exercise, balanced diet, stress management, and regular check-ups with your healthcare provider.', 'Keep your heart healthy', ARRAY['heart', 'cardiovascular', 'exercise', 'diet'], 'Active'),
('Pregnancy Care Guide', 'Women''s Health', 'Prenatal care is crucial for a healthy pregnancy. Attend all scheduled appointments, take prenatal vitamins, and maintain a healthy lifestyle.', 'Complete guide to pregnancy care', ARRAY['pregnancy', 'prenatal', 'women health'], 'Active'),
('Managing Anxiety', 'Mental Health', 'Anxiety management techniques include deep breathing, meditation, regular exercise, and seeking professional help when needed.', 'Techniques to manage anxiety', ARRAY['anxiety', 'mental health', 'stress'], 'Inactive');

COMMENT ON TABLE patient_education_content IS 'Stores educational content for patients';
COMMENT ON COLUMN patient_education_content.status IS 'Content status: Active or Inactive';
COMMENT ON COLUMN patient_education_content.view_count IS 'Number of times content has been viewed';
