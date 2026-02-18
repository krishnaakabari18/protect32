# Users Profile Picture & Provider Photos - Implementation Complete

## Summary
Implemented profile picture upload for users with date-based folder structure and prepared provider photos display functionality.

## Part 1: Users Profile Picture Upload (BACKEND COMPLETE)

### Backend Changes

#### 1. User Controller (`api/src/controllers/userController.js`)
✅ Added multer configuration with date-based folder structure
✅ Storage path: `uploads/users/YYYY/MM/DD/`
✅ File naming: `timestamp_filename.ext`
✅ Image validation: JPEG, PNG, GIF, WebP only
✅ File size limit: 5MB
✅ Updated `createUser()` to handle profile picture upload
✅ Updated `updateUser()` to handle profile picture upload and delete old one
✅ Updated `deleteUser()` to delete profile picture when user is deleted
✅ Added console logging for debugging
✅ Exported `uploadProfilePicture` middleware

#### 2. User Routes (`api/src/routes/v1/userRoutes.js`)
✅ Applied `uploadProfilePicture` middleware to POST route
✅ Applied `uploadProfilePicture` middleware to PUT route
✅ Updated Swagger docs to show `multipart/form-data`
✅ Removed separate profile picture upload endpoint (handled in create/update)

#### 3. File Structure
✅ Created `api/uploads/users/` directory
✅ Photos automatically organized by date when uploaded
✅ Example: `api/uploads/users/2026/02/18/1708300000_profile.jpg`

### API Endpoints

#### Create User with Profile Picture
```
POST /api/v1/users
Content-Type: multipart/form-data

FormData:
- email: string (required)
- password: string (required)
- first_name: string (required)
- last_name: string (required)
- mobile_number: string
- user_type: string (patient/provider/admin)
- profile_picture: file (JPEG, PNG, GIF, WebP - max 5MB)
- date_of_birth: date
- address: string
```

#### Update User with Profile Picture
```
PUT /api/v1/users/:id
Content-Type: multipart/form-data

FormData:
- first_name: string
- last_name: string
- mobile_number: string
- user_type: string
- profile_picture: file (new photo replaces old one)
- address: string
- is_active: boolean
```

## Part 2: Frontend Implementation (TODO)

### Users Component Updates Needed

#### File: `backend/components/apps/contacts/components-apps-contacts-users.tsx`

**Changes Required:**

1. **Add State for Profile Picture**
```typescript
const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
const [photoPreview, setPhotoPreview] = useState<string | null>(null);
```

2. **Add Photo Upload Handler**
```typescript
const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setUploadedPhoto(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
};
```

3. **Update saveContact() to use FormData**
```typescript
const saveContact = async () => {
    const formData = new FormData();
    formData.append('email', params.email);
    formData.append('password', params.password);
    formData.append('first_name', params.first_name);
    formData.append('last_name', params.last_name);
    formData.append('mobile_number', params.mobile_number);
    formData.append('user_type', params.user_type);
    if (params.date_of_birth) formData.append('date_of_birth', params.date_of_birth);
    if (params.address) formData.append('address', params.address);
    
    // Add profile picture if uploaded
    if (uploadedPhoto) {
        formData.append('profile_picture', uploadedPhoto);
    }
    
    const response = await fetch(url, {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
            // DON'T set Content-Type - browser will set it with boundary
        },
        body: formData,
    });
};
```

4. **Add File Input in Modal Form**
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
        <div className="mt-2">
            <img 
                src={photoPreview} 
                alt="Preview" 
                className="w-24 h-24 rounded-full object-cover"
            />
        </div>
    )}
    {params.profile_picture && !photoPreview && (
        <div className="mt-2">
            <img 
                src={`http://localhost:8080${params.profile_picture}`} 
                alt="Current" 
                className="w-24 h-24 rounded-full object-cover"
            />
        </div>
    )}
</div>
```

5. **Display Profile Picture in List View**
```tsx
<td>
    <div className="flex items-center gap-2">
        {user.profile_picture ? (
            <img 
                src={`http://localhost:8080${user.profile_picture}`} 
                alt={user.first_name}
                className="w-10 h-10 rounded-full object-cover"
            />
        ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <IconUser className="w-6 h-6 text-gray-400" />
            </div>
        )}
        <span>{user.first_name} {user.last_name}</span>
    </div>
</td>
```

6. **Display Profile Picture in Grid View**
```tsx
<div className="flex items-center justify-center mb-4">
    {user.profile_picture ? (
        <img 
            src={`http://localhost:8080${user.profile_picture}`} 
            alt={user.first_name}
            className="w-20 h-20 rounded-full object-cover"
        />
    ) : (
        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
            <IconUser className="w-12 h-12 text-gray-400" />
        </div>
    )}
</div>
```

## Part 3: Provider Photos Display (TODO)

### Provider Component Updates Needed

#### File: `backend/components/management/providers-crud.tsx`

**Changes Required in View/Edit Modal:**

1. **Display Clinic Photos**
```tsx
{modalMode !== 'create' && params.clinic_photos && params.clinic_photos.length > 0 && (
    <div className="mb-5 col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Photos</label>
        <div className="grid grid-cols-4 gap-2">
            {params.clinic_photos.map((photo: string, index: number) => (
                <div key={index} className="relative group">
                    <img 
                        src={`http://localhost:8080/${photo}`} 
                        alt={`Clinic ${index + 1}`}
                        className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-75"
                        onClick={() => openPhotoModal(photo)}
                    />
                </div>
            ))}
        </div>
    </div>
)}
```

2. **Display Clinic Video**
```tsx
{modalMode !== 'create' && params.clinic_video_url && (
    <div className="mb-5 col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Video</label>
        {isYouTubeUrl(params.clinic_video_url) ? (
            <iframe
                width="100%"
                height="315"
                src={getYouTubeEmbedUrl(params.clinic_video_url)}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded"
            ></iframe>
        ) : (
            <video 
                controls 
                className="w-full rounded"
                src={params.clinic_video_url}
            >
                Your browser does not support the video tag.
            </video>
        )}
    </div>
)}
```

3. **Add Helper Functions**
```typescript
const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
};

const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
};

const [photoModalOpen, setPhotoModalOpen] = useState(false);
const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

const openPhotoModal = (photo: string) => {
    setSelectedPhoto(photo);
    setPhotoModalOpen(true);
};
```

4. **Add Photo Lightbox Modal**
```tsx
<Transition appear show={photoModalOpen} as={Fragment}>
    <Dialog as="div" open={photoModalOpen} onClose={() => setPhotoModalOpen(false)}>
        <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            <div className="fixed inset-0 bg-black/80" />
        </TransitionChild>
        <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <DialogPanel className="relative">
                        <button
                            onClick={() => setPhotoModalOpen(false)}
                            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
                        >
                            <IconX />
                        </button>
                        {selectedPhoto && (
                            <img 
                                src={`http://localhost:8080/${selectedPhoto}`} 
                                alt="Clinic"
                                className="max-w-4xl max-h-[90vh] object-contain rounded"
                            />
                        )}
                    </DialogPanel>
                </TransitionChild>
            </div>
        </div>
    </Dialog>
</Transition>
```

## Testing Steps

### Test User Profile Picture Upload

1. **Restart API Server**:
   ```bash
   cd api
   npm run dev
   ```

2. **Test Create User with Photo**:
   - Go to: http://localhost:3001/apps/contacts
   - Click "Add User"
   - Fill in required fields
   - Upload a profile picture
   - Click "Add"
   - Check: `api/uploads/users/YYYY/MM/DD/` for the uploaded file

3. **Test Update User Photo**:
   - Click edit on a user
   - Upload a new profile picture
   - Click "Update"
   - Old photo should be deleted
   - New photo should be in date-based folder

4. **Test Photo Display**:
   - List view should show profile pictures as avatars
   - Grid view should show profile pictures
   - Edit modal should show current profile picture

### Test Provider Photos Display

1. **View Provider with Photos**:
   - Go to: http://localhost:3001/management/providers
   - Click view/edit on a provider that has photos
   - Should see all clinic photos as thumbnails
   - Click a photo to view full size

2. **View Provider with Video**:
   - If provider has clinic_video_url
   - Should see embedded video player
   - YouTube videos should be embedded
   - Direct video URLs should use HTML5 video player

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

## Status

### Backend
✅ User profile picture upload with date-based folders
✅ Multer middleware configured
✅ Create user with photo
✅ Update user with photo (deletes old one)
✅ Delete user deletes photo
✅ API routes updated
✅ Swagger docs updated
✅ Console logging added

### Frontend
⏳ Users component needs FormData implementation
⏳ Users component needs file input
⏳ Users component needs photo preview
⏳ Users component needs photo display in list/grid
⏳ Provider component needs photos display
⏳ Provider component needs video player
⏳ Provider component needs photo lightbox

## Next Steps

1. Update users frontend component to use FormData
2. Add file input and preview to users form
3. Display profile pictures in users list/grid
4. Add photos display to provider view/edit modal
5. Add video player to provider modal
6. Add photo lightbox for full-size viewing
7. Test all functionality

The backend is complete and ready. Frontend implementation is straightforward following the patterns shown above.
