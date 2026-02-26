# Debug Guide - Time Slots Not Updating

## Problem
When unchecking Wednesday (middle day), it doesn't update in database. But unchecking Monday or Friday (edge days) works.

## Debug Steps

### Step 1: Verify Database Column Exists

Connect to your database and run:
```sql
\d providers
```

Look for `time_slots` column with type `jsonb`. If it doesn't exist, run:
```sql
ALTER TABLE providers ADD COLUMN IF NOT EXISTS time_slots JSONB;
```

### Step 2: Check Current Data

See what's currently in the database:
```sql
SELECT id, clinic_name, availability, time_slots 
FROM providers 
LIMIT 5;
```

### Step 3: Test with Logging

1. Open browser console (F12)
2. Go to `/management/providers`
3. Click Edit on a provider
4. Look for console logs:
   ```
   === OPEN MODAL DEBUG ===
   Provider data: {...}
   Provider time_slots: {...}
   Parsed time_slots: {...}
   ```

5. Uncheck Wednesday
6. Click Update
7. Look for console logs:
   ```
   === SAVE PROVIDER DEBUG ===
   Time Slots Object: {monday: {...}, tuesday: {...}, wednesday: {enabled: false, ...}, ...}
   Formatted Availability: Mon-Tue: 9am-5pm, Thu-Fri: 9am-5pm
   Time Slots JSON: {"monday":{...},"wednesday":{"enabled":false,...},...}
   FormData availability: Mon-Tue: 9am-5pm, Thu-Fri: 9am-5pm
   FormData time_slots: {"monday":{...},"wednesday":{"enabled":false,...},...}
   ```

8. Check API server console for:
   ```
   === UPDATE PROVIDER DEBUG ===
   Request Body: {...}
   Availability: Mon-Tue: 9am-5pm, Thu-Fri: 9am-5pm
   Time Slots: {"monday":{...},"wednesday":{"enabled":false,...},...}
   ```

### Step 4: Verify Database Update

After saving, check the database:
```sql
SELECT id, clinic_name, availability, time_slots 
FROM providers 
WHERE id = 'your-provider-id';
```

The `time_slots` column should show:
```json
{
  "monday": {"enabled": true, "start": "09:00", "end": "17:00"},
  "tuesday": {"enabled": true, "start": "09:00", "end": "17:00"},
  "wednesday": {"enabled": false, "start": "09:00", "end": "17:00"},
  "thursday": {"enabled": true, "start": "09:00", "end": "17:00"},
  "friday": {"enabled": true, "start": "09:00", "end": "17:00"},
  "saturday": {"enabled": false, "start": "09:00", "end": "17:00"},
  "sunday": {"enabled": false, "start": "09:00", "end": "17:00"}
}
```

## Common Issues and Solutions

### Issue 1: time_slots column doesn't exist
**Symptom**: Database error "column time_slots does not exist"
**Solution**: 
```sql
ALTER TABLE providers ADD COLUMN IF NOT EXISTS time_slots JSONB;
```
Then restart API server.

### Issue 2: time_slots is null in database
**Symptom**: Console shows time_slots being sent, but database has null
**Solution**: Check API server logs. The controller might not be extracting it from FormData.

Verify in `api/src/controllers/providerController.js`:
```javascript
if (req.body.time_slots !== undefined) providerData.time_slots = req.body.time_slots;
```

### Issue 3: time_slots is a string instead of JSON
**Symptom**: Database shows time_slots as string like '{"monday":...}'
**Solution**: This is correct! PostgreSQL JSONB stores it as JSON but displays as string. The model should handle JSON.stringify().

### Issue 4: Wednesday reappears checked after edit
**Symptom**: Save works, but reopening shows Wednesday checked
**Solution**: The openModal is parsing from availability string instead of time_slots.

Check console logs when opening edit:
```
Provider time_slots: null  <-- BAD! Should have JSON
```

If time_slots is null, the database didn't save it. Check Step 2.

### Issue 5: API server not restarted
**Symptom**: Changes to backend code don't take effect
**Solution**: 
```bash
# Stop server (Ctrl+C)
cd api
npm start
```

## Test Scenarios

### Test 1: Uncheck Middle Day
1. Edit provider
2. Check: Mon, Tue, Wed, Thu, Fri
3. Save
4. Edit again
5. Uncheck: Wed
6. Save
7. Edit again
8. **Expected**: Wed should be unchecked
9. **Check console**: time_slots should show wednesday.enabled = false
10. **Check database**: time_slots column should have wednesday.enabled = false

### Test 2: Uncheck Multiple Days
1. Edit provider
2. Check all days
3. Save
4. Edit again
5. Uncheck: Wed, Sat
6. Save
7. Edit again
8. **Expected**: Wed and Sat unchecked
9. **Check database**: Both should have enabled = false

### Test 3: Different Times
1. Edit provider
2. Mon-Fri: 9am-5pm
3. Sat: 10am-2pm
4. Sun: unchecked
5. Save
6. Edit again
7. **Expected**: All times preserved exactly
8. **Check database**: Each day should have correct start/end times

## Manual Database Fix

If you need to manually fix a provider's time_slots:

```sql
UPDATE providers 
SET time_slots = '{
  "monday": {"enabled": true, "start": "09:00", "end": "17:00"},
  "tuesday": {"enabled": true, "start": "09:00", "end": "17:00"},
  "wednesday": {"enabled": false, "start": "09:00", "end": "17:00"},
  "thursday": {"enabled": true, "start": "09:00", "end": "17:00"},
  "friday": {"enabled": true, "start": "09:00", "end": "17:00"},
  "saturday": {"enabled": false, "start": "09:00", "end": "17:00"},
  "sunday": {"enabled": false, "start": "09:00", "end": "17:00"}
}'::jsonb,
availability = 'Mon-Tue: 9am-5pm, Thu-Fri: 9am-5pm'
WHERE id = 'your-provider-id';
```

## Verification Checklist

Run through this checklist:

- [ ] Database has time_slots column (run `\d providers`)
- [ ] API server restarted after code changes
- [ ] Browser console shows "=== SAVE PROVIDER DEBUG ===" logs
- [ ] Console shows time_slots with wednesday.enabled = false
- [ ] API server console shows time_slots in request body
- [ ] Database query shows time_slots column populated
- [ ] Edit modal shows "=== OPEN MODAL DEBUG ===" logs
- [ ] Console shows provider.time_slots is not null
- [ ] Wednesday checkbox is unchecked in UI
- [ ] After save and reopen, Wednesday stays unchecked

## If Still Not Working

1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Hard refresh**: Ctrl+Shift+R
3. **Check network tab**: See what's actually being sent to API
4. **Check API response**: See what's being returned
5. **Direct database query**: Verify data is actually saved

## Get Help

If still not working, provide:
1. Browser console logs (all "=== DEBUG ===" sections)
2. API server console logs
3. Database query result: `SELECT * FROM providers WHERE id = 'xxx'`
4. Screenshot of the form with Wednesday unchecked
5. Network tab showing the PUT request payload
