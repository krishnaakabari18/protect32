# Troubleshooting Date Display Issue

## Steps to Fix

### 1. Clear Browser Cache
The frontend code is cached by the browser. You need to do a hard refresh:

**Chrome/Edge/Firefox:**
- Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Or clear cache manually:**
1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### 2. Restart Next.js Development Server
If you're running the frontend in development mode:

```bash
# Stop the current server (Ctrl+C)
# Then restart
cd backend
npm run dev
```

### 3. Check Console Logs
I've added debug logging. Open browser console (F12) and:

1. Click Edit on a prescription
2. Look for console logs like:
```
Date field date_prescribed: Original="2026-02-23T00:00:00.000Z" Extracted="2026-02-23"
Date field start_date: Original="2026-02-24T00:00:00.000Z" Extracted="2026-02-24"
```

This will show if the date extraction is working correctly.

### 4. Verify Database Data
Check what's actually in the database:

```bash
PGPASSWORD=dentist@345 psql -h localhost -U dentist -d dentist_newdb -c "SELECT id, date_prescribed, start_date, end_date FROM prescriptions LIMIT 5;"
```

### 5. Check API Response
Open browser DevTools Network tab:
1. Click Edit on a prescription
2. Look for the API call to `/api/v1/prescriptions/{id}`
3. Check the Response tab
4. Verify the date format in the response

Example response should look like:
```json
{
  "data": {
    "date_prescribed": "2026-02-23",
    "start_date": "2026-02-24",
    "end_date": "2026-03-26"
  }
}
```

## Expected Behavior

### What Should Happen
1. Database stores: `2026-02-23T00:00:00.000Z`
2. API returns: `2026-02-23` (just the date part)
3. Frontend extracts: `2026-02-23` (using `.split('T')[0]`)
4. Input field shows: `02/23/2026` (browser's date format)

### Current Code Logic
```typescript
// This extracts date without timezone conversion
if (typeof dateValue === 'string') {
    formattedItem[field.key] = dateValue.split('T')[0];
}
```

## Common Issues

### Issue 1: Browser Cache
**Symptom:** Code changes don't take effect
**Solution:** Hard refresh (Ctrl+Shift+R)

### Issue 2: Development Server Not Restarted
**Symptom:** Old code still running
**Solution:** Restart `npm run dev`

### Issue 3: API Returns Full ISO String
**Symptom:** Date includes time and timezone
**Solution:** Check if API is returning correct format

### Issue 4: Date Field Type Mismatch
**Symptom:** Date not recognized by input
**Solution:** Verify field type is 'date' not 'text'

## Debug Checklist

- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Restart Next.js dev server
- [ ] Check browser console for date logs
- [ ] Verify database has correct dates
- [ ] Check API response format
- [ ] Verify no JavaScript errors in console
- [ ] Test with a new prescription (create, then edit)

## Manual Test

1. **Create a new prescription:**
   - Set Date Prescribed: 02/25/2026
   - Set Start Date: 02/26/2026
   - Set End Date: 03/28/2026
   - Save

2. **Edit the prescription:**
   - Click Edit button
   - Check if dates show correctly:
     - Date Prescribed: 02/25/2026 ✓
     - Start Date: 02/26/2026 ✓
     - End Date: 03/28/2026 ✓

3. **Check console logs:**
   - Should see: `Date field date_prescribed: Original="2026-02-25" Extracted="2026-02-25"`

## If Still Not Working

### Check the actual date value in the form
Add this to browser console when edit modal is open:
```javascript
// Get the date input element
const dateInput = document.querySelector('input[type="date"]');
console.log('Input value:', dateInput.value);
console.log('Input valueAsDate:', dateInput.valueAsDate);
```

### Verify the fix is applied
Check the file `backend/components/management/generic-crud.tsx` line ~210:
```typescript
formattedItem[field.key] = dateValue.split('T')[0];
```

This line should exist in the openModal function.

## Contact Information

If the issue persists after trying all steps:
1. Share the console logs
2. Share the API response
3. Share the database query result
4. Share any JavaScript errors

---

**Remember:** Always do a hard refresh after code changes!
