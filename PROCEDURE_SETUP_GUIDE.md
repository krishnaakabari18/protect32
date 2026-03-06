# Procedure Dropdown Setup Guide

## Current Status
✅ Database migration SQL file created
✅ Backend API (model, controller, routes) implemented
✅ Swagger documentation added
✅ Frontend updated to fetch from API
✅ Category-based dropdown with labels
✅ "Add New Procedure" functionality
✅ Edit mode: already-used procedures disabled
✅ SQL parameter placeholders fixed

## Setup Steps

### Step 1: Run Database Migration
```bash
# Connect to PostgreSQL and run the migration
psql -U dentist -d dentist_newdb -f api/database/create-procedures-categories-table.sql
```

This will:
- Create the `procedures` table with categories
- Insert all 90+ procedures organized by category
- Create indexes for better performance
- Display a summary of procedures by category

### Step 2: Restart API Server
```bash
cd api
npm start
```

The API server needs to be restarted to load the new procedure routes.

### Step 3: Test the API Endpoints

#### Test 1: Get all procedures
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "ngrok-skip-browser-warning: true" \
     https://abbey-stateliest-treva.ngrok-free.dev/api/v1/procedures
```

#### Test 2: Get procedures grouped by category
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "ngrok-skip-browser-warning: true" \
     https://abbey-stateliest-treva.ngrok-free.dev/api/v1/procedures/by-category
```

#### Test 3: Get all categories
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "ngrok-skip-browser-warning: true" \
     https://abbey-stateliest-treva.ngrok-free.dev/api/v1/procedures/categories
```

### Step 4: Test Frontend

1. Navigate to: `http://localhost:3000/management/provider-fees`
2. Click "Add Fee" button
3. Verify:
   - Procedure dropdown shows categories as labels
   - All procedures are grouped under their categories
   - "Add New Procedure" link appears
4. Test adding a new procedure:
   - Click "+ Add New Procedure"
   - Select a category
   - Enter procedure name
   - Click "Add Procedure"
   - Verify it appears in the dropdown
5. Test edit mode:
   - Add a fee for a provider with a specific procedure
   - Click edit on that fee
   - Open the procedure dropdown
   - Verify the already-added procedure shows "(Already added)" and is disabled

## API Endpoints

### GET /api/v1/procedures
Get all procedures with optional filters
- Query params: `category`, `is_active`, `search`
- Returns: Array of procedures

### GET /api/v1/procedures/by-category
Get procedures grouped by category
- Returns: Array of categories with nested procedures

### GET /api/v1/procedures/categories
Get list of all categories with counts
- Returns: Array of categories with procedure counts

### GET /api/v1/procedures/:id
Get single procedure by ID
- Returns: Procedure object

### POST /api/v1/procedures (Protected)
Create new procedure
- Body: `{ name, category, description?, is_active?, display_order? }`
- Returns: Created procedure

### PUT /api/v1/procedures/:id (Protected)
Update procedure
- Body: `{ name?, category?, description?, is_active?, display_order? }`
- Returns: Updated procedure

### DELETE /api/v1/procedures/:id (Protected)
Delete procedure
- Returns: Success message

## Categories

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

## Features Implemented

### Frontend (provider-fees-crud.tsx)
- ✅ Fetches procedures from API on component mount
- ✅ Displays procedures grouped by category in dropdown
- ✅ "Add New Procedure" modal with category selection
- ✅ Newly added procedures automatically selected
- ✅ Edit mode: dropdown enabled but used procedures disabled
- ✅ Visual indicator "(Already added)" for used procedures

### Backend
- ✅ Complete CRUD operations for procedures
- ✅ Category-based filtering and grouping
- ✅ Search functionality
- ✅ Active/inactive status management
- ✅ Display order support
- ✅ Swagger documentation

## Troubleshooting

### Issue: Procedures not loading
**Solution:** 
1. Check if database migration ran successfully
2. Verify API server is running
3. Check browser console for errors
4. Verify auth token is valid

### Issue: "Already added" not working
**Solution:**
1. Ensure `provider_id` is set before opening edit modal
2. Check that `items` array contains all provider fees
3. Verify `isProcedureUsed` function logic

### Issue: New procedure not appearing
**Solution:**
1. Check API response in network tab
2. Verify `fetchProceduresByCategory` is called after save
3. Check if procedure was actually saved to database

## Next Steps

After completing the setup:
1. Test all CRUD operations
2. Verify Swagger documentation at `/api-docs`
3. Test with multiple providers
4. Verify discount calculations work correctly
5. Test pagination with large datasets

## Files Modified/Created

### Database
- `api/database/create-procedures-categories-table.sql` (NEW)

### Backend API
- `api/src/models/procedureModel.js` (NEW - FIXED)
- `api/src/controllers/procedureController.js` (NEW)
- `api/src/routes/v1/procedureRoutes.js` (NEW)
- `api/src/routes/v1/index.js` (UPDATED - already includes routes)

### Frontend
- `backend/components/management/provider-fees-crud.tsx` (UPDATED)
- `backend/config/api.config.ts` (already has endpoint)

## Support

If you encounter any issues:
1. Check the API logs for errors
2. Verify database connection
3. Check browser console for frontend errors
4. Ensure all environment variables are set correctly
