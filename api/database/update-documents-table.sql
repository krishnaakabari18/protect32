-- Update documents table to support multiple files
-- Add columns for better file management

-- Add new columns if they don't exist
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES providers(id) ON DELETE SET NULL;

-- Update document_type check constraint to include more types
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_document_type_check;
ALTER TABLE documents ADD CONSTRAINT documents_document_type_check 
CHECK (document_type IN ('Medical Record', 'X-Ray', 'Lab Report', 'Prescription', 'Insurance', 'Treatment Plan', 'Consent Form', 'Other'));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_patient_id ON documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_documents_provider_id ON documents(provider_id);
CREATE INDEX IF NOT EXISTS idx_documents_upload_date ON documents(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);

-- Comment on columns
COMMENT ON COLUMN documents.files IS 'Array of file objects with path, name, size, mime_type';
COMMENT ON COLUMN documents.file_url IS 'Legacy field - use files array instead';
