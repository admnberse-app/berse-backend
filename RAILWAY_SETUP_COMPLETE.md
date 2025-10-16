# Railway Setup - Complete ✅

Setup completed on: $(date +%Y-%m-%d)

## 🎯 Architecture Summary

You now have **Approach A** fully implemented:

```
Project: berse-app
├── Service 1: berse-database (PostgreSQL)
│   ├── production environment
│   │   └── PostgreSQL (fresh database for production)
│   └── staging environment
│       └── PostgreSQL (94 tables with your existing data)
│
└── Service 2: berse-backend (Node.js from GitHub)
    ├── production environment
    │   ├── Branch: main
    │   ├── Auto-deploy: ✅ Enabled
    │   ├── Database: linked to production database
    │   └── Variables: All configured
    └── staging environment
        ├── Branch: staging
        ├── Auto-deploy: ✅ Enabled
        ├── Database: linked to staging database
        └── Variables: All configured
```

---

## ✅ Completed Setup Steps

### Project Structure
- [x] Renamed "berse database" to "berse-app"
- [x] Production environment created with PostgreSQL
- [x] Staging environment has PostgreSQL with 94 tables of data
- [x] Backend service added from GitHub (berse-app-backend)

### Backend Configuration
- [x] Production environment: deploys from `main` branch
- [x] Staging environment: deploys from `staging` branch
- [x] Auto-deployment enabled for both environments
- [x] Database linked via reference variables

### Environment Variables
- [x] Production: NODE_ENV, DATABASE_URL, JWT secrets, CORS, etc.
- [x] Staging: Different secrets, more lenient rate limits
- [x] DATABASE_URL automatically resolves to correct database per environment

### Git Branches
- [x] `main` branch exists and pushed to GitHub
- [x] `staging` branch created and pushed to GitHub

---

## 🔗 Database Connections

### Staging Database (Your Current Data)
- **94 tables** with all your existing data
- **Connected to**: staging environment backend
- **Used for**: Staging deployments + local development

### Production Database
- **Fresh database** ready for production
- **Connected to**: production environment backend
- **Used for**: Production deployments only

---

## 🚀 Deployment Workflow

### How It Works Now

**Deploy to Staging:**
```bash
git checkout staging
# Make changes
git add .
git commit -m "feat: your feature"
git push origin staging
# → Railway automatically deploys to staging environment
```

**Deploy to Production:**
```bash
# Create PR: staging → main on GitHub
# Review and merge PR
# → Railway automatically deploys to production environment
```

---

## 📊 Check Deployment Status

### Via Railway Dashboard
1. Go to [railway.app](https://railway.app)
2. Click on **berse-app** project
3. Use environment dropdown to switch between production/staging
4. Click **berse-backend** service
5. Click **Deployments** tab to see status

### Via Railway CLI

**Link to staging backend:**
```bash
railway link
# Select: berse-app
# Select: staging
# Select: berse-backend

# Check status
railway status

# View logs
railway logs
```

**Link to production backend:**
```bash
railway link
# Select: berse-app
# Select: production
# Select: berse-backend

# Check status
railway status

# View logs
railway logs
```

---

## 🔧 Run Migrations

### On Staging
```bash
railway link
# Select: berse-app → staging → berse-backend
railway run npm run prisma:migrate:prod
```

### On Production
```bash
railway link
# Select: berse-app → production → berse-backend
railway run npm run prisma:migrate:prod
```

**Note**: Migrations run automatically on deployment via the `railway:start` script.

---

## 🗄️ Database Access

### Staging Database
```bash
railway link
# Select: berse-app → staging → berse-database
railway psql
```

### Production Database
```bash
railway link
# Select: berse-app → production → berse-database
railway psql
```

### With Prisma Studio
```bash
# Staging
railway link  # Select staging database
railway variables  # Copy DATABASE_URL
DATABASE_URL="<url>" npm run prisma:studio

# Production
railway link  # Select production database
railway variables  # Copy DATABASE_URL
DATABASE_URL="<url>" npm run prisma:studio
```

---

## 🌐 Custom Domains (Next Step)

Once deployments are successful, you can add custom domains:

### Production
1. Go to berse-app → production → berse-backend
2. Settings → Domains → Add Domain
3. Enter: `api.berse.app`
4. Configure DNS CNAME record

### Staging
1. Go to berse-app → staging → berse-backend
2. Settings → Domains → Add Domain
3. Enter: `staging-api.berse.app`
4. Configure DNS CNAME record

---

## 🔐 Security Notes

✅ Different JWT secrets for production and staging
✅ Different cookie secrets for each environment
✅ DATABASE_URL automatically resolved per environment
✅ Production has stricter rate limits
✅ Staging has debug logs enabled, production doesn't

---

## 📚 Documentation References

- **Architecture**: `RAILWAY_ARCHITECTURE.md`
- **Complete Guide**: `RAILWAY_DEPLOYMENT_GUIDE.md`
- **Production Setup**: `PRODUCTION_SETUP.md`
- **Quick Reference**: `DEPLOYMENT_QUICKSTART.md`
- **This File**: `RAILWAY_SETUP_COMPLETE.md`

---

## 🎉 What's Next?

1. **Verify Deployments**: Check Railway dashboard for deployment status
2. **Run Migrations**: Run initial migrations on production database
3. **Test APIs**: Test staging deployment first
4. **Add Domains**: Configure custom domains (optional)
5. **Monitor**: Check logs for any issues

---

## ✅ Success Criteria

Your setup is complete when:
- [ ] Staging deployment shows "Success" in Railway
- [ ] Production deployment shows "Success" in Railway
- [ ] Can access staging API (via Railway-provided URL)
- [ ] Can access production API (via Railway-provided URL)
- [ ] Database connections work for both environments
- [ ] Migrations run successfully

---

**Setup Status**: ✅ COMPLETE

Ready to deploy! 🚀
