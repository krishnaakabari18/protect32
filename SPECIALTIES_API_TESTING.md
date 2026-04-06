# Specialties API Testing Guide

## Setup Steps

### 1. Create Database Table

Run in pgAdmin or terminal:

```bash
cd api
psql -U postgres -d protect32 -f database/create-specialties-table.sql
```

Or in pgAdmin Query Tool:
```sql
\i C:/wamp/www/protect32/api/database/create-specialties-table.sql
```

### 2. Restart API Server

```bash
cd api
npm start
```

## Testing Methods

### Method 1: HTML Test Page (Easiest)

1. Open `api/test-specialties.html` in your browser
2. Click "Login" button
3. Click "Add All Default Specialties" button
4. Click "Refresh List" to see all specialties

### Method 2: Node.js Test Script

```bash
cd api
node test-specialties-api.js
```

### Method 3: Postman/Thunder Client

#### Step 1: Login
```
POST https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/auth/login

Headers:
  Content-Type: application/json
  ngrok-skip-browser-warning: true

Body:
{
  "email": "admin@protect32.com",
  "password": "admin123"
}

Response: Copy the "token" value
```

#### Step 2: Create Specialty
```
POST https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/specialties

Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_TOKEN_HERE
  ngrok-skip-browser-warning: true

Body:
{
  "name": "Endodontist",
  "description": "Root canal treatment specialist",
  "is_active": true
}
```

#### Step 3: List All Specialties
```
GET https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/specialties?limit=100

Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
  ngrok-skip-browser-warning: true
```

## API Endpoints

### POST /api/v1/specialties
Create a new specialty

**Request Body:**
```json
{
  "name": "Endodontist",
  "description": "Root canal treatment specialist",
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Endodontist",
    "description": "Root canal treatment specialist",
    "is_active": true,
    "created_at": "2026-04-06T...",
    "updated_at": "2026-04-06T..."
  }
}
```

### GET /api/v1/specialties
List all specialties

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `is_active` (optional): Filter by status (true/false)
- `search` (optional): Search by name or description

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Endodontist",
      "description": "Root canal treatment specialist",
      "is_active": true,
      "created_at": "2026-04-06T...",
      "updated_at": "2026-04-06T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 6,
    "totalPages": 1
  }
}
```

### GET /api/v1/specialties/:id
Get single specialty by ID

### PUT /api/v1/specialties/:id
Update specialty

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "is_active": false
}
```

### DELETE /api/v1/specialties/:id
Delete specialty

## Default Specialties

The following specialties are included by default:

1. **Endodontist** - Root canal treatment specialist
2. **Periodontist** - Gum disease and dental implants specialist
3. **Prosthodontist** - Dental prosthetics and restoration specialist
4. **OMFS** - Oral and Maxillofacial Surgery specialist
5. **Orthodontist** - Teeth alignment and braces specialist
6. **Pedodontist** - Pediatric dentistry specialist
7. **General Dentist** - General dental care
8. **Cosmetic Dentist** - Aesthetic dental procedures

## Frontend Access

After testing the API, access the frontend at:
```
http://localhost:3000/management/specialties
```

The frontend will automatically use the API to:
- Display list of specialties
- Add new specialties
- Edit existing specialties
- Delete specialties
- Search and filter

## Troubleshooting

### Error: "Specialty name already exists"
- The name must be unique
- Try a different name or update the existing one

### Error: "Name is required"
- The name field is mandatory
- Provide a non-empty name value

### Error: "Authentication required"
- Make sure you're logged in
- Include the Bearer token in Authorization header

### Table doesn't exist
- Run the SQL script to create the table
- Check database connection in `api/src/config/database.js`
