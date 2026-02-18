# Patient & Provider Names Display Update

## Summary

Updated all modules to display patient and provider full names (firstname + lastname) instead of showing UUID IDs.

## Changes Made

### Backend API Updates

#### 1. Added Pagination Support
All controllers now support pagination with `page` and `limit` query parameters.

**Updated Controllers:**
- `api/src/controllers/patientController.js`
- `api/src/controllers/providerController.js`
- `api/src/controllers/appointmentController.js`
- `api/src/controllers/prescriptionController.js`
- `api/src/controllers/treatmentPlanController.js`
- `api/src/controllers/paymentController.js`
- `api/src/controllers/documentController.js`
- `api/src/controllers/reviewController.js`
- `api/src/controllers/notificationController.js`

#### 2. Added User Joins to Models
All models now join with the `users` table to fetch patient and provider names.

**Updated Models:**
- `api/src/models/prescriptionModel.js` - Added LEFT JOIN with users for patient and provider
- `api/src/models/treatmentPlanModel.js` - Added LEFT JOIN with users for patient and provider
- `api/src/models/documentModel.js` - Added LEFT JOIN with users for patient and provider
- `api/src/models/reviewModel.js` - Added LEFT JOIN with users for patient and provider
- `api/src/models/paymentModel.js` - Added LEFT JOIN with users for patient

**Existing Models (Already had joins):**
- `api/src/models/patientModel.js` - Already joins with users
- `api/src/models/providerModel.js` - Already joins with users
- `api/src/models/appointmentModel.js` - Already joins with users

#### 3. API Response Format

All list endpoints now return:
```json
{
  "data": [
    {
      "id": "uuid",
      "patient_id": "uuid",
      "patient_first_name": "John",
      "patient_last_name": "Doe",
      "provider_id": "uuid",
      "provider_first_name": "Dr. Jane",
      "provider_last_name": "Smith",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### Frontend Updates

#### Updated Module Pages

All module pages now display full names instead of IDs:

1. **Appointments** (`backend/app/(defaults)/management/appointments/page.tsx`)
   - Patient ID → Patient Name (firstname + lastname)
   - Provider ID → Provider Name (firstname + lastname)

2. **Documents** (`backend/app/(defaults)/management/documents/page.tsx`)
   - Patient ID → Patient Name
   - Provider ID → Provider Name

3. **Treatment Plans** (`backend/app/(defaults)/management/treatment-plans/page.tsx`)
   - Patient ID → Patient Name
   - Provider ID → Provider Name

4. **Reviews** (`backend/app/(defaults)/management/reviews/page.tsx`)
   - Patient ID → Patient Name
   - Provider ID → Provider Name

5. **Prescriptions** (`backend/app/(defaults)/management/prescriptions/page.tsx`)
   - Patient ID → Patient Name
   - Provider ID → Provider Name

6. **Payments** (`backend/app/(defaults)/management/payments/page.tsx`)
   - Patient ID → Patient Name

#### Column Rendering Logic

Each module now uses a custom render function:

```typescript
{
    key: 'patient_id',
    label: 'Patient Name',
    render: (value, row) => row.patient_first_name && row.patient_last_name 
        ? `${row.patient_first_name} ${row.patient_last_name}`
        : value || '-'
}
```

This ensures:
- If names are available, display "Firstname Lastname"
- If names are missing, fall back to showing the ID
- If both are missing, display "-"

## Benefits

1. **Better UX**: Users see meaningful names instead of cryptic UUIDs
2. **Easier Identification**: Quickly identify patients and providers
3. **Professional Look**: More polished and user-friendly interface
4. **Consistent**: All modules follow the same pattern

## Testing

### API Testing

Test that names are returned:
```bash
curl -X GET "http://localhost:8080/api/v1/appointments?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "ngrok-skip-browser-warning: true"
```

Expected response should include:
- `patient_first_name`
- `patient_last_name`
- `provider_first_name`
- `provider_last_name`

### Frontend Testing

1. Login to the application
2. Navigate to each module:
   - Appointments
   - Documents
   - Treatment Plans
   - Reviews
   - Prescriptions
   - Payments

3. Verify that:
   - Patient names are displayed instead of IDs
   - Provider names are displayed instead of IDs
   - Names are formatted as "Firstname Lastname"
   - Fallback to ID if names are missing

## Before vs After

### Before
```
ID                                    Patient ID                            Provider ID
c88dbb79-0653-4063-8e8d-d1110480aedc  51f141d9-554d-4c07-a980-5ad3a001d3d6  c9418c98-ca78-44e9-99da-96e7e25df359
```

### After
```
ID                                    Patient Name    Provider Name
c88dbb79-0653-4063-8e8d-d1110480aedc  John Doe        Dr. Jane Smith
```

## Files Modified

### API (Backend)
- api/src/controllers/patientController.js
- api/src/controllers/providerController.js
- api/src/controllers/appointmentController.js
- api/src/controllers/prescriptionController.js
- api/src/controllers/treatmentPlanController.js
- api/src/controllers/paymentController.js
- api/src/controllers/documentController.js
- api/src/controllers/reviewController.js
- api/src/controllers/notificationController.js
- api/src/models/prescriptionModel.js
- api/src/models/treatmentPlanModel.js
- api/src/models/documentModel.js
- api/src/models/reviewModel.js
- api/src/models/paymentModel.js

### Frontend
- backend/app/(defaults)/management/appointments/page.tsx
- backend/app/(defaults)/management/documents/page.tsx
- backend/app/(defaults)/management/treatment-plans/page.tsx
- backend/app/(defaults)/management/reviews/page.tsx
- backend/app/(defaults)/management/prescriptions/page.tsx
- backend/app/(defaults)/management/payments/page.tsx

## Next Steps

1. Restart the API server to apply changes
2. Refresh the frontend
3. Test all modules to verify names are displaying correctly
4. Consider adding search by patient/provider name functionality

---

**All modules now display patient and provider names!** 🎉
