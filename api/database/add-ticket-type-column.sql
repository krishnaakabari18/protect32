-- Add ticket_type column to support_tickets table
ALTER TABLE support_tickets
ADD COLUMN IF NOT EXISTS ticket_type VARCHAR(50);
