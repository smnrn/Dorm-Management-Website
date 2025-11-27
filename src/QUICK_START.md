# DormGuard - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Configure Backend
```bash
cd backend
cp .env.example .env  # Or use the existing .env file
```

**Verify `.env` has these settings:**
```
SUPABASE_DB_HOST=db.ksegustazzrvubcktz.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_PASSWORD=AppDev123
```

### Step 2: Start Backend Server
```bash
# From the /backend directory
npm install
npm start
```

**You should see:**
```
[DATABASE] Connection Configuration:
[DATABASE] Host: db.ksegustazzrvubcktz.supabase.co
[DATABASE] Port: 5432
[SUCCESS] ✓ Supabase database connected successfully
Running on: http://localhost:5000
```

### Step 3: Start Frontend
```bash
# From the root directory
npm install
npm run dev
```

**Open:** http://localhost:3000

---

## 🔑 Default Login Credentials

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Administrator (full access)

### Help Desk Account
- **Username:** `helpdesk`
- **Password:** `help123`
- **Role:** Help Desk Staff (check-in/out only)

### Tenant Account
- **Username:** `johndoe`
- **Password:** `pass123`
- **Room:** A101

---

## ✅ Verification Checklist

- [ ] Backend starts on port 5000
- [ ] Database connection succeeds
- [ ] Frontend opens at localhost:3000
- [ ] Can login with admin credentials
- [ ] Can see dashboard data

---

## 🐛 Common Issues

### Port 5000 Already in Use
```bash
# Kill the process
lsof -ti:5000 | xargs kill -9

# Or change port in /backend/.env
PORT=5001
```

### Database Connection Error
1. Check `.env` file exists in `/backend` directory
2. Verify password is correct: `AppDev123`
3. Ensure internet connection is stable
4. Check Supabase project is active

### Frontend Shows "Connection Failed"
1. Ensure backend is running on port 5000
2. Check CORS settings in backend
3. Verify API URL in frontend code

---

## 📁 Project Structure

```
dormguard/
├── backend/
│   ├── config/
│   │   └── db.js          # Database connection
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   └── tenantSpecificRoutes.js
│   ├── .env               # Environment variables
│   └── server.js          # Express app
│
├── components/
│   ├── admin-new/         # Admin components
│   ├── tenant/            # Tenant components
│   └── HelpDeskPage.tsx   # Help desk UI
│
├── lib/
│   ├── dataStore.ts       # Data management
│   ├── types.ts           # TypeScript types
│   └── api.ts             # API client
│
└── App.tsx                # Main app component
```

---

## 🎯 What's Working

✅ **Authentication**: Role-based login (Admin, HelpDesk, Tenant)  
✅ **Visitor Registration**: Tenants can register visitors with validation  
✅ **Approval System**: Admins approve/deny visitor requests  
✅ **Check-In/Out**: Help desk manages visitor entry/exit  
✅ **Digital Pass**: QR code generation for approved visitors  
✅ **Visit Logs**: Complete audit trail of all visits  
✅ **Real-Time Sync**: Auto-refresh every 5 seconds  
✅ **Analytics**: Dashboard with statistics and charts  
✅ **CSV Export**: Download visitor data  

---

## 🔄 Development Workflow

### Making Changes

1. **Backend changes**: Edit files in `/backend`, server auto-restarts
2. **Frontend changes**: Edit components, Vite auto-reloads
3. **Database changes**: Update schema in Supabase dashboard

### Testing Changes

1. Test on each role (Admin, HelpDesk, Tenant)
2. Verify data appears correctly
3. Check console for errors
4. Test edge cases

### Deploying

1. Update `.env` for production
2. Build frontend: `npm run build`
3. Deploy backend to hosting service
4. Update CORS and API URLs

---

## 📞 Support

**Issues?** Check `/SYSTEM_STATUS.md` for detailed troubleshooting

**Database Schema:** See `/SYSTEM_STATUS.md` for complete schema reference

**Field Names:** Always use `full_name`, `contact_number`, `expected_date`

---

**Happy Coding!** 🎉
