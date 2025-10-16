# Deployment Quick Start Guide

Get your Railway deployment up and running in minutes!

## 🚀 Quick Setup (First Time)

### 1. Install Railway CLI

```bash
npm install -g @railway/cli
```

### 2. Run Setup Script

```bash
./setup-railway-dev.sh
```

This script will:
- ✅ Login to Railway
- ✅ Link to development database
- ✅ Create `.env.local` with database URL
- ✅ Install dependencies
- ✅ Generate Prisma client
- ✅ Run migrations
- ✅ Optionally seed database

### 3. Start Development

```bash
npm run dev
```

Visit: http://localhost:3001/api-docs

---

## 📋 Railway Services Setup

You need **2 services with 2 environments each**:

### Service 1: Database (`berse-database`)
```bash
# In Railway Dashboard:
# 1. New → Database → PostgreSQL
# 2. Name: berse-database
# 3. Add staging environment:
#    - Click environment dropdown → New Environment
#    - Name: staging
#    - Add PostgreSQL to staging
```

### Service 2: Backend (`berse-backend`)
```bash
# Create backend service:
# 1. New → GitHub Repo
# 2. Select: berse-app-backend repo
# 3. Name: berse-backend

# Configure production environment:
# 1. Switch to production environment
# 2. Settings → Source → Branch: main
# 3. Variables → Link DATABASE_URL from berse-database (production)
# 4. Add environment variables

# Configure staging environment:
# 1. Switch to staging environment
# 2. Settings → Source → Branch: staging
# 3. Variables → Link DATABASE_URL from berse-database (staging)
# 4. Add environment variables (different secrets!)
```

---

## 🌿 Creating Staging Branch

```bash
git checkout main
git pull origin main
git checkout -b staging
git push -u origin staging
```

---

## 🔄 Deployment Workflow

### Development → Staging
```bash
# 1. Make changes locally
git checkout develop  # or feature branch
# ... make changes ...

# 2. Create migration if needed
npm run prisma:migrate

# 3. Commit everything (including migrations!)
git add .
git commit -m "feat: your feature"

# 4. Merge to staging
git checkout staging
git merge develop
git push origin staging
# → Railway auto-deploys to staging!
```

### Staging → Production
```bash
# Via GitHub PR (recommended):
# 1. Create PR: staging → main
# 2. Review code
# 3. Merge PR
# → Railway auto-deploys to production!

# Or direct (not recommended):
git checkout main
git merge staging
git push origin main
```

---

## 🔐 Environment Variables Setup

### For Each Service (Production & Staging)

1. Go to service in Railway
2. Click "Variables" tab
3. Add these variables:

```bash
NODE_ENV=production  # or staging
DATABASE_URL=${{berse-database.DATABASE_URL}}  # Linked via reference
JWT_SECRET=<generate-64-char-random-string>
JWT_REFRESH_SECRET=<generate-64-char-random-string>
COOKIE_SECRET=<generate-32-char-random-string>
CORS_ORIGIN=https://berse.app,https://api.berse.app
FRONTEND_URL=https://berse.app
API_URL=https://api.berse.app
ENABLE_EMAIL_VERIFICATION=true
# ... add more from RAILWAY_DEPLOYMENT_GUIDE.md
```

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📊 Monitoring Deployments

### Via Railway Dashboard
1. Go to service
2. Click "Deployments"
3. Click active deployment
4. View logs in real-time

### Via CLI
```bash
# View production logs
railway link
# Select: berse-backend, production environment
railway logs

# View staging logs
railway link
# Select: berse-backend, staging environment
railway logs

# Run commands on Railway
railway run npm run prisma:studio
```

---

## 🗄️ Database Management

### View Data
```bash
# Open Prisma Studio connected to Railway
DATABASE_URL="<railway-url>" npm run prisma:studio
```

### Run Migrations Manually
```bash
# Link to backend service
railway link
# Select: berse-backend, desired environment (production or staging)

# Run migration
railway run npm run prisma:migrate:prod
```

### Seed Database
```bash
railway link
# Select: berse-backend, desired environment
railway run npm run prisma:seed
```

---

## ✅ Deployment Checklist

### Before First Deployment

- [ ] Create staging branch
- [ ] Create `berse-database` service with 2 environments
- [ ] Create `berse-backend` service with 2 environments
- [ ] Link databases to backend environments
- [ ] Set environment variables for both backend environments
- [ ] Configure GitHub integration (auto-deploy) for both environments
- [ ] Set up custom domains (optional)

### For Each Deployment

**To Staging:**
- [ ] Changes tested locally
- [ ] Migrations created and committed
- [ ] Code pushed to staging branch
- [ ] Wait for Railway deployment
- [ ] Check logs for errors
- [ ] Test on staging URL

**To Production:**
- [ ] Staging tested and verified
- [ ] PR created: staging → main
- [ ] Code reviewed
- [ ] PR merged
- [ ] Wait for Railway deployment
- [ ] Check logs for errors
- [ ] Smoke test production

---

## 🆘 Common Issues

### Build Fails
```bash
# Check TypeScript errors
npm run typecheck

# Test build locally
npm run build
```

### Migration Fails
```bash
# Manually run migration
railway link
# Select: berse-backend, desired environment
railway run npm run prisma:migrate:prod

# Check migration files are committed
git status prisma/migrations/
```

### Database Connection Error
```bash
# Verify DATABASE_URL is set in Railway
railway link
# Select: berse-backend, desired environment
railway variables

# Test connection
railway run npx prisma db push
```

---

## 📚 Full Documentation

- **Architecture Overview**: See `RAILWAY_ARCHITECTURE.md`
- **Complete Setup**: See `RAILWAY_DEPLOYMENT_GUIDE.md`
- **Production Setup**: See `PRODUCTION_SETUP.md`
- **API Reference**: See `docs/API_DOCS_QUICK_REF.md`
- **Development**: See `CLAUDE.md`

---

## 🎯 Quick Commands Reference

```bash
# Development
npm run dev                    # Start dev server
npm run typecheck              # Check types
npm run prisma:studio          # Open database GUI

# Railway CLI
railway login                  # Login
railway link                   # Link to service
railway logs                   # View logs
railway run <command>          # Run command on Railway
railway psql                   # Access database

# Database
npm run prisma:migrate         # Create & run migration (dev)
npm run prisma:generate        # Generate Prisma client
npm run prisma:seed            # Seed database

# Deployment
git push origin staging        # Deploy to staging
git push origin main           # Deploy to production
```

---

**Need Help?** See `RAILWAY_DEPLOYMENT_GUIDE.md` for detailed instructions!
