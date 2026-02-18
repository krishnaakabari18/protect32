# File Upload Implementation Guide

## Overview
Profile picture upload functionality has been implemented with role-based folder organization.

## Features Implemented

### 1. Upload Directory Structure
```
uploads/
├── patient/
│   ├── profile_pictures/
│   └── documents/
├── provider/
│   ├── profile_pictures/
│   └── documents/
└── admin/
    ├── profile_pictures/
    └── documents/
```

### 2. File Upload Endpoints

#### A. User Registration with Profile Picture
**Endpoint:** `POST /api/v1/auth/register`
**Content-Type:** `multipart/form-data`

**Fields:**
- `email` (required)
- `password` (required)
- `first_name` (required)
- `last_name` (required)
- `user_type` (required: patient, provider, admin)
- `mobile_number` (optional)
- `date_of_birth` (optional)
- `address` (optional)
- `profile_picture` (optional file - JPEG, PNG, GIF, WebP, max 5MB)

**Example using curl:**
```bash
curl -X POST 'http://localhost:3000/api/v1/auth/register' \
  -H 'ngrok-skip-browser-warning: true' \
  -F 'email=newuser@example.com' \
  -F 'password=password123' \
  -F 'first_name=John' \
  -F 'last_name=Doe' \
  -F 'user_type=patient' \
  -F 'profile_picture=@/path/to/image.jpg'
```

#### B. Create User with Profile Picture
**Endpoint:** `POST /api/v1/users`
**Content-Type:** `multipart/form-data`

**Fields:** Same as registration

#### C. Update User with Profile Picture
**Endpoint:** `PUT /api/v1/users/{id}`
**Content-Type:** `multipart/form-data`

**Fields:**
- `first_name` (optional)
- `last_name` (optional)
- `mobile_number` (optional)
- `address` (optional)
- `is_active` (optional)
- `profile_picture` (optional file)

**Example:**
```bash
curl -X PUT 'http://localhost:3000/api/v1/users/USER_ID' \
  -H 'ngrok-skip-browser-warning: true' \
  -F 'first_name=Jane' \
  -F 'profile_picture=@/path/to/new-image.jpg'
```

#### D. Upload Profile Picture Only
**Endpoint:** `POST /api/v1/users/{id}/profile-picture`
**Content-Type:** `multipart/form-data`

**Fields:**
- `profile_picture` (required file)

**Example:**
```bash
curl -X POST 'http://localhost:3000/api/v1/users/USER_ID/profile-picture' \
  -H 'ngrok-skip-browser-warning: true' \
  -F 'profile_picture=@/path/to/image.jpg'
```

## File Specifications

### Profile Pictures
- **Allowed formats:** JPEG, JPG, PNG, GIF, WebP
- **Maximum size:** 5MB
- **Naming convention:** `{userId}_{timestamp}.{ext}`
- **Storage path:** `uploads/{user_type}/profile_pictures/`

### Documents (for future use)
- **Allowed formats:** Images, PDF, Word documents
- **Maximum size:** 10MB
- **Storage path:** `uploads/{user_type}/documents/`

## File Management

### Automatic File Deletion
The system automatically deletes old profile pictures when:
1. User uploads a new profile picture
2. User is deleted
3. Upload fails (cleanup on error)

### Accessing Uploaded Files
Files are served statically at: `http://localhost:3000/uploads/{user_type}/profile_pictures/{filename}`

**Example:**
```
http://localhost:3000/uploads/patient/profile_pictures/user-id_1234567890.jpg
```

## Implementation Details

### Files Modified
1. `src/utils/upload.js` - Multer configuration with role-based storage
2. `src/controllers/userController.js` - Added file upload handling
3. `src/controllers/authController.js` - Added profile picture to registration
4. `src/routes/v1/userRoutes.js` - Added multer middleware and Swagger docs
5. `src/routes/v1/authRoutes.js` - Added multer middleware to registration
6. `src/app.js` - Static file serving (already configured)

### Key Functions
- `uploadProfilePicture` - Multer middleware for profile pictures
- `uploadDocument` - Multer middleware for documents
- `deleteFile(filePath)` - Delete file from filesystem
- `getFileUrl(filePath)` - Convert file path to URL

## Testing with Swagger

1. Navigate to: `http://localhost:3000/api-docs/`
2. Find the endpoint (e.g., POST /api/v1/auth/register)
3. Click "Try it out"
4. Fill in the form fields
5. Click "Choose File" for profile_picture
6. Click "Execute"

## Error Handling

### Common Errors
- **"Invalid file type"** - Only images are allowed for profile pictures
- **"File too large"** - Maximum 5MB for profile pictures
- **"No file uploaded"** - Required when using profile-picture endpoint

### Validation
- File type validation (MIME type checking)
- File size validation
- Automatic cleanup on errors
- Old file deletion before new upload

## Security Considerations

1. **File type validation** - Only allowed MIME types accepted
2. **File size limits** - Prevents large file uploads
3. **Unique filenames** - Prevents file overwrites
4. **Role-based folders** - Organized by user type
5. **Automatic cleanup** - Removes orphaned files

## Git Configuration

The `.gitignore` file is configured to:
- Ignore all uploaded files: `uploads/*`
- Keep the directory structure: `!uploads/.gitkeep`

This ensures the uploads directory exists in the repository but uploaded files are not tracked.
