# Swagger API Documentation - Procedures

## 🌐 Access Swagger UI

### Local Development:
**URL**: http://localhost:8080/api-docs

### Production (ngrok):
**URL**: https://abbey-stateliest-treva.ngrok-free.dev/api-docs

---

## 📋 Procedures API Endpoints

### Base URL: `/api/v1/procedures`

---

## 1️⃣ GET /api/v1/procedures

### Description
Get all procedures with optional filtering

### Authentication
Not required (public endpoint)

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | No | Filter by category name |
| is_active | boolean | No | Filter by active status |
| search | string | No | Search in procedure names (case-insensitive) |

### Example Requests

```bash
# Get all procedures
curl http://localhost:8080/api/v1/procedures

# Filter by category
curl "http://localhost:8080/api/v1/procedures?category=Endodontic"

# Search procedures
curl "http://localhost:8080/api/v1/procedures?search=X-Ray"

# Get only active procedures
curl "http://localhost:8080/api/v1/procedures?is_active=true"

# Combine filters
curl "http://localhost:8080/api/v1/procedures?category=Diagnostic%20%26%20Preventive&is_active=true"
```

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Check up (Exam)",
      "category": "Diagnostic & Preventive",
      "description": null,
      "is_active": true,
      "display_order": 1,
      "created_at": "2026-03-06T10:30:00.000Z",
      "updated_at": "2026-03-06T10:30:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Digital X-Ray (IOPA)",
      "category": "Diagnostic & Preventive",
      "description": null,
      "is_active": true,
      "display_order": 2,
      "created_at": "2026-03-06T10:30:00.000Z",
      "updated_at": "2026-03-06T10:30:00.000Z"
    }
  ],
  "count": 90
}
```

### Error Response (500)

```json
{
  "error": "Error message"
}
```

---

## 2️⃣ GET /api/v1/procedures/by-category

### Description
Get all procedures grouped by category (optimized for dropdowns)

### Authentication
Not required (public endpoint)

### Example Request

```bash
curl http://localhost:8080/api/v1/procedures/by-category
```

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "category": "Diagnostic & Preventive",
      "procedures": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "name": "Check up (Exam)",
          "description": null,
          "display_order": 1
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "name": "Digital X-Ray (IOPA)",
          "description": null,
          "display_order": 2
        }
      ]
    },
    {
      "category": "Restorative",
      "procedures": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440010",
          "name": "Amalgam (surfaces - 1234)",
          "description": null,
          "display_order": 1
        }
      ]
    }
  ]
}
```

---

## 3️⃣ GET /api/v1/procedures/categories

### Description
Get list of all categories with procedure counts

### Authentication
Not required (public endpoint)

### Example Request

```bash
curl http://localhost:8080/api/v1/procedures/categories
```

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "category": "Adjunctive",
      "count": "5"
    },
    {
      "category": "Diagnostic & Preventive",
      "count": "16"
    },
    {
      "category": "Endodontic",
      "count": "9"
    },
    {
      "category": "Implant",
      "count": "4"
    },
    {
      "category": "OS",
      "count": "10"
    },
    {
      "category": "Ortho",
      "count": "1"
    },
    {
      "category": "Periodontal",
      "count": "5"
    },
    {
      "category": "Prosthodontics, Fixed",
      "count": "5"
    },
    {
      "category": "Prosthodontics, Removable",
      "count": "5"
    },
    {
      "category": "Restorative",
      "count": "8"
    }
  ]
}
```

---

## 4️⃣ GET /api/v1/procedures/:id

### Description
Get a single procedure by ID

### Authentication
Not required (public endpoint)

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Procedure ID |

### Example Request

```bash
curl http://localhost:8080/api/v1/procedures/550e8400-e29b-41d4-a716-446655440000
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Check up (Exam)",
    "category": "Diagnostic & Preventive",
    "description": null,
    "is_active": true,
    "display_order": 1,
    "created_at": "2026-03-06T10:30:00.000Z",
    "updated_at": "2026-03-06T10:30:00.000Z"
  }
}
```

### Error Response (404)

```json
{
  "error": "Procedure not found"
}
```

---

## 5️⃣ POST /api/v1/procedures 🔒

### Description
Create a new procedure

### Authentication
**Required** - Bearer Token

### Headers

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Procedure name (max 500 chars, must be unique) |
| category | string | Yes | Category name (max 100 chars) |
| description | string | No | Procedure description |
| is_active | boolean | No | Active status (default: true) |
| display_order | integer | No | Display order within category (default: 0) |

### Example Request

```bash
curl -X POST http://localhost:8080/api/v1/procedures \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Custom Dental Procedure",
    "category": "Diagnostic & Preventive",
    "description": "A custom procedure for special cases",
    "is_active": true,
    "display_order": 100
  }'
```

### Request Body Example

```json
{
  "name": "Custom Dental Procedure",
  "category": "Diagnostic & Preventive",
  "description": "A custom procedure for special cases",
  "is_active": true,
  "display_order": 100
}
```

### Response (201 Created)

```json
{
  "success": true,
  "message": "Procedure created successfully",
  "data": {
    "id": "new-uuid-here",
    "name": "Custom Dental Procedure",
    "category": "Diagnostic & Preventive",
    "description": "A custom procedure for special cases",
    "is_active": true,
    "display_order": 100,
    "created_at": "2026-03-06T11:00:00.000Z",
    "updated_at": "2026-03-06T11:00:00.000Z"
  }
}
```

### Error Responses

**401 Unauthorized**
```json
{
  "error": "No token provided" 
}
```

**500 Internal Server Error**
```json
{
  "error": "duplicate key value violates unique constraint \"procedures_name_key\""
}
```

---

## 6️⃣ PUT /api/v1/procedures/:id 🔒

### Description
Update an existing procedure

### Authentication
**Required** - Bearer Token

### Headers

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Procedure ID to update |

### Request Body

All fields are optional. Only include fields you want to update.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Procedure name |
| category | string | Category name |
| description | string | Procedure description |
| is_active | boolean | Active status |
| display_order | integer | Display order |

### Example Request

```bash
curl -X PUT http://localhost:8080/api/v1/procedures/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "is_active": false
  }'
```

### Request Body Example

```json
{
  "description": "Updated description for this procedure",
  "is_active": false
}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Procedure updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Check up (Exam)",
    "category": "Diagnostic & Preventive",
    "description": "Updated description for this procedure",
    "is_active": false,
    "display_order": 1,
    "created_at": "2026-03-06T10:30:00.000Z",
    "updated_at": "2026-03-06T11:15:00.000Z"
  }
}
```

### Error Responses

**404 Not Found**
```json
{
  "error": "Procedure not found"
}
```

---

## 7️⃣ DELETE /api/v1/procedures/:id 🔒

### Description
Delete a procedure

### Authentication
**Required** - Bearer Token

### Headers

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Procedure ID to delete |

### Example Request

```bash
curl -X DELETE http://localhost:8080/api/v1/procedures/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Procedure deleted successfully"
}
```

### Error Responses

**404 Not Found**
```json
{
  "error": "Procedure not found"
}
```

---

## 🔐 Authentication

### Getting Your JWT Token

1. **Login to the application**
2. **Open browser console** (F12)
3. **Run this command**:
```javascript
localStorage.getItem('auth_token')
```
4. **Copy the token**
5. **Use in API requests**:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Token Format

```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

---

## 📊 Available Categories

1. **Diagnostic & Preventive** - 16 procedures
2. **Restorative** - 8 procedures
3. **Endodontic** - 9 procedures
4. **Periodontal** - 5 procedures
5. **Prosthodontics, Removable** - 5 procedures
6. **Implant** - 4 procedures
7. **Prosthodontics, Fixed** - 5 procedures
8. **OS** (Oral Surgery) - 10 procedures
9. **Ortho** (Orthodontics) - 1 procedure
10. **Adjunctive** - 5 procedures

**Total**: 90+ procedures

---

## 🧪 Testing in Swagger UI

1. **Open Swagger**: http://localhost:8080/api-docs
2. **Find "Procedures" section**
3. **Click on any endpoint**
4. **Click "Try it out"**
5. **Fill in parameters** (if needed)
6. **For protected endpoints**:
   - Click "Authorize" button at top
   - Enter: `Bearer YOUR_TOKEN`
   - Click "Authorize"
7. **Click "Execute"**
8. **View response**

---

## 💡 Common Use Cases

### Use Case 1: Load Procedures for Dropdown
```bash
GET /api/v1/procedures/by-category
```
Returns procedures grouped by category, perfect for dropdown menus.

### Use Case 2: Search Procedures
```bash
GET /api/v1/procedures?search=root
```
Returns all procedures containing "root" in the name.

### Use Case 3: Get Category Statistics
```bash
GET /api/v1/procedures/categories
```
Returns count of procedures in each category.

### Use Case 4: Add Custom Procedure
```bash
POST /api/v1/procedures
{
  "name": "Special Treatment",
  "category": "Diagnostic & Preventive"
}
```
Adds a new procedure to the database.

---

## 🔍 Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request (invalid data) |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Not found |
| 500 | Server error |

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- UUIDs are version 4
- Procedure names must be unique
- Category names are case-sensitive
- Search is case-insensitive
- Only active procedures (is_active=true) are shown by default in by-category endpoint
