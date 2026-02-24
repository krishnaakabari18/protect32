# Testing Guide - All Modules

## Prerequisites

1. **Database**: PostgreSQL running with `dentist_newdb` database
2. **API Server**: Running on http://localhost:8080
3. **Frontend**: Running on http://localhost:3001
4. **Admin Account**: admin@example.com / password123

## Starting the Application

### 1. Start API Server
```bash
cd api
npm start
```
Expected output: `Server running on port 8080`

### 2. Start Frontend
```bash
cd backend
npm run dev
```
Expected output: `Ready on http://localhost:3001`

## Testing Checklist

### Authentication
- [ ] Login at http://localhost:3001/auth/boxed-signin
- [ ] Verify redirect to dashboard after login
- [ ] Check user profile displays in header
- [ ] Test logout functionality

### Dashboard
- [ ] Access http://localhost:3001/
- [ ] Verify admin-only access (redirects if not logged in)

### Users Module (http://localhost:3001/apps/contacts)
- [ ] View users list
- [ ] Search users by name, email, mobile
- [ ] Filter by user type (Admin, Provider, Patient)
- [ ] Create new user
- [ ] Edit existing user
- [ ] Delete user
- [ ] Switch between List and Grid views
- [ ] Test pagination (10, 25, 50, 100 per page)

### Patients Module (http://localhost:3001/management/patients)
- [ ] View patients list
- [ ] Filter by blood group
- [ ] Create new patient
- [ ] Edit patient details
- [ ] Delete patient
- [ ] Test search functionality
- [ ] Verify medical history, allergies, medications fields

### Providers Module (http://localhost:3001/management/providers)
- [ ] View providers list
- [ ] Create new provider
- [ ] Edit provider details
- [ ] Delete provider
- [ ] Test specialization field
- [ ] Verify license number, experience fields

### Appointments Module (http://localhost:3001/management/appointments)
- [ ] View appointments list
- [ ] Filter by status (Scheduled, Confirmed, Completed, Cancelled, No Show)
- [ ] Create new appointment
- [ ] Edit appointment
- [ ] Delete appointment
- [ ] Verify date formatting
- [ ] Check status badges display correctly

### Treatment Plans Module (http://localhost:3001/management/treatment-plans)
- [ ] View treatment plans list
- [ ] Filter by status (Planned, In Progress, Completed, Cancelled)
- [ ] Create new treatment plan
- [ ] Edit treatment plan
- [ ] Delete treatment plan
- [ ] Verify cost formatting ($XX.XX)
- [ ] Check status badges

### Prescriptions Module (http://localhost:3001/management/prescriptions)
- [ ] View prescriptions list
- [ ] Create new prescription
- [ ] Edit prescription
- [ ] Delete prescription
- [ ] Verify medication name, dosage, frequency fields
- [ ] Check date formatting

### Payments Module (http://localhost:3001/management/payments)
- [ ] View payments list
- [ ] Filter by payment status (Pending, Completed, Failed, Refunded)
- [ ] Create new payment
- [ ] Edit payment
- [ ] Delete payment
- [ ] Verify amount formatting ($XX.XX)
- [ ] Check payment method options
- [ ] Verify status badges

### Documents Module (http://localhost:3001/management/documents)
- [ ] View documents list
- [ ] Filter by document type
- [ ] Create new document
- [ ] Edit document
- [ ] Delete document
- [ ] Verify document type options
- [ ] Check date formatting

### Reviews Module (http://localhost:3001/management/reviews)
- [ ] View reviews list
- [ ] Filter by rating (1-5 stars)
- [ ] Create new review
- [ ] Edit review
- [ ] Delete review
- [ ] Verify star rating display (⭐⭐⭐⭐⭐)
- [ ] Check review text truncation

### Notifications Module (http://localhost:3001/management/notifications)
- [ ] View notifications list
- [ ] Create new notification
- [ ] Edit notification
- [ ] Delete notification
- [ ] Verify notification type options
- [ ] Check read/unread status badges
- [ ] Verify message truncation

## Common Features to Test (All Modules)

### Pagination
- [ ] Change items per page (10, 25, 50, 100)
- [ ] Navigate between pages
- [ ] Verify page numbers display correctly
- [ ] Check "Previous" and "Next" buttons

### Search
- [ ] Type in search box
- [ ] Verify debouncing (300ms delay)
- [ ] Check search results update correctly
- [ ] Clear search and verify all items return

### View Modes
- [ ] Switch to List view
- [ ] Switch to Grid view
- [ ] Verify data displays correctly in both modes

### CRUD Operations
- [ ] Create: Fill form and submit
- [ ] Read: View item details
- [ ] Update: Edit and save changes
- [ ] Delete: Confirm deletion dialog

### Form Validation
- [ ] Submit empty required fields
- [ ] Verify error messages display
- [ ] Check field-specific validation

### Loading States
- [ ] Verify loading spinner during API calls
- [ ] Check loading text displays

### Error Handling
- [ ] Test with invalid data
- [ ] Verify error toast notifications
- [ ] Check error messages are clear

### Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)

### Dark Mode
- [ ] Toggle dark mode
- [ ] Verify all modules display correctly
- [ ] Check badges and colors in dark mode

## API Testing

### Using Swagger UI
1. Open http://localhost:8080/api-docs/
2. Click "Authorize" button
3. Enter Bearer token from localStorage
4. Test each endpoint:
   - GET (list with pagination)
   - GET by ID
   - POST (create)
   - PUT (update)
   - DELETE

### Using cURL

```bash
# Get auth token
TOKEN=$(curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}' \
  | jq -r '.token')

# Test patients endpoint
curl -X GET "http://localhost:8080/api/v1/patients?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "ngrok-skip-browser-warning: true"

# Create patient
curl -X POST http://localhost:8080/api/v1/patients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{
    "user_id": 1,
    "blood_group": "O+",
    "emergency_contact_name": "John Doe",
    "emergency_contact_number": "1234567890"
  }'
```

## Performance Testing

- [ ] Load 100+ records and test pagination
- [ ] Test search with large dataset
- [ ] Verify API response times < 500ms
- [ ] Check frontend rendering performance

## Security Testing

- [ ] Try accessing pages without login
- [ ] Verify JWT token expiration
- [ ] Test with invalid tokens
- [ ] Check CORS headers
- [ ] Verify input sanitization

## Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Known Issues

None at this time.

## Reporting Issues

If you find any issues:
1. Note the module name
2. Describe the steps to reproduce
3. Include error messages
4. Note browser and OS

---

**Happy Testing!** 🚀
