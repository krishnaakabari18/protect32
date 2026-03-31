-- Provider Procedures junction table
CREATE TABLE IF NOT EXISTS provider_procedures (
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (provider_id, procedure_id)
);

CREATE INDEX IF NOT EXISTS idx_provider_procedures_provider ON provider_procedures(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_procedures_procedure ON provider_procedures(procedure_id);
