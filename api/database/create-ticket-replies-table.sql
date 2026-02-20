-- Create Ticket Replies Table for threaded conversations
CREATE TABLE IF NOT EXISTS ticket_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_ticket_replies_ticket ON ticket_replies(ticket_id);
CREATE INDEX idx_ticket_replies_user ON ticket_replies(user_id);
CREATE INDEX idx_ticket_replies_created ON ticket_replies(created_at ASC);

-- Add trigger for updated_at
CREATE TRIGGER update_ticket_replies_updated_at 
BEFORE UPDATE ON ticket_replies
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Insert sample replies for existing tickets
INSERT INTO ticket_replies (ticket_id, user_id, message)
SELECT 
    st.id,
    st.patient_id,
    'This is a sample reply from the patient for testing purposes.'
FROM support_tickets st
LIMIT 3;

INSERT INTO ticket_replies (ticket_id, user_id, message)
SELECT 
    st.id,
    st.provider_id,
    'This is a sample reply from the provider for testing purposes.'
FROM support_tickets st
WHERE st.provider_id IS NOT NULL
LIMIT 2;
