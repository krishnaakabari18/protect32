# Quick Setup: AI Medication Suggestions

## 🚀 3-Minute Setup

### Step 1: Install Package (30 seconds)
```bash
cd api
npm install @google/generative-ai
```

### Step 2: Get API Key (1 minute)
1. Go to: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with "AIzaSy...")

### Step 3: Add to .env (30 seconds)
Open `api/.env` and add this line:
```env
GOOGLE_AI_API_KEY=AIzaSyABC123...your-actual-key-here
```

### Step 4: Restart API (30 seconds)
```bash
# In api folder
# Press Ctrl+C to stop
npm start
```

### Step 5: Test! (30 seconds)
1. Go to Prescriptions page
2. Click "Add Prescription"
3. Type "Paracetamol" in Medication Name
4. See AI suggestions appear! ✨

---

## What You Get

### Before (Old)
```
Medication Name: [empty text box]
```

### After (AI-Powered)
```
Medication Name: [Paracetamol...]
  ↓ (AI suggestions appear)
  📋 Paracetamol
     Generic: Acetaminophen
     Dosages: 500mg, 1000mg
     Uses: Pain relief and fever reduction
     Frequency: Every 4-6 hours
  
  📋 Paracetamol + Ibuprofen
     Generic: Acetaminophen + Ibuprofen
     Dosages: 500mg + 200mg
     Uses: Enhanced pain relief
     Frequency: Every 6 hours
```

Click any suggestion → Auto-fills dosage & frequency!

---

## Example Searches

Try these:
- "Paracetamol" → Pain relievers
- "Ibuprofen" → Anti-inflammatory
- "Amoxicillin" → Antibiotics
- "Metformin" → Diabetes medications
- "Lisinopril" → Blood pressure medications

---

## Troubleshooting

### No suggestions appearing?

**Check 1:** API key in .env?
```bash
cat api/.env | grep GOOGLE_AI
# Should show: GOOGLE_AI_API_KEY=AIzaSy...
```

**Check 2:** Package installed?
```bash
cd api
npm list @google/generative-ai
# Should show: @google/generative-ai@...
```

**Check 3:** API restarted?
```bash
# Must restart after adding .env
cd api
npm start
```

**Check 4:** Browser console errors?
Press F12 and check Console tab

---

## Files Changed

### Backend (3 files)
1. `api/src/controllers/medicationAIController.js` - NEW
2. `api/src/routes/v1/medicationAIRoutes.js` - NEW
3. `api/src/routes/v1/index.js` - UPDATED

### Frontend (4 files)
4. `components/ui/medication-ai-input.tsx` - NEW
5. `components/management/prescriptions-crud-with-ai.tsx` - NEW
6. `app/(defaults)/management/prescriptions/page.tsx` - UPDATED
7. `config/api.config.ts` - UPDATED

---

## Cost

**Free Tier:** 60 requests/minute
**Paid Tier:** Available if needed

For typical clinic usage, free tier is sufficient!

---

## Summary

✅ Install: `npm install @google/generative-ai`
✅ Get key: https://makersuite.google.com/app/apikey
✅ Add to .env: `GOOGLE_AI_API_KEY=your_key`
✅ Restart API: `npm start`
✅ Test: Type "Paracetamol" in prescriptions

**Total time: 3 minutes** ⏱️

---

**Ready to use AI-powered medication suggestions!** 🎉
