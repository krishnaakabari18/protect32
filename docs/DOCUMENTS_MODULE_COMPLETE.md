# Documents Module - Complete Implementation

## Date: February 20, 2026

## Overview
Complete document management system with:
- Multiple file uploads (PDFs and images)
- Organized folder structure: `documents/YYYY/MM/DD`
- Patient and Provider dropdowns
- Full CRUD operations
- Automatic file deletion when records are deleted
- File preview and download

## Features Implemented

### 1. File Upload Structure
```
uploads/
└── documents/
    └── 2026/
        └── 02/
            └── 20/
                ├── Medical_Record-1708425600000-123456789.pdf
                ├── XRay_Image-1708425601000-987654321.jpg
                └── Lab_Report-1708425602000-456789123.pdf
```

### 2. Multiple File Support
- Upload up to 10 files at once
- Supported formats: PDF, JPEG, PNG, GIF, WEBP
- Maximum file size: 10MB per file
- Files stored as JSON array in database

### 3. Database Schema Updates
```sql
ALTER TABLE documents 
ADD COLUMN files JSONB DEFAULT '[]'::jsonb,
ADD COLUMN notes TEXT,
ADD COLUMN provider_id UUID REFERENCES providers(id);
```

### 4. Document Types
- Medical Record
- X-Ray
- Lab Report
- Prescription
- Insurance
- Treatment Plan
- Consent Form
- Other

## Files Created/Modified

### Backend API Files

#### 1. Database Migration
**File**: `api/database/update-documents-table.sql`
- Adds `files` JSONB column
- Adds `notes` TEXT column
- Adds `provider_id` column
- Updates document_type constraints
- Creates indexes for performance

#### 2. Upload Utility
**File**: `api/src/utils/documentUpload.js`
- Handles multiple file uploads
- Creates year/month/day folder structure
- File validation (PDF and images only)
- Unique filename generation
- File deletion utilities

**Key Functions**:
```javascript
uploadDocuments.array('files', 10)  // Accept up to 10 files
deleteFiles(filePaths)               // Delete multiple files
getFileInfo(file)                    // Get file metadata
```

#### 3. Document Model
**File**: `api/src/models/documentModel.js`
- Create with multiple files
- Update with file management
- Delete with cascade file removal
- Query with patient/provider names

**Key Methods**:
```javascript
create(data)                    // Create document with files
findAll(filters)                // Get all with filters
findById(id)                    // Get single document
update(id, data)                // Update with file handling
delete(id)                      // Delete with file cleanup
getFilesByDocumentId(id)        // Get files array
```

#### 4. Document Controller
**File**: `api/src/controllers/documentController.js`
- Handles file uploads in create/update
- Automatic file cleanup on errors
- Delete all files when document deleted
- Delete individual files from document

**Key Features**:
- Upload multiple files
- Keep or replace existing files on update
- Delete specific file by index
- Automatic cleanup on failure

#### 5. Document Routes
**File**: `api/src/routes/v1/documentRoutes.js`
- POST `/documents` - Create with file upload
- GET `/documents` - List with filters
- GET `/documents/:id` - Get single document
- PUT `/documents/:id` - Update with file upload
- DELETE `/documents/:id` - Delete document and files
- DELETE `/documents/:id/files/:fileIndex` - Delete specific file

### Frontend Files

#### 6. Documents Component
**File**: `backend/components/management/documents-crud.tsx`
- Patient dropdown
- Provider dropdown
- Document type dropdown
- Multiple file upload
- File preview
- File download
- Delete individual files
- List and Grid views

## API Endpoints

### Create Document
```http
POST /api/v1/documents
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- files: File[] (multiple files)
- patient_id: UUID
- provider_id: UUID (optional)
- name: string
- document_type: string
- notes: string (optional)
```

### Get All Documents
```http
GET /api/v1/documents?page=1&limit=10&patient_id=xxx&provider_id=xxx&document_type=Medical%20Record
Authorization: Bearer <token>
```

### Get Single Document
```http
GET /api/v1/documents/:id
Authorization: Bearer <token>
```

### Update Document
```http
PUT /api/v1/documents/:id
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- files: File[] (new files to add/replace)
- patient_id: UUID
- provider_id: UUID (optional)
- name: string
- document_type: string
- notes: string (optional)
- keep_existing_files: boolean (true to keep, false to replace)
```

### Delete Document
```http
DELETE /api/v1/documents/:id
Authorization: Bearer <token>

Response:
{
  "message": "Document deleted successfully",
  "filesDeleted": 3,
  "totalFiles": 3
}
```

### Delete Specific File
```http
DELETE /api/v1/documents/:id/files/:fileIndex
Authorization: Bearer <token>

Response:
{
  "message": "File deleted successfully",
  "remainingFiles": 2
}
```

## Database Structure

### Documents Table
```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    files JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    file_url TEXT NOT NULL,  -- Legacy field
    file_size INTEGER,
    mime_type VARCHAR(100),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Files JSON Structure
```json
[
  {
    "path": "uploads/documents/2026/02/20/Medical_Record-1708425600000-123456789.pdf",
    "filename": "Medical_Record-1708425600000-123456789.pdf",
    "originalname": "patient-medical-record.pdf",
    "mimetype": "application/pdf",
    "size": 1048576
  },
  {
    "path": "uploads/documents/2026/02/20/XRay-1708425601000-987654321.jpg",
    "filename": "XRay-1708425601000-987654321.jpg",
    "originalname": "xray-scan.jpg",
    "mimetype": "image/jpeg",
    "size": 524288
  }
]
```

## Frontend Component Features

### Form Fields
- **Patient**: Dropdown (required)
- **Provider**: Dropdown (optional)
- **Document Name**: Text input (required)
- **Document Type**: Dropdown (required)
- **Files**: Multiple file upload (required, max 10 files)
- **Notes**: Textarea (optional)

### File Upload Features
- Drag and drop support
- Multiple file selection
- File type validation (PDF, images only)
- File size validation (10MB max per file)
- Preview uploaded files
- Remove files before upload
- Download files after upload
- Delete individual files

### List View
- Patient name
- Provider name
- Document name
- Document type
- Files count
- Upload date
- Actions (View, Edit, Delete)

### Grid View
- Card layout
- Document icon
- Patient and provider info
- Files count badge
- Quick actions

## Usage Examples

### Upload Document with Multiple Files
```javascript
const formData = new FormData();
formData.append('patient_id', 'patient-uuid');
formData.append('provider_id', 'provider-uuid');
formData.append('name', 'Annual Checkup Records');
formData.append('document_type', 'Medical Record');
formData.append('notes', 'Complete checkup from Feb 2026');

// Add multiple files
files.forEach(file => {
    formData.append('files', file);
});

const response = await fetch('/api/v1/documents', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
    },
    body: formData
});
```

### Update Document - Keep Existing Files
```javascript
const formData = new FormData();
formData.append('patient_id', 'patient-uuid');
formData.append('name', 'Updated Document Name');
formData.append('document_type', 'Medical Record');
formData.append('keep_existing_files', 'true');  // Keep old files

// Add new files
newFiles.forEach(file => {
    formData.append('files', file);
});

await fetch(`/api/v1/documents/${documentId}`, {
    method: 'PUT',
    headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
    },
    body: formData
});
```

### Update Document - Replace All Files
```javascript
formData.append('keep_existing_files', 'false');  // Replace all files
```

### Delete Specific File
```javascript
await fetch(`/api/v1/documents/${documentId}/files/0`, {
    method: 'DELETE',
    headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
    }
});
```

## File Management

### Automatic File Deletion
Files are automatically deleted from filesystem when:
1. Document is deleted
2. Files are replaced during update (when keep_existing_files=false)
3. Specific file is deleted
4. Upload fails (cleanup on error)

### File Organization
```
uploads/documents/
├── 2026/
│   ├── 01/
│   │   ├── 15/
│   │   │   ├── file1.pdf
│   │   │   └── file2.jpg
│   │   └── 20/
│   │       └── file3.pdf
│   └── 02/
│       └── 20/
│           ├── file4.pdf
│           └── file5.jpg
```

## Security Features

### File Validation
- Only PDF and image files allowed
- File size limit: 10MB per file
- Maximum 10 files per upload
- Filename sanitization
- Unique filename generation

### Access Control
- Authentication required for all endpoints
- User ID captured for uploaded_by field
- Patient/Provider relationship validation

## Testing Checklist

### Create Document
- [ ] Upload single PDF file
- [ ] Upload multiple PDF files
- [ ] Upload single image file
- [ ] Upload multiple image files
- [ ] Upload mix of PDFs and images
- [ ] Try uploading invalid file type (should fail)
- [ ] Try uploading file > 10MB (should fail)
- [ ] Try uploading > 10 files (should fail)
- [ ] Verify files saved in correct folder structure
- [ ] Verify database record created
- [ ] Verify patient/provider names display

### Update Document
- [ ] Update with keep_existing_files=true
- [ ] Update with keep_existing_files=false
- [ ] Verify old files deleted when replaced
- [ ] Verify new files added when keeping existing
- [ ] Update document info without changing files

### Delete Document
- [ ] Delete document
- [ ] Verify all files deleted from filesystem
- [ ] Verify database record deleted
- [ ] Check response shows files deleted count

### Delete Specific File
- [ ] Delete first file
- [ ] Delete middle file
- [ ] Delete last file
- [ ] Try deleting last remaining file (should fail)
- [ ] Verify file deleted from filesystem
- [ ] Verify database updated

### View/Download
- [ ] View document details
- [ ] Download PDF file
- [ ] Download image file
- [ ] Preview image in browser
- [ ] Open PDF in new tab

## Status
✅ Database schema updated
✅ Upload utility created
✅ Model implemented
✅ Controller implemented
✅ Routes configured
✅ Multiple file support
✅ Year/month/day folder structure
✅ Automatic file deletion
✅ Patient/Provider dropdowns
✅ Ready for frontend implementation

## Next Steps
1. Complete frontend component
2. Add file preview modal
3. Add drag-and-drop upload
4. Test all CRUD operations
5. Test file deletion scenarios
6. Verify folder structure
7. Test with large files
8. Test with many files

---

**Last Updated**: February 20, 2026
**Status**: Backend Complete - Frontend In Progress
