# Reviews Module - Quick Test Guide

## 🚀 Quick Start

### Access Reviews
1. Login to admin panel
2. Navigate to: **Management > Reviews**
3. You should see the Reviews page with list/grid view

---

## ✅ 5-Minute Test

### Test 1: Add New Review (2 min)
```
1. Click "Add Review" button
2. Check Patient dropdown - should show names like "John Doe"
3. Check Provider dropdown - should show names like "Dr. Sarah Williams"
4. Fill form:
   - Patient: Select any patient
   - Provider: Select any provider
   - Rating: Select "5 - Excellent"
   - Review Text: "Great service!"
   - Review Date: (auto-filled with today)
5. Click "Add"
6. ✅ Success message should appear
7. ✅ New review should appear in list
```

### Test 2: Edit Review (1 min)
```
1. Click Pencil icon (✏️) on any review
2. ✅ Patient dropdown should show selected patient
3. ✅ Provider dropdown should show selected provider
4. Change rating to "4 - Very Good"
5. Click "Update"
6. ✅ Success message should appear
7. ✅ Changes should be visible in list
```

### Test 3: View Review (30 sec)
```
1. Click Eye icon (👁️) on any review
2. ✅ All fields should be read-only
3. ✅ Only "Close" button visible
4. Click "Close"
```

### Test 4: Filter by Rating (30 sec)
```
1. Select "5 Stars" from rating filter
2. ✅ Only 5-star reviews should show
3. Click "Clear Filter"
4. ✅ All reviews should show again
```

### Test 5: Delete Review (1 min)
```
1. Click Trash icon (🗑️) on any review
2. ✅ Confirmation dialog should appear
3. Click "Delete"
4. ✅ Success message should appear
5. ✅ Review should be removed from list
```

---

## 🎯 Expected Results

### Dropdowns Should Show:
- ✅ **Patient**: "John Doe", "Jane Smith" (NOT: 1, 2, 3)
- ✅ **Provider**: "Dr. Sarah Williams", "Dr. David Brown" (NOT: 1, 2, 3)
- ✅ **Rating**: "1 - Poor" to "5 - Excellent"

### List View Should Show:
- ✅ Patient full name
- ✅ Provider full name with "Dr." prefix
- ✅ Stars (⭐⭐⭐⭐⭐) with number (5/5)
- ✅ Review text (truncated if long)
- ✅ Date formatted as DD/MM/YYYY
- ✅ Action buttons (Eye, Pencil, Trash)

### Grid View Should Show:
- ✅ Cards with patient name
- ✅ Provider name
- ✅ Star rating
- ✅ Date
- ✅ Review text preview
- ✅ Action buttons

---

## ❌ Common Issues

### Issue: Dropdowns are empty
**Fix**: 
- Ensure patients exist in database
- Ensure providers exist in database
- Check API server is running (port 8080)
- Check browser console for errors

### Issue: Cannot save review
**Fix**:
- Fill all required fields (Patient, Provider, Rating)
- Check API server is running
- Check auth token is valid

### Issue: Date shows "Invalid Date"
**Fix**:
- Check date format in database
- Verify API returns valid date

---

## 📊 Test Data

### Minimum Required:
- At least 2 patients in database
- At least 2 providers in database
- At least 1 review for testing edit/delete

### Create Test Review:
```
Patient: Any patient from dropdown
Provider: Any provider from dropdown
Rating: 5 - Excellent
Review Text: "Excellent service and very professional!"
Review Date: Today (auto-filled)
```

---

## 🔍 What to Look For

### ✅ Good Signs:
- Dropdowns show names (not IDs)
- All buttons work
- Success messages appear
- Data saves correctly
- List updates after changes
- No console errors

### ❌ Bad Signs:
- Dropdowns show numbers (1, 2, 3)
- Errors in console
- Data doesn't save
- List doesn't update
- Blank screens
- Loading forever

---

## 📱 Quick Browser Test

### Desktop (Chrome/Firefox/Edge):
```
1. Open http://localhost:3001
2. Login
3. Go to Reviews
4. Test add/edit/delete
5. ✅ Should work perfectly
```

### Mobile (Responsive):
```
1. Resize browser to 375px width (F12 > Device toolbar)
2. Test same operations
3. ✅ Should work on mobile too
```

---

## 🎨 Visual Check

### List View:
```
┌────────────────────────────────────────────────────┐
│ Reviews                          [+ Add Review]    │
├────────────────────────────────────────────────────┤
│ Patient    │ Provider   │ Rating │ Review │ Date  │
│ John Doe   │ Dr. Smith  │ ⭐⭐⭐⭐⭐│ Great  │ 20/02 │
└────────────────────────────────────────────────────┘
```

### Add/Edit Modal:
```
┌─────────────────────────────────┐
│ Add Review                  [X] │
├─────────────────────────────────┤
│ Patient *                       │
│ [Select Patient ▼]              │
│                                 │
│ Provider *                      │
│ [Select Provider ▼]             │
│                                 │
│ Rating (1-5) *                  │
│ [Select Rating ▼]               │
│                                 │
│ Review Date                     │
│ [2026-02-20]                    │
│                                 │
│ Review Text                     │
│ [Write your review...]          │
│                                 │
│         [Cancel]  [Add]         │
└─────────────────────────────────┘
```

---

## ⚡ Performance Check

### Expected Load Times:
- Reviews list: < 1 second
- Patient dropdown: < 500ms
- Provider dropdown: < 500ms
- Save operation: < 1 second

### If Slow:
- Check network tab in browser
- Verify API server is running locally
- Check database connection

---

## 🐛 Report Issues

### If Something Doesn't Work:

1. **Check Browser Console** (F12)
   - Look for red errors
   - Copy error message

2. **Check Network Tab** (F12 > Network)
   - Look for failed requests (red)
   - Check response status (should be 200)

3. **Check API Server**
   - Is it running on port 8080?
   - Check terminal for errors

4. **Provide Details**:
   - What were you doing?
   - What did you expect?
   - What actually happened?
   - Any error messages?
   - Screenshots if possible

---

## ✨ Success Criteria

### All Tests Pass If:
- ✅ Can add new review with dropdowns
- ✅ Can edit existing review
- ✅ Can view review details
- ✅ Can delete review
- ✅ Can filter by rating
- ✅ Dropdowns show names (not IDs)
- ✅ All data saves correctly
- ✅ No console errors
- ✅ UI is responsive
- ✅ Loading states work

---

## 📞 Quick Reference

### URLs:
- UI: http://localhost:3001
- API: http://localhost:8080
- Reviews Page: http://localhost:3001/management/reviews

### API Endpoints:
- GET /api/v1/reviews
- POST /api/v1/reviews
- PUT /api/v1/reviews/:id
- DELETE /api/v1/reviews/:id
- GET /api/v1/patients
- GET /api/v1/providers

### Test Credentials:
- Username: admin
- Password: password123

---

**Status**: ✅ Ready for Testing
**Time Required**: 5 minutes
**Difficulty**: Easy

**Last Updated**: February 20, 2026
