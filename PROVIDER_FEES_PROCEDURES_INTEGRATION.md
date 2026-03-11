# Provider Fees - Procedures Integration Complete

## Summary
Updated provider fees to use procedures from the database with category-based dropdowns.

## Changes Made

### 1. API Updates

#### New Controller Method
**File**: `api/src/controllers/procedureController.js`
- Added `getProceduresGroupedByCategory()` method
- Returns procedures grouped by category for dropdown display

#### New API Endpoint
```
GET /api/v1/procedures/grouped
```
Returns:
```json
{
  "data": [
    {
      "category": "Diagnostic & Preventive",
      "procedures": [
        {
          "id": "uuid",
          "name": "Check up (Exam)",
          "description": "Routine dental examination",
          "is_active": true
        },
        ...
      ]
    },
    ...
  ]
}
```

### 2. Database Schema
**Table**: `provider_fees`
- Added column: `procedure_id UUID` (references procedures.id)
- Keeps `procedure` text field for backward compatibility

### 3. Frontend Updates

#### Provider Fees CRUD Component
**File**: `backend/components/management/provider-fees-crud.tsx`

**Changes**:
1. Replaced hardcoded `PROCEDURE_CATEGORIES` with API call
2. Added `fetchProceduresGrouped()` function
3. Updated procedure dropdown to use procedure IDs
4. Modified form to save both `procedure` (name) and `procedure_id`

**New State**:
```typescript
const defaultValues = {
    id: null,
    provider_id: '',
    procedure: '',        // Procedure name (for display)
    procedure_id: '',     // Procedure ID (foreign key)
    fee: '',
    discount_percent: 0,
    status: 'approved',
};
```

**Dropdown Implementation**:
```tsx
<select
    id="procedure_id"
    name="procedure_id"
    value={params.procedure_id || ''}
    onChange={(e) => {
        const selectedId = e.target.value;
        const selectedProc = procedureCategories
            .flatMap(cat => cat.procedures)
            .find((p: any) => p.id === selectedId);
        setParams({ 
            ...params, 
            procedure_id: selectedId,
            procedure: selectedProc?.name || ''
        });
    }}
>
    <option value="">Select Procedure</option>
    {procedureCategories.map((category: any) => (
        <optgroup key={category.category} label={category.category}>
            {category.procedures.map((proc: any) => (
                <option key={proc.id} value={proc.id}>
                    {proc.name}
                </option>
            ))}
        </optgroup>
    ))}
</select>
```

## How It Works

1. **On Page Load**:
   - Fetches providers from `/api/v1/users?user_type=provider`
   - Fetches procedures grouped by category from `/api/v1/procedures/grouped`

2. **When Creating/Editing Fee**:
   - User selects provider from dropdown
   - User selects procedure from category-organized dropdown
   - Both `procedure` (name) and `procedure_id` are saved

3. **Data Saved**:
```json
{
  "provider_id": "uuid",
  "procedure": "RCT - Molar",
  "procedure_id": "uuid-from-procedures-table",
  "fee": 5000,
  "discount_percent": 10,
  "status": "approved"
}
```

## Benefits

1. **Centralized Data**: All procedures managed in one place
2. **Easy Updates**: Change procedure names/details in procedures table
3. **Category Organization**: Procedures grouped by category in dropdown
4. **Data Integrity**: Foreign key ensures valid procedures
5. **Backward Compatible**: Keeps procedure name for display

## Testing

### Test Procedures API
```bash
# Get auth token
TOKEN="your-token-here"

# Get procedures grouped by category
curl -H "Authorization: Bearer $TOKEN" \
     -H "ngrok-skip-browser-warning: true" \
     https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/procedures/grouped

# Get all categories
curl -H "Authorization: Bearer $TOKEN" \
     -H "ngrok-skip-browser-warning: true" \
     https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/procedures/categories
```

### Test Provider Fees Creation
```bash
# Create provider fee with procedure_id
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -H "ngrok-skip-browser-warning: true" \
     -d '{
       "provider_id": "provider-uuid",
       "procedure": "RCT - Molar",
       "procedure_id": "procedure-uuid-from-procedures-table",
       "fee": 5000,
       "discount_percent": 10,
       "status": "approved"
     }' \
     https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/provider-fees
```

## Files Modified

1. `api/src/controllers/procedureController.js` - Added grouped endpoint
2. `api/src/routes/v1/procedureRoutes.js` - Added /grouped route
3. `api/src/models/providerFeeModel.js` - Updated to support procedure_id
4. `backend/components/management/provider-fees-crud.tsx` - Updated dropdown

## Next Steps

1. Test the procedures API endpoints
2. Test creating provider fees with procedure_id
3. Verify dropdown shows categories correctly
4. Check that procedure_id is saved to database

## Result

✅ Provider fees now use procedures from database
✅ Category-based dropdown organization
✅ Procedure ID stored as foreign key
✅ Backward compatible with existing data
