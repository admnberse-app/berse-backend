# Railway Deployment Guide

Complete guide for deploying Berse App backend to Railway with staging and production environments.

## Overview

Railway Architecture: **2 services with environments**

### Service 1: Database (`berse-database`)
- **Production Environment**: Production PostgreSQL database
- **Staging Environment**: Staging PostgreSQL database
- **Development**: Uses Railway staging database (no local PostgreSQL needed)

### Service 2: Backend (`berse-backend`)
- **Production Environment**: Auto-deploys from `main` branch
- **Staging Environment**: Auto-deploys from `staging` branch
- **Development**: Runs locally, connects to Railway database

Each environment has isolated database and configuration.

## Table of Contents

1. [Initial Railway Setup](#initial-railway-setup)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Deployment Configuration](#deployment-configuration)
5. [GitHub Integration](#github-integration)
6. [Migration Strategy](#migration-strategy)
7. [Monitoring & Logs](#monitoring--logs)
8. [Troubleshooting](#troubleshooting)

---

## Initial Railway Setup

### 1. Create Railway Account & Project

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `berse-app-backend` repository

### 2. Create Two Services with Environments

You'll need **2 services** with **2 environments each**:

#### Service 1: Database (`berse-database`)
- **Type**: PostgreSQL
- **Production Environment**: Production database
- **Staging Environment**: Staging database (used for both staging and local development)

#### Service 2: Backend (`berse-backend`)
- **Type**: Node.js application from GitHub
- **Production Environment**:
  - Deploys from `main` branch
  - Connects to `berse-database` production environment
- **Staging Environment**:
  - Deploys from `staging` branch
  - Connects to `berse-database` staging environment

---

## Environment Configuration

### Production Environment Variables

1. Go to `berse-backend` service
2. Switch to **production** environment
3. Go to Variables tab and add:

```bash
# Node Environment
NODE_ENV=production

# Server Configuration
PORT=3001
API_URL=https://api.berse.app

# Database (linked via reference variable)
DATABASE_URL=${{berse-database.DATABASE_URL}}

# JWT Secrets (generate secure random strings)
JWT_SECRET=<64-character-random-string>
JWT_REFRESH_SECRET=<64-character-random-string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=365d

# Security
COOKIE_SECRET=<32-character-random-string>
BCRYPT_ROUNDS=12

# CORS
CORS_ORIGIN=https://berse.app,https://api.berse.app

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@berse.app

# Frontend URL
FRONTEND_URL=https://berse.app
APP_URL=https://berse.app

# Feature Flags
ENABLE_EMAIL_VERIFICATION=true
ENABLE_REGISTRATION=true

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_LOGIN_MAX=3

# File Upload
MAX_FILE_SIZE=10mb
UPLOAD_DIR=uploads

# Redis (if using Railway Redis)
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}
```

### Staging Environment Variables

1. Stay in `berse-backend` service
2. Switch to **staging** environment
3. Go to Variables tab and add:

```bash
# Node Environment
NODE_ENV=staging

# Server Configuration
PORT=3001
API_URL=https://staging-api.berse.app

# Database (linked via reference variable)
DATABASE_URL=${{berse-database.DATABASE_URL}}

# JWT Secrets (use different secrets from production!)
JWT_SECRET=<different-64-character-random-string>
JWT_REFRESH_SECRET=<different-64-character-random-string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=365d

# Security
COOKIE_SECRET=<different-32-character-random-string>
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGIN=https://staging.berse.app,https://staging-api.berse.app

# Email Configuration (use test email or same as prod)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-staging-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=staging@berse.app

# Frontend URL
FRONTEND_URL=https://staging.berse.app
APP_URL=https://staging.berse.app

# Feature Flags
ENABLE_EMAIL_VERIFICATION=true
ENABLE_REGISTRATION=true

# Rate Limiting (more lenient for testing)
RATE_LIMIT_MAX_REQUESTS=500
RATE_LIMIT_WINDOW_MS=900000

# File Upload
MAX_FILE_SIZE=10mb
UPLOAD_DIR=uploads
```

### Development Environment Variables (.env)

Create `.env` file in your project root (already in .gitignore):

```bash
# Node Environment
NODE_ENV=development

# Server Configuration
PORT=3001
API_URL=http://localhost:3001

# Database (from Railway staging database - for local development)
# Get this from: berse-database service → staging environment → DATABASE_PUBLIC_URL
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:7432/railway

# JWT Secrets (development only)
JWT_SECRET=dev-secret-key-minimum-32-characters-long
JWT_REFRESH_SECRET=dev-refresh-secret-key-minimum-32-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
COOKIE_SECRET=dev-cookie-secret
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Email Configuration (use Mailtrap or similar for dev)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-pass
FROM_EMAIL=dev@berse.app

# Frontend URL
FRONTEND_URL=http://localhost:5173
APP_URL=http://localhost:5173

# Feature Flags
ENABLE_EMAIL_VERIFICATION=false
ENABLE_REGISTRATION=true
ENABLE_DEBUG_LOGS=true

# File Upload
MAX_FILE_SIZE=10mb
UPLOAD_DIR=uploads
```

---

## Database Setup

### 1. Create Database Service with Environments

#### Create the Database Service:
1. In your Railway project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Name it: `berse-database`
4. Railway creates production environment by default

#### Add Staging Environment:
1. Click on `berse-database` service
2. Click environment dropdown (top left)
3. Click "+ New Environment"
4. Name it: `staging`
5. Add PostgreSQL to this environment:
   - Click "New" → "Database" → "Add PostgreSQL"

#### For Development:
1. Use the **staging environment** database for local development
2. In `berse-database` service → staging environment
3. Copy the `DATABASE_PUBLIC_URL` (for external connections)
4. Use this URL in your local `.env` file

### 2. Link Database to Backend Service

#### Link Production:
1. Go to `berse-backend` service
2. Switch to **production** environment
3. Click "Variables" tab
4. Click "New Variable" → "Add Reference"
5. Select: `berse-database.DATABASE_URL` (from production environment)
6. Save as: `DATABASE_URL`

#### Link Staging:
1. Stay in `berse-backend` service
2. Switch to **staging** environment
3. Click "Variables" tab
4. Click "New Variable" → "Add Reference"
5. Select: `berse-database.DATABASE_URL` (from staging environment)
6. Save as: `DATABASE_URL`

**Result:** Each backend environment automatically connects to its corresponding database environment.

---

## Deployment Configuration

### 1. Update package.json Scripts

Your current scripts are good, but let's add environment-specific ones:

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "rimraf dist && tsc && npm run copy-files",
    "build:backend": "rimraf dist && tsc && npm run copy-files",
    "start": "node dist/server.js",
    "start:prod": "cross-env NODE_ENV=production node dist/server.js",

    "railway:build": "npm run build && cd frontend && npm install && npm run build",
    "railway:start": "npm run prisma:migrate:prod && npm run start:prod",

    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:migrate:prod": "prisma migrate deploy",
    "prisma:migrate:staging": "prisma migrate deploy",
    "prisma:studio": "prisma studio",
    "prisma:seed": "ts-node prisma/seed.ts",

    "copy-files": "copyfiles -u 1 src/**/*.json dist/"
  }
}
```

### 2. Create railway.json (Optional but Recommended)

Create `railway.json` in project root:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run railway:build"
  },
  "deploy": {
    "startCommand": "npm run railway:start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 3. Create Nixpacks Configuration

Create `nixpacks.toml` in project root:

```toml
[phases.setup]
nixPkgs = ['nodejs-18_x', 'openssl']

[phases.install]
cmds = ['npm ci']

[phases.build]
cmds = ['npm run railway:build']

[start]
cmd = 'npm run railway:start'
```

### 4. Update .gitignore

Make sure these are in `.gitignore`:

```gitignore
# Environment files
.env
.env.local
.env.development
.env.staging
.env.production

# Build outputs
dist/
build/
frontend/dist/
frontend/build/

# Dependencies
node_modules/
frontend/node_modules/

# Database
*.db
*.sqlite

# Logs
logs/
*.log

# Uploads
uploads/*
!uploads/.gitkeep

# OS
.DS_Store
Thumbs.db
```

---

## GitHub Integration

### 1. Create Staging Branch

```bash
# Create staging branch from main
git checkout main
git pull origin main
git checkout -b staging
git push -u origin staging
```

### 2. Configure Railway GitHub Integration

#### For Production Environment:
1. Go to `berse-backend` service
2. Switch to **production** environment
3. Go to Settings → Source
4. Configure:
   - **Branch**: `main`
   - **Auto Deploy**: ✅ Enabled
   - **Deploy on PR**: ❌ Disabled
5. Click "Save"

#### For Staging Environment:
1. Stay in `berse-backend` service
2. Switch to **staging** environment
3. Go to Settings → Source
4. Configure:
   - **Branch**: `staging`
   - **Auto Deploy**: ✅ Enabled
   - **Deploy on PR**: ✅ Enabled (optional, for PR previews)
5. Click "Save"

### 3. Branch Protection Rules (Recommended)

On GitHub:

#### For `main` branch:
1. Go to Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators
4. Save changes

#### For `staging` branch:
1. Same process, but with pattern: `staging`
2. Less restrictive: can allow direct pushes for testing

---

## Migration Strategy

### Development Workflow

When developing locally with Railway dev database:

```bash
# 1. Make schema changes in prisma/schema.prisma
# 2. Create migration
npm run prisma:migrate

# This will:
# - Create migration files
# - Apply to development database on Railway
# - Regenerate Prisma Client

# 3. Commit migration files
git add prisma/migrations/
git commit -m "feat: add new schema changes"
```

### Deploying to Staging

```bash
# 1. Push to staging branch
git checkout staging
git merge develop  # or cherry-pick specific commits
git push origin staging

# Railway will automatically:
# - Build the application
# - Run: npm run railway:start
#   - Which runs: npm run prisma:migrate:prod
#   - Then runs: npm run start:prod
# - Migrations are applied automatically
# - Server starts
```

### Deploying to Production

```bash
# 1. Merge staging to main (via PR)
git checkout main
git merge staging
git push origin main

# Railway will automatically:
# - Build and deploy
# - Run migrations
# - Start production server
```

### Manual Migration Management

If you need to run migrations manually:

```bash
# For staging
railway login
railway link
# Select: berse-backend service, staging environment
railway run npm run prisma:migrate:prod

# For production
railway link
# Select: berse-backend service, production environment
railway run npm run prisma:migrate:prod
```

### Database Seeding

For initial data (badges, rewards, etc.):

```bash
# Development (local)
npm run prisma:seed

# Staging (first time setup)
railway link
# Select: berse-backend service, staging environment
railway run npm run prisma:seed

# Production (first time setup)
railway link
# Select: berse-backend service, production environment
railway run npm run prisma:seed
```

---

## Monitoring & Logs

### View Logs

#### Via Railway Dashboard:
1. Go to your service
2. Click "Deployments"
3. Click on active deployment
4. Click "View Logs"

#### Via Railway CLI:
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# View production logs
railway link
# Select: berse-backend service, production environment
railway logs

# View staging logs
railway link
# Select: berse-backend service, staging environment
railway logs
```

### Health Checks

Railway automatically monitors:
- `/health` endpoint
- Server uptime
- Deployment status

You can also add custom health checks:

```bash
# Check production
curl https://api.berse.app/health

# Check staging
curl https://staging-api.berse.app/health
```

### Database Access

#### Via Railway Dashboard:
1. Go to `berse-database` service
2. Switch to desired environment (production or staging)
3. Click "Data" tab
4. Browse tables directly

#### Via Railway CLI:
```bash
# Access production database
railway link
# Select: berse-database service, production environment
railway psql  # Opens PostgreSQL shell

# Access staging database
railway link
# Select: berse-database service, staging environment
railway psql
```

#### Via Prisma Studio:
```bash
# For development (using staging database)
npm run prisma:studio

# For production database
railway link
# Select: berse-database service, production environment
railway variables  # Copy DATABASE_URL
DATABASE_URL="<copied-url>" npm run prisma:studio
```

---

## Custom Domains

### Production Setup

1. Go to `berse-backend` service
2. Switch to **production** environment
3. Go to Settings → Domains
4. Click "Generate Domain" (Railway creates default)
5. Click "Custom Domain"
6. Enter: `api.berse.app`
7. Add CNAME record in your DNS provider:
   ```
   Type: CNAME
   Name: api
   Target: <railway-generated-url>.railway.app
   ```

### Staging Setup

1. Stay in `berse-backend` service
2. Switch to **staging** environment
3. Go to Settings → Domains
4. Click "Generate Domain"
5. Click "Custom Domain"
6. Enter: `staging-api.berse.app`
7. Configure DNS:
   ```
   Type: CNAME
   Name: staging-api
   Target: <railway-generated-url>.railway.app
   ```

---

## Troubleshooting

### Build Failures

**Issue**: Build fails during `npm run build`

**Solutions**:
1. Check build logs in Railway dashboard
2. Verify all TypeScript errors are fixed:
   ```bash
   npm run typecheck
   ```
3. Test build locally:
   ```bash
   npm run build
   ```

### Migration Failures

**Issue**: Migrations fail on deployment

**Solutions**:
1. Check migration files are committed:
   ```bash
   git status prisma/migrations/
   ```
2. Manually run migration:
   ```bash
   railway run npm run prisma:migrate:prod
   ```
3. Reset database (CAUTION: data loss):
   ```bash
   railway run npx prisma migrate reset
   ```

### Database Connection Issues

**Issue**: `Can't reach database server`

**Solutions**:
1. Verify `DATABASE_URL` is set correctly in Railway variables
2. Check database service is running
3. Test connection locally:
   ```bash
   DATABASE_URL="<railway-url>" npx prisma db push
   ```

### Environment Variables Not Loading

**Issue**: App can't find environment variables

**Solutions**:
1. Check variables are set in Railway dashboard
2. Restart deployment:
   - Click "Redeploy" in Railway
3. Verify variable names match exactly (case-sensitive)

### CORS Errors

**Issue**: Frontend can't connect to backend

**Solutions**:
1. Check `CORS_ORIGIN` includes frontend URL
2. Update in Railway variables:
   ```
   CORS_ORIGIN=https://berse.app,https://staging.berse.app
   ```
3. Redeploy service

---

## Step-by-Step Setup Checklist

### Initial Setup (One-time)

- [ ] Create Railway account and project
- [ ] Create `berse-database` service
- [ ] Add production environment to database (default)
- [ ] Add staging environment to database
- [ ] Add PostgreSQL to both database environments
- [ ] Create `berse-backend` service from GitHub
- [ ] Link database to backend (production & staging)
- [ ] Configure environment variables for both backend environments
- [ ] Set up GitHub auto-deployment for both environments
- [ ] Configure custom domains for both environments
- [ ] Create `staging` branch in Git
- [ ] Push both `main` and `staging` branches to GitHub

### For Each Deployment

**Development:**
- [ ] Make changes locally
- [ ] Run migrations: `npm run prisma:migrate`
- [ ] Test locally: `npm run dev`
- [ ] Commit changes including migration files
- [ ] Push to `staging` branch

**Staging:**
- [ ] Verify deployment on `staging-api.berse.app`
- [ ] Check logs for errors
- [ ] Test all features
- [ ] Run smoke tests

**Production:**
- [ ] Create PR from `staging` to `main`
- [ ] Get code review
- [ ] Merge PR
- [ ] Verify deployment on `api.berse.app`
- [ ] Monitor logs
- [ ] Test critical paths

---

## Useful Railway Commands

```bash
# Install CLI
npm i -g @railway/cli

# Login
railway login

# Link to service
railway link

# View logs
railway logs

# Run commands
railway run <command>

# Open shell
railway shell

# Access database
railway psql

# List services
railway list

# Deploy manually
railway up
```

---

## Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Railway PostgreSQL Guide](https://docs.railway.app/databases/postgresql)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)

---

## Quick Reference

### Development Database Connection

```bash
# Get staging database URL from Railway (used for local development)
railway link
# Select: berse-database service, staging environment
railway variables

# Copy DATABASE_PUBLIC_URL and add to .env
DATABASE_URL=<copied-url>

# Test connection
npx prisma db push
```

### Deploy to Staging

```bash
git checkout staging
git merge develop
git push origin staging
# Railway auto-deploys
```

### Deploy to Production

```bash
# Via PR (recommended)
# Create PR: staging → main
# Merge after review
# Railway auto-deploys

# Or direct (not recommended)
git checkout main
git merge staging
git push origin main
```

### Rollback Deployment

In Railway dashboard:
1. Go to Deployments
2. Find previous successful deployment
3. Click "..." → "Redeploy"

---

**Last Updated**: 2025-01-16
**Maintained By**: Berse Development Team
