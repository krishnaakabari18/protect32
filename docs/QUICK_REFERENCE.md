# 🚀 Quick Reference - Dentist Management System

## 🌐 Access URLs

| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:3002 | ✅ Running |
| Login Page | http://localhost:3002/auth/boxed-signin | ✅ Ready |
| API Server | http://localhost:8080 | ✅ Running |
| Swagger UI | http://localhost:8080/api-docs/ | ✅ Ready |

## 🔐 Login Credentials

```
Email:    admin@example.com
Password: password123
```

## 🗄️ Database Credentials

```
Host:     localhost
Port:     5432
Database: dentist_newdb
User:     dentist
Password: dentist@345
```

## 🎯 Quick Commands

### Start Both Servers
```bash
./start-all.sh
```

### Start API Only
```bash
cd api && npm start
```

### Start Frontend Only
```bash
cd backend && npm run dev
```

### Test Database Connection
```bash
node api/test-db-connection.js
```

### Stop All Servers
```bash
# Kill API
lsof -ti:8080 | xargs kill -9

# Kill Frontend
lsof -ti:3002 | xargs kill -9
```

## 📋 Module URLs

| Module | URL |
|--------|-----|
| Dashboard | http://localhost:3002/ |
| Users | http://localhost:3002/apps/contacts |
| Patients | http://localhost:3002/management/patients |
| Providers | http://localhost:3002/management/providers |
| Appointments | http://localhost:3002/management/appointments |
| Treatment Plans | http://localhost:3002/management/treatment-plans |
| Prescriptions | http://localhost:3002/management/prescriptions |
| Payments | http://localhost:3002/management/payments |
| Documents | http://localhost:3002/management/documents |
| Reviews | http://localhost:3002/management/reviews |
| Notifications | http://localhost:3002/management/notifications |

## 🧪 API Test Commands

### Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### Get Users (with token)
```bash
curl -X GET "http://localhost:8080/api/v1/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "ngrok-skip-browser-warning: true"
```

### Get Patients
```bash
curl -X GET "http://localhost:8080/api/v1/patients?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "ngrok-skip-browser-warning: true"
```

## 📊 Current Status

✅ API Server: Running on port 8080
✅ Frontend: Running on port 3002
✅ Database: Connected
✅ Authentication: Working
✅ All Modules: Implemented
✅ Names Display: Working (shows "John Doe" instead of UUIDs)

## 🔧 Troubleshooting

### Port in Use
```bash
lsof -ti:8080 | xargs kill -9  # Kill API
lsof -ti:3002 | xargs kill -9  # Kill Frontend
```

### Database Connection Failed
```bash
# Check PostgreSQL
sudo systemctl status postgresql

# Test connection
psql -h localhost -U dentist -d dentist_newdb
```

### Module Not Found
```bash
cd api && npm install
cd backend && npm install
```

## 📝 Log Files

```bash
# View API logs
tail -f api.log

# View Frontend logs
tail -f frontend.log
```

## 🎨 Features

- ✅ Full CRUD operations
- ✅ Server-side pagination
- ✅ Real-time search
- ✅ Filter options
- ✅ List & Grid views
- ✅ Patient/Provider names display
- ✅ Dark mode support
- ✅ Responsive design
- ✅ JWT authentication
- ✅ Swagger documentation

## 📞 Support

Check these files for detailed help:
- `SETUP_COMPLETE.md` - Complete setup guide
- `API_SERVER_FIX.md` - API troubleshooting
- `DATABASE_PASSWORD_FIX.md` - Database issues
- `TESTING_GUIDE.md` - Testing checklist

---

**Ready to use!** Login at http://localhost:3002/auth/boxed-signin 🎉
