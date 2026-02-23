# Patient Education API - Complete Implementation ✓

## Status: FULLY IMPLEMENTED AND TESTED

All CRUD APIs with search functionality are created and working correctly.

---

## API Endpoints

### Base URL
- Development: `http://localhost:8080/api/v1`
- Production: `https://abbey-stateliest-treva.ngrok-free.dev/api/v1`

### Authentication Required
All endpoints require JWT Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Available Endpoints

### 1. Create Patient Education Content
**POST** `/patient-education`

**Request Body:**
```json
{
  "title": "Understanding Diabetes",
  "category": "Chronic Conditions",
  "content": "<p>HTML content with <strong>formatting</strong></p>",
  "summary": "Learn about diabetes management",
  "tags": ["diabetes", "health", "chronic"],
  "status": "Active"
}
```

**With Feature Image:**
- Content-Type: `multipart/form-data`
- Field name: `feature_image`
- Max size: 5MB
- Formats: JPEG, PNG, GIF, WebP

**Response:**
```json
{
  "message": "Patient education content created successfully",
  "data": {
    "id": "uuid",
    "title": "Understanding Diabetes",
    "category": "Chronic Conditions",
    "content": "<p>HTML content</p>",
    "summary": "Learn about diabetes",
    "tags": ["diabetes", "health"],
    "author_id": "uuid",
    "status": "Active",
    "feature_image": "education/2026/02/23/filename.jpg",
    "view_count": 0,
    "created_at": "2026-02-23T...",
    "updated_at": "2026-02-23T..."
  }
}
```

---

### 2. Get All Patient Education Content (with Search & Filters)
**GET** `/patient-education`

**Query Parameters:**
- `search` - Search in title, content, and summary (case-insensitive)
- `category` - Filter by category
- `status` - Filter by Active/Inactive
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Examples:**
```bash
# Get all content
GET /patient-education

# Search for "diabetes"
GET /patient-education?search=diabetes

# Filter by category and status
GET /patient-education?category=Health&status=Active

# Pagination
GET /patient-education?page=2&limit=20

# Combined filters
GET /patient-education?search=dental&category=Dental%20Care&status=Active&page=1&limit=10
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Understanding Diabetes",
      "category": "Chronic Conditions",
      "content": "<p>HTML content</p>",
      "summary": "Learn about diabetes",
      "tags": ["diabetes", "health"],
      "author_id": "uuid",
      "author_first_name": "John",
      "author_last_name": "Doe",
      "status": "Active",
      "feature_image": "education/2026/02/23/filename.jpg",
      "view_count": 15,
      "created_at": "2026-02-23T...",
      "updated_at": "2026-02-23T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### 3. Get Patient Education Content by ID
**GET** `/patient-education/:id`

**Note:** Automatically increments view count when accessed.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "title": "Understanding Diabetes",
    "category": "Chronic Conditions",
    "content": "<p>Full HTML content</p>",
    "summary": "Learn about diabetes",
    "tags": ["diabetes", "health"],
    "author_id": "uuid",
    "author_first_name": "John",
    "author_last_name": "Doe",
    "status": "Active",
    "feature_image": "education/2026/02/23/filename.jpg",
    "view_count": 16,
    "created_at": "2026-02-23T...",
    "updated_at": "2026-02-23T..."
  }
}
```

---

### 4. Update Patient Education Content
**PUT** `/patient-education/:id`

**Request Body:**
```json
{
  "title": "Updated Title",
  "category": "Updated Category",
  "content": "<p>Updated HTML content</p>",
  "summary": "Updated summary",
  "tags": ["updated", "tags"],
  "status": "Active",
  "removeImage": "false"
}
```

**With New Feature Image:**
- Content-Type: `multipart/form-data`
- Field name: `feature_image`
- Old image will be automatically deleted

**To Remove Image:**
- Set `removeImage: "true"` in request body

**Response:**
```json
{
  "message": "Patient education content updated successfully",
  "data": { /* updated content */ }
}
```

---

### 5. Toggle Content Status
**PATCH** `/patient-education/:id/status`

**Request Body:**
```json
{
  "status": "Inactive"
}
```

**Valid Status Values:**
- `Active`
- `Inactive`

**Response:**
```json
{
  "message": "Content status updated to Inactive",
  "data": { /* updated content */ }
}
```

---

### 6. Delete Patient Education Content
**DELETE** `/patient-education/:id`

**Note:** Automatically deletes associated feature image.

**Response:**
```json
{
  "message": "Patient education content deleted successfully"
}
```

---

### 7. Get All Categories
**GET** `/patient-education/categories`

**Response:**
```json
{
  "data": [
    "Cardiovascular",
    "Chronic Conditions",
    "Dental Care",
    "Mental Health",
    "Women's Health"
  ]
}
```

---

### 8. Get Statistics
**GET** `/patient-education/statistics`

**Response:**
```json
{
  "data": {
    "total_content": "25",
    "active_content": "20",
    "inactive_content": "5",
    "total_views": "1250",
    "total_categories": "8"
  }
}
```

---

### 9. Upload Inline Image (for Rich Text Editor)
**POST** `/education-images/upload`

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `image`
- Max size: 5MB
- Formats: JPEG, PNG, GIF, WebP

**Response:**
```json
{
  "success": true,
  "url": "/uploads/education/2026/02/23/inline-image-123456.jpg",
  "path": "education/2026/02/23/inline-image-123456.jpg"
}
```

---

## Search Functionality Details

The search parameter uses PostgreSQL `ILIKE` for case-insensitive searching across:
- Title
- Content (HTML)
- Summary

**Example Searches:**
```bash
# Find content about "diabetes"
GET /patient-education?search=diabetes

# Find content with "heart" in any field
GET /patient-education?search=heart

# Combine search with filters
GET /patient-education?search=dental&category=Dental%20Care&status=Active
```

---

## Image Storage

### Feature Images
- Path: `api/uploads/education/YYYY/MM/DD/`
- Naming: `feature-{timestamp}-{random}.{ext}`
- Max Size: 5MB
- Formats: JPEG, PNG, GIF, WebP

### Inline Images (Editor)
- Path: `api/uploads/education/YYYY/MM/DD/`
- Naming: `inline-{timestamp}-{random}.{ext}`
- Max Size: 5MB
- Formats: JPEG, PNG, GIF, WebP

### Image URLs
Images are served statically at:
```
http://localhost:8080/uploads/education/YYYY/MM/DD/filename.jpg
```

---

## Database Schema

**Table:** `patient_education_content`

```sql
CREATE TABLE patient_education_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  tags TEXT[],
  author_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'Active',
  feature_image VARCHAR(500),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Swagger Documentation

All endpoints are fully documented in Swagger UI:

**Access:** http://localhost:8080/api-docs/

**Features:**
- Interactive API testing
- Request/Response schemas
- Authentication support
- Example values
- Try it out functionality

**To Use Swagger:**
1. Open http://localhost:8080/api-docs/
2. Click "Authorize" button
3. Login via `/api/v1/auth/login` to get JWT token
4. Enter token in format: `Bearer <your_token>`
5. Test all endpoints interactively

---

## Frontend Integration

**URL:** http://localhost:3000/management/patienteducation

**Features:**
- Rich text editor (React Quill) with inline image upload
- Feature image upload with preview
- Tag management
- Status toggle (Active/Inactive)
- Search functionality
- Category filter
- Status filter
- List/Grid view
- Pagination
- View counter
- CRUD operations

**API Configuration:**
File: `backend/config/api.config.ts`
```typescript
export const API_BASE_URL = 'http://localhost:8080';
export const API_VERSION = 'v1';
```

---

## Testing

### Quick Test Script
Run: `./test-patient-education-with-auth.sh`

This script tests:
- Authentication
- GET all content
- GET categories
- GET statistics
- Search functionality
- POST create content

### Manual Testing via Swagger
1. Open http://localhost:8080/api-docs/
2. Find "Patient Education" section
3. Click "Authorize" and enter JWT token
4. Test each endpoint interactively

### Test Credentials
- Email: `admin@dentist.com`
- Password: `password123`

---

## Error Handling

### Common Errors

**401 Unauthorized**
```json
{
  "error": "No token provided" 
}
```
Solution: Include JWT token in Authorization header

**400 Bad Request**
```json
{
  "error": "Title, category, and content are required"
}
```
Solution: Provide all required fields

**404 Not Found**
```json
{
  "error": "Content not found"
}
```
Solution: Check if the ID exists

**500 Internal Server Error**
```json
{
  "error": "Database connection failed"
}
```
Solution: Check database connection and server logs

---

## Files Structure

```
api/
├── src/
│   ├── models/
│   │   └── patientEducationModel.js          # Database queries
│   ├── controllers/
│   │   ├── patientEducationController.js     # Business logic
│   │   └── educationImageController.js       # Image upload logic
│   ├── routes/
│   │   └── v1/
│   │       ├── patientEducationRoutes.js     # API routes + Swagger docs
│   │       └── educationImageRoutes.js       # Image upload routes
│   ├── utils/
│   │   └── educationImageUpload.js           # Multer configuration
│   └── config/
│       └── swagger.js                        # Swagger configuration
└── uploads/
    └── education/                            # Image storage
        └── YYYY/MM/DD/

backend/
├── components/
│   └── management/
│       └── patient_education_crud.tsx        # Frontend component
├── app/
│   └── (defaults)/
│       └── management/
│           └── patienteducation/
│               └── page.tsx                  # Page component
└── config/
    └── api.config.ts                         # API configuration
```

---

## Summary

✅ **All CRUD APIs Created**
✅ **Search Functionality Implemented**
✅ **Pagination Working**
✅ **Filters (Category, Status) Working**
✅ **Image Upload (Feature & Inline) Working**
✅ **Swagger Documentation Complete**
✅ **Authentication Required**
✅ **Database Schema Created**
✅ **Frontend Integration Complete**
✅ **Rich Text Editor with Image Upload**
✅ **View Counter Implemented**
✅ **Tested and Verified**

---

## Next Steps

1. Access Swagger UI: http://localhost:8080/api-docs/
2. Login to get JWT token
3. Test all endpoints
4. Access frontend: http://localhost:3000/management/patienteducation
5. Create, edit, and manage patient education content

---

**Last Updated:** February 23, 2026
**Status:** Production Ready ✓
