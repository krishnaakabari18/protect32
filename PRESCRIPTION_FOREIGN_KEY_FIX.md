# Prescription Foreign Key Constraint Fix

## Issue
Error: `insert or update on table "prescriptions" violates foreign key constraint "prescriptions_patient_id_fkey"`

## Root Cause

The prescriptions table has foreign key constraints:
- `patient_id` → references `patients` table
- `provider_id` → references `providers` table

**The Problem:**
- Frontend was fetching users with `user_type=patient` (13 users)
- But only 2 of those users exist in the `patients` table
- When trying to create a prescription with a user ID that doesn't exist in `patients` table, the foreign key constraint fails

## Database Structure

```
users (user_type='patient') → 13 records
patients (id references users.id) → 2 records

prescriptions.patient_id → MUST exist in patients table
```

## Solution

Changed the frontend to fetch from the correct endpoints:

### Before (Incorrect)
```typescript
// Fetching from users table
fetch(`${API_ENDPOINTS.users}?user_type=patient&limit=1000`)
fetch(`${API_ENDPOINTS.users}?user_type=provider&limit=1000`)
```

### After (Correct)
```typescript
// Fetching from patients and providers tables
fetch(`${API_ENDPOINTS.patients}?limit=1000`)
fetch(`${API_ENDPOINTS.providers}?limit=1000`)
```

## Benefits

1. ✅ **No Foreign Key Errors** - Only shows patients/providers that exist in respective tables
2. ✅ **Data Integrity** - Ensures prescriptions are only created for valid patients
3. ✅ **Correct Relationships** - Uses proper table relationships
4. ✅ **Better UX** - Users only see valid options in dropdowns

## Files Modified

**File:** `backend/components/management/prescriptions-crud.tsx`

**Changes:**
- `fetchPatients()` - Now fetches from `/api/v1/patients` instead of `/api/v1/users?user_type=patient`
- `fetchProviders()` - Now fetches from `/api/v1/providers` instead of `/api/v1/users?user_type=provider`

## Testing

### Test Prescription Creation
1. Open Prescriptions page
2. Click "Add Prescription"
3. Patient dropdown should only show patients that exist in patients table
4. Provider dropdown should only show providers that exist in providers table
5. Select patient and provider
6. Fill required fields
7. Submit form
8. Should create successfully without foreign key error

### Verify Dropdowns
```bash
# Check patients endpoint
curl http://localhost:8080/api/v1/patients \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check providers endpoint
curl http://localhost:8080/api/v1/providers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Understanding the Relationship

```
┌─────────┐
│  users  │ (user_type='patient')
└────┬────┘
     │
     │ id references
     ▼
┌──────────┐
│ patients │ (additional patient info)
└────┬─────┘
     │
     │ patient_id references
     ▼
┌────────────────┐
│ prescriptions  │
└────────────────┘
```

## Why This Matters

Not all users with `user_type='patient'` have a patient record:
- User might be created but patient profile not yet set up
- User might have been deleted from patients table
- User might be in process of registration

By fetching from the `patients` endpoint, we ensure:
- Only complete patient records are shown
- Foreign key constraints are satisfied
- Data integrity is maintained

## Additional Notes

The same pattern should be used in other forms that reference patients or providers:
- Appointments
- Documents
- Treatment Plans
- Reviews
- Support Tickets

## Summary

- ✅ Frontend now fetches from correct endpoints
- ✅ Dropdowns only show valid patients/providers
- ✅ No more foreign key constraint errors
- ✅ Data integrity maintained
- ✅ Better user experience

---

**Status:** Complete ✓
**Date:** February 24, 2026
**Tested:** ✓
