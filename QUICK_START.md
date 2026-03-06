# Quick Start - Procedure Dropdown Feature

## 🚀 3 Steps to Get Started

### 1️⃣ Run Database Migration (1 minute)
```bash
psql -U dentist -d dentist_newdb -f api/database/create-procedures-categories-table.sql
```
**Expected Output**: Summary showing 10 categories with procedure counts

### 2️⃣ Restart API Server (30 seconds)
```bash
cd api
npm start
```
**Expected Output**: Server running on port 8080

### 3️⃣ Test in Browser (2 minutes)
1. Open: http://localhost:3000/management/provider-fees
2. Click "Add Fee" button
3. Open "Procedure" dropdown
4. ✅ You should see categories with procedures!

---

## 📊 What You'll See

### Procedure Dropdown Structure:
```
Select Procedure
├─ Diagnostic & Preventive
│  ├─ Check up (Exam)
│  ├─ Digital X-Ray (IOPA)
│  └─ ... (16 total)
├─ Restorative
│  ├─ Amalgam (surfaces - 1234)
│  └─ ... (8 total)
├─ Endodontic
│  └─ ... (9 total)
└─ ... (10 categories total)
```

---

## ✨ Features to Test

### ✅ Add New Procedure
1. Click "+ Add New Procedure" link
2. Select category
3. Enter procedure name
4. Click "Add Procedure"
5. New procedure appears in dropdown

### ✅ Edit Mode Behavior
1. Add a fee with a specific procedure
2. Click "Edit" on that fee
3. Open procedure dropdown
4. Already-used procedure shows "(Already added)" and is disabled

---

## 🔍 Verify API Works

### Quick Test (Optional):
```bash
# Get all procedures
curl -H "ngrok-skip-browser-warning: true" \
  https://abbey-stateliest-treva.ngrok-free.dev/api/v1/procedures

# Get by category
curl -H "ngrok-skip-browser-warning: true" \
  https://abbey-stateliest-treva.ngrok-free.dev/api/v1/procedures/by-category
```

---

## 📚 Full Documentation

- **Setup Guide**: `PROCEDURE_SETUP_GUIDE.md`
- **Complete Summary**: `TASK_COMPLETE_SUMMARY.md`
- **API Test Script**: `api/test-procedures-api.js`

---

## ❓ Troubleshooting

### Dropdown is empty?
- ✅ Check if database migration ran successfully
- ✅ Verify API server is running
- ✅ Check browser console for errors

### "Already added" not working?
- ✅ Make sure you're in edit mode (not create mode)
- ✅ Verify provider is selected
- ✅ Check that procedure was actually added before

### Can't add new procedure?
- ✅ Check if you're logged in (auth token valid)
- ✅ Verify API server is running
- ✅ Check network tab for API errors

---

## 🎯 Success Checklist

- [ ] Database migration completed
- [ ] API server restarted
- [ ] Procedure dropdown shows categories
- [ ] All 90+ procedures visible
- [ ] "Add New Procedure" works
- [ ] Edit mode disables used procedures
- [ ] Swagger docs accessible at `/api-docs`

---

**Need Help?** Check `PROCEDURE_SETUP_GUIDE.md` for detailed troubleshooting!
