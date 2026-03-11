# Procedures API - Complete Implementation

## Summary
Created a comprehensive procedures management system with 106 dental procedures organized into 10 categories, fully integrated with provider fees.

## Database Changes

### 1. Procedures Table Created
**File**: `api/database/create-procedures-categories-table.sql`

**Schema**:
```sql
CREATE TABLE procedures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Categories** (10 total):
1. Diagnostic & Preventive (16 procedures)
2. Restorative (21 procedures)
3. Endodontic (16 procedures)
4. Periodontal (9 procedures)
5. Prosthodontics, Removable (7 procedures)
6. Implant (4 procedures)
7. Prosthodontics, Fixed (9 procedures)
8. Oral Surgery (14 procedures)
9. Orthodontic (3 procedures)
10. Adjunctive (7 procedures)

**Total Procedures**: 106

### 2. Provider Fees Table Updated
**File**: `api/database/update-provider-fees-add-procedure.sql`

**Changes**:
- Added `procedure_id UUID` column
- Foreign key reference to `procedures(id)` with CASCADE delete
- Index created for faster lookups

## API Implementation

### Model: `api/src/models/procedureModel.js`

**Methods**:
- `getAll(page, limit, category, search)` - Paginated list with filters
- `getAllNoPagination(category)` - Full list for dropdowns
- `getCategories()` - Get all unique categories
- `getByCategory(category)` - Get procedures by category
- `getById(id)` - Get single procedure
- `create(procedureData)` - Create new procedure
- `update(id, procedureData)` - Update procedure
- `delete(id)` - Delete procedure
- `toggleActive(id)` - Toggle active status

### Controller: `api/src/controllers/procedureController.js`

**Endpoints**:
- `getAllProcedures` - GET with pagination
- `getAllProceduresNoPagination` - GET all for dropdowns
- `getCategories` - GET categories list
- `getProceduresByCategory` - GET by category
- `getProcedureById` - GET single
- `createProcedure` - POST new
- `updateProcedure` - PUT update
- `deleteProcedure` - DELETE
- `toggleProcedureStatus` - PATCH toggle

### Routes: `api/src/routes/v1/procedureRoutes.js`

**API Endpoints**:
```
GET    /api/v1/procedures                    - List with pagination
GET    /api/v1/procedures/list/all           - All procedures (no pagination)
GET    /api/v1/procedures/categories         - Get all categories
GET    /api/v1/procedures/category/:category - Get by category
GET    /api/v1/procedures/:id                - Get by ID
POST   /api/v1/procedures                    - Create new
PUT    /api/v1/procedures/:id                - Update
PATCH  /api/v1/procedures/:id/toggle         - Toggle active status
DELETE /api/v1/procedures/:id                - Delete
```

**All endpoints require authentication** (Bearer token)

### Updated Provider Fees Model
**File**: `api/src/models/providerFeeModel.js`

**Changes**:
- Added `procedure_id` support in all methods
- JOIN with procedures table to get procedure details
- Returns `procedure_name` and `procedure_category` in results
- Fixed SQL parameter placeholders ($1, $2, etc.)

## Procedure Categories & Examples

### 1. Diagnostic & Preventive
- Check up (Exam)
- Digital X-Ray (IOPA)
- OPG
- Teeth Cleaning / Oral Prophylaxis
- Topical Fluoride
- Sealant – per tooth
- And 10 more...

### 2. Restorative
- Amalgam (1-4 surfaces)
- Resin-based composite (Anterior/Posterior, 1-4 surfaces)
- Crown (Metal / PFM / Zirconia)
- Core-Build Up
- Post & Core
- Veneer
- And 9 more...

### 3. Endodontic
- Pulp cap (Direct/Indirect)
- Therapeutic pulpotomy
- RCT (Anterior / Bicuspid / Molar)
- Re-RCT (Anterior / Bicuspid / Molar)
- Apicoectomy
- And 7 more...

### 4. Periodontal
- Gingivectomy or Gingivoplasty
- Gingival flap procedure
- Clinical crown lengthening
- Osseous surgery
- Bone replacement graft
- And 4 more...

### 5. Prosthodontics, Removable
- Complete denture - per arch
- Immediate denture - per arch
- RPD (Resin base / Cast Metal / Flexible Base)
- Denture repair
- Overdenture

### 6. Implant
- Surgical placement of implant body
- Implant removal
- Debridement of peri-implant defect
- Bone graft at time of implant placement

### 7. Prosthodontics, Fixed
- Pontic (Metal / PFM / Zirconia)
- Crown (Metal / PFM / Zirconia)
- Re-cement or re-bond bridge
- Stress breaker
- Precision attachments

### 8. Oral Surgery
- Extraction (various types)
- Surgical removal of erupted tooth
- Removal of impacted tooth (soft tissue / partially bony / completely bony)
- Alveoloplasty
- Vestibuloplasty
- Excision of benign lesion
- Frenectomy
- And 7 more...

### 9. Orthodontic
- Orthodontic Treatment - Metal Braces
- Orthodontic Treatment - Ceramic Braces
- Orthodontic Treatment - Aligners

### 10. Adjunctive
- Administration of nitrous oxide/anxiolysis
- Fabrication of athletic mouth-guard
- Fabrication of Occlusal Guard
- External bleaching (per tooth / per Arch)
- Internal bleaching
- Teledentistry

## Usage Examples

### 1. Get All Procedures (Paginated)
```bash
GET /api/v1/procedures?page=1&limit=10&category=Restorative
Authorization: Bearer <token>
```

### 2. Get All Procedures for Dropdown
```bash
GET /api/v1/procedures/list/all?category=Endodontic
Authorization: Bearer <token>
```

### 3. Get All Categories
```bash
GET /api/v1/procedures/categories
Authorization: Bearer <token>

Response:
{
  "data": [
    "Adjunctive",
    "Diagnostic & Preventive",
    "Endodontic",
    ...
  ]
}
```

### 4. Create Provider Fee with Procedure
```bash
POST /api/v1/provider-fees
Authorization: Bearer <token>
Content-Type: application/json

{
  "provider_id": "uuid",
  "procedure": "RCT - Molar",
  "procedure_id": "uuid-from-procedures-table",
  "fee": 5000,
  "discount_percent": 10,
  "status": "approved"
}
```

## Integration with Provider Fees

### How It Works:
1. Provider fees can now reference procedures table via `procedure_id`
2. When creating/updating provider fees, you can:
   - Use `procedure` field (text) for backward compatibility
   - Use `procedure_id` field to link to procedures table
3. Provider fees queries now JOIN with procedures table
4. Results include `procedure_name` and `procedure_category`

### Benefits:
- Standardized procedure names across the system
- Easy to update procedure details in one place
- Category-based filtering and organization
- Dropdown lists populated from database
- Can add/edit/delete procedures via API

## Frontend Integration

### Provider Fees CRUD
The provider fees CRUD component already has procedure support:
- Dropdown populated from procedures API
- Category-based organization
- Can add new procedures on the fly
- Validates duplicate procedures per provider

### Next Steps for Frontend:
1. Update provider fees form to use `/api/v1/procedures/list/all` endpoint
2. Add procedure_id field when creating/updating fees
3. Display procedure category in the list view
4. Add procedure management page (optional)

## Testing

### 1. Test Procedures API
```bash
# Get auth token first
TOKEN="your-auth-token"

# List all procedures
curl -H "Authorization: Bearer $TOKEN" \
     -H "ngrok-skip-browser-warning: true" \
     https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/procedures

# Get categories
curl -H "Authorization: Bearer $TOKEN" \
     -H "ngrok-skip-browser-warning: true" \
     https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/procedures/categories

# Get procedures by category
curl -H "Authorization: Bearer $TOKEN" \
     -H "ngrok-skip-browser-warning: true" \
     https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/procedures/category/Restorative
```

### 2. Test Provider Fees with Procedures
```bash
# Create provider fee with procedure_id
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -H "ngrok-skip-browser-warning: true" \
     -d '{
       "provider_id": "provider-uuid",
       "procedure": "RCT - Molar",
       "procedure_id": "procedure-uuid",
       "fee": 5000,
       "discount_percent": 10
     }' \
     https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/provider-fees
```

## Database Migration Status

✅ Procedures table created with 106 procedures
✅ Provider_fees table updated with procedure_id column
✅ Foreign key constraint added
✅ Indexes created for performance
✅ Trigger for updated_at timestamp

## Files Created/Modified

### Created:
1. `api/database/create-procedures-categories-table.sql`
2. `api/database/update-provider-fees-add-procedure.sql`
3. `api/src/models/procedureModel.js` (updated with fixes)
4. `api/src/controllers/procedureController.js` (updated)
5. `api/src/routes/v1/procedureRoutes.js` (updated)

### Modified:
1. `api/src/models/providerFeeModel.js` - Added procedure_id support

## Swagger Documentation

All endpoints are documented in Swagger:
- Visit: https://occupiable-milissa-ennuyante.ngrok-free.dev/api-docs
- Look for "Procedures" tag
- All endpoints have request/response examples

## Result

✅ Complete procedures management system
✅ 106 procedures across 10 categories
✅ Full CRUD API with authentication
✅ Integrated with provider fees
✅ Swagger documentation
✅ Database migrations completed
✅ Ready for frontend integration
