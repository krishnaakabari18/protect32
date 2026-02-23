# Patient Education Module - Step-by-Step Test Guide

## 🎯 Quick Test (5 Minutes)

Follow these steps to verify everything works:

### Step 1: Access the Module (30 seconds)
1. Open browser: `http://localhost:3001`
2. Login with credentials (password: `password123`)
3. Look at left sidebar
4. Click **"Patient Education"** (should be below "Support Tickets")

**Expected Result**: You should see a page with 5 sample records

---

### Step 2: Test Views (30 seconds)
1. Click the **List icon** (☰) - Should show table view
2. Click the **Grid icon** (⊞) - Should show card view

**Expected Result**: Data displays in both formats

---

### Step 3: Test Search (1 minute)
1. In the search box, type: **"diabetes"**
2. Wait 1 second

**Expected Result**: Only "Managing Diabetes" record shows

3. Clear the search box

**Expected Result**: All 5 records return

---

### Step 4: Test Filters (1 minute)
1. Click **Category dropdown**
2. Select **"Dental Care"**

**Expected Result**: Only "Understanding Dental Hygiene" shows

3. Click **Status dropdown**
4. Select **"Inactive"**

**Expected Result**: Only "Managing Anxiety" shows

5. Click **"Clear Filters"** button

**Expected Result**: All 5 records return

---

### Step 5: Test Add Content (2 minutes)
1. Click **"Add Content"** button
2. Fill in the form:
   - **Title**: "Test Article"
   - **Category**: "Testing"
   - **Content**: "This is a test article for verification"
   - **Summary**: "Test summary"
   - **Status**: Active
3. In the tags section:
   - Type "test" and click **"Add"** (or press Enter)
   - Type "demo" and click **"Add"**
4. Click **"Add"** button at bottom

**Expected Result**: 
- Success message appears
- Modal closes
- New record appears in the list (6 records total)

---

### Step 6: Test Status Toggle (30 seconds)
1. Find your "Test Article" record
2. Click the **green "Active" badge**

**Expected Result**: 
- Badge turns red and shows "Inactive"
- Success message appears

3. Click the badge again

**Expected Result**: 
- Badge turns green and shows "Active"

---

### Step 7: Test Edit (1 minute)
1. Click the **pencil icon** (✏️) on "Test Article"
2. Change title to: **"Updated Test Article"**
3. Remove one tag by clicking the **X** on it
4. Add a new tag: "updated"
5. Click **"Update"** button

**Expected Result**: 
- Success message appears
- Modal closes
- Record shows updated title and tags

---

### Step 8: Test View (30 seconds)
1. Click the **eye icon** (👁️) on any record
2. Review the content (read-only)
3. Click **"Close"** button

**Expected Result**: 
- All fields are visible but not editable
- Modal closes on click

---

### Step 9: Test Delete (30 seconds)
1. Click the **trash icon** (🗑️) on "Updated Test Article"
2. Click **"Delete"** in confirmation dialog

**Expected Result**: 
- Success message appears
- Record is removed from list
- Back to 5 records

---

### Step 10: Test Pagination (if needed)
If you have more than 10 records:
1. Click **"Next"** button
2. Click **"Previous"** button

**Expected Result**: 
- Page navigation works
- Entry count updates

---

## 🔧 API Testing (Optional)

### Get Auth Token First
1. Login via UI
2. Open browser DevTools (F12)
3. Go to Application/Storage → Local Storage
4. Find `auth_token` value
5. Copy the token

### Test API Endpoints

Replace `YOUR_TOKEN` with the token from above:

#### 1. Get All Content
```bash
wget -q -O - \
  --header="Authorization: Bearer YOUR_TOKEN" \
  --header="ngrok-skip-browser-warning: true" \
  "http://localhost:8080/api/v1/patient-education"
```

#### 2. Get Categories
```bash
wget -q -O - \
  --header="Authorization: Bearer YOUR_TOKEN" \
  --header="ngrok-skip-browser-warning: true" \
  "http://localhost:8080/api/v1/patient-education/categories"
```

#### 3. Get Statistics
```bash
wget -q -O - \
  --header="Authorization: Bearer YOUR_TOKEN" \
  --header="ngrok-skip-browser-warning: true" \
  "http://localhost:8080/api/v1/patient-education/statistics"
```

#### 4. Search for "diabetes"
```bash
wget -q -O - \
  --header="Authorization: Bearer YOUR_TOKEN" \
  --header="ngrok-skip-browser-warning: true" \
  "http://localhost:8080/api/v1/patient-education?search=diabetes"
```

#### 5. Filter by Active Status
```bash
wget -q -O - \
  --header="Authorization: Bearer YOUR_TOKEN" \
  --header="ngrok-skip-browser-warning: true" \
  "http://localhost:8080/api/v1/patient-education?status=Active"
```

---

## ✅ Success Criteria

After completing all steps, you should have verified:

- [x] Page loads with sample data
- [x] List and Grid views work
- [x] Search functionality works
- [x] Category filter works
- [x] Status filter works
- [x] Clear filters works
- [x] Add new content works
- [x] Tags can be added/removed
- [x] Status toggle works
- [x] Edit content works
- [x] View content works
- [x] Delete content works
- [x] Pagination works (if applicable)

---

## 🐛 Troubleshooting

### Issue: Page shows "Loading..." forever
**Solution**: 
1. Check if API server is running: `ps aux | grep "node.*server.js"`
2. Check browser console for errors (F12)
3. Verify you're logged in

### Issue: "Unauthorized" error
**Solution**: 
1. Logout and login again
2. Check if token is in localStorage
3. Verify token hasn't expired

### Issue: No data showing
**Solution**: 
1. Check database: `SELECT COUNT(*) FROM patient_education_content;`
2. Should return 5 records
3. If 0, run the SQL script again

### Issue: Status toggle not working
**Solution**: 
1. Check browser console for errors
2. Verify API endpoint is accessible
3. Check network tab for failed requests

### Issue: Tags not saving
**Solution**: 
1. Make sure to click "Add" button or press Enter
2. Check if tag already exists (duplicates not allowed)
3. Verify tags appear as badges before saving

---

## 📊 Expected Sample Data

You should see these 5 records initially:

| Title | Category | Status | Tags |
|-------|----------|--------|------|
| Understanding Dental Hygiene | Dental Care | Active | dental, hygiene, teeth, oral health |
| Managing Diabetes | Chronic Conditions | Active | diabetes, blood sugar, chronic disease |
| Heart Health Tips | Cardiovascular | Active | heart, cardiovascular, exercise, diet |
| Pregnancy Care Guide | Women's Health | Active | pregnancy, prenatal, women health |
| Managing Anxiety | Mental Health | Inactive | anxiety, mental health, stress |

---

## 🎓 What to Look For

### Good Signs ✅
- Fast page load
- Smooth transitions
- Clear success messages
- Immediate UI updates
- No console errors
- Responsive design

### Bad Signs ❌
- Slow loading
- Console errors
- Failed API calls
- UI not updating
- Broken layout
- Missing data

---

## 📞 Need Help?

If tests fail:
1. Check browser console (F12)
2. Check API server logs
3. Verify database connection
4. Review error messages
5. Check network tab for failed requests

---

## 🎉 Test Complete!

If all steps passed, the Patient Education Module is working correctly!

**Next Steps**:
1. Add more content for your use case
2. Customize categories as needed
3. Train users on the interface
4. Monitor usage statistics

---

**Test Duration**: ~5-10 minutes
**Difficulty**: Easy
**Prerequisites**: System running, logged in
**Success Rate**: Should be 100% if setup is correct
