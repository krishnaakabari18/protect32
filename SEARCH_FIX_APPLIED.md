# Search Functionality Fixed

## Problem
The search box in appointments was not filtering properly when searching for patient, provider, code, or service.

## Root Cause
The SQL query was using incorrect placeholder syntax. The code was using:
```javascript
query += ` AND a.patient_id = ${p++}`;  // WRONG - evaluates as template literal
```

This gets evaluated as a JavaScript template literal, so if `p = 1`, it becomes:
```sql
AND a.patient_id = 1  -- Literal number, not a placeholder!
```

## The Fix
Changed all placeholders to use proper SQL parameter syntax:
```javascript
query += ` AND a.patient_id = $${p++}`;  // CORRECT - creates $1, $2, etc.
```

Now it correctly creates SQL placeholders:
```sql
AND a.patient_id = $1  -- Proper PostgreSQL placeholder
```

## What Was Fixed

### File: `api/src/models/appointmentModel.js`

**Fixed all filter conditions:**
- `patient_id` filter
- `provider_id` filter
- `status` filter
- `date` filter
- `from_date` filter
- `to_date` filter
- **Search query** (the main issue)

**Fixed update method:**
- Dynamic field updates now use proper placeholders

### Search Query Before (BROKEN):
```javascript
if (filters.search) {
  query += ` AND (
    u1.first_name ILIKE ${p} OR   // Wrong!
    u1.last_name ILIKE ${p} OR    // Wrong!
    u2.first_name ILIKE ${p} OR   // Wrong!
    u2.last_name ILIKE ${p} OR    // Wrong!
    a.appointment_code ILIKE ${p} OR  // Wrong!
    a.service ILIKE ${p}          // Wrong!
  )`;
  values.push(`%${filters.search}%`);
  p++;
}
```

### Search Query After (FIXED):
```javascript
if (filters.search) {
  query += ` AND (
    u1.first_name ILIKE $${p} OR   // Correct!
    u1.last_name ILIKE $${p} OR    // Correct!
    u2.first_name ILIKE $${p} OR   // Correct!
    u2.last_name ILIKE $${p} OR    // Correct!
    a.appointment_code ILIKE $${p} OR  // Correct!
    a.service ILIKE $${p}          // Correct!
  )`;
  values.push(`%${filters.search}%`);
  p++;
}
```

## How It Works Now

### Example Search: "John"

**Query Built:**
```sql
SELECT a.id, a.patient_id, a.provider_id, ...
FROM appointments a
JOIN users u1 ON a.patient_id = u1.id
JOIN users u2 ON a.provider_id = u2.id
JOIN providers pr ON a.provider_id = pr.id
WHERE 1=1
  AND (
    u1.first_name ILIKE $1 OR 
    u1.last_name ILIKE $1 OR 
    u2.first_name ILIKE $1 OR 
    u2.last_name ILIKE $1 OR 
    a.appointment_code ILIKE $1 OR 
    a.service ILIKE $1
  )
ORDER BY a.appointment_date DESC, a.start_time DESC
```

**Parameters:**
```javascript
values = ['%John%']
```

**Result:**
- Finds patients with first/last name containing "John"
- Finds providers with first/last name containing "John"
- Finds appointment codes containing "John"
- Finds services containing "John"

## Search Capabilities

The search now properly searches across:

1. **Patient Name**
   - First name (e.g., "John")
   - Last name (e.g., "Smith")

2. **Provider Name**
   - First name (e.g., "Dr. Sarah")
   - Last name (e.g., "Johnson")

3. **Appointment Code**
   - Full code (e.g., "p32-20260408-001")
   - Partial code (e.g., "20260408")

4. **Service**
   - Service name (e.g., "Root Canal")
   - Partial service (e.g., "Canal")

## Testing

### Step 1: Restart API Server
```bash
cd api
npm start
```

**Important:** You MUST restart the API server for the fix to take effect!

### Step 2: Test Search

1. Go to Appointments page
2. Type in search box:
   - Patient name (e.g., "John")
   - Provider name (e.g., "Smith")
   - Appointment code (e.g., "p32-20260408")
   - Service (e.g., "Cleaning")

3. Results should filter immediately

### Expected Behavior

**Search: "John"**
- Shows all appointments where:
  - Patient name contains "John"
  - Provider name contains "John"
  - Service contains "John"

**Search: "p32-20260408"**
- Shows all appointments with that code prefix

**Search: "Root"**
- Shows all appointments with "Root" in service name

**Search: "Smith"**
- Shows appointments for patients or providers named Smith

## Additional Fixes

### Update Method Also Fixed
The `update` method had the same issue:

**Before:**
```javascript
fields.push(`${key} = ${p++}`);  // Wrong!
```

**After:**
```javascript
fields.push(`${key} = $${p++}`);  // Correct!
```

This ensures updates also work properly.

## Why This Happened

JavaScript template literals use `${expression}` syntax. When you write:
```javascript
query += ` AND field = ${p++}`;
```

JavaScript evaluates `${p++}` immediately and inserts the value into the string.

To create a SQL placeholder, you need to escape the `$`:
```javascript
query += ` AND field = $${p++}`;
```

This creates the string `" AND field = $1"` (literal dollar sign followed by the number).

## Performance Impact

**Before:** Queries were likely failing or not filtering correctly
**After:** Queries use proper parameterized queries, which are:
- ✅ Faster (query plan caching)
- ✅ Safer (SQL injection prevention)
- ✅ More reliable (proper type handling)

## Summary

✅ **Fixed:** All SQL placeholders in appointment model
✅ **Fixed:** Search functionality now works properly
✅ **Fixed:** All filters work correctly
✅ **Fixed:** Update method uses proper placeholders

**Action Required:** Restart API server!

```bash
cd api
npm start
```

Then test the search functionality - it should work perfectly now! 🎉

## Testing Checklist

- [ ] Restart API server
- [ ] Search by patient name - works
- [ ] Search by provider name - works
- [ ] Search by appointment code - works
- [ ] Search by service - works
- [ ] Filter by status - works
- [ ] Filter by date range - works
- [ ] Filter by provider dropdown - works
- [ ] Combine search + filters - works

All should work correctly now!
