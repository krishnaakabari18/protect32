# Procedures Dropdown - Complete Fix Guide

## Current Status
✅ Database has 123 procedures across 10 categories
✅ API endpoints created and configured
✅ Frontend code updated to use procedure IDs
❌ API server needs to be running
❌ Dropdown not populating

## Step-by-Step Fix

### Step 1: Start the API Server
```bash
cd /var/www/html/protect32/api
npm start
```

If you get "EADDRINUSE" error, the server is already running - that's GOOD! Skip to Step 2.

### Step 2: Verify API is Working
Open your browser and go to:
```
http://localhost:8080/health
```

You should see: `{"status":"OK","message":"Server is running"}`

### Step 3: Test Procedures API
1. Login to get a token (use Swagger or your frontend)
2. Test the endpoint in Swagger: `/api/v1/procedures/by-category`
3. You should see JSON with categories and procedures

### Step 4: Check Browser Console
1. Open your frontend: `http://localhost:3000/management/provider-fees`
2. Click "Add Fee" button
3. Open browser DevTools (F12)
4. Go to Console tab
5. Look for any errors related to procedures fetch

### Step 5: Check Network Tab
1. In DevTools, go to Network tab
2. Click "Add Fee" button again
3. Look for request to `/api/v1/procedures/by-category`
4. Check if:
   - Request is being made
   - Response status is 200
   - Response has data

## Common Issues & Solutions

### Issue 1: "Failed to fetch" or CORS error
**Solution**: Make sure API_BASE_URL in `backend/config/api.config.ts` is correct:
```typescript
export const BASE_URL = 'http://localhost:8080';
```

### Issue 2: 401 Unauthorized
**Solution**: You need to login first. The auth token is required.

### Issue 3: Empty dropdown
**Possible causes**:
1. API not returning data - check database has procedures
2. Frontend not parsing response correctly - check console for errors
3. Token expired - login again

### Issue 4: Dropdown shows "Select Procedure" but no options
**Solution**: Check if `procedureCategories` state is being set. Add console.log in fetchProceduresByCategory:
```typescript
const fetchProceduresByCategory = async () => {
    try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_ENDPOINTS.procedures}/by-category`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
            },
        });
        const data = await response.json();
        console.log('Procedures API Response:', data); // ADD THIS LINE
        if (response.ok && data.success) {
            setProcedureCategories(data.data || []);
            console.log('Categories set:', data.data); // ADD THIS LINE
        } else {
            console.error('Failed to fetch procedures:', data);
        }
    } catch (error) {
        console.error('Error fetching procedures by category:', error);
    }
};
```

## Expected API Response Format
```json
{
  "success": true,
  "data": [
    {
      "category": "Diagnostic & Preventive",
      "procedures": [
        {
          "id": "uuid-here",
          "name": "Check up (Exam)",
          "description": null,
          "category": "Diagnostic & Preventive",
          "is_active": true
        }
      ]
    }
  ]
}
```

## Expected Dropdown Structure
```html
<select>
  <option value="">Select Procedure</option>
  <optgroup label="Diagnostic & Preventive">
    <option value="uuid-1">Check up (Exam)</option>
    <option value="uuid-2">Digital X-Ray (IOPA)</option>
  </optgroup>
  <optgroup label="Restorative">
    <option value="uuid-3">Amalgam (surfaces - 1234)</option>
  </optgroup>
</select>
```

## Files Modified
1. `api/src/models/procedureModel.js` - Removed display_order references
2. `api/src/routes/v1/procedureRoutes.js` - Fixed authentication middleware
3. `backend/components/management/provider-fees-crud.tsx` - Updated to use procedure IDs

## Next Steps
1. Start API server if not running
2. Hard refresh browser (Ctrl+Shift+R)
3. Login to the application
4. Go to Treatment Fees page
5. Click "Add Fee"
6. Procedure dropdown should now show all 123 procedures grouped by 10 categories

## Debug Commands
```bash
# Check if API is running
ps aux | grep "node.*server.js"

# Check port 8080
lsof -i :8080

# Check procedures in database
PGPASSWORD=dentist@345 psql -h localhost -U dentist -d dentist_newdb -c "SELECT category, COUNT(*) FROM procedures GROUP BY category;"

# Test API endpoint (replace TOKEN with your actual token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8080/api/v1/procedures/by-category
```

## Contact
If dropdown still not working after following all steps, check:
1. Browser console for JavaScript errors
2. Network tab for API request/response
3. API server logs for errors
