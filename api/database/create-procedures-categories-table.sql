-- Create procedures table with categories
CREATE TABLE IF NOT EXISTS procedures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_procedures_category ON procedures(category);
CREATE INDEX IF NOT EXISTS idx_procedures_is_active ON procedures(is_active);

-- Insert all procedures with categories
INSERT INTO procedures (name, category, display_order) VALUES
-- Diagnostic & Preventive
('Check up (Exam)', 'Diagnostic & Preventive', 1),
('Digital X-Ray (IOPA)', 'Diagnostic & Preventive', 2),
('OPG', 'Diagnostic & Preventive', 3),
('Other X-Rays', 'Diagnostic & Preventive', 4),
('Blood glucose level test – in-office using a glucose meter', 'Diagnostic & Preventive', 5),
('Pulp vitality tests', 'Diagnostic & Preventive', 6),
('Diagnostic casts', 'Diagnostic & Preventive', 7),
('Teeth Cleaning / Oral Prophylaxis', 'Diagnostic & Preventive', 8),
('Topical Fluoride', 'Diagnostic & Preventive', 9),
('Nutritional counseling for control of dental disease', 'Diagnostic & Preventive', 10),
('Tobacco counseling for control and prevention of oral disease', 'Diagnostic & Preventive', 11),
('Oral hygiene instructions', 'Diagnostic & Preventive', 12),
('Sealant – per tooth', 'Diagnostic & Preventive', 13),
('Preventive resin restoration – Permanent tooth', 'Diagnostic & Preventive', 14),
('Application of caries arresting medicament – per tooth', 'Diagnostic & Preventive', 15),
('Space maintainer', 'Diagnostic & Preventive', 16),

-- Restorative
('Amalgam (surfaces - 1234)', 'Restorative', 1),
('Resin-based composite (Surfaces - 1234) (Anterior / Posterior)', 'Restorative', 2),
('Crown – resin-based composite', 'Restorative', 3),
('Crown -- Different types (Metal / PFM / Zirconia)', 'Restorative', 4),
('Core-Build Up (Amalgam / Composite)', 'Restorative', 5),
('Pin Retention - per tooth in restoration', 'Restorative', 6),
('Post & Core - per tooth', 'Restorative', 7),
('Veneer - Per tooth', 'Restorative', 8),

-- Endodontic
('Pulp cap only (Direct / Indirect)', 'Endodontic', 1),
('Therapeutic pulpotomy', 'Endodontic', 2),
('RCT (Anterior / Bicuspid / Molar)', 'Endodontic', 3),
('Re-RCT (Anterior / Bicuspid / Molar)', 'Endodontic', 4),
('Apexification per tooth', 'Endodontic', 5),
('Apicoectomy (Anterior / Bicuspid / Molar) - No of roots', 'Endodontic', 6),
('Bone graft in conjunction with periradicular surgery – per tooth, single site', 'Endodontic', 7),
('Retrograde filling – per root', 'Endodontic', 8),
('Root amputation – per root', 'Endodontic', 9),

-- Periodontal
('Gingivectomy or Gingivoplasty -- (to allow access for restorative procedure, per tooth / 1 to 3 contiguous teeth or tooth bounded spaces per quadrant / 4 or more contiguous teeth or tooth-bounded spaces per quadrant)', 'Periodontal', 1),
('Gingival flap procedure (1 to 3 contiguous teeth or tooth bounded spaces per quadrant / 4 or more contiguous teeth or tooth-bounded spaces per quadrant)', 'Periodontal', 2),
('Clinical crown lengthening hard tissue', 'Periodontal', 3),
('Osseous surgery (including flap and closure -- 1234)', 'Periodontal', 4),
('Bone replacement graft per site', 'Periodontal', 5),

-- Prosthodontics, Removable
('Complete denture - per arch', 'Prosthodontics, Removable', 1),
('Immediate denture - per arch', 'Prosthodontics, Removable', 2),
('RPD - per arch (Resin base / Cast Metal / Flexible Base)', 'Prosthodontics, Removable', 3),
('Denture repair -- CD, RPD etc.', 'Prosthodontics, Removable', 4),
('Overdenture - per arch', 'Prosthodontics, Removable', 5),

-- Implant
('Surgical placement of implant body - per endosteal implant', 'Implant', 1),
('Implant removal', 'Implant', 2),
('Debridement of a peri-implant defect', 'Implant', 3),
('Bone graft at time of implant placement per tooth', 'Implant', 4),

-- Prosthodontics, Fixed
('Pontic (Different types)', 'Prosthodontics, Fixed', 1),
('Crown (Different types)', 'Prosthodontics, Fixed', 2),
('Re-cement or re-bond bridge', 'Prosthodontics, Fixed', 3),
('Stress breaker', 'Prosthodontics, Fixed', 4),
('Precision attachments', 'Prosthodontics, Fixed', 5),

-- OS (Oral Surgery)
('Extraction – coronal remnants, deciduous tooth per tooth', 'OS', 1),
('Extraction – erupted tooth or exposed root (elevation and/or forcep removal) per tooth', 'OS', 2),
('Surgical removal of an erupted tooth', 'OS', 3),
('Removal of impacted tooth – soft tissue, partially bony, completely bony', 'OS', 4),
('Surgical removal of residual tooth roots', 'OS', 5),
('Alveoloplasty in conjunction with extractions', 'OS', 6),
('Alveoloplasty not in conjunction with extractions', 'OS', 7),
('Vestibuloplasty', 'OS', 8),
('Excision of benign lesion (up to 1.25 cm / > 1.25 cm / complicated)', 'OS', 9),
('Frenectomy per site', 'OS', 10),

-- Ortho (Orthodontics)
('Orthodontic Treatment - (Metal, Ceramic, Aligners)', 'Ortho', 1),

-- Adjunctive
('Administration of nitrous oxide/anxiolysis, analgesia', 'Adjunctive', 1),
('Fabrication of athletic mouth-guard / Occlusal Guard', 'Adjunctive', 2),
('External bleaching – per tooth / Arch', 'Adjunctive', 3),
('Internal bleaching – per tooth', 'Adjunctive', 4),
('Teledentistry', 'Adjunctive', 5)

ON CONFLICT (name) DO NOTHING;

-- Add comment
COMMENT ON TABLE procedures IS 'Dental procedures with categories for treatment fees';
COMMENT ON COLUMN procedures.category IS 'Category/Label for grouping procedures';
COMMENT ON COLUMN procedures.display_order IS 'Order within category for display';

-- Display results
SELECT category, COUNT(*) as procedure_count 
FROM procedures 
GROUP BY category 
ORDER BY category;
