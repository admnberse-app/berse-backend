# Deployment Configuration

## Production URLs

- **Frontend (Netlify)**: https://berse.app
- **Backend API (Railway)**: https://api.berse.app
- **Health Check Endpoint**: https://api.berse.app/health

## Deployment Platforms

### Frontend - Netlify
- **Primary Domain**: https://berse.app
- **Netlify Domain**: https://bersemuka.netlify.app (redirects to berse.app)
- **Auto-Deploy**: Enabled from `main` branch
- **Build Command**: `npm run build`
- **Publish Directory**: `frontend/dist`
- **Environment Variables**: Set in Netlify dashboard

### Backend - Railway
- **Domain**: https://api.berse.app
- **Platform**: Railway.app
- **Auto-Deploy**: Enabled from `main` branch
- **Start Command**: `npm start`
- **Build Command**: `npm run build`
- **Database**: PostgreSQL on Railway
- **Environment Variables**: Set in Railway dashboard

## Deployment Flow

1. **Development**: Work on feature branches
2. **Testing**: Test locally with `npm run dev`
3. **Merge to Main**: Create PR and merge to main branch
4. **CI/CD**: GitHub Actions runs tests and build checks
5. **Auto-Deploy**: 
   - Railway automatically deploys backend to api.berse.app
   - Netlify automatically deploys frontend to berse.app

## Environment Variables

### Frontend (Netlify)
```env
VITE_API_URL=https://api.berse.app
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_API_KEY=your-google-api-key
```

### Backend (Railway)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret
COOKIE_SECRET=your-cookie-secret
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://berse.app
```

## Monitoring

- **Backend Health**: https://api.berse.app/health
- **Frontend Status**: Check Netlify dashboard
- **Backend Logs**: View in Railway dashboard
- **Error Tracking**: Check browser console and Railway logs

## Rollback Procedure

### Netlify (Frontend)
1. Go to Netlify dashboard
2. Navigate to Deploys
3. Find previous successful deploy
4. Click "Publish deploy"

### Railway (Backend)
1. Go to Railway dashboard
2. Navigate to Deployments
3. Find previous successful deployment
4. Click "Redeploy"

## Local Testing with Production Config

```bash
# Test with production API locally
cd frontend
VITE_API_URL=https://api.berse.app npm run dev

# Test backend with production database (be careful!)
DATABASE_URL=your-production-url npm run dev
```

## Important Notes

- **Never commit** `.env` files with real credentials
- **Always test** on localhost before deploying
- **Monitor** error logs after deployment
- **Main branch** = Production (be careful with direct commits)
- **CORS** is configured for berse.app and www.berse.app

Last Updated: August 18, 2025