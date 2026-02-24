# Provider Module Fix V2 - Multer Middleware

## Issue
The null ID error was still occurring because the multer middleware was being called inside the controller instead of being applied to the route.

## Root Cause
When multer is called inside the controller with `uploadClinicPhotos(req, res, async (err) => {...})`, it creates a nested callback structure that doesn't properly process the FormData before the controller logic runs.

## Solution
Move the multer middleware to the route definition so it processes the FormData BEFORE the controller is called.

## Changes Made

### 1. Controller (`api/src/controllers/providerController.js`)
- Removed the nested multer callback structure
- Made controller methods direct async functions
- Added extensive console logging for debugging
- Exported the `uploadClinicPhotos` middleware separately
- Controller now receives already-processed `req.body` and `req.files`

### 2. Routes (`api/src/routes/v1/providerRoutes.js`)
- Imported `uploadClinicPhotos` middleware
- Applied middleware to POST route: `router.post('/', uploadClinicPhotos, ProviderController.createProvider)`
- Applied middleware to PUT route: `router.put('/:id', uploadClinicPhotos, ProviderController.updateProvider)`
- Updated Swagger docs to reflect `multipart/form-data` content type

## How It Works Now

### Request Flow:
1. **Client** sends FormData with files to `/api/v1/providers`
2. **Express Router** receives the request
3. **Multer Middleware** (`uploadClinicPhotos`) processes the FormData:
   - Extracts text fields to `req.body`
   - Saves files to disk with date-based folder structure
   - Adds file info to `req.files`
4. **Controller** receives processed request with:
   - `req.body.id` - the provider user_id
   - `req.body.specialty` - the specialty
   - `req.body.clinic_name` - the clinic name
   - etc.
   - `req.files` - array of uploaded files
5. **Controller** validates and saves to database

## Console Logs

When you create a provider, you'll see in the API console:

```
=== CREATE PROVIDER DEBUG ===
Request Body: {
  id: 'uuid-here',
  specialty: 'Orthodontist',
  experience_years: '5',
  clinic_name: 'Smile Dental Clinic',
  contact_number: '555-1234',
  location: '123 Main St',
  about: 'Best dental clinic',
  clinic_video_url: 'https://youtube.com/...',
  availability: 'Mon-Fri 9-5'
}
Request Files: [
  {
    fieldname: 'clinic_photos',
    originalname: 'clinic1.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    destination: 'uploads/provider/2026/02/18',
    filename: '1708300000_clinic1.jpg',
    path: 'uploads/provider/2026/02/18/1708300000_clinic1.jpg',
    size: 123456
  }
]
Provider ID: uuid-here
Provider Data: { id: 'uuid-here', specialty: 'Orthodontist', ... }
Uploaded Photos: ['uploads/provider/2026/02/18/1708300000_clinic1.jpg']
Creating provider with data: { ... }
Provider created successfully: { ... }
```

## Testing Steps

1. **Restart API Server** (IMPORTANT!):
   ```bash
   cd api
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

2. **Clear Browser Cache** (optional but recommended):
   - Hard refresh: Ctrl+Shift+R (Linux/Windows) or Cmd+Shift+R (Mac)

3. **Test Provider Creation**:
   - Go to: http://localhost:3001/management/providers
   - Click "Add Provider"
   - Select a provider from dropdown
   - Fill in all required fields:
     - Specialty: "Orthodontist"
     - Clinic Name: "Smile Dental Clinic"
     - Contact Number: "555-1234"
     - Location: "123 Main St, City"
   - Optional: Upload 1-2 clinic photos
   - Optional: Add video URL
   - Click "Add"

4. **Check API Console**:
   - You should see the debug logs
   - Verify `id` is present in Request Body
   - Verify files are in Request Files (if uploaded)

5. **Verify Success**:
   - Provider should be created
   - Success message should appear
   - Provider should appear in the list
   - Photos should be in: `api/uploads/provider/YYYY/MM/DD/`

## What Changed

### Before (WRONG):
```javascript
// Controller
static async createProvider(req, res) {
  uploadClinicPhotos(req, res, async (err) => {
    // Controller logic here
  });
}

// Route
router.post('/', ProviderController.createProvider);
```

### After (CORRECT):
```javascript
// Controller
static async createProvider(req, res) {
  // Controller logic here - req.body and req.files already processed
}

// Route
router.post('/', uploadClinicPhotos, ProviderController.createProvider);
```

## Key Points

1. **Middleware Order Matters**: Multer must run BEFORE the controller
2. **Route-Level Middleware**: Apply multer at the route level, not inside controller
3. **Separate Export**: Export the middleware separately so routes can use it
4. **Console Logs**: Extensive logging helps debug FormData issues
5. **Content Type**: Swagger docs updated to show `multipart/form-data`

## Error Messages

If you still see errors, check the console logs:

### "Provider ID (user_id) is required"
- The dropdown selection is not being sent
- Check that you selected a provider from the dropdown
- Check console logs to see if `req.body.id` is undefined

### "Specialty is required" (or other field)
- The form field is empty
- Fill in all required fields marked with *

### "Invalid file type"
- You're trying to upload a non-image file
- Only JPEG, PNG, GIF, WebP allowed

### "File too large"
- File exceeds 5MB limit
- Compress the image or use a smaller file

## Status
✅ Multer middleware moved to route level
✅ Controller simplified to direct async functions
✅ Extensive console logging added
✅ Swagger docs updated for multipart/form-data
✅ Both POST and PUT routes updated
✅ No syntax errors
✅ Ready for testing - RESTART API SERVER!
