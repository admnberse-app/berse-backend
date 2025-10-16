# Railway Architecture

## Service Structure

Your Railway setup uses **2 services** with **2 environments each**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Railway Project: berse-app                │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────┐    ┌──────────────────────────┐
│   Service 1: Database    │    │   Service 2: Backend     │
│   berse-database         │    │   berse-backend          │
└──────────────────────────┘    └──────────────────────────┘
         │                               │
         ├─ production environment       ├─ production environment
         │  • PostgreSQL database        │  • Deploys from `main` branch
         │                               │  • Links to production DB
         │                               │  • Domain: api.berse.app
         │                               │
         └─ staging environment          └─ staging environment
            • PostgreSQL database           • Deploys from `staging` branch
            • Used for staging & dev        • Links to staging DB
                                            • Domain: staging-api.berse.app
```

---

## Environment Details

### Service 1: `berse-database` (PostgreSQL)

#### Production Environment
- **Purpose**: Production database
- **Used by**: `berse-backend` production environment
- **Access**: Internal Railway private network

#### Staging Environment
- **Purpose**: Staging & development database
- **Used by**:
  - `berse-backend` staging environment
  - Local development (via `DATABASE_PUBLIC_URL`)
- **Access**: Internal Railway network + external access for development

---

### Service 2: `berse-backend` (Node.js)

#### Production Environment
- **Branch**: `main`
- **Auto-deploy**: Enabled (deploys on push to `main`)
- **Database**: Links to `berse-database` production environment
- **Domain**: `api.berse.app`
- **Environment Variables**:
  - `NODE_ENV=production`
  - `DATABASE_URL=${{berse-database.DATABASE_URL}}` (auto-linked)
  - JWT secrets, CORS, SMTP, etc.

#### Staging Environment
- **Branch**: `staging`
- **Auto-deploy**: Enabled (deploys on push to `staging`)
- **Database**: Links to `berse-database` staging environment
- **Domain**: `staging-api.berse.app`
- **Environment Variables**:
  - `NODE_ENV=staging`
  - `DATABASE_URL=${{berse-database.DATABASE_URL}}` (auto-linked)
  - Different JWT secrets from production
  - More lenient rate limits for testing

---

## Development Workflow

### Local Development
1. Connect to Railway staging database
2. Get `DATABASE_PUBLIC_URL` from `berse-database` → staging environment
3. Add to `.env` file
4. Run `npm run dev` locally
5. Database is shared with staging environment

### Staging Deployment
1. Make changes on feature branch
2. Merge to `staging` branch
3. Push to GitHub: `git push origin staging`
4. Railway automatically:
   - Builds application
   - Runs migrations (`npm run prisma:migrate:prod`)
   - Deploys to staging environment
5. Test at: `https://staging-api.berse.app`

### Production Deployment
1. Test thoroughly on staging
2. Create PR: `staging` → `main`
3. Review and merge PR
4. Railway automatically:
   - Builds application
   - Runs migrations
   - Deploys to production environment
5. Live at: `https://api.berse.app`

---

## Database Linking

Railway uses **reference variables** to link services:

```bash
# In berse-backend (production environment):
DATABASE_URL=${{berse-database.DATABASE_URL}}
# ↓
# Resolves to production database connection string

# In berse-backend (staging environment):
DATABASE_URL=${{berse-database.DATABASE_URL}}
# ↓
# Resolves to staging database connection string
```

The same variable name (`DATABASE_URL`) automatically resolves to the correct database based on the environment!

---

## Environment Switching

In Railway Dashboard:

1. Click on a service (`berse-database` or `berse-backend`)
2. Use the **environment dropdown** (top left) to switch between:
   - **production** - View/manage production environment
   - **staging** - View/manage staging environment

Each environment has:
- Its own deployments
- Its own variables
- Its own logs
- Its own metrics

---

## Key Benefits

### Clean Separation
- ✅ Production and staging are completely isolated
- ✅ Each environment has its own database
- ✅ Different secrets for each environment
- ✅ No cross-contamination

### Easy Management
- ✅ Switch between environments with one click
- ✅ Environment variables managed per environment
- ✅ Separate logs and metrics
- ✅ Branch-based deployment (no manual intervention)

### Cost Effective
- ✅ Only 2 services to manage (not 3 or 4)
- ✅ Environments share service infrastructure
- ✅ No separate dev database service needed
- ✅ Staging database doubles as dev database

### Development Friendly
- ✅ Local development connects to Railway staging database
- ✅ No local PostgreSQL installation needed
- ✅ Staging and dev share same database (safe testing)
- ✅ Easy to reset/seed staging database

---

## Quick Commands

### Link to Production Backend
```bash
railway link
# Select: berse-backend, production
railway logs
railway run npm run prisma:migrate:prod
```

### Link to Staging Backend
```bash
railway link
# Select: berse-backend, staging
railway logs
railway run npm run prisma:migrate:prod
```

### Link to Production Database
```bash
railway link
# Select: berse-database, production
railway psql
```

### Link to Staging Database
```bash
railway link
# Select: berse-database, staging
railway psql
```

---

## File References

- **Complete Setup Guide**: `PRODUCTION_SETUP.md`
- **Detailed Deployment Guide**: `RAILWAY_DEPLOYMENT_GUIDE.md`
- **Quick Reference**: `DEPLOYMENT_QUICKSTART.md`
- **Manual Setup**: `MANUAL_SETUP.md`
- **Architecture Overview**: This file (`RAILWAY_ARCHITECTURE.md`)
