# Appointment Date Update Fix

## Issue
When updating an appointment with date 28/02/2026, after saving and reopening the edit form, it showed 27/02/2026 instead of 28/02/2026.

## Root Cause
PostgreSQL was returning the `appointment_date` column as a JavaScript Date object or ISO timestamp with timezone information. When JavaScript processed this date, timezone conversion was shifting the date by one day.

Example flow:
1. User selects: 28/02/2026
2. Saves to database: 2026-02-28 (correct)
3. PostgreSQL returns: 2026-02-28T00:00:00.000Z (UTC midnight)
4. JavaScript in user's timezone (e.g., UTC+5:30) interprets this as: 2026-02-27 18:30:00 local time
5. Date extraction shows: 2026-02-27 ❌

## Solution

### Backend Fix - Force String Format
Updated the SQL queries in `AppointmentModel` to explicitly format dates as strings using PostgreSQL's `TO_CHAR()` function.

**findAll() method:**
```javascript
SELECT a.id, a.patient_id, a.provider_id, a.operatory_id, 
  TO_CHAR(a.appointment_date, 'YYYY-MM-DD') as appointment_date,
  a.start_time, a.end_time, a.service, a.status, a.notes, a.cancellation_reason,
  a.created_at, a.updated_at,
  u1.first_name as patient_first_name, u1.last_name as patient_last_name,
  u2.first_name as provider_first_name, u2.last_name as provider_last_name,
  pr.clinic_name,
  EXTRACT(EPOCH FROM (a.end_time - a.start_time))/60 as duration_minutes
FROM appointments a
...
```

**findById() method:**
```javascript
SELECT a.*, 
  u1.first_name as patient_first_name, u1.last_name as patient_last_name, u1.email as patient_email,
  u2.first_name as provider_first_name, u2.last_name as provider_last_name,
  pr.clinic_name, pr.contact_number as clinic_contact,
  EXTRACT(EPOCH FROM (a.end_time - a.start_time))/60 as duration_minutes,
  TO_CHAR(a.appointment_date, 'YYYY-MM-DD') as appointment_date
FROM appointments a
...
```

### Why This Works

1. **TO_CHAR() Function**: Converts the DATE column to a text string in the specified format
2. **Format 'YYYY-MM-DD'**: Returns exactly "2026-02-28" as a string, not a Date object
3. **No Timezone Conversion**: Since it's a string, JavaScript doesn't apply any timezone conversion
4. **Consistent Format**: Always returns the same format regardless of server timezone

### Frontend Handling
The frontend `openModal()` function already handles this correctly:
```javascript
if (item.appointment_date) {
    let dateStr = item.appointment_date;
    if (dateStr.includes('T')) {
        dateStr = dateStr.split('T')[0];
    }
    json.appointment_date = dateStr;
}
```

Now that the backend returns "2026-02-28" as a string (not a Date object), this code simply uses it as-is.

## Testing

### Test Case 1: Create Appointment
1. Select date: 28/02/2026
2. Save appointment
3. ✅ Database stores: 2026-02-28
4. ✅ List view shows: 28/02/2026
5. ✅ Edit form shows: 28/02/2026

### Test Case 2: Update Appointment
1. Open appointment with date: 28/02/2026
2. ✅ Edit form shows: 28/02/2026
3. Change other fields (e.g., time, notes)
4. Save
5. ✅ Date remains: 28/02/2026
6. Reopen edit form
7. ✅ Still shows: 28/02/2026

### Test Case 3: Update Date
1. Open appointment with date: 28/02/2026
2. Change date to: 15/03/2026
3. Save
4. ✅ Database stores: 2026-03-15
5. ✅ List view shows: 15/03/2026
6. Reopen edit form
7. ✅ Shows: 15/03/2026

## Files Modified

### Backend
- `api/src/models/appointmentModel.js`
  - Updated `findAll()` to use `TO_CHAR(a.appointment_date, 'YYYY-MM-DD')`
  - Updated `findById()` to use `TO_CHAR(a.appointment_date, 'YYYY-MM-DD')`

### API Server
- Restarted to apply changes

## Technical Details

### PostgreSQL DATE Type
- Stores dates without time or timezone information
- When returned to JavaScript, pg driver converts to Date object at midnight UTC
- This causes timezone issues in the client

### TO_CHAR() Function
- PostgreSQL function to format dates/times as strings
- Format: `TO_CHAR(date_column, 'YYYY-MM-DD')`
- Returns: Plain string like "2026-02-28"
- No Date object creation, no timezone conversion

### Alternative Approaches Considered

1. **Client-side timezone handling**: Too complex, error-prone
2. **Store as TIMESTAMP**: Overkill for date-only data
3. **Use DATE but handle in pg driver**: Requires configuration changes
4. **TO_CHAR() in SQL**: ✅ Simple, reliable, no side effects

## Status
✅ FIXED - Dates now display correctly in edit form
✅ No timezone conversion issues
✅ Works across all timezones
✅ Consistent behavior for create, read, update operations
✅ API server restarted with changes
