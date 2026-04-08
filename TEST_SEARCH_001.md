# Test: Search for "001"

## Current Situation
You're searching for "001" but not seeing results, even though appointment "P32-20260411-001" exists in the list.

## Possible Causes

### Cause 1: API Server Not Restarted ⚠️
**Most Likely!**

The fix was applied to the file, but Node.js caches the old code in memory.

**Solution:**
```bash
# Stop the current API server (Ctrl+C)
cd api
npm start
```

### Cause 2: Pagination
The appointment with "001" might be on a different page.

**Check:**
- Look at pagination at bottom of table
- Try going to next/previous pages
- Or increase items per page

### Cause 3: Filters Applied
Other filters might be hiding the result.

**Check:**
- Status filter: Is "All Status" selected?
- Date filters: Are from/to dates set?
- Provider filter: Is "All Providers" selected?

**Solution:** Click "Clear Filters" button

### Cause 4: Case Sensitivity (Unlikely)
The search uses ILIKE which is case-insensitive, but let's verify.

**Try searching:**
- "001" (lowercase)
- "001" (uppercase)  
- "p32-20260411-001" (full code)

## How to Test Properly

### Step 1: Clear All Filters
1. Click "Clear Filters" button
2. Make sure:
   - Search box is empty
   - Status = "All Status"
   - Date filters are empty
   - Provider = "All Providers"

### Step 2: Restart API Server
```bash
cd api
# Press Ctrl+C to stop current server
npm start
```

Wait for:
```
Server running on port 8080
Database connected successfully
```

### Step 3: Refresh Browser
```
Press: Ctrl + Shift + R
```

### Step 4: Test Search
1. Go to Appointments page
2. Type in search box: "001"
3. Press Enter or wait for auto-search

### Expected Result
Should show appointment: **P32-20260411-001**

## Debug: Check What's Being Sent

### Open Browser Console (F12)

Add this to see what's being searched:

```javascript
// In browser console, monitor fetch requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
    if (args[0].includes('appointments')) {
        console.log('Appointments API call:', args[0]);
    }
    return originalFetch.apply(this, args);
};
```

Then search for "001" and check console output.

Should see:
```
Appointments API call: http://localhost:8080/api/v1/appointments?page=1&limit=10&search=001
```

## Test API Directly

### In Browser Console:
```javascript
fetch('http://localhost:8080/api/v1/appointments?search=001', {
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
        'ngrok-skip-browser-warning': 'true'
    }
})
.then(r => r.json())
.then(d => {
    console.log('Search results for "001":', d);
    console.log('Total found:', d.data?.length);
    console.log('Codes:', d.data?.map(a => a.appointment_code));
});
```

### Expected Output:
```javascript
Search results for "001": {data: Array(1), pagination: {...}}
Total found: 1
Codes: ["P32-20260411-001"]
```

## If Still Not Working

### Check 1: Verify Code is Correct
```bash
# In terminal:
cd api
grep -A 5 "filters.search" src/models/appointmentModel.js
```

Should show:
```javascript
if (filters.search) {
  query += ` AND (
    u1.first_name ILIKE $${p} OR 
    u1.last_name ILIKE $${p} OR 
    u2.first_name ILIKE $${p} OR 
    u2.last_name ILIKE $${p} OR 
    a.appointment_code ILIKE $${p} OR 
    a.service ILIKE $${p}
  )`;
```

Note the `$${p}` (double dollar sign) - this is correct!

### Check 2: API Server Logs
When you search, check API server console for:
- SQL query being executed
- Any errors
- Results returned

### Check 3: Database Query
Run directly in pgAdmin:
```sql
SELECT appointment_code, patient_first_name, provider_first_name, service
FROM appointments a
JOIN users u1 ON a.patient_id = u1.id
JOIN users u2 ON a.provider_id = u2.id
WHERE a.appointment_code ILIKE '%001%'
ORDER BY a.appointment_date DESC;
```

This should return the appointment with code containing "001".

## Common Mistakes

### ❌ Mistake 1: Not Restarting API
```
Fix applied → Browser refreshed → Still doesn't work
Why? API server still running old code!
Solution: Restart API server
```

### ❌ Mistake 2: Filters Active
```
Search shows nothing → But filters are set
Why? Filters + search = combined conditions
Solution: Clear all filters first
```

### ❌ Mistake 3: Wrong Page
```
Search shows nothing → But on page 2
Why? Results might be on page 1
Solution: Check pagination or go to page 1
```

## Quick Checklist

Before reporting "still not working":

- [ ] API server restarted (Ctrl+C then npm start)
- [ ] Browser refreshed (Ctrl+Shift+R)
- [ ] All filters cleared (click "Clear Filters")
- [ ] On page 1 of results
- [ ] Searched for "001" (not "001 " with space)
- [ ] Checked browser console for errors (F12)
- [ ] Checked API server console for errors

## What to Report

If still not working after all above steps:

1. **API Server Console Output:**
   ```
   [paste what you see when API starts]
   ```

2. **Browser Console Output:**
   ```
   [paste any errors or logs]
   ```

3. **API Direct Test Result:**
   ```javascript
   [paste result of fetch test above]
   ```

4. **Screenshot:**
   - Show search box with "001"
   - Show results (or no results)
   - Show filters status
   - Show pagination

---

## Most Likely Solution

**99% chance the issue is:** API server not restarted!

**Do this now:**
1. Go to terminal where API is running
2. Press `Ctrl+C` to stop it
3. Run `npm start` to restart
4. Wait for "Server running on port 8080"
5. Go to browser and search "001"

Should work! 🎉
