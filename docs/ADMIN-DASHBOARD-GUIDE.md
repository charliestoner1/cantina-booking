# Admin Dashboard Installation Guide

## Files to Create

### 1. API Route
**Location:** `app/api/admin/bookings/route.ts`
**File:** `admin-bookings-route.ts`

This handles:
- GET requests with filtering (status, search, date)
- PATCH requests to update booking status
- Statistics aggregation

### 2. Dashboard Page
**Location:** `app/admin/page.tsx`
**File:** `admin-dashboard-page.tsx`

This provides:
- Overview stats (total bookings, by status, revenue)
- Search and filter functionality
- Bookings table with inline status updates
- Detailed booking view modal

## Installation Steps

### Step 1: Create Admin API Route
```bash
mkdir -p app/api/admin/bookings
```

Copy `admin-bookings-route.ts` to `app/api/admin/bookings/route.ts`

### Step 2: Create Admin Page
```bash
mkdir -p app/admin
```

Copy `admin-dashboard-page.tsx` to `app/admin/page.tsx`

### Step 3: Install date-fns (if not already installed)
```bash
npm install date-fns
```

### Step 4: Test the Dashboard
```bash
npm run dev
```

Navigate to: `http://localhost:3000/admin`

## Features

### Stats Dashboard
- Total bookings count
- Pending bookings count
- Confirmed bookings count
- Total revenue (from confirmed/completed bookings)

### Filters
- **Search:** By confirmation code, customer name, email, or phone
- **Status:** Filter by booking status
- **Date:** Filter by specific reservation date

### Booking Management
- View all booking details in modal
- Update status inline from dropdown
- Quick access to customer contact info
- See bottle selections and financial breakdown

### Status Options
- PENDING - Initial booking state
- CONFIRMED - Admin has confirmed the booking
- COMPLETED - Event happened successfully
- CANCELLED - Customer cancelled
- NO_SHOW - Customer didn't show up

## Security Considerations (TODO)

**IMPORTANT:** This admin dashboard has NO authentication. Anyone can access it.

For production, you MUST add:

### Option 1: Simple Password Protection
```typescript
// app/admin/page.tsx
'use client'

import { useState, useEffect } from 'react'

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setAuthenticated(true)
      sessionStorage.setItem('admin_auth', 'true')
    } else {
      alert('Incorrect password')
    }
  }

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') {
      setAuthenticated(true)
    }
  }, [])

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-3 py-2 border rounded mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  return <AdminDashboard />
}
```

### Option 2: NextAuth.js (Recommended for Production)
```bash
npm install next-auth
```

Set up proper authentication with session management.

### Option 3: Middleware Protection
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check for admin auth
  const adminAuth = request.cookies.get('admin_session')
  
  if (!adminAuth) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
```

## Usage Tips

### Quick Actions
1. **Today's Bookings:** Set date filter to today
2. **Pending Review:** Set status filter to "PENDING"
3. **Search Customer:** Type name/email in search box
4. **Update Status:** Use dropdown in Actions column

### Best Practices
1. Confirm bookings as soon as you review them
2. Mark completed after the event happens
3. Mark no-shows to track patterns
4. Keep special requests visible during service

## Troubleshooting

**"Failed to fetch bookings"**
- Check API route exists at `app/api/admin/bookings/route.ts`
- Check browser console for errors
- Verify Prisma is working: `npx prisma studio`

**Stats showing wrong numbers**
- Stats count ALL bookings regardless of filters
- Revenue only counts CONFIRMED and COMPLETED bookings
- Refresh page to update stats

**Modal not closing**
- Click the X button or outside the modal
- Refresh page if stuck

**Can't update status**
- Check network tab for errors
- Verify booking ID is valid
- Try refreshing the page

## Next Steps

After testing the basic dashboard:

1. **Add Authentication** - Critical for production
2. **Add More Filters** - By table type, date range, revenue range
3. **Export Functionality** - CSV export of bookings
4. **Email Customer** - Quick email from dashboard
5. **Calendar View** - Visual booking calendar
6. **Analytics** - Charts and graphs
7. **Inventory Management** - Track bottle stock

## Production Checklist

Before going live:
- [ ] Add authentication
- [ ] Protect API routes
- [ ] Add admin user roles
- [ ] Add audit logging
- [ ] Set up rate limiting
- [ ] Add HTTPS only
- [ ] Remove console.logs
- [ ] Test all status transitions
- [ ] Backup database regularly

