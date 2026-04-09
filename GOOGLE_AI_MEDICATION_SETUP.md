# Google AI Medication Suggestions - Setup Guide

## Overview
This feature integrates Google AI (Gemini) to provide intelligent medication suggestions when prescribing. When you type a medication name like "Paracetamol", it shows related medications with dosages, frequencies, and uses.

## Features
✨ AI-powered medication search
✨ Real-time suggestions as you type
✨ Shows generic names, dosages, and common uses
✨ Auto-fills dosage and frequency when selecting
✨ Powered by Google Gemini AI

---

## Installation Steps

### Step 1: Install Google AI Package
```bash
cd api
npm install @google/generative-ai
```

### Step 2: Get Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key" or "Create API Key"
3. Copy the API key

### Step 3: Add API Key to .env

Open `api/.env` and add:
```env
GOOGLE_AI_API_KEY=your_api_key_here
```

Example:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dentist
DB_USER=dentist
DB_PASSWORD=dentist123

# JWT
JWT_SECRET=your-secret-key-here

# Google AI
GOOGLE_AI_API_KEY=AIzaSyABC123XYZ...your-actual-key
```

### Step 4: Restart API Server
```bash
# Stop current server (Ctrl+C)
npm start
```

### Step 5: Test the Feature

1. Go to Prescriptions page
2. Click "Add Prescription"
3. Type "Paracetamol" in Medication Name field
4. Wait 0.5 seconds - AI suggestions will appear!
5. Click a suggestion to auto-fill

---

## How It Works

### Frontend Flow
```
User types "Paracetamol"
    ↓ (debounced 500ms)
MedicationAIInput component
    ↓ (API call)
/api/v1/medication-ai/suggestions?query=Paracetamol
    ↓
Backend calls Google AI
    ↓
Returns medication suggestions
    ↓
Display in dropdown with details
    ↓
User selects → Auto-fills dosage & frequency
```

### Backend Flow
```
API receives query
    ↓
Calls Google Gemini AI
    ↓
Sends prompt: "Suggest medications for 'Paracetamol'"
    ↓
AI returns JSON with medications
    ↓
Parse and return to frontend
```

---

## API Endpoints

### Get Medication Suggestions
```
GET /api/v1/medication-ai/suggestions?query=Paracetamol
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "name": "Paracetamol",
      "genericName": "Acetaminophen",
      "commonDosages": ["500mg", "1000mg"],
      "commonUses": "Pain relief and fever reduction",
      "frequency": "Every 4-6 hours as needed"
    },
    {
      "name": "Paracetamol + Ibuprofen",
      "genericName": "Acetaminophen + Ibuprofen",
      "commonDosages": ["500mg + 200mg"],
      "commonUses": "Enhanced pain relief",
      "frequency": "Every 6 hours"
    }
  ],
  "query": "Paracetamol",
  "source": "Google AI (Gemini)"
}
```

---

## Component Usage

### MedicationAIInput Component

```tsx
import MedicationAIInput from '@/components/ui/medication-ai-input';

<MedicationAIInput
    value={medicationName}
    onChange={(value, suggestion) => {
        setMedicationName(value);
        // suggestion contains full medication details
    }}
    onSelectDosage={(dosage) => {
        setDosage(dosage); // Auto-fill dosage
    }}
    onSelectFrequency={(frequency) => {
        setFrequency(frequency); // Auto-fill frequency
    }}
    placeholder="Type medication name..."
/>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `value` | string | Current medication name |
| `onChange` | function | Called when value changes |
| `onSelectDosage` | function | Called when suggestion selected (auto-fill dosage) |
| `onSelectFrequency` | function | Called when suggestion selected (auto-fill frequency) |
| `disabled` | boolean | Disable input |
| `placeholder` | string | Placeholder text |
| `className` | string | Additional CSS classes |

---

## Files Created

### Backend
1. ✅ `api/src/controllers/medicationAIController.js` - AI controller
2. ✅ `api/src/routes/v1/medicationAIRoutes.js` - API routes
3. ✅ Updated `api/src/routes/v1/index.js` - Register routes

### Frontend
4. ✅ `components/ui/medication-ai-input.tsx` - AI input component
5. ✅ `components/management/prescriptions-crud-with-ai.tsx` - Updated prescriptions page
6. ✅ Updated `app/(defaults)/management/prescriptions/page.tsx` - Use AI component
7. ✅ Updated `config/api.config.ts` - Add medication AI endpoint

---

## Testing

### Test 1: Basic Search
1. Type "Paracetamol"
2. Should show 5-10 medication suggestions
3. Each suggestion shows:
   - Medication name
   - Generic name
   - Common dosages
   - Common uses
   - Typical frequency

### Test 2: Auto-Fill
1. Type "Paracetamol"
2. Click first suggestion
3. Dosage field should auto-fill (e.g., "500mg")
4. Frequency field should auto-fill (e.g., "Every 4-6 hours")

### Test 3: Different Medications
Try searching:
- "Ibuprofen"
- "Amoxicillin"
- "Aspirin"
- "Metformin"
- "Lisinopril"

### Test 4: Partial Search
- Type "Para" → Should suggest Paracetamol
- Type "Ibu" → Should suggest Ibuprofen
- Type "Amox" → Should suggest Amoxicillin

---

## Troubleshooting

### Issue 1: No Suggestions Appearing

**Check 1: API Key Set?**
```bash
# In api/.env
GOOGLE_AI_API_KEY=AIzaSy...
```

**Check 2: Package Installed?**
```bash
cd api
npm list @google/generative-ai
```

**Check 3: API Server Restarted?**
```bash
# Must restart after adding .env variable
npm start
```

**Check 4: Console Errors?**
Open browser console (F12) and check for errors

### Issue 2: "API key not configured" Error

**Solution:** Add GOOGLE_AI_API_KEY to `api/.env` file

### Issue 3: Slow Suggestions

**Normal:** AI takes 1-3 seconds to respond
**Optimization:** Debounce is set to 500ms (adjustable in component)

### Issue 4: Invalid JSON Response

**Cause:** AI sometimes returns markdown instead of pure JSON
**Solution:** Already handled in code - removes markdown code blocks

---

## Customization

### Change Debounce Time
In `medication-ai-input.tsx`:
```tsx
timeoutRef.current = setTimeout(() => {
    fetchSuggestions(newValue);
}, 500); // Change to 300 or 1000 ms
```

### Change Number of Suggestions
In `medicationAIController.js`:
```javascript
const prompt = `...
Provide 5-10 most relevant medications.`; // Change to 3-5 or 10-15
```

### Customize AI Prompt
In `medicationAIController.js`, modify the prompt:
```javascript
const prompt = `You are a medical assistant...
[Customize this prompt to change AI behavior]`;
```

---

## Cost & Limits

### Google AI (Gemini) Pricing
- **Free Tier:** 60 requests per minute
- **Paid Tier:** Higher limits available

### Optimization Tips
1. Debounce input (already implemented)
2. Cache common medications (future enhancement)
3. Minimum 2 characters before search (already implemented)

---

## Security Notes

### API Key Security
- ✅ API key stored in .env (not in code)
- ✅ .env file in .gitignore
- ✅ API key only on backend (not exposed to frontend)
- ✅ Authentication required for API endpoint

### Data Privacy
- ✅ No patient data sent to Google AI
- ✅ Only medication names sent
- ✅ Responses are suggestions only (not medical advice)

---

## Future Enhancements

### Possible Additions
1. **Caching:** Cache common medications to reduce API calls
2. **Offline Mode:** Fallback to local medication database
3. **Drug Interactions:** Check for interactions between medications
4. **Allergy Warnings:** Alert if patient has allergies
5. **Dosage Calculator:** Calculate dosage based on patient weight/age
6. **Multi-language:** Support for multiple languages

---

## Summary

✅ **Installed:** Google AI package
✅ **Created:** Backend API for medication suggestions
✅ **Created:** Frontend AI input component
✅ **Updated:** Prescriptions page with AI
✅ **Configured:** API routes and endpoints

**Next Steps:**
1. Install package: `npm install @google/generative-ai`
2. Get API key from Google AI Studio
3. Add to .env: `GOOGLE_AI_API_KEY=your_key`
4. Restart API server
5. Test in Prescriptions page!

---

## Support

### Get Google AI API Key
https://makersuite.google.com/app/apikey

### Google AI Documentation
https://ai.google.dev/docs

### Gemini API Reference
https://ai.google.dev/api/rest

---

**Enjoy AI-powered medication suggestions!** ✨🤖
