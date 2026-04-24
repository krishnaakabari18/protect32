CREATE TABLE IF NOT EXISTS econsents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  procedure_names TEXT NOT NULL,
  patient_age INT,
  patient_address TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'rejected')),
  signed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_econsents_provider ON econsents(provider_id);
CREATE INDEX IF NOT EXISTS idx_econsents_patient ON econsents(patient_id);
CREATE INDEX IF NOT EXISTS idx_econsents_status ON econsents(status);
