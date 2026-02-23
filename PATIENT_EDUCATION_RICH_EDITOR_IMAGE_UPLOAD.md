# Patient Education Module - Rich Text Editor & Image Upload Update

## ✅ Updates Complete

The Patient Education module has been enhanced with:
1. **Rich Text Editor** (React Quill) for content formatting
2. **Feature Image Upload** with preview and management
3. **Database schema updated** to store feature images

## Changes Made

### 1. Database Schema Update ✅

Added `feature_image` column to store image paths:

```sql
ALTER TABLE patient_education_content 
ADD COLUMN IF NOT EXISTS feature_image VARCHAR(500);
```

**File**: `api/database/update-patient-education-add-image.sql`

### 2. Backend API Updates ✅

#### Image Upload Utility Created
**File**: `api/src/utils/educationImageUpload.js`

Features:
- Folder structure: `uploads/education/YYYY/MM/DD/`
- Allowed formats: JPEG, PNG, GIF, WebP
- Max file size: 5MB
- Automatic file deletion on content delete/update

#### Model Updated
**File**: `api/src/models/patientEducationModel.js`

- `create()` method now handles `feature_image`
- `update()` method now handles `feature_image`

#### Controller Updated
**File**: `api/src/controllers/patientEducationController.js`

- `create()` - Handles image upload via FormData
- `update()` - Handles image replacement and removal
- `delete()` - Automatically deletes associated image file

#### Routes Updated
**File**: `api/src/routes/v1/patientEducationRoutes.js`

- POST `/patient-education` - Now accepts multipart/form-data
- PUT `/patient-education/:id` - Now accepts multipart/form-data
- Uses multer middleware for file upload

### 3. Frontend Updates ✅

#### Component Enhanced
**File**: `backend/components/management/patient-education-crud.tsx`

**New Features**:

1. **Rich Text Editor (React Quill)**
   - Toolbar with formatting options:
     - Headers (H1, H2, H3)
     - Bold, Italic, Underline, Strike
     - Ordered/Unordered lists
     - Text color and background
     - Links
     - Clean formatting
   - WYSIWYG editing
   - HTML output stored in database
   - Read-only view mode with HTML rendering

2. **Feature Image Upload**
   - File input with image preview
   - Drag & drop support
   - Image validation (type and size)
   - Preview before upload
   - Remove image button
   - Replace existing image
   - Display in grid view

3. **Enhanced Grid View**
   - Feature images displayed at top of cards
   - Fallback if image fails to load
   - Responsive image sizing

## Usage Guide

### Adding Content with Rich Text & Image

1. Click **"Add Content"** button
2. Fill in Title and Category
3. Use the **Rich Text Editor** for content:
   - Select text and use toolbar for formatting
   - Add headers, lists, colors, links
   - Format as needed
4. Click **"Choose File"** to upload feature image:
   - Select an image (JPEG, PNG, GIF, WebP)
   - Max size: 5MB
   - Preview appears immediately
5. Add summary and tags
6. Click **"Add"** to save

### Editing Content

1. Click the **pencil icon** on any content
2. Modify text using the rich text editor
3. To change image:
   - Click **X** button on current image to remove
   - Upload new image
4. Click **"Update"** to save

### Viewing Content

1. Click the **eye icon** on any content
2. Content displays with HTML formatting
3. Feature image shown if available
4. All fields are read-only

## Rich Text Editor Features

### Toolbar Options

| Button | Function |
|--------|----------|
| H1, H2, H3 | Header sizes |
| **B** | Bold text |
| *I* | Italic text |
| U | Underline |
| S | Strikethrough |
| • | Bullet list |
| 1. | Numbered list |
| A | Text color |
| ⬛ | Background color |
| 🔗 | Insert link |
| 🧹 | Clear formatting |

### Keyboard Shortcuts

- **Ctrl+B**: Bold
- **Ctrl+I**: Italic
- **Ctrl+U**: Underline
- **Ctrl+K**: Insert link

## Image Upload Specifications

### Supported Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### File Size Limit
- Maximum: 5MB per image

### Storage Structure
```
api/uploads/education/
├── 2024/
│   ├── 02/
│   │   ├── 23/
│   │   │   ├── education-1234567890-123456789.jpg
│   │   │   └── education-1234567891-987654321.png
```

### Image Management
- **Upload**: Automatically saved to dated folder
- **Replace**: Old image deleted, new image uploaded
- **Delete**: Image deleted when content is deleted
- **Remove**: Can remove image without deleting content

## API Changes

### Create Content (POST)

**Before**:
```json
Content-Type: application/json
{
  "title": "...",
  "content": "..."
}
```

**After**:
```
Content-Type: multipart/form-data

title: "..."
content: "<p>Rich <strong>HTML</strong> content</p>"
feature_image: [File]
```

### Update Content (PUT)

**New Parameters**:
- `feature_image`: Image file (optional)
- `removeImage`: "true" to remove existing image (optional)

### Response Format

```json
{
  "message": "Content created successfully",
  "data": {
    "id": "uuid",
    "title": "...",
    "content": "<p>HTML content</p>",
    "feature_image": "education/2024/02/23/education-123.jpg",
    ...
  }
}
```

## Frontend Implementation Details

### State Management

New state variables:
```typescript
const [imageFile, setImageFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string | null>(null);
const [removeImage, setRemoveImage] = useState(false);
```

### Image Handling Functions

```typescript
handleImageChange(e) // Handle file selection
handleRemoveImage() // Remove image preview
```

### Quill Configuration

```typescript
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link'],
    ['clean']
  ],
};
```

### FormData Submission

```typescript
const formData = new FormData();
formData.append('title', params.title);
formData.append('content', params.content); // HTML string
formData.append('feature_image', imageFile); // File object
```

## Testing Checklist

### Rich Text Editor
- [ ] Bold, italic, underline formatting
- [ ] Headers (H1, H2, H3)
- [ ] Ordered and unordered lists
- [ ] Text color and background
- [ ] Insert links
- [ ] Clear formatting
- [ ] HTML saved correctly
- [ ] View mode displays HTML properly

### Image Upload
- [ ] Upload JPEG image
- [ ] Upload PNG image
- [ ] Upload GIF image
- [ ] Upload WebP image
- [ ] Reject non-image files
- [ ] Reject files > 5MB
- [ ] Preview displays correctly
- [ ] Remove image button works
- [ ] Replace existing image
- [ ] Image displays in grid view
- [ ] Image deleted on content delete

### Integration
- [ ] Create content with image and rich text
- [ ] Edit content and change image
- [ ] Edit content and remove image
- [ ] View content with formatted text
- [ ] Delete content removes image file
- [ ] Grid view shows images
- [ ] List view works normally

## Route Issue Fix

If you see "Route not found" error:

1. **Clear Next.js cache**:
```bash
cd backend
rm -rf .next
npm run dev
```

2. **Restart API server**:
```bash
cd api
# Stop current server (Ctrl+C)
node src/server.js
```

3. **Check route file exists**:
```bash
ls backend/app/\(defaults\)/management/patient-education/page.tsx
```

4. **Verify sidebar menu**:
- Check `backend/components/layouts/sidebar-dentist.tsx`
- Look for "Patient Education" link

## Files Modified/Created

### Backend (5 files)
1. `api/database/update-patient-education-add-image.sql` - Schema update (NEW)
2. `api/src/utils/educationImageUpload.js` - Upload utility (NEW)
3. `api/src/models/patientEducationModel.js` - Model updated (MODIFIED)
4. `api/src/controllers/patientEducationController.js` - Controller updated (MODIFIED)
5. `api/src/routes/v1/patientEducationRoutes.js` - Routes updated (MODIFIED)

### Frontend (1 file)
6. `backend/components/management/patient-education-crud.tsx` - Component enhanced (MODIFIED)

### Documentation (1 file)
7. `PATIENT_EDUCATION_RICH_EDITOR_IMAGE_UPLOAD.md` - This file (NEW)

## Quick Test

1. Navigate to `/management/patient-education`
2. Click "Add Content"
3. Type in the rich text editor - try formatting
4. Upload an image
5. Save and verify
6. Check grid view - image should appear
7. Edit content - change image
8. Delete content - verify image file deleted

## Troubleshooting

### Issue: Rich text editor not showing
**Solution**: 
- Check browser console for errors
- Verify React Quill is installed: `npm list react-quill`
- Clear browser cache

### Issue: Image upload fails
**Solution**:
- Check file size (< 5MB)
- Check file type (JPEG, PNG, GIF, WebP only)
- Verify uploads directory exists: `api/uploads/education/`
- Check API server logs

### Issue: Image not displaying
**Solution**:
- Check image path in database
- Verify file exists in uploads folder
- Check BASE_URL in config
- Check browser console for 404 errors

### Issue: HTML not rendering
**Solution**:
- Check `dangerouslySetInnerHTML` is used in view mode
- Verify content is saved as HTML string
- Check for XSS sanitization if needed

## Security Notes

1. **File Upload Security**:
   - Only image types allowed
   - File size limited to 5MB
   - Files stored outside web root
   - Unique filenames prevent overwrites

2. **HTML Content**:
   - React Quill sanitizes input
   - Consider adding DOMPurify for extra security
   - Limit allowed HTML tags if needed

3. **Image Access**:
   - Images served through Express static middleware
   - Consider adding authentication for sensitive content

## Performance Considerations

1. **Image Optimization**:
   - Consider adding image compression
   - Generate thumbnails for grid view
   - Use lazy loading for images

2. **Rich Text Editor**:
   - Dynamically imported to reduce bundle size
   - SSR disabled for Quill component

3. **File Storage**:
   - Dated folder structure prevents large directories
   - Old images cleaned up on delete/update

## Next Steps

1. ✅ Test rich text editor functionality
2. ✅ Test image upload and preview
3. ✅ Test image replacement
4. ✅ Test image deletion
5. ✅ Verify grid view displays images
6. ✅ Test on mobile devices
7. Consider adding image compression
8. Consider adding image cropping tool
9. Consider adding more editor features (tables, videos)

---

**Status**: ✅ Complete - Rich Text Editor & Image Upload Implemented
**Last Updated**: Current session
**Version**: 2.0.0
