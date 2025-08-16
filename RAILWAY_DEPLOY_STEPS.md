# 🚂 Railway Deployment - Step by Step Commands

## **Phase 1: Railway Login**
After you run these commands in your terminal, follow the prompts:

```bash
# 1. Login to Railway (opens browser)
railway login
# Click "Authorize" in the browser when it opens
```

---

## **Phase 2: Deploy Backend** 

```bash
# 2. Navigate to project root
cd C:\Users\zayd\Desktop\nama-fund-b\BerseMuka

# 3. Initialize Railway project for backend
railway init
# Select: "Create new project"
# Enter name: "bersemuka-backend"
# Select: "Empty Project"

# 4. Add PostgreSQL database
railway add -d postgresql
# This automatically creates DATABASE_URL

# 5. Deploy backend
railway up
# Railway will build and deploy your Node.js backend
# Note down the URL it gives you (like: https://bersemuka-backend-production.railway.app)
```

---

## **Phase 3: Set Backend Environment Variables**

Go to [railway.app/dashboard](https://railway.app/dashboard) → Your "bersemuka-backend" project → Variables tab

Add these variables one by one:

```env
NODE_ENV=production
PORT=3001

# JWT Secrets (generate random 32-character strings)
JWT_SECRET=your_super_long_32_character_secret_here
JWT_REFRESH_SECRET=another_long_32_character_secret_here
COOKIE_SECRET=16_char_cookie_sec

# Push Notifications (VAPID keys already generated)
VAPID_PUBLIC_KEY=BPprWOx_-rff-w_nW1apFH4LIjgzNhPCDWbkW5sl10goITRdq6I-GPcuId4y5JE6oqvBp3ysVSkRCeKJXH3Fx-E
VAPID_PRIVATE_KEY=zlKhPz4og8lgh2Igk06CHKCdgrgOYRn1F_7w6sRzTxk
VAPID_EMAIL=mailto:admin@yourdomain.com

# CORS (temporarily set to localhost, will update after frontend deployment)
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
```

After adding variables, restart the backend:
```bash
railway restart
```

---

## **Phase 4: Deploy Frontend**

```bash
# 6. Navigate to frontend directory
cd frontend

# 7. Initialize Railway project for frontend
railway init
# Select: "Create new project"  
# Enter name: "bersemuka-frontend"
# Select: "Empty Project"

# 8. Deploy frontend
railway up
# Railway will build and deploy your React app
# Note down the URL it gives you (like: https://bersemuka-frontend-production.railway.app)
```

---

## **Phase 5: Set Frontend Environment Variables**

Go to Railway dashboard → Your "bersemuka-frontend" project → Variables tab

Add these variables (replace YOUR_BACKEND_URL with the actual backend URL from step 5):

```env
NODE_ENV=production
PORT=5173

# API Connection (replace with your actual backend URL)
VITE_API_URL=https://YOUR_BACKEND_URL.railway.app
VITE_API_BASE_URL=https://YOUR_BACKEND_URL.railway.app/api

# Features
VITE_ENABLE_PWA=true
VITE_ENABLE_NOTIFICATIONS=true
```

---

## **Phase 6: Update Backend CORS**

Go back to your backend project in Railway dashboard → Variables tab

Update these variables with your actual frontend URL:

```env
# Replace with your actual frontend URL
FRONTEND_URL=https://YOUR_FRONTEND_URL.railway.app
CORS_ORIGINS=https://YOUR_FRONTEND_URL.railway.app
```

Then restart backend:
```bash
# Navigate back to project root
cd C:\Users\zayd\Desktop\nama-fund-b\BerseMuka
railway restart
```

---

## **Phase 7: Run Database Migrations**

```bash
# Still in project root directory
railway run npx prisma migrate deploy
```

---

## **Phase 8: Test Your Deployment**

1. **Backend Health Check**: Visit `https://YOUR_BACKEND_URL.railway.app/health`
2. **Frontend**: Visit `https://YOUR_FRONTEND_URL.railway.app`  
3. **Test Registration**: Try creating a new user account
4. **Test Login**: Try logging in
5. **Test Push Notifications**: Go to Settings and enable notifications

---

## **Useful Commands**

```bash
# View deployment logs
railway logs

# Check deployment status  
railway status

# Restart service
railway restart

# Connect to database
railway connect

# List environment variables
railway variables
```

---

## **Your Generated Keys (SAVE THESE!)**

**VAPID Public Key:**
```
BPprWOx_-rff-w_nW1apFH4LIjgzNhPCDWbkW5sl10goITRdq6I-GPcuId4y5JE6oqvBp3ysVSkRCeKJXH3Fx-E
```

**VAPID Private Key:** 
```
zlKhPz4og8lgh2Igk06CHKCdgrgOYRn1F_7w6sRzTxk
```

**⚠️ Keep the private key secure!**

---

## **Need Help?**

If anything fails:
1. Run `railway logs` to see error messages
2. Check all environment variables are set correctly
3. Verify URLs don't have typos
4. Ensure both services are running

**You're ready to deploy! 🚀**