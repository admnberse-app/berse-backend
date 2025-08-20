# Frontend Development Setup Guide

## Critical Configuration for Local Development

### ⚠️ IMPORTANT: Preventing Double `/api` Issues

The frontend uses Vite proxy to route API calls to the backend. To ensure this works correctly:

1. **DO NOT set VITE_API_URL in .env for local development**
   - The .env file should have this line commented out:
   ```
   # VITE_API_URL=http://localhost:3000  # Keep commented for local dev
   ```

2. **Vite Proxy Configuration (vite.config.ts)**
   - The proxy is already configured to forward `/api` requests to `localhost:3000`:
   ```typescript
   proxy: {
     '/api': {
       target: 'http://localhost:3000',
       changeOrigin: true,
       secure: false
     }
   }
   ```

3. **Auth Service URLs**
   - The auth service uses direct URLs to avoid configuration issues:
   - Localhost: `/api/v1/auth/login` (relative URL - Vite proxy handles it)
   - Production: `https://api.berse.app/api/v1/auth/login` (full URL)

## Running the Development Environment

### Backend (Port 3000)
```bash
npm run dev
```

### Frontend (Port 5173)
```bash
cd frontend
npm run dev
```

## Testing Login
1. Navigate to http://localhost:5173
2. Use your registered email and password
3. The login request should go to `/api/v1/auth/login` (NOT `/api/api/v1/auth/login`)

## Common Issues and Solutions

### Issue: Double `/api` in URLs
**Symptom:** Requests going to `/api/api/v1/auth/login`
**Solution:** 
1. Check that VITE_API_URL is NOT set in frontend/.env
2. Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)
3. Clear browser cache if needed

### Issue: CORS Errors on Production
**Symptom:** "blocked by CORS policy" errors on berse.app
**Solution:** Add CORS_ORIGIN environment variable to Railway:
```
CORS_ORIGIN=https://berse.app,https://www.berse.app,http://localhost:3000,http://localhost:5173
```

## Environment Variables

### Frontend (.env)
```env
NODE_ENV=development
VITE_NODE_ENV=development
# VITE_API_URL=http://localhost:3000  # KEEP COMMENTED for local dev
VITE_APP_URL=http://localhost:5173
```

### Backend (.env)
```env
PORT=3000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

## Code Quality Checklist

Before committing changes related to API configuration:

- [ ] Test login works on localhost:5173
- [ ] Verify API URLs don't have double `/api`
- [ ] Check VITE_API_URL is commented in frontend/.env
- [ ] Test that production build still works
- [ ] Document any API endpoint changes

## Architecture Notes

The app uses a unified configuration approach where:
- **Local development**: Uses Vite proxy with relative URLs
- **Production**: Uses full URLs to api.berse.app
- **Auth Service**: Has hardcoded URLs to avoid configuration complexity

This approach ensures consistent behavior and prevents configuration conflicts.