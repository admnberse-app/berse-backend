# Manual Setup Guide

If you prefer to set up manually or the setup script doesn't work, follow these steps.

## Prerequisites

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login
```

## Step 1: Link to Railway Database

```bash
# Link to your Railway development database
railway link

# Select:
# - Workspace: Berse Admin's Projects
# - Project: berse database (or your dev database project)
# - Environment: staging (or the environment with your dev database)
# - Service: Postgres
```

## Step 2: Get Database URL

```bash
# View all variables (including DATABASE_URL)
railway variables
```

Copy the `DATABASE_URL` value. It should look like:
```
postgresql://postgres:PASSWORD@containers-us-west-XXX.railway.app:PORT/railway
```

## Step 3: Create .env.local File

Create a file named `.env.local` in the project root:

```bash
# =============================================================================
# DEVELOPMENT ENVIRONMENT
# =============================================================================

# Environment
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001

# Database (paste your Railway DATABASE_URL here)
DATABASE_URL="postgresql://postgres:PASSWORD@containers-us-west-XXX.railway.app:PORT/railway"
DATABASE_MAX_CONNECTIONS=20

# JWT Secrets (Development Only)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-generated-secret-here
JWT_REFRESH_SECRET=your-generated-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
COOKIE_SECRET=your-cookie-secret-here
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Email (Use Mailtrap for development)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
FROM_EMAIL=dev@berse.app

# Frontend URLs
FRONTEND_URL=http://localhost:5173
APP_URL=http://localhost:5173

# Feature Flags
ENABLE_EMAIL_VERIFICATION=false
ENABLE_REGISTRATION=true
ENABLE_DEBUG_LOGS=true

# File Upload
MAX_FILE_SIZE=10mb
UPLOAD_DIR=uploads

# Rate Limiting (more lenient for development)
RATE_LIMIT_MAX_REQUESTS=500
RATE_LIMIT_WINDOW_MS=900000
```

### Generate Secure Secrets

Run these commands to generate random secrets:

```bash
# For JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# For JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# For COOKIE_SECRET
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

Copy each output and paste into your `.env.local` file.

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Setup Prisma

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

## Step 6: Create Uploads Directory

```bash
mkdir -p uploads
```

## Step 7: Start Development Server

```bash
npm run dev
```

Server will start at: http://localhost:3001

## Step 8: Test the Setup

1. Open API documentation: http://localhost:3001/api-docs
2. Try the health check: http://localhost:3001/health
3. Open Prisma Studio: `npm run prisma:studio`

## Verify Database Connection

```bash
# Test database connection
npx prisma db push

# If successful, you should see:
# "The database is already in sync with the Prisma schema."
```

## Common Issues

### Issue: Can't connect to database

**Solution:**
1. Verify `DATABASE_URL` in `.env.local` is correct
2. Check Railway database is running
3. Test connection: `npx prisma db push`

### Issue: Port already in use

**Solution:**
Change `PORT` in `.env.local` to a different port (e.g., 3002)

### Issue: Prisma client not found

**Solution:**
```bash
npm run prisma:generate
```

### Issue: Migration fails

**Solution:**
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or manually apply migrations
npm run prisma:migrate
```

## Email Configuration (Optional)

For testing emails in development:

1. Sign up at [Mailtrap](https://mailtrap.io)
2. Get SMTP credentials from your inbox
3. Update in `.env.local`:
   ```bash
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=your-username
   SMTP_PASS=your-password
   ```

## Next Steps

1. ✅ Development environment is ready
2. Start coding!
3. When ready to deploy, see `RAILWAY_DEPLOYMENT_GUIDE.md`

## Useful Commands

```bash
# Development
npm run dev                    # Start dev server
npm run typecheck              # Type check
npm run prisma:studio          # Open database GUI

# Database
npm run prisma:migrate         # Create & apply migration
npm run prisma:generate        # Regenerate Prisma client
npm run prisma:seed            # Seed database with initial data

# Code Quality
npm run lint                   # Lint code
npm run format                 # Format code

# Testing
npm run test:backend           # Run tests
```

## Environment Setup Complete! 🎉

You're now ready to develop with Railway database!

- **Local Dev**: http://localhost:3001
- **API Docs**: http://localhost:3001/api-docs
- **Database GUI**: `npm run prisma:studio`

See `DEPLOYMENT_QUICKSTART.md` for deployment instructions.
