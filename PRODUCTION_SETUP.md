# Production Environment Setup Guide

Complete guide for setting up your production environment on Railway.

## Overview

Railway Architecture: **2 services with 2 environments each**

### Service 1: Database (`berse-database`)
- **Production Environment**: Production PostgreSQL database
- **Staging Environment**: Staging PostgreSQL database

### Service 2: Backend (`berse-backend`)
- **Production Environment**: Deploys from `main` branch
- **Staging Environment**: Deploys from `staging` branch

Each environment has its own isolated database and configuration.

---

## Step 1: Create Staging Branch

First, create a staging branch if you haven't already:

```bash
git checkout main
git pull origin main
git checkout -b staging
git push -u origin staging
```

---

## Step 2: Create Railway Project & Services

### A. Create New Project (if not exists)

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Empty Project"
4. Name it: `berse-app`

### B. Create Database Service with 2 Environments

1. In your project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Name it: `berse-database`
4. This creates the database service
5. Railway automatically creates these environments:
   - **production** - Production database
   - **staging** - Staging database (you may need to add this manually)

**To add staging environment to database:**
1. Click on `berse-database` service
2. Click on environment dropdown (top left)
3. Click "+ New Environment"
4. Name it: `staging`
5. Add PostgreSQL to staging environment

### C. Create Backend Service with 2 Environments

1. Click "New" in your project
2. Select "GitHub Repo"
3. Choose `berse-app-backend` repository
4. Name it: `berse-backend`
5. Railway creates the service with environments

**Configure environments:**

**Production Environment:**
1. Switch to `production` environment
2. Go to Settings → Source
3. Set **Branch**: `main`
4. Enable **Auto Deploy**: ✅

**Staging Environment:**
1. Switch to `staging` environment
2. Go to Settings → Source
3. Set **Branch**: `staging`
4. Enable **Auto Deploy**: ✅

---

## Step 3: Link Database to Backend

### Link Production Database:

1. Go to `berse-backend` service
2. Switch to **production** environment
3. Click "Variables" tab
4. Click "New Variable" → "Add Reference"
5. Select: `berse-database` (production) → `DATABASE_URL`
6. This creates: `DATABASE_URL=${{berse-database.DATABASE_URL}}`

### Link Staging Database:

1. Switch to **staging** environment in `berse-backend`
2. Click "Variables" tab
3. Click "New Variable" → "Add Reference"
4. Select: `berse-database` (staging) → `DATABASE_URL`
5. This creates: `DATABASE_URL=${{berse-database.DATABASE_URL}}`

**Important**: Each environment automatically connects to its corresponding database environment!

---

## Step 4: Configure Environment Variables

### Production Environment Variables

1. Go to `berse-backend` service
2. Switch to **production** environment
3. Click "Variables" tab
4. Add the following variables:

```bash
# ============================================================================
# PRODUCTION ENVIRONMENT VARIABLES
# ============================================================================

# Node Environment
NODE_ENV=production

# Server Configuration
PORT=3001
API_URL=https://api.berse.app

# Database (Auto-linked via reference variable)
# DATABASE_URL=${{berse-database.DATABASE_URL}} - Already set in Step 3

# JWT Secrets - GENERATE NEW ONES FOR PRODUCTION!
# Run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=<paste-generated-64-char-secret-here>
JWT_REFRESH_SECRET=<paste-different-64-char-secret-here>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=365d

# Security - GENERATE NEW SECRET!
# Run: node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
COOKIE_SECRET=<paste-generated-32-char-secret-here>
BCRYPT_ROUNDS=12

# CORS - Update with your actual production domains
CORS_ORIGIN=https://berse.app,https://api.berse.app

# Frontend URLs
FRONTEND_URL=https://berse.app
APP_URL=https://berse.app

# Email Configuration - Production SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=admn.berse@gmail.com
SMTP_PASS=<your-gmail-app-password>
FROM_EMAIL=noreply@berse.app

# Feature Flags
ENABLE_EMAIL_VERIFICATION=true
ENABLE_REGISTRATION=true
ENABLE_DEBUG_LOGS=false

# File Upload
MAX_FILE_SIZE=10mb
UPLOAD_DIR=uploads

# Rate Limiting - Production settings
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_LOGIN_MAX=3

# Security
SESSION_TIMEOUT_MINUTES=60
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCKOUT_MINUTES=30
```

### Staging Environment Variables

1. Stay in `berse-backend` service
2. Switch to **staging** environment
3. Click "Variables" tab
4. Add the following (similar to production but with different values):

```bash
# ============================================================================
# STAGING ENVIRONMENT VARIABLES
# ============================================================================

# Node Environment
NODE_ENV=staging

# Server Configuration
PORT=3001
API_URL=https://staging-api.berse.app

# Database (Auto-linked via reference variable)
# DATABASE_URL=${{berse-database.DATABASE_URL}} - Already set in Step 3

# JWT Secrets - DIFFERENT FROM PRODUCTION!
# Run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=<paste-different-secret-from-production>
JWT_REFRESH_SECRET=<paste-different-secret-from-production>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=365d

# Security - DIFFERENT FROM PRODUCTION!
COOKIE_SECRET=<paste-different-secret-from-production>
BCRYPT_ROUNDS=10

# CORS - Staging domains
CORS_ORIGIN=https://staging.berse.app,https://staging-api.berse.app

# Frontend URLs
FRONTEND_URL=https://staging.berse.app
APP_URL=https://staging.berse.app

# Email Configuration - Can use same or test email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=admn.berse@gmail.com
SMTP_PASS=<your-gmail-app-password>
FROM_EMAIL=staging@berse.app

# Feature Flags
ENABLE_EMAIL_VERIFICATION=true
ENABLE_REGISTRATION=true
ENABLE_DEBUG_LOGS=true

# File Upload
MAX_FILE_SIZE=10mb
UPLOAD_DIR=uploads

# Rate Limiting - More lenient for testing
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=500
RATE_LIMIT_AUTH_MAX=20
RATE_LIMIT_LOGIN_MAX=10
```

---

## Step 5: Generate Secrets

Run these commands to generate secure secrets:

```bash
# JWT_SECRET (64 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# JWT_REFRESH_SECRET (64 characters) - MUST BE DIFFERENT
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# COOKIE_SECRET (32 characters)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

**IMPORTANT**:
- Generate **different secrets** for production and staging
- **Never** use development secrets in production
- **Never** use the same secrets across environments

---

## Step 6: Configure Auto-Deployment

Auto-deployment is configured per environment in the backend service.

### Configure Production Environment:

1. Go to `berse-backend` service
2. Switch to **production** environment
3. Go to Settings → Source
4. Configure:
   - **Branch**: `main`
   - **Auto Deploy**: ✅ Enabled
   - **Deploy on PR**: ❌ Disabled
5. Click "Save"

### Configure Staging Environment:

1. Stay in `berse-backend` service
2. Switch to **staging** environment
3. Go to Settings → Source
4. Configure:
   - **Branch**: `staging`
   - **Auto Deploy**: ✅ Enabled
   - **Deploy on PR**: ✅ Enabled (optional, for PR previews)
5. Click "Save"

---

## Step 7: Run Initial Database Migrations

Migrations run automatically on deployment via `railway:start` script, but you can also run them manually.

### For Production:

```bash
# Link to backend service production environment
railway link
# Select:
#   - Service: berse-backend
#   - Environment: production

# Run migrations
railway run npm run prisma:migrate:prod

# Seed database (optional, for initial badges/rewards)
railway run npm run prisma:seed
```

### For Staging:

```bash
# Link to backend service staging environment
railway link
# Select:
#   - Service: berse-backend
#   - Environment: staging

# Run migrations
railway run npm run prisma:migrate:prod

# Seed database
railway run npm run prisma:seed
```

---

## Step 8: Configure Custom Domains

Custom domains are configured per environment in the backend service.

### Production Domains:

1. Go to `berse-backend` service
2. Switch to **production** environment
3. Go to Settings → Domains
4. Click "Generate Domain" (Railway provides a default)
5. Click "Custom Domain" to add your own:
   - Add: `api.berse.app`
6. Railway will provide a CNAME target
7. In your DNS provider (e.g., Cloudflare, Namecheap):
   ```
   Type: CNAME
   Name: api
   Target: <railway-provided-url>.railway.app
   ```

### Staging Domains:

1. Stay in `berse-backend` service
2. Switch to **staging** environment
3. Go to Settings → Domains
4. Click "Generate Domain" (Railway provides a default)
5. Click "Custom Domain" to add:
   - Add: `staging-api.berse.app`
6. Configure DNS similarly:
   ```
   Type: CNAME
   Name: staging-api
   Target: <railway-provided-url>.railway.app
   ```

---

## Step 9: Verify Deployment

### Check Production:

```bash
# Health check
curl https://api.berse.app/health

# API documentation
# Visit: https://api.berse.app/api-docs
```

### Check Staging:

```bash
# Health check
curl https://staging-api.berse.app/health

# API documentation
# Visit: https://staging-api.berse.app/api-docs
```

---

## Step 10: Monitor Deployments

### View Logs via CLI:

```bash
# Production logs
railway link
# Select: berse-backend, production environment
railway logs

# Staging logs
railway link
# Select: berse-backend, staging environment
railway logs
```

### View Logs via Dashboard:

1. Go to `berse-backend` service
2. Switch to desired environment (production or staging)
3. Click "Deployments" tab
4. Click on active deployment
5. View real-time logs

### Switch Between Environments:

In Railway dashboard, use the environment dropdown (top left) to switch between:
- **production** - View production deployments and logs
- **staging** - View staging deployments and logs

---

## Deployment Workflow

Now that everything is set up:

### Deploy to Staging:

```bash
git checkout staging
git merge develop  # or your feature branch
git push origin staging
# → Railway automatically deploys to berse-backend (staging environment)
```

### Deploy to Production:

```bash
# Method 1: Via Pull Request (Recommended)
# 1. Create PR: staging → main on GitHub
# 2. Review code
# 3. Merge PR
# → Railway automatically deploys to berse-backend (production environment)

# Method 2: Direct push (Not recommended)
git checkout main
git merge staging
git push origin main
# → Railway automatically deploys to berse-backend (production environment)
```

---

## Database Management

### Access Database via CLI:

```bash
# For production database
railway link
# Select: berse-database, production environment
railway psql

# For staging database
railway link
# Select: berse-database, staging environment
railway psql
```

### View Data with Prisma Studio:

```bash
# Production database
railway link
# Select: berse-database, production environment
railway variables  # Copy DATABASE_URL
DATABASE_URL="<copied-url>" npm run prisma:studio

# Staging database
railway link
# Select: berse-database, staging environment
railway variables  # Copy DATABASE_URL
DATABASE_URL="<copied-url>" npm run prisma:studio
```

### Run Migrations:

```bash
# Automatic (on deployment)
# Migrations run automatically via railway:start script in berse-backend service

# Manual - Production
railway link
# Select: berse-backend, production environment
railway run npm run prisma:migrate:prod

# Manual - Staging
railway link
# Select: berse-backend, staging environment
railway run npm run prisma:migrate:prod
```

---

## Security Checklist

- [ ] Different JWT secrets for production, staging, and development
- [ ] Different cookie secrets for each environment
- [ ] CORS_ORIGIN set to actual production domains only
- [ ] EMAIL_VERIFICATION enabled in production
- [ ] DEBUG_LOGS disabled in production
- [ ] Rate limiting enabled and properly configured
- [ ] BCRYPT_ROUNDS set to 12 in production
- [ ] Gmail app password (not regular password) for SMTP
- [ ] All secrets stored in Railway variables (not in code)
- [ ] `.env` files added to `.gitignore`

---

## Troubleshooting

### Deployment Fails

**Check build logs:**
1. Go to service → Deployments
2. Click failed deployment
3. View logs

**Common issues:**
- TypeScript errors: Run `npm run typecheck` locally
- Missing environment variables: Check Variables tab
- Migration errors: Check migration files are committed

### Database Connection Issues

**Check DATABASE_URL:**
```bash
railway link  # Select service
railway variables
```

**Test connection:**
```bash
railway run npx prisma db push
```

### Migration Failures

**View migration status:**
```bash
railway run npx prisma migrate status
```

**Force migration:**
```bash
railway run npx prisma migrate deploy
```

**Reset database (CAUTION: Deletes all data):**
```bash
railway run npx prisma migrate reset
```

---

## Environment Variables Reference

### Required for All Environments:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment name | `production`, `staging` |
| `DATABASE_URL` | PostgreSQL connection | Auto-filled by Railway |
| `JWT_SECRET` | Access token secret | 64-char random string |
| `JWT_REFRESH_SECRET` | Refresh token secret | 64-char random string |
| `COOKIE_SECRET` | Cookie signing secret | 32-char random string |
| `CORS_ORIGIN` | Allowed origins | Comma-separated URLs |
| `FRONTEND_URL` | Frontend URL | `https://berse.app` |
| `API_URL` | API URL | `https://api.berse.app` |

### Optional but Recommended:

| Variable | Description | Default |
|----------|-------------|---------|
| `ENABLE_EMAIL_VERIFICATION` | Email verification | `false` |
| `SMTP_*` | Email configuration | Required if email enabled |
| `RATE_LIMIT_*` | Rate limiting settings | See defaults in config |
| `REDIS_*` | Redis configuration | Optional for caching |

---

## Maintenance

### Update Dependencies:

```bash
# Update Prisma
npm install -D prisma@latest
npm install @prisma/client@latest

# Regenerate client
npm run prisma:generate

# Test locally, then deploy
git push origin staging
```

### Backup Database:

```bash
# Via Railway CLI
railway link  # Select service
railway psql -c "\dt"  # List tables

# Via pg_dump (if configured)
pg_dump $DATABASE_URL > backup.sql
```

### Monitor Health:

Set up monitoring for:
- `/health` endpoint
- Error rates in logs
- Database connection pool
- Response times

---

## Next Steps

1. ✅ Database service created with production & staging environments
2. ✅ Backend service created with production & staging environments
3. ✅ Databases linked to backend environments
4. ✅ Environment variables configured for both environments
5. ✅ Auto-deployment enabled for both environments
6. ✅ Migrations run on both databases
7. ✅ Custom domains configured for both environments
8. ✅ Deployments verified

Your production environment is ready! 🚀

**Railway Architecture Summary:**
- **Service 1**: `berse-database` (PostgreSQL)
  - Production environment → Production database
  - Staging environment → Staging database
- **Service 2**: `berse-backend` (Node.js app)
  - Production environment → Deploys from `main` branch
  - Staging environment → Deploys from `staging` branch

**Start deploying:**
```bash
git push origin staging  # Deploy to staging
# Test on staging
# Create PR to main
# Merge PR → deploys to production
```

---

## Support Resources

- [Railway Documentation](https://docs.railway.app)
- [Prisma Deploy Guide](https://www.prisma.io/docs/guides/deployment)
- Internal Docs: `RAILWAY_DEPLOYMENT_GUIDE.md`
- Quick Reference: `DEPLOYMENT_QUICKSTART.md`
