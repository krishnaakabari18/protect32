# Users CRUD Implementation - Contacts Page

## Overview
Implemented complete User management system at `/apps/contacts` with full CRUD operations and server-side pagination integrated with the API.

## Features Implemented

### ✅ Full CRUD Operations
1. **Create User**
   - Add new users with all required fields
   - Email, password, first name, last name
   - User type selection (Admin, Provider, Patient)
   - Mobile number, date of birth, address
   - Form validation

2. **Read Users**
   - List all users with pagination
   - Server-side pagination (10, 25, 50, 100 per page)
   - Search functionality (name, email, mobile)
   - Filter by user type
   - Two view modes: List and Grid

3. **Update User**
   - Edit existing user details
   - Update all fields except email
   - Toggle active/inactive status
   - Form pre-filled with current data

4. **Delete User**
   - Delete user with confirmation dialog
   - SweetAlert2 confirmation popup
   - API integration for deletion

### ✅ Server-Side Pagination
- Page navigation (Previous, Next, Page numbers)
- Items per page selector (10, 25, 50, 100)
- Shows current page info (Showing X to Y of Z entries)
- Smart page number display (shows 5 pages at a time)
- Maintains pagination state across operations

### ✅ Search & Filter
- Real-time search (debounced 300ms)
- Search by: Name, Email, Mobile number
- Filter by user type (All, Admin, Provider, Patient)
- Refresh button to reload data

### ✅ Two View Modes
1. **List View**
   - Table format with columns
   - Shows: Name, Email, Type, Mobile, Status, Actions
   - User type badges (color-coded)
   - Status badges (Active/Inactive)
   - Action buttons (Edit, Delete)

2. **Grid View**
   - Card-based layout
   - Responsive grid (1-4 columns based on screen size)
   - Shows user avatar with initials
   - User type badge
   - All user details in card format
   - Action buttons at bottom

### ✅ UI Features
- Loading states (spinner)
- Error handling with toast notifications
- Success messages for operations
- Confirmation dialogs for delete
- Modal forms for add/edit
- Responsive design
- Dark mode support
- Beautiful gradient avatars with initials

## API Integration

### Endpoints Used:
```
GET    /api/v1/users?page=1&limit=10&user_type=admin
POST   /api/v1/users
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id
```

### Authentication:
- Uses Bearer token from localStorage
- Includes `ngrok-skip-browser-warning` header
- Handles 401 errors

## File Structure

```
backend/
├── app/(defaults)/apps/contacts/
│   └── page.tsx                                    # Updated to use new component
└── components/apps/contacts/
    ├── components-apps-contacts.tsx                # Original (kept for reference)
    └── components-apps-contacts-users.tsx          # New Users CRUD component
```

## How to Use

### 1. Access the Page
Navigate to: **http://localhost:3001/apps/contacts**

### 2. View Users
- See all users in list or grid view
- Toggle between views using the buttons
- Use pagination to navigate through pages

### 3. Search Users
- Type in the search box
- Search by name, email, or mobile number
- Results update automatically (debounced)

### 4. Filter Users
- Select user type from dropdown
- Choose items per page
- Click Refresh to reload

### 5. Add New User
1. Click "Add User" button
2. Fill in the form:
   - First Name (required)
   - Last Name (required)
   - Email (required)
   - Password (required for new users)
   - User Type (required)
   - Mobile Number (optional)
   - Date of Birth (optional)
   - Address (optional)
3. Click "Add"

### 6. Edit User
1. Click Edit button (pencil icon) on any user
2. Modify the fields (email cannot be changed)
3. Toggle Active/Inactive status
4. Click "Update"

### 7. Delete User
1. Click Delete button (trash icon) on any user
2. Confirm deletion in the popup
3. User will be removed from the list

## Features Breakdown

### Pagination Controls
```
[Previous] [1] [2] [3] [4] [5] [Next]
```
- Shows 5 page numbers at a time
- Smart navigation (adjusts based on current page)
- Disabled state for first/last pages

### User Type Badges
- **Admin**: Red badge
- **Provider**: Blue badge
- **Patient**: Green badge

### Status Badges
- **Active**: Green badge
- **Inactive**: Red badge

### Search Behavior
- Debounced (300ms delay)
- Searches across: first_name, last_name, email, mobile_number
- Case-insensitive
- Real-time results

### Form Validation
- Required fields marked with *
- Email format validation
- Password required for new users only
- User type dropdown with 3 options
- Date picker for date of birth
- Textarea for address

## API Response Format

### List Users Response:
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "user_type": "patient",
      "mobile_number": "+1234567890",
      "date_of_birth": "1990-01-01",
      "address": "123 Main St",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

## Testing Checklist

### ✅ CRUD Operations
- [ ] Create new user (all user types)
- [ ] View users in list mode
- [ ] View users in grid mode
- [ ] Edit user details
- [ ] Toggle user active status
- [ ] Delete user with confirmation

### ✅ Pagination
- [ ] Navigate to next page
- [ ] Navigate to previous page
- [ ] Click specific page number
- [ ] Change items per page
- [ ] Verify page info display

### ✅ Search & Filter
- [ ] Search by name
- [ ] Search by email
- [ ] Search by mobile
- [ ] Filter by user type
- [ ] Clear search
- [ ] Refresh data

### ✅ UI/UX
- [ ] Loading states show correctly
- [ ] Success messages appear
- [ ] Error messages appear
- [ ] Confirmation dialogs work
- [ ] Modal opens/closes properly
- [ ] Responsive on mobile
- [ ] Dark mode works

## Troubleshooting

### Issue: Users not loading
- Check API is running on port 8080
- Check authentication token is valid
- Check browser console for errors
- Verify API endpoint is correct

### Issue: Pagination not working
- Check API returns pagination object
- Verify page/limit parameters in URL
- Check pagination state updates

### Issue: Search not working
- Wait for debounce (300ms)
- Check search term is not empty
- Verify users array has data

### Issue: Create/Update fails
- Check all required fields are filled
- Verify email format is correct
- Check password is provided for new users
- Check API response for error details

## Next Steps

Optional enhancements:
1. Add bulk operations (delete multiple)
2. Add export to CSV/Excel
3. Add import from CSV
4. Add advanced filters (date range, status)
5. Add sorting by columns
6. Add user profile pictures upload
7. Add email verification
8. Add password reset
9. Add activity logs
10. Add role-based permissions

## Success! 🎉

You now have a fully functional User management system with:
- ✅ Complete CRUD operations
- ✅ Server-side pagination
- ✅ Search and filter
- ✅ Two view modes (List & Grid)
- ✅ Beautiful UI with animations
- ✅ API integration
- ✅ Error handling
- ✅ Responsive design

**Access it now at: http://localhost:3001/apps/contacts**
