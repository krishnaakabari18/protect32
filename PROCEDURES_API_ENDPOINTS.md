# Procedures API Endpoints

## Important Note
The procedures API routes are currently disabled in the main routes due to a module loading issue. However, the procedures data is already in the database and can be accessed directly via SQL or by fixing the routes loading issue.

## Available Endpoints (When Enabled)

### 1. Get Procedures Grouped by Category ⭐ **USE THIS FOR DROPDOWN**
```
GET /api/v1/procedures/grouped
```

**Headers:**
```
Authorization: Bearer {token}
ngrok-skip-browser-warning: true
```

**Response:**
```json
{
  "data": [
    {
      "category": "Diagnostic & Preventive",
      "procedures": [
        {
          "id": "uuid",
          "name": "Check up (Exam)",
          "description": "Routine dental examination",
          "category": "Diagnostic & Preventive",
          "is_active": true,
          "created_at": "2026-03-06T...",
          "updated_at": "2026-03-06T..."
        }
      ]
    }
  ]
}
```

### 2. Get All Categories
```
GET /api/v1/procedures/categories
```

**Response:**
```json
{
  "data": [
    "Adjunctive",
    "Diagnostic & Preventive",
    "Endodontic",
    "Implant",
    "Oral Surgery",
    "Orthodontic",
    "Periodontal",
    "Prosthodontics, Fixed",
    "Prosthodontics, Removable",
    "Restorative"
  ]
}
```

### 3. Get All Procedures (No Pagination)
```
GET /api/v1/procedures/list/all?category={category}
```

### 4. Get Procedures by Category
```
GET /api/v1/procedures/category/Restorative
```

### 5. Get All Procedures (Paginated)
```
GET /api/v1/procedures?page=1&limit=10&category=&search=
```

### 6. Get Procedure by ID
```
GET /api/v1/procedures/{id}
```

### 7. Create Procedure
```
POST /api/v1/procedures
Content-Type: application/json

{
  "category": "Diagnostic & Preventive",
  "name": "New Procedure",
  "description": "Description here",
  "is_active": true
}
```

### 8. Update Procedure
```
PUT /api/v1/procedures/{id}
Content-Type: application/json

{
  "category": "Diagnostic & Preventive",
  "name": "Updated Name",
  "description": "Updated description",
  "is_active": true
}
```

### 9. Toggle Procedure Status
```
PATCH /api/v1/procedures/{id}/toggle
```

### 10. Delete Procedure
```
DELETE /api/v1/procedures/{id}
```

## Temporary Workaround

Since the procedures routes have a loading issue, you can access the procedures data directly from the database:

### SQL Query for Grouped Procedures
```sql
SELECT 
    category,
    json_agg(
        json_build_object(
            'id', id,
            'name', name,
            'description', description,
            'category', category,
            'is_active', is_active,
            'created_at', created_at,
            'updated_at', updated_at
        ) ORDER BY name
    ) as procedures
FROM procedures
WHERE is_active = true
GROUP BY category
ORDER BY category;
```

### Alternative: Create a Simple Express Route

Add this directly to `api/src/app.js` before the v1 routes:

```javascript
// Temporary procedures endpoint
app.get('/api/v1/procedures/grouped', authenticateToken, async (req, res) => {
    try {
        const pool = require('./config/database');
        const query = `
            SELECT 
                category,
                json_agg(
                    json_build_object(
                        'id', id,
                        'name', name,
                        'description', description,
                        'category', category,
                        'is_active', is_active
                    ) ORDER BY name
                ) as procedures
            FROM procedures
            WHERE is_active = true
            GROUP BY category
            ORDER BY category
        `;
        const result = await pool.query(query);
        res.json({ data: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

## Frontend Usage

The frontend code in `provider-fees-crud.tsx` is already configured to use this endpoint:

```typescript
const fetchProceduresGrouped = async () => {
    try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_ENDPOINTS.procedures}/grouped`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
            },
        });
        const data = await response.json();
        if (response.ok) {
            setProcedureCategories(data.data || []);
        }
    } catch (error) {
        console.error('Error fetching procedures:', error);
    }
};
```

## Database Tables

### procedures table
- id (UUID, PRIMARY KEY)
- category (VARCHAR)
- name (VARCHAR)
- description (TEXT)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### provider_fees table (updated)
- id (UUID, PRIMARY KEY)
- provider_id (UUID, FOREIGN KEY)
- procedure (VARCHAR) - procedure name
- procedure_id (UUID, FOREIGN KEY) - references procedures.id
- fee (NUMERIC)
- discount_percent (NUMERIC)
- status (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## Total Procedures: 106 across 10 categories

1. Adjunctive - 7 procedures
2. Diagnostic & Preventive - 16 procedures
3. Endodontic - 16 procedures
4. Implant - 4 procedures
5. Oral Surgery - 14 procedures
6. Orthodontic - 3 procedures
7. Periodontal - 9 procedures
8. Prosthodontics, Fixed - 9 procedures
9. Prosthodontics, Removable - 7 procedures
10. Restorative - 21 procedures
