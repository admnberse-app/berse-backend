# 📋 Auto-Deploy Setup Guide (Step-by-Step)

## 🔵 NETLIFY (Frontend) - Set Up Auto-Deploy

### Current Status: Manual Deploy ❌
### Goal: Auto-Deploy from GitHub ✅

### Step-by-Step Instructions:

1. **Open Netlify Dashboard**
   - Go to: https://app.netlify.com
   - Click on **"berseapp"** site

2. **Navigate to Build Settings**
   - Left sidebar → Click **"Site configuration"**
   - Scroll down to **"Build & deploy"**
   - Click **"Continuous deployment"**

3. **Link to GitHub**
   - You'll see: "Your site is not linked to a Git repository"
   - Click big blue button: **"Link site to Git"**
   
4. **Choose GitHub**
   - Select **"GitHub"** (not GitLab or Bitbucket)
   - A popup will appear - click **"Authorize Netlify"**
   - Enter your GitHub password if asked

5. **Select Repository**
   - Search for: **"BerseMuka"**
   - Click on **"raihaan123/BerseMuka"**

6. **Configure Build Settings**
   ```
   Branch to deploy: main
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```
   - Click **"Deploy site"**

7. **Add Environment Variables**
   - Go to **"Site configuration"** → **"Environment variables"**
   - Click **"Add a variable"**
   - Add:
     ```
     Key: VITE_API_URL
     Value: https://api.berse.app
     ```

### ✅ Success Indicators:
- Dashboard shows: **"Auto publishing is on"**
- New section appears: **"Deploy contexts"**
- Build starts automatically when you push to GitHub

---

## 🟣 RAILWAY (Backend) - Set Up Auto-Deploy

### Step-by-Step Instructions:

1. **Open Railway Dashboard**
   - Go to: https://railway.app/dashboard
   - Click **"bersemuka-backend"** project

2. **Check GitHub Connection**
   - Click **"Settings"** tab
   - Look for **"Source"** section
   - Should show: **"GitHub Repo: raihaan123/BerseMuka"**

3. **If NOT Connected to GitHub:**
   - Click **"Connect GitHub"** button
   - Authorize Railway to access GitHub
   - Select **"raihaan123/BerseMuka"** repository

4. **Configure Auto-Deploy**
   - In Settings, find **"Deploy"** section
   - Set these options:
     ```
     Branch: main
     Root Directory: (leave empty)
     Auto Deploy: Toggle ON ✅
     Check Suites: Toggle ON ✅
     ```

5. **Verify Environment Variables**
   - Click **"Variables"** tab
   - Check you have all required vars:
     - DATABASE_URL ✅
     - JWT_SECRET ✅
     - CORS_ORIGIN ✅
     - NODE_ENV=production ✅
     - PORT=8080 ✅

### ✅ Success Indicators:
- Settings show: **"Deploys from GitHub"**
- New commits trigger: **"Deployment #XX building"**
- Deploy history shows automatic deployments

---

## 🧪 TEST AUTO-DEPLOY

### Quick Test:
1. Make a small change (we'll create a test file)
2. Push to GitHub
3. Watch both dashboards

### What to Look For:

**Netlify:**
- Status changes to **"Building"** (yellow)
- Then **"Published"** (green)
- Takes 2-3 minutes

**Railway:**
- Shows **"Building"** with progress bar
- Then **"Active"** (green)
- Takes 3-5 minutes

---

## 🚨 TROUBLESHOOTING

### Netlify Issues:
- **"Build failed"** → Check build command and directory
- **"Command not found"** → Ensure package.json has build script
- **"Module not found"** → Run npm install locally and commit package-lock.json

### Railway Issues:
- **"Build failed"** → Check logs for missing env variables
- **"Port error"** → Ensure PORT env variable is set
- **"Database connection failed"** → Verify DATABASE_URL

---

## 📝 FINAL CHECKLIST

### Netlify:
- [ ] Connected to GitHub
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] Auto-deploy enabled
- [ ] Test deployment successful

### Railway:
- [ ] Connected to GitHub
- [ ] Deploy settings configured
- [ ] Environment variables verified
- [ ] Auto-deploy enabled
- [ ] Test deployment successful

## 🎉 Once Complete:
Every `git push` to main branch will automatically:
1. Deploy frontend to Netlify (berse.app)
2. Deploy backend to Railway (api.berse.app)
3. No more manual deployments needed!

---

**Need Help?**
- Netlify Support: https://answers.netlify.com/
- Railway Support: https://railway.app/help
- Or ask in our Discord/Slack!