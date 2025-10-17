# Local Development with Railway Staging Database

## Overview

This guide explains how to connect your local development environment to Railway's staging database using Railway's **public network TCP proxy**.

Railway provides **two ways** to access databases:
1. **Private Network**: Internal hostname (`postgres.railway.internal`) - only accessible within Railway's network
2. **Public Network**: TCP proxy URL (`*.proxy.rlwy.net`) - accessible from anywhere, including your local machine

This document covers:
- **Quick Start**: Get connected in minutes with `npm run dev`
- **How to Get Public Database URL**: Step-by-step guide from Railway dashboard
- **Setup Instructions**: Complete environment configuration
- **Alternative Approaches**: Local database option for isolated development
- **Important Warnings**: Safety considerations when working with staging data

## ✅ Railway Public Network Access

**IMPORTANT:** Railway databases are accessible from your local machine using their **TCP proxy service**:

- ✅ Railway provides **public TCP proxy URLs** (e.g., `crossover.proxy.rlwy.net:27596`)
- ✅ These proxy URLs are accessible from **anywhere** with internet access
- ✅ Your local machine **CAN** connect to Railway staging database
- ✅ [`npm run dev`](package.json:6) **WORKS** when configured with the public URL
- ℹ️ Public network access uses Railway's Egress bandwidth (may incur costs on higher usage)

**Two URL Types:**
- **Internal URL**: `postgresql://postgres:***@postgres.railway.internal:5432/railway`
  - Only works within Railway's network
  - Returned by `railway variables` command
  - Used by deployed services
  
- **Public URL**: `postgresql://postgres:***@crossover.proxy.rlwy.net:27596/railway`
  - Works from anywhere with internet access
  - Must be obtained from Railway dashboard (Connect → Public Network tab)
  - **Use this for local development**

See the [**Alternative Approaches**](#-alternative-approaches) section for recommended solutions.

---

## Overview

**UPDATE:** After investigation, we discovered that **direct connection from local machine to Railway staging database is not possible** due to Railway's internal-only database hostnames.

This document now provides:

- **Understanding of Railway's Database Limitations**: Why direct connection doesn't work
- **Alternative Approaches**: Three practical solutions for development and testing
- **Local Development Setup**: Complete guide for PostgreSQL local database (recommended)
- **Railway CLI Usage**: How to use `railway run` and when it's useful
- **Deploy-to-Test Strategy**: Testing in actual Railway staging environment

### What Changed

**Original Goal (Not Achievable):**
- ❌ Run `npm run dev` locally and connect directly to Railway staging database
- ❌ Use TCP proxy to access Railway database externally

**Current Reality:**
- ✅ Railway databases use internal-only hostnames (`postgres.railway.internal`)
- ✅ External TCP proxies have been deprecated by Railway
- ✅ Local development requires local PostgreSQL database
- ✅ Testing with staging database requires deployment to Railway

### Recommended Approach

**For Local Development:**
Use a **local PostgreSQL database** with [`npm run dev:local`](package.json:7). This provides:
- ✅ Full control and fast iteration
- ✅ No network dependencies
- ✅ Safe experimentation without affecting staging
- ✅ Reliable connections

See [Option 2: Local PostgreSQL Database (Recommended)](#option-2-local-postgresql-database-recommended) for setup instructions.

**For Testing with Staging Data:**
Deploy to Railway staging environment where your code runs within Railway's network and can access `postgres.railway.internal`.

---

## 🚀 Quick Start

⚠️ **UPDATE:** Direct connection to Railway staging database from local machine is now possible via public network TCP proxy. For local development, use `npm run dev` with the public DATABASE_URL from Railway dashboard (see [Setup Instructions](#-setup-instructions) below).

### ❌ Original Approach (No Longer Preferred)

```bash
npm run dev  # This MAY FAIL - outdated connection method
```

**Why it was previously preferred:**
- [`.env.development.local`](.env.development.local:1) contained `postgres.railway.internal` (working internally)
- Thought to use `railway run npm run dev`

### ✅ New Recommended Approach: Public Network Database

**Direct connection from local machine now works!**

```bash
npm run dev
```

**What happens:**
- Loads environment variables from [`.env.development.local`](.env.development.local:1)
- Connects to Railway staging database via **public TCP proxy**
- Full access to staging data and schema
- ⚠️ **Changes affect shared staging environment** - use responsibly

**Prerequisites:**
- [`.env.development.local`](.env.development.local:1) must contain **public DATABASE_URL** from Railway dashboard (Format: `postgresql://postgres:PASSWORD@PROXY_HOST:PORT/railway`)
- Active internet connection

**Safety warnings:**
- ⚠️ You're connected to the **actual staging database**
- ⚠️ Data changes are **immediately visible** to other services and developers
- ⚠️ Schema changes affect all connected applications
- ⚠️ Coordinate with team before running migrations or destructive operations
- ✅ Consider using [`npm run dev:local`](package.json:7) for isolated development

---

## 🔄 Alternative Approaches

Since direct connection to Railway staging database is now possible, here are your options:

### Option 1: Railway Staging Database (Recommended for Staging Testing)

**Use `npm run dev` with Railway's public TCP proxy** - this is the PRIMARY approach when you need to:
- Test with actual staging data
- Verify changes work with production-like configuration
- Debug issues that only appear with staging data
- Collaborate with team using shared staging environment

**Setup:** See [Setup Instructions](#-setup-instructions) below

**Considerations:**
- ✅ Real staging data and schema
- ✅ Tests production-like environment
- ⚠️ Changes affect shared staging environment
- ⚠️ Requires internet connection
- ⚠️ Uses Railway Egress bandwidth

### Option 2: Local PostgreSQL Database (Recommended for Development)

Use a local PostgreSQL database for isolated development:

**When to use:**
- Developing new features without affecting staging
- Testing destructive operations safely
- Rapid iteration without network dependencies
- Working offline
- Running automated tests

**Setup:**

1. **Install PostgreSQL**
   ```bash
   # macOS (using Homebrew)
   brew install postgresql@16
   brew services start postgresql@16
   
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   sudo systemctl start postgresql
   
   # Windows
   # Download from: https://www.postgresql.org/download/windows/
   ```

2. **Create Local Database**
   ```bash
   # Connect to PostgreSQL
   psql postgres
   
   # Create database and user
   CREATE DATABASE bersemuka_dev;
   CREATE USER bersemuka WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE bersemuka_dev TO bersemuka;
   \q
   ```

3. **Create `.env` File**
   Create [`.env`](.env:1) in project root (separate from `.env.development.local`):
   
   ```bash
   NODE_ENV=development
   
   # Local PostgreSQL Database Connection
   DATABASE_URL=postgresql://bersemuka:your_secure_password@localhost:5432/bersemuka_dev
   
   # Copy other required environment variables from .env.example
   ```

4. **Run Database Migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Start Development Server**
   ```bash
   npm run dev:local
   ```

**Benefits:**
- ✅ Complete isolation from staging
- ✅ Safe for experimentation
- ✅ No network dependencies
- ✅ Fast and reliable
- ✅ Works offline

### Option 3: Railway CLI with Railway Run

Run commands within Railway's environment (uses internal URL):

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link to project
railway login
railway link

# Run commands with Railway environment variables
railway run npm run dev
railway run npx prisma studio
```

**How it works:**
- Loads Railway environment variables (including internal DATABASE_URL)
- Executes commands locally with Railway configuration
- Database connection goes through Railway's network

**When to use:**
- Running one-off scripts with Railway environment
- Testing environment variable configuration
- Executing commands that need Railway-specific settings

**Limitations:**
- Uses internal URL, requires Railway CLI
- Not ideal for interactive development
- Slower than direct connection

---

## 📋 Setup Instructions

### Step 1: Get Public Database URL from Railway Dashboard

Railway's public DATABASE_URL must be obtained from the dashboard (it's different from the internal URL):

1. **Open Railway Dashboard**
   ```bash
   railway open
   # Or visit: https://railway.app
   ```

2. **Navigate to Your Database Service**
   - Select your project
   - Click on the **Postgres** service (or your database service name)

3. **Access Public Network Connection**
   - Click **"Connect"** tab or button
   - Select **"Public Network"** tab (NOT "Private Network")
   
4. **Copy the Connection URL**
   - You'll see a connection string in this format:
     ```
     postgresql://postgres:********@crossover.proxy.rlwy.net:27596/railway
     ```
   - Note the TCP proxy hostname (e.g., `crossover.proxy.rlwy.net`)
   - Note the port number (e.g., `27596`)
   - This is your **public DATABASE_URL**

5. **Important Distinctions**
   - ❌ **Private Network URL**: `postgres.railway.internal` - won't work locally
   - ✅ **Public Network URL**: `*.proxy.rlwy.net` - works from anywhere
   - ℹ️ `railway variables` returns the **private** URL (not what you need)
   - ℹ️ Always use the dashboard to get the **public** URL for local development

### Step 2: Configure Environment Variables

Create or update [`.env.development.local`](.env.development.local:1) in your project root:

```bash
# Local Development with Railway Staging Database
NODE_ENV=development

# Railway Staging Database - Public Network Connection
# IMPORTANT: Use the PUBLIC TCP proxy URL from Railway dashboard
# Format: postgresql://postgres:PASSWORD@PROXY_HOST:PORT/railway
# Example: postgresql://postgres:***@crossover.proxy.rlwy.net:27596/railway
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@crossover.proxy.rlwy.net:27596/railway

# Copy other required environment variables from .env.example
# Adjust values as needed for development
```

**Key Points:**
- ✅ Use the **public TCP proxy URL** from Railway dashboard (Step 1)
- ✅ Replace `YOUR_PASSWORD` with actual password from dashboard
- ✅ Replace proxy hostname and port with your actual values
- ⚠️ This file is gitignored - never commit database credentials
- ⚠️ Public network access uses Railway's Egress bandwidth

### Step 3: Verify Configuration

Check that you're using the correct public URL:

```bash
# View your DATABASE_URL (without exposing full password)
grep DATABASE_URL .env.development.local | sed 's/:.*@/:***@/'
```

Expected output should show:
```
DATABASE_URL=postgresql://postgres:***@[SOMETHING].proxy.rlwy.net:[PORT]/railway
```

✅ Correct: Contains `proxy.rlwy.net`
❌ Incorrect: Contains `railway.internal`

### Step 4: Start Development Server

```bash
npm run dev
```

**Expected Output:**
```
⚠️  WARNING: Connecting to RAILWAY STAGING DATABASE
⚠️  Host: crossover.proxy.rlwy.net:27596
⚠️  This affects production/staging data. Use 'npm run dev:local' for local database.
✅ Database connection pool established
🚀 Server running on port 3000
```

✅ Connection successful - you're now connected to Railway staging!

---

## 🔍 How to Verify Which Database You're Connected To

### Check Console Output

When you run [`npm run dev`](package.json:6), look for the connection message:

**Railway Staging Database (Public Network):**
```
⚠️  WARNING: Connecting to RAILWAY STAGING DATABASE
⚠️  Host: crossover.proxy.rlwy.net:27596
⚠️  This affects production/staging data. Use 'npm run dev:local' for local database.
✅ Database connection pool established
🚀 Server running on port 3000
```

**Local Database:**
```
✅ Database connection pool established
🚀 Server running on port 3000
```
(No Railway warning = local database)

### Check Which Script is Running

- `npm run dev` → Railway staging database (if configured correctly)
- `npm run dev:local` → Local PostgreSQL database
- `railway run npm run dev` → Railway environment with internal URL

### Inspect the DATABASE_URL

The detection logic in [`src/config/database.ts`](src/config/database.ts:26) checks if `DATABASE_URL` contains `'railway'` or `'rlwy'`:

**Railway Public URL** ([`.env.development.local`](.env.development.local:1)):
```
DATABASE_URL=postgresql://postgres:***@crossover.proxy.rlwy.net:27596/railway
```
Contains `rlwy` → Triggers Railway warning ✅

**Local Database URL** ([`.env`](.env:1)):
```
DATABASE_URL=postgresql://bersemuka:password@localhost:5432/bersemuka_dev
```
No Railway keywords → No warning ✅

---

## 🛠 Railway CLI Commands Reference

### Understanding Railway URLs

Railway provides two types of DATABASE_URLs:

```bash
# Get Railway environment variables
railway variables

# This returns the INTERNAL URL (not what you need for local dev):
# DATABASE_URL=postgresql://postgres:***@postgres.railway.internal:5432/railway
```

❌ **Internal URL** from `railway variables`:
- Format: `postgres.railway.internal:5432`
- Only works within Railway's network
- Used by deployed services
- **Does NOT work from your local machine**

✅ **Public URL** from Railway dashboard:
- Format: `crossover.proxy.rlwy.net:27596` (varies per database)
- Works from anywhere with internet
- **Use this for local development**
- Must be obtained from dashboard: Connect → Public Network tab

### Useful Railway CLI Commands

```bash
# Install Railway CLI
npm install -g @railway/cli

# Authentication and setup
railway login
railway link  # Link to your project

# View environment variables (returns internal URLs)
railway variables
railway variables | grep DATABASE_URL

# Run commands with Railway environment (uses internal URL)
railway run npm run dev
railway run npx prisma studio

# Open Railway dashboard (to get public URL)
railway open

# View deployment logs
railway logs

# Check project status
railway status

# Deploy to Railway
git push origin main
```

**Important:** `railway variables` returns the **internal** DATABASE_URL. To get the **public** URL for local development, use the Railway dashboard (Connect → Public Network tab).

---

## ⚠️ Important Warnings & Best Practices

### Data Safety

**When using Railway Staging Database:**
- ⚠️ You're connected to the **shared staging database**
- ⚠️ All changes are **immediately visible** to other services and developers
- ⚠️ Database migrations affect the entire staging environment
- ⚠️ Data modifications are **permanent** (no automatic rollback)
- ⚠️ Coordinate with team before running migrations or destructive operations

**Safe Practices:**
1. Use [`npm run dev:local`](package.json:7) for experimental or destructive work
2. Always backup before major schema changes
3. Test migrations on local database first
4. Communicate with team when making staging changes
5. Use database transactions for testing when possible

### Railway Egress Costs

Railway's public network access uses **Egress bandwidth**, which may incur costs:
- ℹ️ Free tier includes some Egress bandwidth
- ℹ️ Additional usage is billed per GB
- ℹ️ Local development typically uses minimal bandwidth
- ℹ️ Consider local database for intensive operations or automated tests

### Security Best Practices

- ⚠️ [`.env.development.local`](.env.development.local:1) is gitignored (line 9 of [`.gitignore`](.gitignore:9))
- ⚠️ **NEVER commit database credentials to version control**
- ⚠️ Rotate Railway credentials periodically
- ⚠️ Share credentials only through secure channels
- ⚠️ Use different credentials for staging and production

### Team Collaboration

- Communicate when using staging database for development
- Avoid running destructive operations without coordination
- Create database snapshots before major changes
- Document any manual data changes made during development
- Consider using feature flags for risky changes

### When to Use Each Approach

**Use Railway Staging Database** ([`npm run dev`](package.json:6)) when:
- ✅ Testing with actual staging data
- ✅ Verifying production-like configurations
- ✅ Debugging staging-specific issues
- ✅ Collaborating with team on shared features
- ⚠️ Accepting responsibility for staging changes

**Use Local Database** ([`npm run dev:local`](package.json:7)) when:
- ✅ Developing new features
- ✅ Testing destructive operations
- ✅ Running automated tests
- ✅ Learning or experimenting
- ✅ Working without affecting others

---

## 🔧 Troubleshooting

### Issue: Connection timeout to Railway database

**Symptoms:**
```bash
❌ Database connection failed: Error: connect ETIMEDOUT
```

**Possible Causes:**

1. **Using internal URL instead of public URL**
   ```bash
   # Check your DATABASE_URL
   grep DATABASE_URL .env.development.local
   ```
   
   ❌ Wrong: `postgres.railway.internal:5432`
   ✅ Correct: `crossover.proxy.rlwy.net:27596` (or similar)
   
   **Solution:** Get the public URL from Railway dashboard (Connect → Public Network tab)

2. **Firewall or network restrictions**
   - Check if your network blocks outbound connections on non-standard ports
   - Try from a different network
   - Check VPN settings if applicable

3. **Railway service is down**
   ```bash
   railway status
   ```
   Check Railway status page: https://status.railway.app

### Issue: Wrong DATABASE_URL format

**Symptoms:**
```bash
❌ Database connection failed: Error: getaddrinfo ENOTFOUND
```

**Solution:**
Verify your DATABASE_URL format in [`.env.development.local`](.env.development.local:1):

```bash
# Correct format from Railway dashboard:
postgresql://postgres:PASSWORD@PROXY_HOST:PORT/railway

# Example:
postgresql://postgres:abc123@crossover.proxy.rlwy.net:27596/railway
```

Check for:
- ✅ Correct protocol: `postgresql://`
- ✅ Valid password (no special characters breaking URL)
- ✅ TCP proxy hostname: `*.proxy.rlwy.net`
- ✅ Port number matches dashboard
- ✅ Database name: usually `railway`

### Issue: Authentication failed

**Symptoms:**
```bash
❌ Database connection failed: Error: password authentication failed
```

**Solution:**
1. Get fresh credentials from Railway dashboard
2. Ensure no extra spaces or characters in `.env.development.local`
3. Check if password contains special characters that need URL encoding
4. Verify you're using the correct database service in Railway

### Issue: Connected to wrong database

**Symptoms:**
- Expected staging data but seeing local data (or vice versa)
- Data changes not appearing where expected

**Solution:**

1. **Check which command you ran:**
   - `npm run dev` = Railway staging (if configured)
   - `npm run dev:local` = Local database

2. **Check console output:**
   ```bash
   ⚠️  WARNING: Connecting to RAILWAY STAGING DATABASE
   ```
   If you see this warning, you're connected to Railway

3. **Verify DATABASE_URL:**
   ```bash
   # For npm run dev (Railway)
   grep DATABASE_URL .env.development.local
   
   # For npm run dev:local (Local)
   grep DATABASE_URL .env
   ```

### Issue: `dotenv-cli` command not found

**Symptoms:**
```bash
dotenv: command not found
```

**Solution:**
```bash
# Install dotenv-cli
npm install --save-dev dotenv-cli

# Verify installation
npm list dotenv-cli
```

### Issue: Cannot access Railway dashboard public URL

**Symptoms:**
- Can't find "Public Network" tab in Railway dashboard
- Only seeing internal URL option

**Solution:**
1. Ensure you're viewing the **database service** (not the application service)
2. Click the **"Connect"** button/tab
3. Look for tabs: **"Private Network"** and **"Public Network"**
4. Select **"Public Network"** tab
5. If you still don't see it, check Railway documentation or contact Railway support

### Issue: Migrations not in sync

**Symptoms:**
```bash
Error: Schema is not in sync with migrations
```

**Solutions:**

**For Railway staging:**
```bash
# Check migration status (against Railway)
npm run dev  # Ensure connected to Railway
npx prisma migrate status

# Deploy pending migrations to Railway
npx prisma migrate deploy
```

**For local database:**
```bash
# Check migration status (against local)
npx prisma migrate status

# Apply migrations
npx prisma migrate dev

# Reset if needed (⚠️ destroys all local data)
npx prisma migrate reset
```

### Issue: Local PostgreSQL not running

**Symptoms:**
```bash
❌ Database connection failed: Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**

**macOS (Homebrew):**
```bash
brew services start postgresql@16
brew services list | grep postgresql
```

**Ubuntu/Debian:**
```bash
sudo systemctl start postgresql
sudo systemctl status postgresql
```

**Windows:**
```bash
net start postgresql-x64-16
```

---

## 📁 File Reference

### Configuration Files

| File | Purpose | Recommended Use | Gitignored |
|------|---------|-----------------|------------|
| [`.env.development.local`](.env.development.local:1) | Railway staging database (public URL) | Railway staging development | ✅ Yes (line 9) |
| `.env` | Local database credentials | Local isolated development | ✅ Yes (line 7) |
| [`.env.example`](.env.example:1) | Environment variables template | Reference for required vars | ❌ No |
| [`.env.staging.example`](.env.staging.example:1) | Staging configuration example | Reference for staging setup | ❌ No |

### Script Files

| File | Relevant Section | Purpose | When to Use |
|------|------------------|---------|-------------|
| [`package.json`](package.json:6) | [`scripts.dev`](package.json:6) | Railway staging database | Testing with staging data |
| [`package.json`](package.json:7) | [`scripts.dev:local`](package.json:7) | Local database | Safe development |

### Source Code

| File | Relevant Section | Purpose |
|------|------------------|---------|
| [`src/config/database.ts`](src/config/database.ts:26) | Lines 26-41 | Railway connection detection and warnings |
| [`src/config/database.ts`](src/config/database.ts:8) | Lines 8-23 | Prisma client with connection pooling |

### Gitignore

| File | Relevant Section | Purpose |
|------|------------------|---------|
| [`.gitignore`](.gitignore:6) | Lines 6-13 | Protects environment files |
| [`.gitignore`](.gitignore:9) | Line 9 | Protects [`.env.development.local`](.env.development.local:1) |

---

## 🎯 Quick Reference Commands

### Railway Staging Development

```bash
# Start development server (Railway staging)
npm run dev

# View staging database with Prisma Studio
npx prisma studio

# Check migration status (Railway)
npx prisma migrate status

# Deploy migrations to Railway
npx prisma migrate deploy

# Generate Prisma Client
npm run prisma:generate
```

### Local Development

```bash
# Start development server (local database)
npm run dev:local

# Set up local database
createdb bersemuka_dev
npx prisma migrate dev
npx prisma db seed

# Open Prisma Studio (local)
npx prisma studio

# Check migration status (local)
npx prisma migrate status
```

### Railway CLI Commands

```bash
# Install Railway CLI
npm install -g @railway/cli

# Authentication
railway login
railway link

# View environment variables (shows internal URL)
railway variables
railway variables | grep DATABASE_URL

# Open Railway dashboard (to get public URL)
railway open

# View logs
railway logs

# Deploy to Railway
git push origin main
```

### Environment Verification

```bash
# Check which DATABASE_URL you're using
# Railway staging:
grep DATABASE_URL .env.development.local | sed 's/:.*@/:***@/'

# Local database:
grep DATABASE_URL .env | sed 's/:.*@/:***@/'

# Verify dotenv-cli installation
npm list dotenv-cli

# Test PostgreSQL connection (local)
psql -d bersemuka_dev -U bersemuka
```

---

## 📚 Related Documentation

- [`DATABASE_SETUP.md`](DATABASE_SETUP.md:1) - Database setup and migration guide
- [`RAILWAY_ENVIRONMENT_CONFIG.md`](RAILWAY_ENVIRONMENT_CONFIG.md:1) - Railway environment configuration
- [`DEPLOYMENT_READY.md`](DEPLOYMENT_READY.md:1) - Deployment guide and checklist
- [Railway Documentation](https://docs.railway.app) - Official Railway docs

---

**Last Updated:** October 16, 2025  
**Status:** ✅ Documentation updated with accurate Railway public network access information

**Key Information:**
- Railway **DOES provide public network access** via TCP proxy
- Use Railway dashboard (Connect → Public Network) to get the public DATABASE_URL
- Format: `postgresql://postgres:***@*.proxy.rlwy.net:PORT/railway`
- `railway variables` returns the **internal** URL (not suitable for local dev)
- Public URL works from anywhere with internet connection
- [`npm run dev`](package.json:6) **WORKS** when configured with public URL
- Use [`npm run dev:local`](package.json:7) for isolated development

**Recommendations:**
- **For staging testing**: Use Railway staging with public URL ([`npm run dev`](package.json:6))
- **For development**: Use local PostgreSQL database ([`npm run dev:local`](package.json:7))
- **For collaboration**: Coordinate staging database usage with team
- **For safety**: Test destructive operations locally first