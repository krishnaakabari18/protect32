# Prescription Date Prescribed Fix

## Issue
Error: `null value in column "date_prescribed" of relation "prescriptions" violates not-null constraint`

The `date_prescribed` field was required (NOT NULL) in the database but was not being sent from the frontend form, causing the insert to fail.

## Solution

### 1. Database Fix
Added a default value of `CURRENT_DATE` to the `date_prescribed` column.

**File:** `api/database/fix-prescriptions-date-prescribed.sql`

```sql
ALTER TABLE prescriptions 
ALTER COLUMN date_prescribed SET DEFAULT CURRENT_DATE;
```

**Result:**
- If `date_prescribed` is not provided, it automatically uses today's date
- No more NOT NULL constraint violations
- Backward compatible with existing code

### 2. Frontend Enhancement
Added `date_prescribed` field to the prescription form so users can optionally specify it.

**File:** `backend/components/management/prescriptions-crud.tsx`

**Changes:**
- Added `date_prescribed` to form fields
- Added `date_prescribed` to display columns
- Added `date_prescribed` to default values

## Updated Table Structure

```sql
date_prescribed | date | NO | CURRENT_DATE
```

- **Type:** DATE
- **Nullable:** NO (still required)
- **Default:** CURRENT_DATE (automatically set if not provided)

## Form Behavior

### Before Fix
- Form didn't include `date_prescribed` field
- Database expected a value (NOT NULL)
- Insert failed with constraint violation

### After Fix
- Form includes optional `date_prescribed` field
- If user doesn't set it: Database uses CURRENT_DATE
- If user sets it: Database uses the provided date
- Insert always succeeds

## Testing

### Test 1: Create Without Date Prescribed
```bash
curl -X POST http://localhost:8080/api/v1/prescriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "patient_id": "uuid",
    "provider_id": "uuid",
    "medication_name": "Amoxicillin",
    "dosage": "500mg",
    "frequency": "Three times daily"
  }'
```
**Expected:** Success - date_prescribed automatically set to today

### Test 2: Create With Date Prescribed
```bash
curl -X POST http://localhost:8080/api/v1/prescriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "patient_id": "uuid",
    "provider_id": "uuid",
    "medication_name": "Amoxicillin",
    "dosage": "500mg",
    "frequency": "Three times daily",
    "date_prescribed": "2026-02-20"
  }'
```
**Expected:** Success - date_prescribed set to 2026-02-20

## Frontend Display

The prescriptions list now shows:
- Patient Name
- Provider Name
- Medication
- Dosage
- Frequency
- **Date Prescribed** (new)
- Start Date
- End Date

## Benefits

1. ✅ **No More Errors** - Default value prevents NOT NULL violations
2. ✅ **User Control** - Users can optionally set the prescribed date
3. ✅ **Automatic Fallback** - Defaults to today if not specified
4. ✅ **Better Tracking** - Shows when prescription was actually prescribed
5. ✅ **Backward Compatible** - Existing code continues to work

## Database Migration

**Applied:** February 24, 2026

**Rollback (if needed):**
```sql
ALTER TABLE prescriptions 
ALTER COLUMN date_prescribed DROP DEFAULT;
```

## Summary

- ✅ Database updated with default value
- ✅ Frontend form updated with date_prescribed field
- ✅ Display columns updated to show date_prescribed
- ✅ No more NOT NULL constraint errors
- ✅ Users can optionally specify prescription date

---

**Status:** Complete ✓
**Date:** February 24, 2026
**Tested:** ✓
