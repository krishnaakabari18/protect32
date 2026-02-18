# Provider Module Fix - Null ID Error

## Issue
When creating a provider, the error "null value in column 'id' of relation 'providers' violates not-null constraint" was occurring.

## Root Cause
The FormData was not being properly extracted in the backend controller. Using `{ ...req.body }` with FormData doesn't work as expected because FormData fields need to be explicitly accessed.

## Fix Applied

### Backend Controller (`api/src/controllers/providerController.js`)

#### Before:
```javascript
const providerData = { ...req.body };
```

#### After:
```javascript
const providerData = {
  id: req.body.id,
  specialty: req.body.specialty,
  experience_years: parseInt(req.body.experience_years) || 0,
  clinic_name: req.body.clinic_name,
  contact_number: req.body.contact_number,
  location: req.body.location,
  about: req.body.about || null,
  clinic_video_url: req.body.clinic_video_url || null,
  availability: req.body.availability || null,
  coordinates: req.body.coordinates || null,
};
```

### Changes Made:
1. **Explicit Field Extraction**: Each field is now explicitly extracted from `req.body`
2. **Type Conversion**: `experience_years` is converted to integer
3. **Validation**: Added validation for all required fields before database insert
4. **Error Messages**: Clear error messages for missing required fields
5. **Console Logging**: Added debug logs to track data flow
6. **Default Values**: Proper handling of optional fields with null defaults

### Validation Added:
- Provider ID (user_id) is required
- Specialty is required
- Clinic name is required
- Contact number is required
- Location is required

## Testing Steps

1. **Restart API Server**:
   ```bash
   cd api
   npm run dev
   ```

2. **Access Providers Module**:
   - Login at: http://localhost:3001/auth/boxed-signin
   - Navigate to: Management > Providers

3. **Create Provider**:
   - Click "Add Provider"
   - Select a provider from dropdown (must be a user with user_type='provider')
   - Fill in required fields:
     - Specialty (e.g., "Orthodontist")
     - Clinic Name (e.g., "Smile Dental Clinic")
     - Contact Number (e.g., "555-1234")
     - Location (e.g., "123 Main St, City")
   - Optional fields:
     - Experience Years
     - About
     - Availability
     - Clinic Video URL
     - Clinic Photos (upload images)
   - Click "Add"

4. **Check Console**:
   - API server console will show:
     - Request Body data
     - Files uploaded
     - Provider Data being sent to database
   - This helps debug if there are still issues

5. **Verify Success**:
   - Provider should be created successfully
   - Photos should be in: `api/uploads/provider/YYYY/MM/DD/`
   - Provider should appear in the list with full name

## Expected Behavior

### Success Response:
```json
{
  "message": "Provider created successfully",
  "data": {
    "id": "uuid-here",
    "specialty": "Orthodontist",
    "clinic_name": "Smile Dental Clinic",
    "contact_number": "555-1234",
    "location": "123 Main St, City",
    "experience_years": 5,
    "about": "...",
    "clinic_photos": ["uploads/provider/2026/02/18/..."],
    "clinic_video_url": "https://...",
    "availability": "Mon-Fri 9-5",
    "created_at": "2026-02-18T...",
    "updated_at": "2026-02-18T..."
  }
}
```

### Error Response (Missing Required Field):
```json
{
  "error": "Specialty is required"
}
```

## Common Issues & Solutions

### Issue: "Provider ID (user_id) is required"
**Solution**: Make sure you selected a provider from the dropdown. The dropdown only shows users with `user_type='provider'`.

### Issue: No providers in dropdown
**Solution**: 
1. First create users with `user_type='provider'` in the Users module
2. Then those users will appear in the provider dropdown

### Issue: Photos not uploading
**Solution**: 
1. Check file size (max 5MB per file)
2. Check file type (only JPEG, PNG, GIF, WebP allowed)
3. Check max 10 files per upload
4. Check `api/uploads/provider/` directory exists and is writable

### Issue: Still getting null ID error
**Solution**:
1. Check API server console logs to see what data is being received
2. Verify the selected user_id is a valid UUID
3. Check that the user exists in the users table
4. Verify the user doesn't already have a provider record

## Debug Console Logs

When creating a provider, you should see in the API console:
```
Create Provider - Request Body: {
  id: 'uuid-here',
  specialty: 'Orthodontist',
  clinic_name: 'Smile Dental Clinic',
  ...
}
Create Provider - Files: [ { filename: '...', path: '...' } ]
Create Provider - Provider Data: {
  id: 'uuid-here',
  specialty: 'Orthodontist',
  ...
}
```

If `id` is undefined or null in these logs, the issue is in the frontend FormData creation.

## Status
✅ Controller updated to explicitly extract FormData fields
✅ Validation added for all required fields
✅ Console logging added for debugging
✅ Error handling improved
✅ Ready for testing
