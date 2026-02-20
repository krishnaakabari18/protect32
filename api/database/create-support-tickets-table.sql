-- Create Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Open', 'In Progress', 'Closed')) DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX idx_support_tickets_patient ON support_tickets(patient_id);
CREATE INDEX idx_support_tickets_provider ON support_tickets(provider_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_created ON support_tickets(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_support_tickets_updated_at 
BEFORE UPDATE ON support_tickets
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO support_tickets (patient_id, provider_id, subject, description, status) 
SELECT 
    p.id,
    pr.id,
    'Sample Ticket ' || generate_series,
    'This is a sample support ticket description for testing purposes.',
    CASE 
        WHEN generate_series % 3 = 0 THEN 'Closed'
        WHEN generate_series % 3 = 1 THEN 'In Progress'
        ELSE 'Open'
    END
FROM 
    (SELECT id FROM patients LIMIT 1) p,
    (SELECT id FROM providers LIMIT 1) pr,
    generate_series(1, 5);
