-- Document items table: each row is one document entry linked to a parent documents record
CREATE TABLE IF NOT EXISTS document_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  upload_date DATE,
  file_path TEXT,
  file_originalname VARCHAR(255),
  file_mimetype VARCHAR(100),
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_items_document_id ON document_items(document_id);
