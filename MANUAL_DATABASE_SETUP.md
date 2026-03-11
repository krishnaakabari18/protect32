# Manual Database Setup - Copy & Paste Method

## ✅ This is the EASIEST way to set up the database!

Follow these steps exactly:

---

## Step 1: Open pgAdmin

1. Press Windows key
2. Type "pgAdmin"
3. Open pgAdmin 4
4. Enter your master password (if asked)

---

## Step 2: Connect to PostgreSQL

1. In the left panel, expand "Servers"
2. Click on "PostgreSQL 18" (or your version)
3. Enter your PostgreSQL password
4. You should now see "Databases" in the tree

---

## Step 3: Create Database (if needed)

1. Right-click on "Databases"
2. Select "Create" → "Database..."
3. In the "General" tab:
   - Database: `dentist_newdb`
   - Owner: `postgres` (or leave default)
4. Click "Save"

---

## Step 4: Open Query Tool

1. Click on "dentist_newdb" in the left panel
2. Click "Tools" menu → "Query Tool"
   OR
   Right-click "dentist_newdb" → "Query Tool"

---

## Step 5: Copy & Paste This SQL

Copy ALL the SQL below and paste it into the Query Tool:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create procedures table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_procedures_category ON procedures(category);
CREATE INDEX IF NOT EXISTS idx_procedures_is_active ON procedures(is_active);

-- Insert all procedures
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

-- Show summary
SELECT category, COUNT(*) as procedure_count 
FROM procedures 
GROUP BY category 
ORDER BY category;
```

---

## Step 6: Execute the SQL

1. Click the "Execute" button (▶ icon) or press F5
2. Wait for it to complete (should take 1-2 seconds)
3. You should see a success message and a table showing procedure counts

Expected output:
```
category                      | procedure_count
------------------------------|----------------
Adjunctive                    | 5
Diagnostic & Preventive       | 16
Endodontic                    | 9
Implant                       | 4
OS                            | 10
Ortho                         | 1
Periodontal                   | 5
Prosthodontics, Fixed         | 5
Prosthodontics, Removable     | 5
Restorative                   | 8
```

---

## Step 7: Verify the Data

Run this query to verify:

```sql
SELECT COUNT(*) as total FROM procedures;
```

You should see: `total: 68`

---

## Step 8: Start the API Server

Now open a terminal and run:

```bash
cd C:\wamp\www\protect32\api
npm start
```

Expected output:
```
Server running on port 8080
Database connected successfully
```

---

## Step 9: View Swagger API

Open your browser and go to:

**http://localhost:8080/api-docs**

You should see the Swagger UI with all API endpoints including the "Procedures" section.

---

## Step 10: Test the Frontend

1. Open: **http://localhost:3000/management/provider-fees**
2. Click "Add Fee" button
3. Open the "Procedure" dropdown
4. You should see all procedures grouped by category!

---

## 🎉 Success!

You now have:
- ✅ Procedures table created
- ✅ 68 procedures inserted
- ✅ 10 categories configured
- ✅ API endpoints working
- ✅ Swagger documentation available
- ✅ Frontend dropdown showing procedures

---

## 🔍 Test the API

### Test in Browser:

1. **Get all procedures**:
   http://localhost:8080/api/v1/procedures

2. **Get by category**:
   http://localhost:8080/api/v1/procedures/by-category

3. **Get categories**:
   http://localhost:8080/api/v1/procedures/categories

### Test in Swagger:

1. Go to http://localhost:8080/api-docs
2. Find "Procedures" section
3. Click on "GET /api/v1/procedures/by-category"
4. Click "Try it out"
5. Click "Execute"
6. See the response with all procedures grouped by category

---

## 📊 What You Get

### 10 Categories:

1. **Diagnostic & Preventive** - 16 procedures
2. **Restorative** - 8 procedures
3. **Endodontic** - 9 procedures
4. **Periodontal** - 5 procedures
5. **Prosthodontics, Removable** - 5 procedures
6. **Implant** - 4 procedures
7. **Prosthodontics, Fixed** - 5 procedures
8. **OS** (Oral Surgery) - 10 procedures
9. **Ortho** (Orthodontics) - 1 procedure
10. **Adjunctive** - 5 procedures

**Total: 68 procedures**

---

## ❓ Troubleshooting

### Error: "relation procedures already exists"
The table already exists! Skip to Step 7 to verify the data.

### Error: "extension uuid-ossp does not exist"
Run this first:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Can't connect to database
1. Make sure PostgreSQL service is running
2. Check Services (services.msc) → postgresql-x64-18
3. Start the service if stopped

### API server won't start
1. Check if port 8080 is already in use
2. Make sure database is accessible
3. Check api/.env file has correct credentials

---

## 💡 Tips

- Use pgAdmin - it's the easiest way!
- Copy the entire SQL block at once
- Don't run it line by line
- If you get errors, drop the table and try again:
  ```sql
  DROP TABLE IF EXISTS procedures;
  ```
  Then run the full SQL again

---

## 🆘 Still Having Issues?

The SQL is ready to copy-paste. Just:
1. Open pgAdmin
2. Open Query Tool
3. Paste the SQL
4. Click Execute
5. Done!

No command line needed, no password issues, just copy-paste and go!
