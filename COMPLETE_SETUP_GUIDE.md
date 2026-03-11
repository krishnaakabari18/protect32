# Complete Setup Guide - Procedures Feature

## 🎯 What You Need

1. PostgreSQL password for the `postgres` superuser
2. Run the database setup
3. Start the API server
4. Access Swagger documentation

---

## 📊 Step 1: Database Setup

### Option A: Using pgAdmin (Easiest)

1. **Open pgAdmin** (should be installed with PostgreSQL)

2. **Connect to PostgreSQL** (it will ask for your postgres password)

3. **Run these SQL commands** in Query Tool:

```sql
-- Create user
CREATE USER dentist WITH PASSWORD 'dentist@345';

-- Create database
CREATE DATABASE dentist_newdb OWNER dentist;

-- Connect to the new database (click on dentist_newdb in left panel)
-- Then run:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant permissions
GRANT ALL ON SCHEMA public TO dentist;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dentist;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dentist;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dentist;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dentist;
```

4. **Run the procedures migration**:
   - Open the file: `api/database/create-procedures-categories-table.sql`
   - Copy all content
   - Paste in pgAdmin Query Tool (while connected to dentist_newdb)
   - Click Execute (F5)

### Option B: Using Command Line

1. **Open Command Prompt as Administrator**

2. **Connect to PostgreSQL**:
```bash
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
```
(Enter your postgres password when prompted)

3. **Run setup commands**:
```sql
CREATE USER dentist WITH PASSWORD 'dentist@345';
CREATE DATABASE dentist_newdb OWNER dentist;
\c dentist_newdb
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
GRANT ALL ON SCHEMA public TO dentist;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dentist;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dentist;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dentist;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dentist;
\q
```

4. **Run the migration**:
```bash
cd C:\wamp\www\protect32\api
$env:PGPASSWORD='dentist@345'
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U dentist -d dentist_newdb -f database/create-procedures-categories-table.sql
```

### Option C: Using Node.js Script

1. **Update the postgres password** in `api/setup-database.js` (line 13):
```javascript
password: 'YOUR_POSTGRES_PASSWORD_HERE'
```

2. **Run the setup**:
```bash
cd api
node setup-database.js
```

---

## 🚀 Step 2: Start API Server

```bash
cd api
npm start
```

Expected output:
```
Server running on port 8080
Database connected successfully
```

---

## 📚 Step 3: Access Swagger API Documentation

### Open Swagger UI:
**URL**: http://localhost:8080/api-docs

or

**URL**: https://abbey-stateliest-treva.ngrok-free.dev/api-docs

### Procedures API Endpoints:

#### 1. GET /api/v1/procedures
**Description**: Get all procedures with optional filters

**Query Parameters**:
- `category` (optional): Filter by category name
- `is_active` (optional): Filter by active status (true/false)
- `search` (optional): Search in procedure names

**Example**:
```bash
GET /api/v1/procedures?category=Endodontic
GET /api/v1/procedures?search=X-Ray
GET /api/v1/procedures?is_active=true
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Check up (Exam)",
      "category": "Diagnostic & Preventive",
      "description": null,
      "is_active": true,
      "display_order": 1,
      "created_at": "2026-03-06T...",
      "updated_at": "2026-03-06T..."
    }
  ],
  "count": 90
}
```

#### 2. GET /api/v1/procedures/by-category
**Description**: Get procedures grouped by category

**Example**:
```bash
GET /api/v1/procedures/by-category
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "category": "Diagnostic & Preventive",
      "procedures": [
        {
          "id": "uuid",
          "name": "Check up (Exam)",
          "description": null,
          "display_order": 1
        },
        {
          "id": "uuid",
          "name": "Digital X-Ray (IOPA)",
          "description": null,
          "display_order": 2
        }
      ]
    },
    {
      "category": "Restorative",
      "procedures": [...]
    }
  ]
}
```

#### 3. GET /api/v1/procedures/categories
**Description**: Get list of all categories with procedure counts

**Example**:
```bash
GET /api/v1/procedures/categories
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "category": "Diagnostic & Preventive",
      "count": "16"
    },
    {
      "category": "Restorative",
      "count": "8"
    }
  ]
}
```

#### 4. GET /api/v1/procedures/:id
**Description**: Get single procedure by ID

**Example**:
```bash
GET /api/v1/procedures/550e8400-e29b-41d4-a716-446655440000
```

**Response**:
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
    "created_at": "2026-03-06T...",
    "updated_at": "2026-03-06T..."
  }
}
```

#### 5. POST /api/v1/procedures (Protected - Requires Auth)
**Description**: Create a new procedure

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Custom Procedure Name",
  "category": "Diagnostic & Preventive",
  "description": "Optional description",
  "is_active": true,
  "display_order": 100
}
```

**Response**:
```json
{
  "success": true,
  "message": "Procedure created successfully",
  "data": {
    "id": "new-uuid",
    "name": "Custom Procedure Name",
    "category": "Diagnostic & Preventive",
    ...
  }
}
```

#### 6. PUT /api/v1/procedures/:id (Protected - Requires Auth)
**Description**: Update a procedure

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "is_active": false
}
```

**Response**:
```json
{
  "success": true,
  "message": "Procedure updated successfully",
  "data": {
    "id": "uuid",
    "name": "Updated Name",
    ...
  }
}
```

#### 7. DELETE /api/v1/procedures/:id (Protected - Requires Auth)
**Description**: Delete a procedure

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response**:
```json
{
  "success": true,
  "message": "Procedure deleted successfully"
}
```

---

## 🧪 Step 4: Test the API

### Using cURL:

```bash
# Get all procedures
curl http://localhost:8080/api/v1/procedures

# Get by category
curl http://localhost:8080/api/v1/procedures/by-category

# Get categories
curl http://localhost:8080/api/v1/procedures/categories

# Search procedures
curl "http://localhost:8080/api/v1/procedures?search=X-Ray"

# Filter by category
curl "http://localhost:8080/api/v1/procedures?category=Endodontic"
```

### Using Swagger UI:

1. Go to http://localhost:8080/api-docs
2. Find "Procedures" section
3. Click "Try it out" on any endpoint
4. Click "Execute"
5. See the response

### Using the Test Script:

1. Get your auth token:
   - Login to the app
   - Open browser console
   - Run: `localStorage.getItem('auth_token')`
   - Copy the token

2. Update `api/test-procedures-api.js`:
   - Replace `YOUR_AUTH_TOKEN_HERE` with your token

3. Run:
```bash
cd api
node test-procedures-api.js
```

---

## 🎨 Step 5: Test Frontend

1. **Open the app**: http://localhost:3000/management/provider-fees

2. **Click "Add Fee"**

3. **Verify**:
   - Provider dropdown works
   - Procedure dropdown shows categories
   - All 90+ procedures are listed under their categories
   - "Add New Procedure" link appears

4. **Test Add New Procedure**:
   - Click "+ Add New Procedure"
   - Select a category
   - Enter procedure name
   - Click "Add Procedure"
   - Verify it appears in the dropdown

5. **Test Edit Mode**:
   - Add a fee with a specific procedure
   - Click "Edit" on that fee
   - Open procedure dropdown
   - Verify already-used procedure shows "(Already added)" and is disabled

---

## 📋 Database Schema

### Procedures Table:

```sql
CREATE TABLE procedures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(500) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Categories:

1. **Diagnostic & Preventive** (16 procedures)
2. **Restorative** (8 procedures)
3. **Endodontic** (9 procedures)
4. **Periodontal** (5 procedures)
5. **Prosthodontics, Removable** (5 procedures)
6. **Implant** (4 procedures)
7. **Prosthodontics, Fixed** (5 procedures)
8. **OS** (Oral Surgery) (10 procedures)
9. **Ortho** (Orthodontics) (1 procedure)
10. **Adjunctive** (5 procedures)

**Total**: 90+ procedures

---

## 🔧 Troubleshooting

### Issue: Can't connect to database
**Solution**: 
- Make sure PostgreSQL is running (Services → postgresql-x64-18)
- Check credentials in `api/.env`
- Try connecting with pgAdmin first

### Issue: Swagger not loading
**Solution**:
- Make sure API server is running
- Check http://localhost:8080/api-docs
- Look for errors in terminal

### Issue: Procedures not showing in frontend
**Solution**:
- Check browser console for errors
- Verify API is running
- Test API endpoint: http://localhost:8080/api/v1/procedures/by-category
- Check auth token is valid

### Issue: Can't add new procedure
**Solution**:
- Make sure you're logged in
- Check auth token in localStorage
- Verify API endpoint works in Swagger

---

## ✅ Success Checklist

- [ ] Database user `dentist` created
- [ ] Database `dentist_newdb` created
- [ ] UUID extension enabled
- [ ] Procedures table created
- [ ] 90+ procedures inserted
- [ ] API server running on port 8080
- [ ] Swagger docs accessible at /api-docs
- [ ] Frontend shows procedure dropdown with categories
- [ ] Can add new procedures
- [ ] Edit mode disables used procedures

---

## 📞 Need Help?

If you're stuck on database setup:
1. Open pgAdmin
2. Use the visual interface to create user and database
3. Copy-paste the SQL from `api/database/create-procedures-categories-table.sql`
4. Execute it in pgAdmin Query Tool

This is the easiest method if command line isn't working!
