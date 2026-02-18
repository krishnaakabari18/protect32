# Providers Module Enhancement - Complete

## Summary
Successfully enhanced the Providers module with dropdown selection, clinic photo uploads with date-based folder structure, and clinic video URL field.

## Changes Made

### 1. Frontend Component (`backend/components/management/providers-crud.tsx`)
- Created custom ProvidersCRUD component with:
  - **Provider Dropdown**: Select provider by name from users list (filtered by user_type='provider')
  - **Clinic Photos Upload**: Multiple file upload with date-based folder organization
  - **Clinic Video URL**: Field for YouTube or other video URLs
  - **FormData Submission**: Proper file upload handling
  - **Provider Names Display**: Shows provider full name instead of user_id in list view
  
- Updated fields to match database schema:
  - `specialty` (not specialization)
  - `experience_years` (not years_of_experience)
  - `clinic_name` (required)
  - `contact_number` (required)
  - `location` (required)
  - `about` (description)
  - `clinic_photos` (array of file paths)
  - `clinic_video_url`
  - `availability` (schedule)

### 2. Page Integration (`backend/app/(defaults)/management/providers/page.tsx`)
- Updated to use custom `ProvidersCRUD` component instead of generic CRUD
- Removed old GenericCRUD implementation

### 3. API Controller (`api/src/controllers/providerController.js`)
- Added multer configuration for file uploads
- Implemented date-based folder structure: `uploads/provider/YYYY/MM/DD/`
- File naming: `timestamp_filename.ext`
- Image validation: JPEG, PNG, GIF, WebP only
- File size limit: 5MB per file
- Max 10 photos per upload
- Updated `createProvider()` to handle FormData and file uploads
- Updated `updateProvider()` to merge new photos with existing ones

### 4. API Model (`api/src/models/providerModel.js`)
- Fixed SQL parameter placeholders (using `$1`, `$2`, etc.)
- Added LEFT JOIN with users table to get provider names
- Returns `first_name`, `last_name`, `email`, `profile_picture` from users
- Proper handling of `clinic_photos` array
- Added `updated_at` timestamp on updates
- Validates allowed fields for updates

### 5. File Structure
- Created `api/uploads/provider/` directory
- Photos automatically organized by date when uploaded
- Example: `api/uploads/provider/2026/02/18/1708300000_clinic_photo.jpg`

## Database Schema (Already Exists)
```sql
CREATE TABLE providers (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    specialty VARCHAR(100) NOT NULL,
    experience_years INT NOT NULL,
    clinic_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    location VARCHAR(255) NOT NULL,
    coordinates JSONB,
    about TEXT,
    clinic_photos TEXT[], -- Array of image URLs
    clinic_video_url TEXT,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    availability VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Features

### Provider Dropdown
- Fetches all users with `user_type='provider'`
- Displays: "FirstName LastName (email@example.com)"
- Disabled in edit mode (can't change provider user)

### Clinic Photos Upload
- Multiple file selection
- Shows count of selected photos
- Organized in date-based folders automatically
- Photos stored as array in database
- Existing photos preserved when adding new ones

### Clinic Video URL
- Text input for video URLs
- Supports YouTube, Vimeo, or any video platform
- Stored as TEXT in database

### List View
- Shows provider full name (from users table)
- Displays specialty, clinic name, experience, location
- View, Edit, Delete actions
- Server-side pagination
- Search by specialty, clinic name, or provider name

## API Endpoints

### Create Provider
```
POST /api/v1/providers
Content-Type: multipart/form-data

FormData:
- id: UUID (provider user_id)
- specialty: string (required)
- clinic_name: string (required)
- contact_number: string (required)
- location: string (required)
- experience_years: number
- about: text
- clinic_video_url: string
- availability: string
- clinic_photos: file[] (max 10 files)
```

### Update Provider
```
PUT /api/v1/providers/:id
Content-Type: multipart/form-data

FormData: (same as create, but id is in URL)
- New photos are merged with existing ones
```

### Get All Providers
```
GET /api/v1/providers?page=1&limit=10
Returns: Provider data with user names from JOIN
```

### Get Provider by ID
```
GET /api/v1/providers/:id
Returns: Provider data with user info
```

### Delete Provider
```
DELETE /api/v1/providers/:id
```

## File Upload Details

### Storage Configuration
- **Base Path**: `uploads/provider/`
- **Date Structure**: `YYYY/MM/DD/`
- **Filename Format**: `timestamp_originalname.ext`
- **Example**: `uploads/provider/2026/02/18/1708300000_clinic_front.jpg`

### Validation
- **Allowed Types**: image/jpeg, image/jpg, image/png, image/gif, image/webp
- **Max File Size**: 5MB per file
- **Max Files**: 10 per upload
- **Error Handling**: Returns 400 with error message if validation fails

### Static File Serving
- Files accessible at: `http://localhost:8080/uploads/provider/YYYY/MM/DD/filename.jpg`
- Already configured in `api/src/app.js`

## Testing Steps

1. **Start Both Servers**:
   ```bash
   # Terminal 1 - API Server
   cd api
   npm run dev
   
   # Terminal 2 - Frontend
   cd backend
   npm run dev
   ```

2. **Access Providers Module**:
   - Login at: http://localhost:3001/auth/boxed-signin
   - Navigate to: Management > Providers

3. **Create Provider**:
   - Click "Add Provider"
   - Select provider from dropdown
   - Fill required fields (specialty, clinic name, contact, location)
   - Upload clinic photos (optional)
   - Add video URL (optional)
   - Click "Add"

4. **Verify**:
   - Provider appears in list with full name
   - Photos saved in date-based folder structure
   - Check: `api/uploads/provider/YYYY/MM/DD/`

5. **Edit Provider**:
   - Click edit icon
   - Upload additional photos
   - Photos are merged with existing ones
   - Click "Update"

## Notes

- Provider dropdown only shows users with `user_type='provider'`
- Photos are automatically organized by upload date
- Existing photos are preserved when uploading new ones
- Provider user_id cannot be changed after creation
- All file uploads use FormData (not JSON)
- Multer is already installed in package.json
- Static file serving is already configured

## Dependencies
- multer: ^1.4.5-lts.1 (already installed)
- express: ^4.18.2 (already installed)
- All other dependencies already present

## Status
✅ Frontend component created and integrated
✅ API controller updated with file upload handling
✅ API model updated with proper SQL and joins
✅ Upload directory structure created
✅ Static file serving configured
✅ No TypeScript or JavaScript errors
✅ Ready for testing
