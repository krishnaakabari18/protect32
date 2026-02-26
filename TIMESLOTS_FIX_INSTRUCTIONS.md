# Time Slots Fix - Preserving Unchecked Days

## Problem
When editing a provider and unchecking a day (like Wednesday), then saving and reopening the edit form, the unchecked day would appear checked again.

## Root Cause
The system was only saving the formatted availability string (e.g., "Mon-Sat: 9am-5pm") to the database. When loading the edit form, it tried to parse this string back into individual day settings, which would re-enable all days in the range, losing information about which specific days were unchecked.

## Solution

### 1. Database Changes
Added a new `time_slots` JSONB column to store the complete schedule with exact enabled/disabled state for each day.

**Migration File**: `api/database/add-time-slots-column.sql`

Run this SQL to add the column:
```sql
ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS time_slots JSONB;
```

### 2. Backend Changes
Updated `api/src/models/providerModel.js` to:
- Save `time_slots` as JSON in create and update operations
- Fixed SQL placeholder bugs (was `${paramCount}`, now `$${paramCount}`)
- Return `time_slots` when fetching providers

### 3. Frontend Changes
Updated `backend/components/management/providers-crud.tsx` to:
- Load `time_slots` directly from database instead of parsing availability string
- Fall back to parsing if `time_slots` doesn't exist (backward compatibility)
- Continue saving both formats for display purposes

## How to Apply the Fix

### Step 1: Run Database Migration
```bash
cd api
psql -U dentist -d dentist_newdb -f database/add-time-slots-column.sql
```

Or connect to your database and run:
```sql
ALTER TABLE providers ADD COLUMN IF NOT EXISTS time_slots JSONB;
```

### Step 2: Restart API Server
```bash
cd api
# Stop current server (Ctrl+C)
npm start
```

### Step 3: Test the Fix
1. Go to `/management/providers`
2. Edit an existing provider
3. Uncheck Wednesday
4. Set other days (e.g., Mon, Tue, Thu, Fri, Sat)
5. Click Update
6. Click Edit again on the same provider
7. Verify Wednesday is still unchecked ✓

## Data Format

### Database Storage
```json
{
  "availability": "Mon-Tue: 9am-5pm, Thu-Sat: 9am-5pm",
  "time_slots": {
    "monday": { "enabled": true, "start": "09:00", "end": "17:00" },
    "tuesday": { "enabled": true, "start": "09:00", "end": "17:00" },
    "wednesday": { "enabled": false, "start": "09:00", "end": "17:00" },
    "thursday": { "enabled": true, "start": "09:00", "end": "17:00" },
    "friday": { "enabled": true, "start": "09:00", "end": "17:00" },
    "saturday": { "enabled": true, "start": "09:00", "end": "17:00" },
    "sunday": { "enabled": false, "start": "09:00", "end": "17:00" }
  }
}
```

### Why Both Fields?
- **availability**: Human-readable string for display on frontend (patient view)
- **time_slots**: Complete JSON for accurate editing and processing

## Backward Compatibility
The system maintains backward compatibility:
- If `time_slots` exists in database → use it directly
- If `time_slots` is null → parse from `availability` string
- Always save both fields on update

## Testing Scenarios

### Scenario 1: Uncheck Middle Day
1. Enable: Mon, Tue, Wed, Thu, Fri
2. Uncheck: Wed
3. Save and reopen
4. Expected: Mon, Tue, Thu, Fri checked; Wed unchecked ✓

### Scenario 2: Uncheck Multiple Days
1. Enable: All days
2. Uncheck: Wed, Sun
3. Save and reopen
4. Expected: Mon-Sat checked except Wed; Sun unchecked ✓

### Scenario 3: Different Times Per Day
1. Mon-Fri: 9am-5pm
2. Sat: 10am-2pm
3. Sun: Unchecked
4. Save and reopen
5. Expected: All times preserved exactly ✓

### Scenario 4: Edit Existing Provider (No time_slots yet)
1. Edit old provider (created before this fix)
2. System parses from availability string
3. Make changes
4. Save
5. Now has time_slots in database ✓

## Files Modified

1. `api/database/add-time-slots-column.sql` - New migration
2. `api/src/models/providerModel.js` - Added time_slots handling
3. `backend/components/management/providers-crud.tsx` - Load from time_slots field

## Verification

After applying the fix, check:
1. Database has `time_slots` column: `\d providers`
2. New providers save time_slots: Check database after creating
3. Edit preserves unchecked days: Test edit flow
4. Old providers still work: Edit a provider created before the fix
