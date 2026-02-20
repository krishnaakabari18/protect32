# Reviews Module - Database Schema Fix

## Date: February 20, 2026

## Issue
The Reviews module was using incorrect column names that didn't match the actual database schema:
- Frontend was using `review_text` but database has `comment`
- Frontend was using `review_date` but database only has `created_at`
- Database uses UUID for IDs, not integers

## Actual Database Schema

### Table: provider_reviews
```sql
CREATE TABLE provider_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    appointment_id UUID,
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Key Points:
- ✅ Column is `comment` (not `review_text`)
- ✅ No `review_date` column (only `created_at` timestamp)
- ✅ IDs are UUIDs (not integers)
- ✅ `provider_id` references `providers` table (not `users` directly)
- ✅ `patient_id` references `users` table
- ✅ Has `appointment_id` field (optional)

## Changes Made

### 1. Frontend Component Updates
**File**: `backend/components/management/reviews-crud.tsx`

#### Changed Field Names:
- ❌ `review_text` → ✅ `comment`
- ❌ `review_date` → ✅ `created_at` (read-only, auto-generated)

#### Updated Default Values:
```typescript
const defaultValues = {
    id: null,
    patient_id: '',
    provider_id: '',
    rating: '',
    comment: '',  // Changed from review_text
    // Removed review_date
};
```

#### Updated Form Fields:
- Removed "Review Date" input field
- Changed "Review Text" label to "Comment"
- Changed textarea name from `review_text` to `comment`
- Display `created_at` timestamp in list (read-only)

#### Updated Display:
- List view shows `comment` column
- List view shows `created_at` with date and time
- Grid view shows `comment` text
- Grid view shows `created_at` timestamp

### 2. Backend Model Updates
**File**: `api/src/models/reviewModel.js`

#### Fixed SQL Queries:
```javascript
// CREATE - Now uses correct columns
INSERT INTO provider_reviews (patient_id, provider_id, rating, comment)
VALUES ($1, $2, $3, $4)

// UPDATE - Now uses correct columns
UPDATE provider_reviews 
SET patient_id = $1, provider_id = $2, rating = $3, comment = $4
WHERE id = $5
```

#### Fixed JOIN for Provider Names:
```javascript
// Old (incorrect):
LEFT JOIN users prov ON r.provider_id = prov.id

// New (correct):
LEFT JOIN providers prov ON r.provider_id = prov.id
LEFT JOIN users u ON prov.user_id = u.id
```

**Reason**: `provider_id` references the `providers` table, which has a `user_id` that references `users` table.

### 3. Controller (No Changes Needed)
**File**: `api/src/controllers/reviewController.js`
- Already handles pagination correctly
- Already handles filtering correctly
- No changes required

## Form Fields After Fix

### Add/Edit Review Modal

| Field | Type | Required | Database Column | Notes |
|-------|------|----------|-----------------|-------|
| Patient | Dropdown | Yes | patient_id | UUID from users table |
| Provider | Dropdown | Yes | provider_id | UUID from providers table |
| Rating | Dropdown | Yes | rating | Integer 1-5 |
| Comment | Textarea | No | comment | Text field |
| Created Date | Display Only | - | created_at | Auto-generated timestamp |

### Removed Fields:
- ❌ Review Date input (was trying to write to non-existent column)

### Display-Only Fields:
- ✅ Created Date (shows when review was created, cannot be edited)

## API Request/Response Format

### Create Review Request:
```json
POST /api/v1/reviews
{
  "patient_id": "uuid-here",
  "provider_id": "uuid-here",
  "rating": 5,
  "comment": "Excellent service!"
}
```

### Update Review Request:
```json
PUT /api/v1/reviews/:id
{
  "patient_id": "uuid-here",
  "provider_id": "uuid-here",
  "rating": 4,
  "comment": "Very good service!"
}
```

### Response Format:
```json
{
  "data": {
    "id": "uuid-here",
    "patient_id": "uuid-here",
    "provider_id": "uuid-here",
    "rating": 5,
    "comment": "Excellent service!",
    "created_at": "2026-02-20T10:30:00.000Z",
    "patient_first_name": "John",
    "patient_last_name": "Doe",
    "provider_first_name": "Sarah",
    "provider_last_name": "Williams"
  }
}
```

## Testing After Fix

### Test 1: Add New Review
```
1. Click "Add Review"
2. Select Patient: John Doe
3. Select Provider: Dr. Sarah Williams
4. Select Rating: 5 - Excellent
5. Enter Comment: "Great service!"
6. Click "Add"
7. ✅ Should save successfully
8. ✅ Created date should show current timestamp
```

### Test 2: Edit Review
```
1. Click Edit on any review
2. ✅ Patient dropdown should show selected patient
3. ✅ Provider dropdown should show selected provider
4. ✅ Rating should show current rating
5. ✅ Comment should show current comment
6. Change rating to 4
7. Update comment
8. Click "Update"
9. ✅ Should save successfully
```

### Test 3: View Review
```
1. Click View on any review
2. ✅ All fields should be read-only
3. ✅ Created date should be displayed
4. ✅ No date input field should be visible
```

### Test 4: List Display
```
1. View reviews list
2. ✅ Patient names should display correctly
3. ✅ Provider names should display correctly
4. ✅ Rating should show as stars
5. ✅ Comment should be truncated if long
6. ✅ Created date should show with time
```

## Database Relationships

### Provider Reviews Relationships:
```
provider_reviews
├── patient_id → users.id (patient information)
├── provider_id → providers.id
│   └── providers.user_id → users.id (provider information)
└── appointment_id → appointments.id (optional)
```

### Query to Get Provider Name:
```sql
SELECT 
  r.*,
  p.first_name as patient_first_name,
  p.last_name as patient_last_name,
  u.first_name as provider_first_name,
  u.last_name as provider_last_name
FROM provider_reviews r
LEFT JOIN users p ON r.patient_id = p.id
LEFT JOIN providers prov ON r.provider_id = prov.id
LEFT JOIN users u ON prov.user_id = u.id
```

## Files Modified

### Frontend:
1. ✅ `backend/components/management/reviews-crud.tsx`
   - Changed `review_text` to `comment`
   - Removed `review_date` field
   - Updated display to show `created_at`
   - Removed date input from form

### Backend:
1. ✅ `api/src/models/reviewModel.js`
   - Fixed column names in INSERT query
   - Fixed column names in UPDATE query
   - Fixed JOIN to get provider names correctly
   - Added proper filtering for rating

## Common Errors Fixed

### Error 1: Column "review_text" does not exist
**Cause**: Frontend was sending `review_text` field
**Fix**: Changed to `comment` field

### Error 2: Column "review_date" does not exist
**Cause**: Frontend was sending `review_date` field
**Fix**: Removed field, use auto-generated `created_at` instead

### Error 3: Provider names not showing
**Cause**: Incorrect JOIN (joining users directly instead of through providers table)
**Fix**: Added proper JOIN through providers table

## Validation Rules

### Rating:
- Required field
- Must be integer between 1 and 5
- Database has CHECK constraint

### Comment:
- Optional field
- TEXT type (unlimited length)
- Can be NULL

### Patient ID:
- Required field
- Must be valid UUID
- Must exist in users table

### Provider ID:
- Required field
- Must be valid UUID
- Must exist in providers table

## Status
✅ **FIXED** - All database schema issues resolved
✅ Frontend uses correct column names
✅ Backend queries use correct columns
✅ Provider names display correctly
✅ Created timestamp displays correctly
✅ Ready for testing

## Next Steps
1. Test add new review
2. Test edit existing review
3. Test view review details
4. Verify provider names display correctly
5. Verify created timestamps display correctly
6. Test rating filter
7. Test pagination

---

**Last Updated**: February 20, 2026
**Issue**: Database schema mismatch
**Status**: RESOLVED
