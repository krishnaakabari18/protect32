# Appointments Module Fixes

## Issues Fixed

### 1. Foreign Key Constraint Error
**Error**: `insert or update on table "appointments" violates foreign key constraint "appointments_provider_id_fkey"`

**Root Cause**: 
- The appointments table has `provider_id` as a foreign key to `providers(id)`
- We were fetching providers from the `users` table with `user_type='provider'`
- Not all users with `user_type='provider'` have entries in the `providers` table
- This caused the foreign key constraint violation

**Fix**:
- Changed `fetchProviders()` to fetch from `/api/v1/providers` endpoint instead of `/api/v1/users?user_type=provider`
- This ensures only providers with valid provider records are shown in the dropdown
- Also changed `fetchPatients()` to use `/api/v1/patients` endpoint for consistency

**Files Modified**:
- `backend/components/management/appointments-crud.tsx`

### 2. Edit Screen Fields Not Populated
**Issue**: When editing an appointment, the following fields were empty:
- Appointment Date
- Duration (Minutes)
- Start Time

**Root Cause**:
- Date format from database (ISO timestamp) wasn't being converted to input format (YYYY-MM-DD)
- `duration_minutes` field wasn't being properly set from the database response
- Time fields had seconds (HH:MM:SS) but input needed HH:MM format

**Fix**:
Updated `openModal()` function to:
1. Format `appointment_date` to YYYY-MM-DD for date input
2. Parse and set `duration_minutes` from the item data
3. Calculate duration from start/end times if not provided
4. Format time fields to HH:MM (removing seconds)

**Code Changes**:
```javascript
const openModal = (mode: 'create' | 'edit' | 'view', item: any = null) => {
    setModalMode(mode);
    const json = JSON.parse(JSON.stringify(defaultValues));
    
    if (item) {
        Object.keys(item).forEach(key => {
            if (json.hasOwnProperty(key)) {
                json[key] = item[key];
            }
        });
        
        // Format date for input field (YYYY-MM-DD)
        if (item.appointment_date) {
            const date = new Date(item.appointment_date);
            json.appointment_date = date.toISOString().split('T')[0];
        }
        
        // Ensure duration_minutes is set
        if (item.duration_minutes) {
            json.duration_minutes = parseInt(item.duration_minutes);
        } else if (item.start_time && item.end_time) {
            // Calculate duration from start and end times
            const [startHour, startMin] = item.start_time.split(':').map(Number);
            const [endHour, endMin] = item.end_time.split(':').map(Number);
            const durationMins = (endHour * 60 + endMin) - (startHour * 60 + startMin);
            json.duration_minutes = durationMins;
        }
        
        // Format time fields (HH:MM format)
        if (item.start_time) {
            json.start_time = item.start_time.substring(0, 5);
        }
        if (item.end_time) {
            json.end_time = item.end_time.substring(0, 5);
        }
    }
    
    setParams(json);
    setAddModal(true);
};
```

### 3. Minor TypeScript Error
**Issue**: SweetAlert customClass type error

**Fix**: Removed `customClass: 'sweet-alerts'` from Swal.fire() call

## Testing Checklist

### Insert (Create) Appointment
- ✅ Patient dropdown shows only patients with patient records
- ✅ Provider dropdown shows only providers with provider records
- ✅ All required fields validate correctly
- ✅ Duration changes update time slot options
- ✅ Start time selection auto-calculates end time
- ✅ Form submits successfully without foreign key errors

### Edit Appointment
- ✅ Appointment Date field is populated with correct date
- ✅ Duration (Minutes) field shows the correct duration
- ✅ Start Time field is populated
- ✅ End Time is calculated and displayed
- ✅ Patient and Provider dropdowns show selected values
- ✅ All other fields populate correctly
- ✅ Changes save successfully

### Display
- ✅ List view shows patient and provider names
- ✅ Grid view shows patient and provider names
- ✅ Time range displays correctly (start - end)
- ✅ Duration displays in minutes

## API Endpoints Used

### Patients
- `GET /api/v1/patients?limit=1000`
- Returns: `{ data: [{ id, first_name, last_name, email, ... }] }`

### Providers
- `GET /api/v1/providers?limit=1000`
- Returns: `{ data: [{ id, first_name, last_name, email, specialty, clinic_name, ... }] }`

### Appointments
- `GET /api/v1/appointments` - List with pagination
- `GET /api/v1/appointments/:id` - Get single (includes duration_minutes calculated)
- `POST /api/v1/appointments` - Create
- `PUT /api/v1/appointments/:id` - Update
- `DELETE /api/v1/appointments/:id` - Delete

## Database Schema Reference

### Appointments Table
```sql
CREATE TABLE appointments (
    id UUID PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    operatory_id UUID REFERENCES operatories(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    service VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'Upcoming',
    notes TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Key Relationships
- `patient_id` → `patients(id)` → `users(id)`
- `provider_id` → `providers(id)` → `users(id)`

## Status
✅ All issues fixed and tested
✅ Foreign key constraint resolved
✅ Edit screen fields populate correctly
✅ TypeScript errors resolved
