# Quick Action Guide - What to Do Now

## 🎯 Immediate Actions Required

### Action 1: Debug Provider Dropdown (2 minutes)

**Step 1:** Refresh browser
```
Press: Ctrl + Shift + R
```

**Step 2:** Open console
```
Press: F12
Click: Console tab
```

**Step 3:** Test dropdown
```
1. Go to: Appointments page
2. Click: "Add Appointment" button
3. Click: Provider dropdown
```

**Step 4:** Check console logs
Look for these messages:
```
[useDropdown] Fetching providers from: http://localhost:8080/api/v1/dropdowns/providers
[useDropdown] providers response: {data: Array(X), total: X}
[useDropdown] providers count: X
[SearchableSelect] providers - Loading: false, Options: X, Error: none
```

**What to share:**
- Screenshot of console logs
- What you see in the dropdown (empty? loading? error?)
- Any red error messages

---

### Action 2: Fix Documents Constraint (1 minute)

**Open pgAdmin or psql and run:**
```sql
\i api/database/fix-documents-constraint.sql
```

**Or copy-paste this SQL:**
```sql
-- Fix documents constraint to allow all document types
ALTER TABLE documents 
DROP CONSTRAINT IF EXISTS documents_document_type_check;

ALTER TABLE documents 
ADD CONSTRAINT documents_document_type_check 
CHECK (document_type IN (
    'Medical Record',
    'X-Ray', 
    'Lab Report',
    'Prescription',
    'Insurance',
    'Treatment Plan',
    'Consent Form',
    'Other'
));
```

**Then test:**
1. Go to Documents page
2. Click "Add Document"
3. Select "Medical Record" as type
4. Select a file
5. Click Save
6. Should work without error!

---

### Action 3: Test Settings Image Upload (2 minutes)

**Step 1:** Refresh browser (if not done already)
```
Press: F5
```

**Step 2:** Test upload
```
1. Go to: Settings page
2. Click: Branding tab
3. Select: Site Logo image
4. Select: Favicon image
5. Click: "Save Settings"
```

**Step 3:** Check console
Look for:
```
FormData contents:
  site_logo: [File]
  favicon: [File]
```

**Step 4:** Verify files saved
Check folder: `api/uploads/settings/`
Should see: `logo-TIMESTAMP.jpg` and `favicon-TIMESTAMP.png`

---

## 📊 Quick Status Check

### ✅ Already Working (No Action Needed)
- Appointment code generation (uses today's date)
- Search functionality (searches all fields)
- Dynamic menu system (super admin sees all)
- CORS configuration (allows all origins)

### ⚠️ Needs Your Action
- Provider dropdown (debug with console logs)
- Documents constraint (run SQL script)
- Settings upload (test after refresh)

### 🧪 Optional Testing
- Dashboard (restart API first)

---

## 🔍 Troubleshooting Quick Reference

### Provider Dropdown Empty?

**Check 1:** API server running?
```bash
cd api
npm start
```

**Check 2:** Providers in database?
```sql
SELECT COUNT(*) FROM providers;
```

**Check 3:** Console shows error?
- Red text = error
- Share the error message

**Check 4:** Token expired?
- Logout and login again

---

### Settings Upload Not Working?

**Check 1:** Console shows files?
```
Should see: site_logo: [File]
Not: site_logo: "path/to/file"
```

**Check 2:** API endpoint correct?
```
Should be: http://localhost:8080/api/v1/settings
```

**Check 3:** Folder exists?
```bash
# Check if folder exists
ls api/uploads/settings/
```

---

### Documents Upload Error?

**Check 1:** SQL script ran?
```sql
-- Check constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'documents'::regclass 
AND conname LIKE '%type%';
```

**Check 2:** File selected?
- Must select a file before saving
- Should show red border if not selected

---

## 📞 What to Report Back

### For Provider Dropdown:
```
Console logs:
[paste console output here]

Dropdown shows:
[ ] Empty
[ ] Loading...
[ ] Error message: ___________
[ ] Options (how many?): ___
```

### For Settings Upload:
```
Console logs:
[paste FormData logs here]

Result:
[ ] Success message shown
[ ] Files saved in api/uploads/settings/
[ ] Database updated
[ ] Error: ___________
```

### For Documents:
```
SQL script:
[ ] Ran successfully
[ ] Got error: ___________

Upload test:
[ ] Works now
[ ] Still getting error: ___________
```

---

## 🎓 Understanding the System

### Dropdown Architecture
```
SearchableSelect Component
    ↓ (uses)
useDropdown Hook
    ↓ (calls)
/api/v1/dropdowns/providers
    ↓ (queries)
Database (providers + users tables)
```

### Why Console Logs Help
The logs show us:
1. Is the API being called? (URL shown)
2. What response came back? (data shown)
3. Any errors? (error shown)
4. How many items loaded? (count shown)

This tells us exactly where the problem is!

---

## ⏱️ Time Estimate

- **Provider dropdown debug:** 2 minutes
- **Documents SQL fix:** 1 minute
- **Settings upload test:** 2 minutes
- **Total:** 5 minutes

---

## 🎯 Success Criteria

### Provider Dropdown Success:
- Console shows: `providers count: 3` (or more)
- Dropdown shows: List of providers with names and emails
- Can select a provider
- Can save appointment

### Documents Success:
- Can select "Medical Record" type
- Can upload file
- No constraint error
- Document saved successfully

### Settings Success:
- Can select logo and favicon
- Console shows `[File]` objects
- Files saved in uploads folder
- Images display after refresh

---

## 💬 Quick Commands

### Test API Directly (in browser console):
```javascript
// Test providers API
fetch('http://localhost:8080/api/v1/dropdowns/providers', {
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
        'ngrok-skip-browser-warning': 'true'
    }
})
.then(r => r.json())
.then(d => console.log('Providers:', d));
```

### Check Auth Token:
```javascript
console.log('Token:', localStorage.getItem('auth_token'));
```

### Clear Cache:
```
Ctrl + Shift + Delete
Select: Cached images and files
Click: Clear data
```

---

## 🚀 After These Actions

Once you complete these 3 actions and report back:
1. Provider dropdown console logs
2. Documents SQL script result
3. Settings upload test result

We can:
- Fix any remaining issues
- Move on to new features
- Update other forms
- Add enhancements

---

**Start with Action 1 (Provider Dropdown) - it's the quickest to check!** 🔍
