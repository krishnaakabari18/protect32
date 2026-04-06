# Specialties Module - Complete Implementation

## What Was Created

### Backend (API)

1. **Database Table**: `api/database/create-specialties-table.sql`
   - Fields: id, name, description, is_active, created_at, updated_at
   - Includes 8 default specialties (Endodontist, Periodontist, etc.)

2. **Model**: `api/src/models/specialtyModel.js`
   - CRUD operations
   - Search and filter support
   - Active/inactive status filtering

3. **Controller**: `api/src/controllers/specialtyController.js`
   - GET /api/v1/specialties (list with pagination)
   - GET /api/v1/specialties/:id (get by ID)
   - POST /api/v1/specialties (create)
   - PUT /api/v1/specialties/:id (update)
   - DELETE /api/v1/specialties/:id (delete)

4. **Routes**: `api/src/routes/v1/specialtyRoutes.js`
   - All endpoints with Swagger documentation
   - Authentication middleware applied

5. **Registered**: Added to `api/src/routes/v1/index.js`

### Frontend

1. **API Config**: Added endpoint to `config/api.config.ts`
   - `specialties: ${API_BASE_URL}/specialties`

2. **Page**: `app/(defaults)/management/specialties/page.tsx`
   - Uses GenericCRUD component
   - Columns: Name, Description, Status
   - Form fields: Name (required), Description, Status
   - Search by name/description
   - Filter by Active/Inactive status

3. **Sidebar Menu**: Added to `components/layouts/sidebar-dentist.tsx`
   - Menu item: "Specialties" with star icon
   - Located after "Providers" in Management section
   - Permission-based: `can('specialties')`

## Setup Steps

### 1. Create Database Table

Run this SQL in pgAdmin:

```sql
\i api/database/create-specialties-table.sql
```

Or manually:
```sql
psql -U postgres -d protect32 -f api/database/create-specialties-table.sql
```

### 2. Restart API Server

```bash
cd api
npm start
```

### 3. Refresh Frontend

Press `Ctrl + Shift + R` (hard refresh) in your browser

## Features

### List View
- Displays all specialties with name, description, and status
- Search by name or description
- Filter by Active/Inactive status
- Pagination support

### Add Specialty
- Name (required, unique)
- Description (optional)
- Status (Active/Inactive)

### Edit Specialty
- Update name, description, or status
- Validates unique name constraint

### Delete Specialty
- Removes specialty from database
- Shows confirmation dialog

## Default Specialties Included

1. Endodontist - Root canal treatment specialist
2. Periodontist - Gum disease and dental implants specialist
3. Prosthodontist - Dental prosthetics and restoration specialist
4. OMFS - Oral and Maxillofacial Surgery specialist
5. Orthodontist - Teeth alignment and braces specialist
6. Pedodontist - Pediatric dentistry specialist
7. General Dentist - General dental care
8. Cosmetic Dentist - Aesthetic dental procedures

## API Endpoints

- `GET /api/v1/specialties` - List all (with pagination, search, filter)
- `GET /api/v1/specialties/:id` - Get one
- `POST /api/v1/specialties` - Create new
- `PUT /api/v1/specialties/:id` - Update
- `DELETE /api/v1/specialties/:id` - Delete

## Access

Navigate to: `http://localhost:3000/management/specialties`

Or click "Specialties" in the left sidebar under Management section.
