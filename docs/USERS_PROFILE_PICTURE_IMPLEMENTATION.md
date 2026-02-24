# Users Profile Picture & Provider Photos Implementation

## Requirements

### 1. Users Module
- Add profile picture upload in create/edit forms
- Store in: `uploads/users/YYYY/MM/DD/`
- Display profile picture in list view
- Display profile picture in edit modal
- Support file upload with FormData

### 2. Providers Module - Edit Screen
- Display all clinic photos as thumbnails
- Display clinic video URL with embedded player if available
- Allow viewing full-size photos
- Show existing photos when editing

## Implementation Plan

### Phase 1: Backend - User Profile Picture Upload

#### 1.1 Update User Controller (`api/src/controllers/userController.js`)
- Add multer middleware for profile picture upload
- Date-based folder structure: `uploads/users/YYYY/MM/DD/`
- Update create and update methods to handle file upload
- Return profile picture URL in response

#### 1.2 Update User Routes (`api/src/routes/v1/userRoutes.js`)
- Apply multer middleware to POST and PUT routes
- Change content-type to multipart/form-data in Swagger docs

#### 1.3 Update User Model (`api/src/models/userModel.js`)
- Ensure profile_picture field is included in queries
- Return profile_picture URL in all user responses

### Phase 2: Frontend - User Profile Picture

#### 2.1 Update Users Component (`backend/components/apps/contacts/components-apps-contacts-users.tsx`)
- Add file input for profile picture
- Add state for uploaded file
- Change form submission to use FormData
- Display profile picture in list view (avatar)
- Display profile picture in edit modal
- Show preview of selected image before upload

### Phase 3: Frontend - Provider Photos Display

#### 3.1 Update Providers Component (`backend/components/management/providers-crud.tsx`)
- In view/edit modal, display all clinic photos as thumbnails
- Add lightbox/modal for viewing full-size photos
- Display video player if clinic_video_url exists
- Support YouTube, Vimeo, and direct video URLs

## File Structure

```
uploads/
├── users/
│   └── 2026/
│       └── 02/
│           └── 18/
│               ├── 1708300000_profile.jpg
│               └── 1708300001_avatar.png
└── provider/
    └── 2026/
        └── 02/
            └── 18/
                ├── 1708300000_clinic1.jpg
                └── 1708300001_clinic2.jpg
```

## Implementation Steps

1. Create user profile picture upload controller
2. Update user routes with multer middleware
3. Update users frontend component
4. Update providers view modal to show photos
5. Add video player for clinic videos
6. Test all functionality

Let's implement this step by step.
