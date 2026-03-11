# URL Conversion Implementation

## Overview
All API endpoints now return absolute URLs for image and document fields instead of relative paths.

## Implementation Date
February 24, 2026

## Changes Made

### 1. URL Helper Utility (`api/src/utils/urlHelper.js`)
Created a comprehensive utility for converting relative paths to absolute URLs:

- `getBaseUrl()` - Gets BASE_URL from environment or constructs from PORT
- `toAbsoluteUrl(path)` - Converts single relative path to absolute URL
- `toAbsoluteUrls(paths)` - Converts array of paths to absolute URLs
- `convertProviderUrls(provider)` - Converts provider image fields
- `convertUserUrls(user)` - Converts user profile picture
- `convertDocumentUrls(document)` - Converts document file paths
- `convertEducationUrls(education)` - Converts education feature images

### 2. Environment Configuration
Updated `api/.env` to include:
```env
BASE_URL=https://occupiable-milissa-ennuyante.ngrok-free.dev
```

### 3. Updated Controllers

#### Provider Controller (`api/src/controllers/providerController.js`)
- ✅ `getAllProviders()` - Converts clinic_photos, profile_picture, clinic_video_url
- ✅ `getProviderById()` - Converts all image fields
- ✅ `createProvider()` - Returns absolute URLs in response
- ✅ `updateProvider()` - Returns absolute URLs in response

#### User Controller (`api/src/controllers/userController.js`)
- ✅ `getAllUsers()` - Converts profile_picture for all users
- ✅ `getUserById()` - Converts profile_picture
- ✅ `createUser()` - Returns absolute URL in response
- ✅ `updateUser()` - Returns absolute URL in response

#### Document Controller (`api/src/controllers/documentController.js`)
- ✅ `getAll()` - Converts file_url and files array paths
- ✅ `getById()` - Converts all file fields
- ✅ `create()` - Returns absolute URLs in response
- ✅ `update()` - Returns absolute URLs in response
- ✅ `deleteFile()` - Returns absolute URLs in response

#### Patient Education Controller (`api/src/controllers/patientEducationController.js`)
- ✅ `getAll()` - Converts feature_image for all content
- ✅ `getById()` - Converts feature_image
- ✅ `create()` - Returns absolute URL in response
- ✅ `update()` - Returns absolute URL in response
- ✅ `updateStatus()` - Returns absolute URL in response

#### Auth Controller (`api/src/controllers/authController.js`)
- ✅ `getProfile()` - Converts profile_picture in user profile

## URL Format

### Before (Relative Paths)
```json
{
  "clinic_photos": ["uploads/provider/2026/02/24/image.jpg"],
  "profile_picture": "/uploads/users/user-id/profile.jpg"
}
```

### After (Absolute URLs)
```json
{
  "clinic_photos": ["https://occupiable-milissa-ennuyante.ngrok-free.dev/uploads/provider/2026/02/24/image.jpg"],
  "profile_picture": "https://occupiable-milissa-ennuyante.ngrok-free.dev/uploads/users/user-id/profile.jpg"
}
```

## Fields Converted

### Providers
- `clinic_photos` (array)
- `profile_picture` (string)
- `clinic_video_url` (string)

### Users
- `profile_picture` (string)

### Documents
- `file_url` (string - backward compatibility)
- `files[].path` (array of objects)
- `files[].url` (added for convenience)

### Patient Education
- `feature_image` (string)

## Testing

### Test Scripts
1. `test-provider-urls.sh` - Tests provider API URL conversion
2. `test-all-url-conversions.sh` - Tests all endpoints

### Manual Testing
```bash
# Test Provider API
curl -X GET "https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/providers" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test User API
curl -X GET "https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/users" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test Documents API
curl -X GET "https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/documents" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test Patient Education API
curl -X GET "https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/patient-education" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Benefits

1. **Mobile App Compatibility** - Mobile apps can directly use URLs without constructing them
2. **Consistency** - All endpoints return URLs in the same format
3. **Flexibility** - BASE_URL can be changed in .env without code changes
4. **Backward Compatibility** - Existing relative paths are converted automatically

## Configuration

To change the base URL, update `api/.env`:
```env
BASE_URL=https://your-domain.com
```

For local development:
```env
BASE_URL=http://localhost:8080
```

## Notes

- URL conversion happens at the controller level before sending response
- Original database values remain as relative paths
- No database migration required
- Works with both string paths and array of paths
- Handles null/undefined values gracefully
- Removes leading slashes from paths automatically

## Future Enhancements

1. Add URL conversion for other controllers if needed
2. Consider adding URL signing for secure file access
3. Add CDN support by changing BASE_URL to CDN domain
4. Add image optimization/resizing parameters to URLs
