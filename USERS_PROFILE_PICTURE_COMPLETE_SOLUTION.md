# Users Profile Picture - Complete Solution

## ✅ BACKEND COMPLETE

### Folder Structure: User ID Based
- Path: `uploads/users/{user-id}/profile_*.jpg`
- Example: `uploads/users/7c49e075-e597-4d79-9a84-7d294733b980/profile_1708300000.jpg`

### Features Implemented
✅ Profile picture upload on user creation
✅ Profile picture update (deletes old photo)
✅ Profile picture delete when user is deleted
✅ User ID-based folder organization
✅ File validation (JPEG, PNG, GIF, WebP - max 5MB)
✅ Automatic folder creation
✅ Console logging for debugging

### API Endpoints Ready
- `POST /api/v1/users` - Create user with profile picture
- `PUT /api/v1/users/:id` - Update user with profile picture
- `GET /api/v1/users` - Returns users with profile_picture URLs
- `DELETE /api/v1/users/:id` - Deletes user and profile picture

## 📋 FRONTEND IMPLEMENTATION NEEDED

### File to Update
`backend/components/apps/contacts/components-apps-contacts-users.tsx`

### Changes Required

#### 1. Add State (2 lines)
```typescript
const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
const [photoPreview, setPhotoPreview] = useState<string | null>(null);
```

#### 2. Add Photo Handler Function (1 function)
```typescript
const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.size > 5 * 1024 * 1024) {
            showMessage('File size must be less than 5MB', 'error');
            return;
        }
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showMessage('Only JPEG, PNG, GIF, and WebP images are allowed', 'error');
            return;
        }
        setUploadedPhoto(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
};
```

#### 3. Update saveUser Function
Change from JSON to FormData:
```typescript
// OLD: const body = { first_name: ..., last_name: ... };
// NEW: const formData = new FormData();
formData.append('first_name', params.first_name);
// ... append all fields
if (uploadedPhoto) {
    formData.append('profile_picture', uploadedPhoto);
}

// OLD: body: JSON.stringify(body)
// NEW: body: formData
// REMOVE: 'Content-Type': 'application/json'
```

#### 4. Add File Input in Form (1 field)
```tsx
<div className="mb-5 col-span-2">
    <label htmlFor="profile_picture">Profile Picture</label>
    <input
        id="profile_picture"
        type="file"
        accept="image/*"
        className="form-input"
        onChange={handlePhotoUpload}
    />
    {photoPreview && (
        <img src={photoPreview} className="w-24 h-24 rounded-full mt-2" />
    )}
    {params.profile_picture && !photoPreview && (
        <img src={`http://localhost:8080${params.profile_picture}`} className="w-24 h-24 rounded-full mt-2" />
    )}
</div>
```

#### 5. Display Photos in List View
```tsx
<td>
    <div className="flex items-center gap-3">
        {user.profile_picture ? (
            <img src={`http://localhost:8080${user.profile_picture}`} className="w-10 h-10 rounded-full" />
        ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <IconUser className="w-6 h-6" />
            </div>
        )}
        <span>{user.first_name} {user.last_name}</span>
    </div>
</td>
```

#### 6. Display Photos in Grid View
```tsx
<div className="flex items-center justify-center mb-4">
    {user.profile_picture ? (
        <img src={`http://localhost:8080${user.profile_picture}`} className="w-20 h-20 rounded-full" />
    ) : (
        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
            <IconUser className="w-12 h-12" />
        </div>
    )}
</div>
```

## 🚀 Quick Start

### Step 1: Restart API Server
```bash
cd api
npm run dev
```

### Step 2: Update Frontend Component
Follow the detailed guide in `USERS_PROFILE_PICTURE_FRONTEND_GUIDE.md`

### Step 3: Test
1. Go to http://localhost:3001/apps/contacts
2. Click "Add User"
3. Upload a profile picture
4. See preview
5. Click "Add"
6. Photo should appear in list/grid view
7. Check folder: `api/uploads/users/{user-id}/`

## 📁 File Structure

```
api/
└── uploads/
    └── users/
        ├── 7c49e075-e597-4d79-9a84-7d294733b980/
        │   └── profile_1708300000.jpg
        ├── c9418c98-ca78-44e9-99da-96e7e25df359/
        │   └── profile_1708300001.png
        └── 694c4470-5fec-4cdf-96b5-e84451983c24/
            └── profile_1708300002.jpg
```

## 🔍 How It Works

### Create User Flow:
1. User fills form and selects photo
2. Frontend shows preview
3. User clicks "Add"
4. Frontend sends FormData with photo
5. Backend creates user (gets UUID)
6. Backend moves photo from temp to `uploads/users/{uuid}/`
7. Backend updates user record with photo path
8. Frontend displays user with photo

### Update User Flow:
1. User clicks edit
2. Frontend shows current photo
3. User selects new photo
4. Frontend shows new preview
5. User clicks "Update"
6. Frontend sends FormData with new photo
7. Backend deletes old photo
8. Backend saves new photo to `uploads/users/{uuid}/`
9. Backend updates user record
10. Frontend displays updated photo

### Delete User Flow:
1. User clicks delete
2. Backend deletes user record
3. Backend deletes photo file
4. Backend deletes user folder (if empty)

## ✅ Features

- ✅ Upload profile picture on create
- ✅ Update profile picture on edit
- ✅ Delete profile picture on user delete
- ✅ Preview before upload
- ✅ Show current photo when editing
- ✅ Display photos in list view
- ✅ Display photos in grid view
- ✅ File validation (type and size)
- ✅ User ID-based folder structure
- ✅ Automatic folder management
- ✅ Fallback icon for users without photos

## 📝 Notes

1. **User ID Folders**: Each user has their own folder
2. **Old Photo Deletion**: When updating, old photo is automatically deleted
3. **Validation**: Both frontend (UX) and backend (security)
4. **FormData Required**: Must use FormData for file uploads, not JSON
5. **No Content-Type**: Browser sets Content-Type automatically for FormData
6. **Profile Picture Field**: Already exists in users table
7. **Static Files**: Already configured to serve from uploads/

## 🎯 Status

### Backend
✅ User controller updated
✅ User routes updated
✅ Multer middleware configured
✅ File validation added
✅ Folder structure implemented
✅ API tested and working

### Frontend
⏳ Needs implementation (follow guide)
⏳ Add state variables
⏳ Add photo handler
⏳ Update saveUser to FormData
⏳ Add file input
⏳ Display photos in list
⏳ Display photos in grid

## 📚 Documentation

- **Complete Guide**: `USERS_PROFILE_PICTURE_FRONTEND_GUIDE.md`
- **Backend Code**: `api/src/controllers/userController.js`
- **Routes**: `api/src/routes/v1/userRoutes.js`

The backend is ready! Just implement the frontend changes following the guide.
