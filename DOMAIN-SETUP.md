# Custom Domain Setup for berse.app

## 🎉 Deployment Successful!

Your app is now live at: https://bersemuka.netlify.app

## 📌 Setting Up Your Custom Domain (berse.app)

Follow these steps to connect your custom domain:

### Step 1: Access Netlify Domain Settings

1. Go to your Netlify dashboard: https://app.netlify.com/projects/bersemuka
2. Click on **Domain management** in the top navigation
3. Click **Add a domain** button

### Step 2: Add Your Custom Domain

1. Enter `berse.app` in the domain field
2. Click **Verify**
3. Netlify will check if the domain is available

### Step 3: Configure DNS Settings

You have two options:

#### Option A: Use Netlify DNS (Recommended)
1. Click **Add domain** when prompted
2. Netlify will provide you with name servers
3. Go to your domain registrar (where you bought berse.app)
4. Update the nameservers to Netlify's nameservers:
   ```
   dns1.p01.nsone.net
   dns2.p01.nsone.net
   dns3.p01.nsone.net
   dns4.p01.nsone.net
   ```

#### Option B: Configure DNS Records Manually
1. Keep your current DNS provider
2. Add these records at your domain registrar:

   **For apex domain (berse.app):**
   ```
   Type: A
   Name: @
   Value: 75.2.60.5
   ```

   **For www subdomain (www.berse.app):**
   ```
   Type: CNAME
   Name: www
   Value: bersemuka.netlify.app
   ```

### Step 4: SSL Certificate

- Netlify will automatically provision a free SSL certificate from Let's Encrypt
- This usually takes a few minutes after DNS propagation
- Your site will be available at https://berse.app

### Step 5: Set Primary Domain

1. Once DNS is configured, go back to Domain management
2. Click on **Options** → **Set as primary domain** for berse.app
3. This ensures all traffic redirects to your custom domain

## 🔍 DNS Propagation

- DNS changes can take up to 48 hours to propagate globally
- Usually, it happens within 1-4 hours
- You can check propagation status at: https://www.whatsmydns.net/

## ✅ Verification Checklist

- [ ] Domain added to Netlify
- [ ] DNS configured (either Netlify DNS or manual records)
- [ ] SSL certificate provisioned
- [ ] Primary domain set
- [ ] Site accessible at https://berse.app

## 🚀 Current Deployment Info

- **Production URL:** https://bersemuka.netlify.app
- **Deploy ID:** 6898aedfc9f78159f63089ea
- **Build logs:** https://app.netlify.com/projects/bersemuka/deploys/6898aedfc9f78159f63089ea

## 📱 Testing Your Deployment

Once DNS is configured, test these URLs:
- https://berse.app
- https://www.berse.app
- http://berse.app (should redirect to HTTPS)

## 🛠️ Need Help?

- Netlify Support: https://www.netlify.com/support/
- DNS Troubleshooting: https://docs.netlify.com/domains-https/troubleshooting-tips/

---

**Note:** Your app is already live and working at the Netlify URL. The custom domain setup is the final step to make it accessible at berse.app.