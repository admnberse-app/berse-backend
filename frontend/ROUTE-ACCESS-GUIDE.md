# 🎯 BerseMuka Route Access Guide

## 🚨 SOLUTION: How to Access /connect and /profile Routes

### ✅ Step 1: Open BerseMuka App
Visit: **http://localhost:5173**

### ✅ Step 2: Quick Authentication (Choose ONE method)

#### Method A: Browser Console (Fastest) ⚡
1. **Press F12** to open Developer Tools
2. **Go to Console tab**
3. **Copy and paste this code:**

```javascript
// Quick Authentication Setup
const testUser = {
    id: "1",
    email: "test@example.com",
    fullName: "Test User",
    firstName: "Test",
    lastName: "User",
    phone: "+60123456789",
    bio: "A test user for development",
    profession: "Software Developer",
    age: 28,
    location: "Kuala Lumpur, Malaysia",
    interests: ["Technology", "Coffee", "Travel"],
    points: 245,
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3MjI3NjA4MDAwMDAsImV4cCI6MTcyMzM2NTYwMDAwMH0.mock-signature";

localStorage.setItem('bersemuka_user', JSON.stringify(testUser));
localStorage.setItem('bersemuka_auth_token', testToken);

console.log('✅ Authentication set up! Reloading page...');
location.reload();
```

4. **Press Enter** - The page will reload automatically
5. **You're now authenticated!** 

#### Method B: Using Login Page 📝
1. Go to: **http://localhost:5173/login**
2. **Email:** `test@example.com`
3. **Password:** `password`
4. Click **Login**

### ✅ Step 3: Access Protected Routes

Now you can visit:
- **Connect Page:** http://localhost:5173/connect ✅
- **Profile Page:** http://localhost:5173/profile ✅
- **Dashboard:** http://localhost:5173/dashboard ✅
- **Match Page:** http://localhost:5173/match ✅
- **Points:** http://localhost:5173/points ✅

## 🔧 Troubleshooting

### If routes still don't work:

#### Check Authentication Status:
```javascript
// Run this in browser console
const user = localStorage.getItem('bersemuka_user');
const token = localStorage.getItem('bersemuka_auth_token');
console.log('User:', user ? JSON.parse(user) : 'None');
console.log('Token:', token ? token.substring(0, 50) + '...' : 'None');
console.log('Authenticated:', !!(user && token));
```

#### Clear Authentication and Start Over:
```javascript
// Run this in browser console to clear everything
localStorage.removeItem('bersemuka_user');
localStorage.removeItem('bersemuka_auth_token');
const oldKeys = ['authToken', 'auth_token', 'token', 'user'];
oldKeys.forEach(key => localStorage.removeItem(key));
console.log('Authentication cleared! Refresh the page.');
location.reload();
```

#### Check Console for Errors:
1. Press **F12** → **Console tab**
2. Look for any **red error messages**
3. If you see errors, they might provide clues about what's wrong

## 🎯 What Was Fixed

### 1. **Route Conflicts** ✅
- Removed duplicate `/event/:eventId` route definitions
- Fixed navigation routing issues

### 2. **API Service Errors** ✅
- Fixed `API_BASE_URL` undefined errors in:
  - `rewards.service.ts`
  - `notification.service.ts`
- Services now properly use the unified configuration

### 3. **Authentication Logic** ✅
- Verified ProtectedRoute component works correctly
- Mock authentication service is properly configured
- Test users are available for development

## 📱 Available Test Users

You can also try logging in with these users:

| Email | Password | Role |
|-------|----------|------|
| `test@example.com` | `password` | User |
| `admin@bersemuka.com` | `password` | Admin |
| `zara@example.com` | `password` | User |

## 🚀 Success Indicators

When everything works correctly, you should see:
- ✅ Page loads without infinite loading
- ✅ No JavaScript errors in console
- ✅ Bottom navigation works
- ✅ You can navigate between routes
- ✅ User profile shows in top-right or side menu

## 🎉 Enjoy BerseMuka!

Once authenticated, explore all the features:
- **Dashboard:** Home screen with points and activities
- **Connect:** Browse and join events
- **Match:** Find people to connect with
- **Profile:** View and edit your profile
- **Points:** See rewards and vouchers

---

**Need help?** Check the browser console (F12) for any error messages.
**Still having issues?** Try the "Clear Authentication" code above and start fresh.