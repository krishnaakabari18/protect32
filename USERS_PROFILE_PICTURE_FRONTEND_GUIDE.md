# Users Profile Picture - Complete Frontend Implementation Guide

## Overview
This guide shows how to add profile picture upload, display, and management to the Users module.

## Changes Required in `backend/components/apps/contacts/components-apps-contacts-users.tsx`

### 1. Add State for Profile Picture (after existing state declarations)

```typescript
// Add after const [params, setParams] = useState...
const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
const [photoPreview, setPhotoPreview] = useState<string | null>(null);
```

### 2. Add Photo Upload Handler (after changeValue function)

```typescript
const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showMessage('File size must be less than 5MB', 'error');
            return;
        }
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showMessage('Only JPEG, PNG, GIF, and WebP images are allowed', 'error');
            return;
        }
        
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

### 3. Update saveUser Function to Use FormData

Replace the entire `saveUser` function with:

```typescript
const saveUser = async () => {
    if (!params.first_name) {
        showMessage('First name is required.', 'error');
        return;
    }
    if (!params.last_name) {
        showMessage('Last name is required.', 'error');
        return;
    }
    if (!params.email) {
        showMessage('Email is required.', 'error');
        return;
    }
    if (!params.id && !params.password) {
        showMessage('Password is required for new users.', 'error');
        return;
    }

    setLoading(true);
    try {
        const token = localStorage.getItem('auth_token');
        const url = params.id ? `${API_URL}/users/${params.id}` : `${API_URL}/users`;
        const method = params.id ? 'PUT' : 'POST';

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('first_name', params.first_name);
        formData.append('last_name', params.last_name);
        formData.append('email', params.email);
        formData.append('user_type', params.user_type);
        if (params.mobile_number) formData.append('mobile_number', params.mobile_number);
        if (params.date_of_birth) formData.append('date_of_birth', params.date_of_birth);
        if (params.address) formData.append('address', params.address);
        
        // Add password for new users
        if (!params.id && params.password) {
            formData.append('password', params.password);
        }
        
        // Add profile picture if uploaded
        if (uploadedPhoto) {
            formData.append('profile_picture', uploadedPhoto);
        }

        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
                // DON'T set Content-Type - browser will set it with boundary for FormData
            },
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(`User has been ${params.id ? 'updated' : 'created'} successfully.`);
            setAddContactModal(false);
            fetchUsers();
            setUploadedPhoto(null);
            setPhotoPreview(null);
        } else {
            showMessage(data.error || 'Operation failed', 'error');
        }
    } catch (error: any) {
        showMessage('Error: ' + error.message, 'error');
    } finally {
        setLoading(false);
    }
};
```

### 4. Update editUser Function to Load Profile Picture

Add after setting params in `editUser`:

```typescript
const editUser = (user: any = null) => {
    const json = JSON.parse(JSON.stringify(defaultParams));
    setParams(json);
    setUploadedPhoto(null);
    setPhotoPreview(null);
    
    if (user) {
        let json1 = JSON.parse(JSON.stringify(user));
        setParams(json1);
        // Don't set photoPreview here - we'll show the existing photo from params.profile_picture
    }
    setAddContactModal(true);
};
```

### 5. Add Profile Picture Input in Modal Form

Find the form in the modal and add this field (after address field):

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
    <p className="text-xs text-gray-500 mt-1">
        JPEG, PNG, GIF, or WebP - Max 5MB
    </p>
    
    {/* Show preview of newly selected photo */}
    {photoPreview && (
        <div className="mt-3">
            <p className="text-sm mb-2">New Photo Preview:</p>
            <img 
                src={photoPreview} 
                alt="Preview" 
                className="w-24 h-24 rounded-full object-cover border-2 border-primary"
            />
        </div>
    )}
    
    {/* Show existing photo if editing and no new photo selected */}
    {params.profile_picture && !photoPreview && (
        <div className="mt-3">
            <p className="text-sm mb-2">Current Photo:</p>
            <img 
                src={`http://localhost:8080${params.profile_picture}`} 
                alt="Current" 
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
            />
        </div>
    )}
</div>
```

### 6. Display Profile Picture in List View

Find the table row where user name is displayed and update it:

```tsx
<tr key={user.id}>
    <td>
        <div className="flex items-center gap-3">
            {user.profile_picture ? (
                <img 
                    src={`http://localhost:8080${user.profile_picture}`} 
                    alt={user.first_name}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                />
            ) : null}
            {!user.profile_picture && (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <IconUser className="w-6 h-6 text-primary" />
                </div>
            )}
            <div>
                <div className="font-semibold">{user.first_name} {user.last_name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
            </div>
        </div>
    </td>
    {/* ... rest of the columns */}
</tr>
```

### 7. Display Profile Picture in Grid View

Find the grid card and update it:

```tsx
<div className="panel">
    <div className="flex items-center justify-center mb-4">
        {user.profile_picture ? (
            <img 
                src={`http://localhost:8080${user.profile_picture}`} 
                alt={user.first_name}
                className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
            />
        ) : null}
        {!user.profile_picture && (
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <IconUser className="w-12 h-12 text-primary" />
            </div>
        )}
    </div>
    <div className="text-center">
        <h5 className="text-lg font-semibold">{user.first_name} {user.last_name}</h5>
        <p className="text-sm text-gray-500">{user.email}</p>
        {/* ... rest of the card content */}
    </div>
</div>
```

## Complete Example of Key Sections

### State Declarations (at the top of component)
```typescript
const [addContactModal, setAddContactModal] = useState(false);
const [viewMode, setViewMode] = useState('list');
const [users, setUsers] = useState<any[]>([]);
const [loading, setLoading] = useState(false);
const [search, setSearch] = useState('');
const [filterType, setFilterType] = useState('');
const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
const [photoPreview, setPhotoPreview] = useState<string | null>(null);
```

### Form Field in Modal
```tsx
<form className="text-sm">
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Existing fields... */}
        
        <div className="mb-5 col-span-2">
            <label htmlFor="profile_picture">Profile Picture</label>
            <input
                id="profile_picture"
                type="file"
                accept="image/*"
                className="form-input"
                onChange={handlePhotoUpload}
            />
            <p className="text-xs text-gray-500 mt-1">
                JPEG, PNG, GIF, or WebP - Max 5MB
            </p>
            
            {photoPreview && (
                <div className="mt-3">
                    <p className="text-sm mb-2">New Photo Preview:</p>
                    <img 
                        src={photoPreview} 
                        alt="Preview" 
                        className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                    />
                </div>
            )}
            
            {params.profile_picture && !photoPreview && (
                <div className="mt-3">
                    <p className="text-sm mb-2">Current Photo:</p>
                    <img 
                        src={`http://localhost:8080${params.profile_picture}`} 
                        alt="Current" 
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                    />
                </div>
            )}
        </div>
    </div>
    
    <div className="mt-8 flex items-center justify-end">
        <button type="button" className="btn btn-outline-danger" onClick={() => setAddContactModal(false)}>
            Cancel
        </button>
        <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={saveUser}>
            {params.id ? 'Update' : 'Add'}
        </button>
    </div>
</form>
```

## Testing Steps

1. **Restart API Server**:
   ```bash
   cd api
   npm run dev
   ```

2. **Test Create User with Photo**:
   - Go to: http://localhost:3001/apps/contacts
   - Click "Add User"
   - Fill in required fields
   - Click "Choose File" and select an image
   - See preview appear
   - Click "Add"
   - User should be created with photo
   - Check: `api/uploads/users/{user-id}/profile_*.jpg`

3. **Test Update User Photo**:
   - Click edit on a user
   - See current photo (if exists)
   - Upload new photo
   - See new preview
   - Click "Update"
   - Old photo should be deleted
   - New photo should be in user's folder

4. **Test Photo Display**:
   - List view: Photos appear as avatars next to names
   - Grid view: Photos appear as larger avatars in cards
   - Users without photos: Show icon placeholder

5. **Test Validation**:
   - Try uploading file > 5MB: Should show error
   - Try uploading non-image file: Should show error
   - Try uploading valid image: Should work

## Folder Structure

```
uploads/
└── users/
    ├── {user-id-1}/
    │   └── profile_1708300000.jpg
    ├── {user-id-2}/
    │   └── profile_1708300001.png
    └── {user-id-3}/
        └── profile_1708300002.jpg
```

## Important Notes

1. **FormData vs JSON**: Must use FormData when uploading files, not JSON
2. **Content-Type**: Don't set Content-Type header - browser sets it automatically with boundary
3. **File Validation**: Validate on both frontend (UX) and backend (security)
4. **Error Handling**: Show user-friendly messages for file errors
5. **Preview**: Always show preview before upload for better UX
6. **Existing Photos**: Show current photo when editing
7. **Fallback**: Show icon if photo fails to load or doesn't exist

## Status
✅ Backend complete with user ID-based folders
✅ Frontend guide complete with all code snippets
✅ Ready to implement in users component
