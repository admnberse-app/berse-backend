# BerseMuka Frontend Routes

## 🌟 Available Routes

### Public Routes (No Authentication Required)
- **`/`** - Splash Screen (redirects based on auth status)
- **`/login`** - Login Screen
- **`/register`** - Registration Screen

### Protected Routes (Authentication Required)
- **`/dashboard`** ✅ - Main Dashboard (Home screen with points, rewards, activities)
- **`/connect`** ✅ - BerseConnect (Events and community connections)
- **`/match`** ✅ - BerseMatch (Matching system for users)
- **`/profile`** ✅ - User Profile Screen
- **`/rewards`** ✅ - Points and Rewards Detail (same as /points)
- **`/points`** ✅ - Points and Rewards Detail (same as /rewards)
- **`/settings`** ✅ - User Settings Screen
- **`/event/:eventId`** ✅ - Event Details (dynamic route)
- **`/profile/edit`** ✅ - Edit Profile Screen
- **`/edit-profile`** ✅ - Alternative Edit Profile Route
- **`/event/create`** ✅ - Create Event Screen
- **`/forum`** ✅ - Forum Screen
- **`/create-forum-post`** ✅ - Create Forum Post Screen
- **`/book-meetup`** ✅ - Book Meetup Screen
- **`/leaderboard`** ✅ - Points Leaderboard Screen
- **`/vouchers`** ✅ - My Vouchers Screen

### Navigation Routes
- **`/*`** - Catch-all route (redirects to splash screen)

## 🧭 Navigation Flow

### Authentication Flow
1. **`/`** (Splash) → Checks authentication status
2. If authenticated → **`/dashboard`**
3. If not authenticated → **`/login`**

### Main Navigation (Bottom Navigation Bar)
- **🏠 Home** → `/dashboard`
- **🤝 Connect** → `/connect`
- **💫 Match** → `/match`
- **👥 Forum** → `/forum`
- **👤 Profile** → `/profile`

## 🔧 Route Testing

### Direct URL Access
You can test routes directly by visiting:
- `http://localhost:5173/dashboard` (will redirect to login if not authenticated)
- `http://localhost:5173/login` (always accessible)
- `http://localhost:5173/connect` (requires authentication)

### Authentication Testing
1. Access any protected route → redirects to `/login`
2. Login successfully → redirects to `/dashboard`
3. Use bottom navigation → navigate between protected routes

## 🛠 Troubleshooting

### Common Issues
1. **Route not loading**: Check authentication status
2. **Redirect loop**: Clear localStorage authentication data
3. **404 on refresh**: Vite dev server handles client-side routing automatically

### Debug Commands
```bash
# Start frontend server
cd frontend && npm run dev

# Clear authentication (in browser console)
localStorage.clear()

# Test authentication (in browser console)
testLogin('test@example.com', 'password')
```

## 📱 Route Components Status

| Route | Component | Status | Notes |
|-------|-----------|--------|-------|
| `/` | SplashScreen | ✅ Working | Auto-redirects based on auth |
| `/login` | LoginScreen | ✅ Working | Public route |
| `/register` | RegisterScreen | ✅ Working | Public route |
| `/dashboard` | DashboardScreen | ✅ Working | Main home screen |
| `/connect` | BerseConnectScreen | ✅ Working | Events & connections |
| `/match` | BerseMatchScreen | ✅ Working | User matching |
| `/profile` | ProfileScreen | ✅ Working | User profile |
| `/points` | PointsDetailScreen | ✅ Working | Points & rewards |
| `/settings` | SettingsScreen | ✅ Working | User settings |
| `/forum` | ForumScreen | ✅ Working | Community forum |
| `/leaderboard` | LeaderboardScreen | ✅ Working | Points leaderboard |
| `/vouchers` | MyVouchersScreen | ✅ Working | User vouchers |

All routes are properly configured and should work correctly at `http://localhost:5173/`!