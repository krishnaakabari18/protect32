# Quick Guide - Users Management

## 🚀 Access

**URL**: http://localhost:3001/apps/contacts

## 📋 Features

### View Modes
- **List View**: Table format with all details
- **Grid View**: Card-based layout

### Operations
- ✅ **Create**: Add new users
- ✅ **Read**: View all users with pagination
- ✅ **Update**: Edit user details
- ✅ **Delete**: Remove users

### Pagination
- Navigate: Previous, Next, Page numbers
- Items per page: 10, 25, 50, 100
- Shows: "Showing X to Y of Z entries"

### Search & Filter
- Search by: Name, Email, Mobile
- Filter by: User Type (All, Admin, Provider, Patient)
- Real-time search (300ms debounce)

## 🎯 Quick Actions

### Add User
1. Click **"Add User"** button
2. Fill required fields:
   - First Name *
   - Last Name *
   - Email *
   - Password * (for new users)
   - User Type *
3. Click **"Add"**

### Edit User
1. Click **Edit** button (pencil icon)
2. Modify fields
3. Toggle Active/Inactive
4. Click **"Update"**

### Delete User
1. Click **Delete** button (trash icon)
2. Confirm in popup
3. User removed

### Search
1. Type in search box
2. Results update automatically
3. Clear to show all

### Filter
1. Select user type from dropdown
2. Results update immediately
3. Select "All Types" to clear

### Change View
- Click **List** icon for table view
- Click **Grid** icon for card view

## 🎨 UI Elements

### User Type Badges
- 🔴 **Admin**: Red badge
- 🔵 **Provider**: Blue badge
- 🟢 **Patient**: Green badge

### Status Badges
- 🟢 **Active**: Green badge
- 🔴 **Inactive**: Red badge

### Avatars
- Gradient circles with user initials
- Color: Blue to Purple gradient

## 📊 Pagination Example

```
Showing 1 to 10 of 50 entries

[Previous] [1] [2] [3] [4] [5] [Next]

Items per page: [10 ▼]
```

## 🔍 Search Examples

- Search "John" → Finds "John Doe", "Johnny Smith"
- Search "admin@" → Finds "admin@dentist.com"
- Search "555" → Finds users with "555" in mobile

## ⚙️ Form Fields

### Required (*)
- First Name
- Last Name
- Email
- Password (new users only)
- User Type

### Optional
- Mobile Number
- Date of Birth
- Address
- Active Status (edit only)

## 💡 Tips

1. **Search is debounced**: Wait 300ms after typing
2. **Email cannot be changed**: When editing users
3. **Password not required**: When updating existing users
4. **Pagination persists**: Stays on same page after operations
5. **Confirmation required**: For delete operations

## 🐛 Common Issues

### Users not showing?
- Check API is running (port 8080)
- Check you're logged in
- Click Refresh button

### Can't create user?
- Fill all required fields (marked with *)
- Check email format
- Provide password for new users

### Search not working?
- Wait 300ms after typing
- Check spelling
- Try different search terms

## 📱 Responsive Design

- **Desktop**: 4 columns in grid view
- **Tablet**: 2-3 columns in grid view
- **Mobile**: 1 column in grid view
- **All devices**: Full-width list view

## ⌨️ Keyboard Shortcuts

- **Enter**: Submit form
- **Escape**: Close modal
- **Tab**: Navigate form fields

## 🎯 Best Practices

1. **Use search** for quick access to specific users
2. **Use filters** to narrow down by user type
3. **Use pagination** for large datasets
4. **Use grid view** for visual browsing
5. **Use list view** for detailed information

## 📈 Performance

- **Debounced search**: Reduces API calls
- **Server-side pagination**: Handles large datasets
- **Lazy loading**: Only loads visible data
- **Optimized rendering**: Fast UI updates

## 🔐 Security

- **Authentication required**: Must be logged in
- **Admin only**: Only admin users can access
- **Token-based**: Uses Bearer token
- **Secure API**: All requests authenticated

---

**Ready to manage users!** Navigate to http://localhost:3001/apps/contacts
