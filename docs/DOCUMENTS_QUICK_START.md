# Documents Module - Quick Start Guide

## 🚀 Quick Access

**URL**: http://localhost:3001/management/documents

## ✅ What's Implemented

### Form Fields
1. **Patient** - Dropdown (Required) - Shows: "John Doe"
2. **Provider** - Dropdown (Optional) - Shows: "Dr. Sarah Williams"
3. **Document Type** - Dropdown (Required) - Medical Record, X-Ray, etc.
4. **Document Name** - Text Input (Required)
5. **Files** - Multiple File Upload (Required) - PDF & Images
6. **Notes** - Textarea (Optional)

### File Upload
- **Formats**: PDF, JPEG, PNG, GIF, WEBP
- **Max Size**: 10MB per file
- **Max Files**: 10 files at once
- **Folder**: `uploads/documents/YYYY/MM/DD/`

## 📋 Quick Test

### 1. Add Document (2 min)
```
1. Click "Add Document"
2. Patient: Select "John Doe"
3. Provider: Select "Dr. Sarah Williams" (optional)
4. Document Type: Select "Medical Record"
5. Document Name: "Annual Checkup 2026"
6. Files: Click "Choose Files" → Select 1-3 files (PDF or images)
7. Notes: "Complete checkup records"
8. Click "Add"
9. ✅ Success message appears
10. ✅ Document appears in list
```

### 2. View Document (30 sec)
```
1. Click Eye icon (👁️) on any document
2. ✅ All fields shown (read-only)
3. ✅ Files listed with download buttons
4. Click download icon to download file
5. Click "Close"
```

### 3. Edit Document (1 min)
```
1. Click Pencil icon (✏️) on any document
2. ✅ Patient dropdown shows selected patient
3. ✅ Provider dropdown shows selected provider
4. ✅ Existing files shown
5. Check "Keep existing files" (to add more files)
6. OR Uncheck to replace all files
7. Add new files if needed
8. Click "Update"
9. ✅ Success message appears
```

### 4. Delete Document (30 sec)
```
1. Click Trash icon (🗑️) on any document
2. ✅ Confirmation dialog appears
3. Click "Delete"
4. ✅ Success message shows files deleted count
5. ✅ Document removed from list
6. ✅ All files deleted from server
```

## 🎯 Expected Results

### Dropdowns Show:
- ✅ **Patient**: "John Doe", "Jane Smith" (NOT: UUID)
- ✅ **Provider**: "Dr. Sarah Williams", "Dr. David Brown" (NOT: UUID)
- ✅ **Document Type**: "Medical Record", "X-Ray", etc.

### File Upload Shows:
- ✅ Selected files list
- ✅ File name and size
- ✅ File type icon (📄 for PDF, 🖼️ for images)
- ✅ Remove button (X) for each file

### List View Shows:
- ✅ Document name
- ✅ Patient name
- ✅ Provider name
- ✅ Document type badge
- ✅ Files count badge (e.g., "3 files")
- ✅ Upload date with time
- ✅ Action buttons

## ❌ Common Issues

### Issue: Dropdowns Empty
**Fix**: 
- Ensure patients exist in database
- Ensure providers exist in database
- Check API server running (port 8080)
- Check browser console for errors

### Issue: Cannot Upload Files
**Fix**:
- Check file type (only PDF and images)
- Check file size (max 10MB per file)
- Check file count (max 10 files)
- Check API server running

### Issue: Files Not Downloading
**Fix**:
- Check file path in database
- Check uploads folder exists
- Check file permissions
- Check BASE_URL in API config

## 📁 Folder Structure

```
api/
└── uploads/
    └── documents/
        └── 2026/
            └── 02/
                └── 20/
                    ├── Medical_Record-1708425600000-123456789.pdf
                    ├── XRay_Image-1708425601000-987654321.jpg
                    └── Lab_Report-1708425602000-456789123.pdf
```

## 🔍 File Validation

### Valid Files:
- ✅ document.pdf
- ✅ xray.jpg
- ✅ scan.jpeg
- ✅ photo.png
- ✅ image.gif
- ✅ picture.webp

### Invalid Files:
- ❌ document.doc
- ❌ spreadsheet.xlsx
- ❌ video.mp4
- ❌ audio.mp3
- ❌ archive.zip

## 🎨 Visual Features

### File Upload Input:
```
┌─────────────────────────────────────────────┐
│ Upload Files * (PDF, Images - Max 10 files)│
│ [Choose Files]                              │
│                                             │
│ Selected Files (3):                         │
│ 📄 medical-record.pdf (1.2 MB)      [X]    │
│ 🖼️ xray-scan.jpg (856 KB)           [X]    │
│ 🖼️ lab-result.png (432 KB)          [X]    │
│                                             │
│ ☑ Keep existing files (2 files)            │
└─────────────────────────────────────────────┘
```

### Existing Files Display:
```
┌─────────────────────────────────────────────┐
│ Existing Files (2):                         │
│ 📄 checkup-report.pdf (2.1 MB)      [↓]    │
│ 🖼️ xray-image.jpg (1.5 MB)          [↓]    │
└─────────────────────────────────────────────┘
```

## 📊 Test Data

### Create Test Document:
```
Patient: John Doe
Provider: Dr. Sarah Williams
Document Type: Medical Record
Document Name: Annual Checkup 2026
Files: 
  - checkup-report.pdf (2MB)
  - xray-front.jpg (1MB)
  - xray-side.jpg (1MB)
Notes: Complete annual checkup with X-rays
```

## 🔧 API Endpoints

### Create:
```
POST /api/v1/documents
Content-Type: multipart/form-data
```

### List:
```
GET /api/v1/documents?page=1&limit=10
```

### Update:
```
PUT /api/v1/documents/:id
Content-Type: multipart/form-data
```

### Delete:
```
DELETE /api/v1/documents/:id
```

## ✨ Key Features

1. ✅ Patient dropdown (not ID input)
2. ✅ Provider dropdown (not ID input)
3. ✅ Multiple file upload
4. ✅ File preview before upload
5. ✅ Keep or replace existing files
6. ✅ Download files
7. ✅ Auto folder structure (YYYY/MM/DD)
8. ✅ Auto file deletion on document delete
9. ✅ File type validation
10. ✅ File size validation

## 🎯 Success Criteria

### All Tests Pass If:
- ✅ Can select patient from dropdown
- ✅ Can select provider from dropdown
- ✅ Can upload multiple files
- ✅ Can see selected files before upload
- ✅ Can remove files before upload
- ✅ Can add document successfully
- ✅ Can view document with files
- ✅ Can download files
- ✅ Can edit document
- ✅ Can keep or replace files
- ✅ Can delete document
- ✅ Files deleted from server on delete
- ✅ No console errors
- ✅ Dropdowns show names (not IDs)

---

**Status**: ✅ Ready for Testing
**Time Required**: 5 minutes
**Difficulty**: Easy

**Last Updated**: February 20, 2026
