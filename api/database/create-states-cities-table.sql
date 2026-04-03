-- States and Cities table (single table with parent_id for hierarchy)
CREATE TABLE IF NOT EXISTS states_cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('state', 'city')),
  parent_id INTEGER REFERENCES states_cities(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_states_cities_type ON states_cities(type);
CREATE INDEX IF NOT EXISTS idx_states_cities_parent ON states_cities(parent_id);
CREATE INDEX IF NOT EXISTS idx_states_cities_active ON states_cities(is_active);
