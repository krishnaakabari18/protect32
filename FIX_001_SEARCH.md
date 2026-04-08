# Fix: Search for "001" Not Working

## Quick Fix (Do This Now!)

### Step 1: Restart API Server
```bash
# In your API terminal:
Ctrl+C  (stop current server)
npm start  (start fresh)
```

### Step 2: Clear Filters
1. Go to Appointments page
2. Click "Clear Filters" button
3. Make sure all filters are reset

### Step 3: Search Again
1. Type "001" in search box
2. Should show appointment: P32-20260411-001

---

## Why It Wasn't Working

The code fix was applied, but Node.js was still running the old code in memory. Restarting the API server loads the new fixed code.

---

## If Still Not Working

### Test the API Directly

Open browser console (F12) and run:

```javascript
fetch('http://localhost:8080/api/v1/appointments?search=001', {
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
        'ngrok-skip-browser-warning': 'true'
    }
})
.then(r => r.json())
.then(d => {
    console.log('Results:', d.data?.length);
    console.log('Codes:', d.data?.map(a => a.appointment_code));
});
```

Should show:
```
Results: 1
Codes: ["P32-20260411-001"]
```

---

## What the Fix Does

The search now properly looks for "001" in:
- Patient names
- Provider names
- **Appointment codes** ← This is what you need
- Service names

When you search "001", it finds any appointment code containing "001", like:
- P32-20260411-**001**
- P32-20260408-**001**
- etc.

---

## Action Required

**Right now:**
1. Stop API server (Ctrl+C)
2. Start API server (npm start)
3. Clear filters in browser
4. Search "001"

Should work! 🎉
