# Railway Deployment Status Check

## 📊 How to Check Deployment Status

### Via Railway Dashboard (Recommended)

1. **Go to Railway Dashboard**
   - Visit: https://railway.app
   - Click on **berse-app** project

2. **Check Staging Deployment**
   - Environment dropdown (top left) → Select **staging**
   - Click on **berse-backend** service
   - Click **Deployments** tab
   - Look for the latest deployment

   **Status indicators:**
   - 🔵 **Building** - Deployment in progress
   - ✅ **Success** - Deployment successful
   - ❌ **Failed** - Deployment failed (check logs)
   - ⏸️ **Waiting** - Queued for deployment

3. **Check Production Deployment**
   - Environment dropdown → Select **production**
   - Click on **berse-backend** service
   - Click **Deployments** tab
   - Check latest deployment status

### Via Railway CLI

```bash
# Link to staging backend
railway link
# Select: berse-app → staging → berse-backend

# Check status
railway status

# View recent logs
railway logs --tail 100

# Switch to production
railway link
# Select: berse-app → production → berse-backend

railway status
railway logs --tail 100
```

---

## 🔗 Get Deployment URLs

### Staging URL
1. Railway Dashboard → berse-app → staging environment
2. Click **berse-backend** service
3. Click **Settings** → **Domains**
4. You'll see a Railway-provided URL like: `berse-backend-staging-production-xxxx.up.railway.app`

### Production URL
1. Railway Dashboard → berse-app → production environment
2. Click **berse-backend** service
3. Click **Settings** → **Domains**
4. You'll see a Railway-provided URL like: `berse-backend-production-xxxx.up.railway.app`

---

## 🧪 Test Deployment

Once you get the URL, test the health endpoint:

```bash
# Staging
curl https://your-staging-url.railway.app/health

# Production
curl https://your-production-url.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-16T..."
}
```

---

## 🔍 Common Deployment Issues

### Issue: Build Failed

**Check:**
1. Build logs in Railway dashboard
2. TypeScript errors: Run `npm run typecheck` locally
3. Environment variables: Ensure all required vars are set

### Issue: Deployment Succeeded but App Not Responding

**Check:**
1. Runtime logs in Railway dashboard
2. Database connection: Verify DATABASE_URL is linked
3. Port configuration: Ensure PORT=3001 is set

### Issue: Database Connection Error

**Check:**
1. DATABASE_URL reference variable is set correctly
2. Link should be: `${{berse-database.DATABASE_URL}}`
3. Database service is running

---

## 📝 What to Look For

### Successful Deployment Shows:

```
✅ Build completed
✅ Container started
✅ Health check passed (if configured)
✅ No error logs
✅ Service responding to requests
```

### Failed Deployment Shows:

```
❌ Build errors (check build logs)
❌ Runtime errors (check runtime logs)
❌ Container crashed
❌ Health check failed
```

---

## 🎯 Quick Checklist

- [ ] Staging backend deployment shows "Success"
- [ ] Production backend deployment shows "Success"
- [ ] Staging has a Railway-provided URL
- [ ] Production has a Railway-provided URL
- [ ] Health endpoint responds (if you test it)
- [ ] No errors in deployment logs

---

## 🆘 If Deployments Failed

1. **Check build logs** - Look for TypeScript or dependency errors
2. **Verify environment variables** - Ensure all required vars are set
3. **Check database link** - Verify DATABASE_URL reference is correct
4. **Review package.json scripts** - Ensure `railway:build` and `railway:start` exist

---

## 📞 Next Steps After Verification

Once deployments are successful:

1. **Run migrations** on production database
2. **Test API endpoints** with staging URL
3. **Configure custom domains** (optional)
4. **Set up monitoring** (optional)

---

**Check your Railway dashboard now and let me know what you see!**
