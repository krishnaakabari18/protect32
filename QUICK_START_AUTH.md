# Quick Start - Authentication System

## 🚀 Start the Application

```bash
# Terminal 1 - Start API
cd api
npm run dev
# API runs on: http://localhost:8080

# Terminal 2 - Start Frontend
cd backend
npm run dev
# Frontend runs on: http://localhost:3001
```

## 🔐 Login

1. Open browser: **http://localhost:3001**
2. You'll be redirected to: **http://localhost:3001/auth/boxed-signin**
3. Enter credentials:
   ```
   Email: admin@dentist.com
   Password: password123
   ```
4. Click **SIGN IN**
5. You'll be redirected to dashboard: **http://localhost:3001**

## 🚪 Logout

1. Click on **user avatar** (top-right corner)
2. Click **Sign Out**
3. You'll be redirected to login page

## ✅ What's Working

- ✅ Login with API integration
- ✅ Dashboard protection (requires authentication)
- ✅ Logout functionality
- ✅ User profile display in header
- ✅ Admin-only access
- ✅ Automatic redirects
- ✅ Loading states
- ✅ Error handling

## 📍 Important URLs

- **Login**: http://localhost:3001/auth/boxed-signin
- **Dashboard**: http://localhost:3001/
- **API**: http://localhost:8080/api/v1
- **API Docs**: http://localhost:8080/api-docs

## 🔑 Test Accounts

### Admin (Full Access)
```
Email: admin@dentist.com
Password: password123
```

### Provider (No Dashboard Access)
```
Email: dr.smith@dentist.com
Password: password123
```

### Patient (No Dashboard Access)
```
Email: john.doe@email.com
Password: password123
```

## 🛡️ Security Features

1. **Middleware Protection**: Server-side route protection
2. **Client-side Check**: Double verification in layout
3. **Admin-only**: Only admin users can access dashboard
4. **Token Management**: Secure token storage
5. **Auto Cleanup**: All auth data cleared on logout

## 🐛 Troubleshooting

### Can't login?
- Check API is running on port 8080
- Check credentials are correct
- Check browser console for errors

### Stuck on loading?
- Clear localStorage: `localStorage.clear()`
- Clear cookies
- Refresh page

### Redirect loop?
- Clear browser cache
- Clear localStorage and cookies
- Restart dev servers

## 📝 Quick Commands

```bash
# Clear localStorage (in browser console)
localStorage.clear()

# Check if logged in (in browser console)
localStorage.getItem('auth_token')
localStorage.getItem('user')

# Manual logout (in browser console)
localStorage.clear()
document.cookie = 'auth_token=; path=/; max-age=0'
location.href = '/auth/boxed-signin'
```

## 🎯 Next Steps

Now that authentication is working, you can:
1. Access the dashboard at http://localhost:3001
2. Use the admin panel at http://localhost:3001/admin
3. Manage users, patients, providers, etc.
4. All features are protected by authentication

## 💡 Tips

- The login page shows test credentials for convenience
- Only admin users can access the dashboard
- Logout clears all authentication data
- The header shows your profile information
- All routes except `/auth/*` require authentication

---

**Ready to go!** Just start both servers and navigate to http://localhost:3001
