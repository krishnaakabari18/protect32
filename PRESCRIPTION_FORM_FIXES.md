# Prescription Form Fixes

## Issues Fixed

### 1. ✅ Date Validation Error
**Problem:** `error: "invalid input syntax for type date: ""`
- Empty date strings were being sent to the database
- PostgreSQL expects NULL for empty dates, not empty strings

**Solution:**
- Updated `generic-crud.tsx` to convert empty date strings to null before sending to API
- Changed default values in `prescriptions-crud.tsx` from `''` to `null` for date fields

```typescript
// Before
start_date: '',
end_date: '',

// After
start_date: null,
end_date: null,
```

### 2. ✅ Added "Select" Option in Dropdowns
**Problem:** Dropdowns didn't have a default "Select" option as first item

**Solution:**
- Added "Select Patient" and "Select Provider" as first options in dropdown lists

```typescript
options: [
    { value: '', label: 'Select Patient' },
    ...patients.map(p => ({ ... }))
]
```

### 3. ✅ Show Mobile Number When Email Not Available
**Problem:** Patient/Provider dropdowns showed "null" when email was not available

**Solution:**
- Updated dropdown labels to show mobile number if email is not available
- Fallback to "No contact" if neither email nor mobile is available

```typescript
label: `${p.first_name} ${p.last_name} (${p.email || p.mobile_number || 'No contact'})`
```

## Files Modified

### 1. `backend/components/management/prescriptions-crud.tsx`
- Added "Select" option as first item in patient and provider dropdowns
- Updated dropdown labels to show email OR mobile number
- Changed default date values from empty strings to null

### 2. `backend/components/management/generic-crud.tsx`
- Added date field handling in `saveItem()` function
- Converts empty date strings to null before API submission
- Applies to all date and datetime-local fields

## Code Changes

### Generic CRUD - Date Handling
```typescript
formFields.forEach(field => {
    if (modalMode === 'edit' && field.hideOnEdit) return;
    if (modalMode === 'create' && field.hideOnCreate) return;
    if (params[field.key] !== undefined && params[field.key] !== null) {
        // Convert empty strings to null for date fields
        if (field.type === 'date' || field.type === 'datetime-local') {
            body[field.key] = params[field.key] === '' ? null : params[field.key];
        } else {
            body[field.key] = params[field.key];
        }
    }
});
```

### Prescriptions CRUD - Dropdown Options
```typescript
// Patient dropdown
options: [
    { value: '', label: 'Select Patient' },
    ...patients.map(p => ({
        value: p.id,
        label: `${p.first_name} ${p.last_name} (${p.email || p.mobile_number || 'No contact'})`
    }))
]

// Provider dropdown
options: [
    { value: '', label: 'Select Provider' },
    ...providers.map(p => ({
        value: p.id,
        label: `${p.first_name} ${p.last_name} (${p.email || p.mobile_number || 'No contact'})`
    }))
]
```

## Testing

### Test Prescription Creation
1. Open Prescriptions page
2. Click "Add Prescription"
3. Verify dropdowns show "Select Patient" and "Select Provider" as first option
4. Verify patient/provider names show email or mobile number
5. Fill required fields (leave dates empty)
6. Submit form
7. Should create successfully without date validation error

### Test with Dates
1. Create prescription with start_date and end_date
2. Should save successfully
3. Create prescription without dates
4. Should save successfully with NULL dates

### Test Dropdown Display
1. Check patient dropdown
2. If user has email: Shows "Name (email@example.com)"
3. If no email but has mobile: Shows "Name (+1234567890)"
4. If neither: Shows "Name (No contact)"

## Benefits

1. ✅ **No More Date Errors** - Empty dates properly handled as NULL
2. ✅ **Better UX** - Clear "Select" option in dropdowns
3. ✅ **Complete Contact Info** - Shows mobile when email unavailable
4. ✅ **Consistent Behavior** - Applies to all forms using generic CRUD
5. ✅ **Database Compatible** - Properly formatted data for PostgreSQL

## Impact on Other Forms

The generic CRUD date handling fix applies to ALL forms that use:
- Appointments
- Documents
- Patient Education
- Support Tickets
- Any other form with date fields

This ensures consistent date handling across the entire application.

## Database Schema

Dates are now properly stored as:
```sql
start_date DATE NULL,
end_date DATE NULL
```

Empty dates = NULL (not empty string)

---

**Status:** Complete ✓
**Date:** February 24, 2026
**Tested:** ✓
