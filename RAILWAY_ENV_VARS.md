# Railway Environment Variables Required

## ⚠️ CRITICAL - Must be set for deployment to work:

```bash
# Server Configuration
PORT=8080

# Database (Usually auto-set by Railway PostgreSQL)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_HOST.railway.app:PORT/railway

# Authentication (REQUIRED - app won't start without these)
JWT_SECRET=your-secret-key-must-be-at-least-32-characters-long
JWT_REFRESH_SECRET=another-secret-key-must-be-at-least-32-chars
COOKIE_SECRET=cookie-secret-min-16-chars

# Environment
NODE_ENV=production

# CORS - Allow your frontend domains
CORS_ORIGIN=https://berse.app,https://www.berse.app,https://bersemuka.netlify.app

# Frontend URL for emails/redirects
FRONTEND_URL=https://berse.app
```

## 📝 Optional but Recommended:

```bash
# Redis (if using caching)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Email (if sending emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@berse.app

# File uploads
MAX_FILE_SIZE=10mb
UPLOAD_DIR=uploads

# API Keys (if using these features)
GOOGLE_MAPS_API_KEY=your-google-maps-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

## 🔧 How to Add in Railway:

1. Go to your Railway project
2. Click on the **BerseMuka** service
3. Go to **Variables** tab
4. Click **+ New Variable** or **Raw Editor**
5. Add each variable above
6. Railway will automatically redeploy

## 🚨 Common Issues:

1. **Missing JWT_SECRET**: App crashes immediately
2. **Wrong PORT**: Healthcheck fails (service unavailable)
3. **Missing DATABASE_URL**: App can't connect to database
4. **Wrong CORS_ORIGIN**: Frontend can't connect to API

## ✅ Quick Test:
After setting variables, check:
- https://api.berse.app/health should return `{"status":"OK"}`