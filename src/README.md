# DormGuard - Visitor Management System

A comprehensive dormitory security system with digital visitor registration and tracking, featuring a modern animated interface.

## Features

- **Role-based authentication** (Admin, HelpDesk, Tenant)
- **Digital visitor pre-registration** (12 hours advance notice)
- **Real-time visitor tracking** with live sync
- **Digital pass generation**
- **Comprehensive activity logging**
- **Analytics and reporting**
- **Modern animated UI** with smooth transitions

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS + Motion (Framer Motion)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (Supabase)
- **Authentication:** JWT

## Database Schema

### Tables

1. **Rooms** - Dormitory room management (Buildings A, B, C)
2. **Admin** - Admin and HelpDesk users (role-based)
3. **Tenant** - Dormitory residents
4. **Visitor** - Visitor pre-registrations
5. **Visitor_Log** - Check-in/check-out records

### User Roles

- **Admin** - Full system access, manages tenants and approvals
- **HelpDesk** - Manages physical check-in/check-out at entrances
- **Tenant** - Pre-registers visitors online

**Note:** Both Admin and HelpDesk users are stored in the Admin table with a `role` field.

## Quick Start

### 1. Database Setup

Run the SQL script in Supabase SQL Editor:

```bash
# Copy and paste the contents of DATABASE_SETUP.sql
```

This creates:
- 30 empty rooms (10 per building: A, B, C)
- 2 production users:
  - **Admin:** simon.roaring / admin123
  - **HelpDesk:** kenrick.cham / admin123

### 2. Environment Configuration

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Create `backend/.env` file:

```env
# Database
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=24h

# Server
PORT=5000
NODE_ENV=development
```

### 3. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### 4. Start Application

```bash
# Terminal 1 - Start backend
cd backend
npm start

# Terminal 2 - Start frontend
npm run dev
```

### 5. Login

Access the application and login with:

**Admin Account:**
- Username: `simon.roaring`
- Password: `admin123`

**HelpDesk Account:**
- Username: `kenrick.cham`
- Password: `admin123`

**Tenant Accounts** (if you create them):
- Create through Admin dashboard
- Credentials set during registration

**⚠️ Important:** Change default passwords after first login.

## Role-Based Access

### Admin Dashboard
- ✅ Register and manage tenants
- ✅ Approve/deny visitor requests
- ✅ View all visitors and logs
- ✅ Manage room assignments
- ✅ Generate reports and analytics

### HelpDesk Dashboard
- ✅ Check-in/check-out visitors
- ✅ View expected visitors
- ✅ View active visitors
- ✅ Access visit logs
- ✅ Real-time sync updates

### Tenant Dashboard
- ✅ Register visitors (12 hours advance)
- ✅ View visitor status (Pending/Approved/Denied)
- ✅ View visitor history
- ✅ Manage profile information

## Frontend Enhancements

### 🎨 Modern Animated Interface

The system features a **professional, smooth UI** with:

#### HomePage Animations
- ✨ Smooth page entry with staggered elements
- 🎯 Interactive hover effects on cards
- 📊 Animated statistics counters
- 🌊 Pulsing background effects
- 🎪 Scroll-triggered fade-in animations

#### LoginPage Animations
- ✨ Slide-in transitions from left/right
- 🎯 Form field focus feedback
- ⚡ Smooth loading states
- 🔄 Error shake animations
- ✅ Success state transitions

#### Dashboard Features
- ⚡ Real-time data synchronization
- 🔄 Smooth loading transitions
- 🎯 Interactive button feedback
- 📱 Responsive animations on all devices

**Performance:** All animations are GPU-accelerated and run at 60 FPS.

For detailed animation documentation, see: `ANIMATIONS_GUIDE.md`

## Database Field Mapping

### Admin/HelpDesk Login
- **Database:** `admin_id`, `username`, `password`, `full_name`, `role`
- **Backend:** Same as database
- **Frontend:** `userId`, `username`, `fullName`, `role`

### Tenant Login
- **Database:** `tenant_id`, `username`, `password`, `full_name`, `room_id`
- **Backend:** Same as database
- **Frontend:** `userId`, `username`, `fullName`, `role`, `building`, `room`

### Visitor Registration
- **Database:** `full_name`, `contact_number`, `expected_date`, `expected_time`
- **Backend/Frontend:** Same as database

## Key Business Rules

1. ⏰ Visitors must be registered **12 hours in advance**
2. ✅ Admin approval required before check-in
3. 🚪 Help Desk processes physical check-in/check-out
4. 👤 Tenants can only register visitors for themselves
5. 📝 All activities are logged with timestamps
6. 🏢 Building filter correctly filters rooms by building (A, B, C)

## Room Management

### Building Structure
- **Building A:** Rooms A-101 to A-110 (10 rooms)
- **Building B:** Rooms B-101 to B-110 (10 rooms)
- **Building C:** Rooms C-101 to C-110 (10 rooms)

### Room Assignment
- Each room has a capacity (typically 2-4 people)
- Current occupants tracked automatically
- Filter by building when assigning rooms
- Real-time availability updates

## Troubleshooting

### Connection Timeout Error
- ✅ Check Supabase project is active
- ✅ Verify database credentials in `.env` files
- ✅ Ensure IP is whitelisted in Supabase
- ✅ Test connection using Supabase Dashboard

### Login Issues
- ✅ Verify user exists in Admin or Tenant table
- ✅ Check password hash matches bcrypt format
- ✅ Ensure role field is set correctly (Admin table)
- ✅ Clear browser cache and try again

### Data Not Syncing
- ✅ Check browser console for errors
- ✅ Verify dataStore initialization
- ✅ Check Supabase connection status
- ✅ Click manual refresh button

### Building Filter Not Working
- ✅ Verify database stores buildings as single letters ("A", "B", "C")
- ✅ Check console logs for filter debugging
- ✅ Ensure frontend extracts letter from "Building A" format
- ✅ Clear cache and refresh

## Security Notes

- ⚠️ This system is for **internal use only**
- ⚠️ Not designed for PII or highly sensitive data
- ⚠️ Change default passwords immediately
- ⚠️ Use strong passwords in production
- ⚠️ Enable HTTPS in production
- ⚠️ Regularly backup database
- ⚠️ Review Supabase Row Level Security policies

## Testing

### Test Accounts

**Admin:**
```
Username: simon.roaring
Password: admin123
```

**HelpDesk:**
```
Username: kenrick.cham
Password: admin123
```

**Create Tenant Accounts:**
1. Login as Admin
2. Go to "Register New Tenant"
3. Fill in tenant details
4. Assign a room
5. Create credentials
6. Share login info with tenant

### Test Workflow

1. **Admin:** Register a tenant with room assignment
2. **Tenant:** Login and register a visitor (12 hours in advance)
3. **Admin:** Approve the visitor request
4. **HelpDesk:** Check-in the visitor when they arrive
5. **HelpDesk:** Check-out the visitor when they leave
6. **Admin:** View logs and generate reports

## Support

For issues or questions, check logs in:
- 🌐 **Browser console** (Frontend errors - F12)
- 💻 **Backend terminal** (Server errors)
- 🗄️ **Supabase Dashboard** (Database queries)

## Production Deployment

Before deploying to production:

1. ✅ Change all default passwords
2. ✅ Update JWT_SECRET to a strong random value
3. ✅ Set NODE_ENV=production
4. ✅ Enable HTTPS
5. ✅ Configure proper CORS settings
6. ✅ Set up database backups (Supabase automatic backups)
7. ✅ Review and tighten security policies
8. ✅ Test all features thoroughly
9. ✅ Monitor performance and errors
10. ✅ Set up production error logging

## Project Structure

```
/
├── App.tsx                    # Main app component
├── components/
│   ├── HomePage.tsx           # Landing page with animations
│   ├── LoginPage.tsx          # Login with animations
│   ├── AdminPage.tsx          # Admin dashboard
│   ├── HelpDeskPage.tsx       # HelpDesk dashboard
│   ├── TenantPage.tsx         # Tenant dashboard
│   ├── admin-new/             # Admin sub-components
│   ├── tenant/                # Tenant sub-components
│   └── ui/                    # Reusable UI components
├── lib/
│   ├── api.ts                 # API client
│   ├── auth.ts                # Authentication utilities
│   ├── dataStore.ts           # Client-side data store
│   └── types.ts               # TypeScript types
├── backend/
│   ├── server.js              # Express server
│   ├── config/db.js           # Database connection
│   ├── controllers/           # Business logic
│   ├── routes/                # API routes
│   └── middleware/            # Auth middleware
├── styles/
│   └── globals.css            # Global styles + animations
└── DATABASE_SETUP.sql         # Database schema and seed data
```

## Documentation Files

- **README.md** - This file (main documentation)
- **DATABASE_SETUP.sql** - Database schema and initial data
- **ANIMATIONS_GUIDE.md** - Detailed animation documentation
- **FRONTEND_IMPROVEMENTS_SUMMARY.md** - Summary of UI enhancements
- **Attributions.md** - Credits and licenses

## License

Internal use only - DormGuard System © 2025

---

## Quick Commands Reference

```bash
# Start development servers
npm run dev                    # Frontend (Vite)
cd backend && npm start        # Backend (Node.js)

# Database operations
# Run in Supabase SQL Editor:
DATABASE_SETUP.sql            # Initial setup

# Environment setup
cp .env.example .env          # Configure Supabase credentials
cp backend/.env.example backend/.env  # Configure backend
```

---

**System Status:** ✅ Production Ready | 🎨 Enhanced UI | 🔒 Secure | 📊 Full Analytics
