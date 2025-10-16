#!/bin/bash

# =============================================================================
# Railway Development Setup Script
# =============================================================================
# This script helps you set up your local development environment
# with Railway PostgreSQL database
# =============================================================================

set -e  # Exit on error

echo "🚀 Setting up Railway Development Environment..."
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found!"
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
    echo "✅ Railway CLI installed"
fi

# Login to Railway
echo "🔐 Logging in to Railway..."
railway login

# List projects
echo ""
echo "📋 Available Railway projects:"
railway list

# Link to dev database
echo ""
echo "🔗 Link to your Railway development database service..."
echo "   Select: berse-dev-database"
railway link

# Get DATABASE_URL
echo ""
echo "📝 Fetching DATABASE_URL..."
echo "   (This will open an interactive prompt)"
railway variables

echo ""
echo "📋 Please copy the DATABASE_URL value from above"
read -p "Paste DATABASE_URL here: " DB_URL

if [ -z "$DB_URL" ]; then
    echo "⚠️  No DATABASE_URL provided. Exiting."
    exit 1
fi

# Create .env.local file
echo ""
echo "📄 Creating .env.local file..."
cat > .env.local << EOF
# =============================================================================
# DEVELOPMENT ENVIRONMENT - AUTO-GENERATED
# =============================================================================
# Generated on: $(date)
# =============================================================================

# Environment
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001

# Database (Railway Dev Database)
DATABASE_URL="${DB_URL}"
DATABASE_MAX_CONNECTIONS=20

# JWT Secrets (Development Only)
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
COOKIE_SECRET=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Redis (Optional - comment out if not using)
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=
# REDIS_DB=0

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

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=500
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_AUTH_MAX=20
RATE_LIMIT_LOGIN_MAX=10
EOF

echo "✅ .env.local created"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
npm run prisma:generate

# Create uploads directory
echo ""
echo "📁 Creating uploads directory..."
mkdir -p uploads

# Run migrations
echo ""
echo "🗄️  Running database migrations..."
npm run prisma:migrate

# Seed database
echo ""
read -p "Do you want to seed the database with initial data? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    npm run prisma:seed
    echo "✅ Database seeded"
fi

# Success message
echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Update email configuration in .env.local (SMTP_* variables)"
echo "   2. Start development server: npm run dev"
echo "   3. Open API docs: http://localhost:3001/api-docs"
echo "   4. Open Prisma Studio: npm run prisma:studio"
echo ""
echo "🔗 Useful commands:"
echo "   npm run dev              # Start dev server"
echo "   npm run typecheck        # Check TypeScript"
echo "   npm run prisma:studio    # Open database GUI"
echo "   railway logs             # View Railway logs"
echo ""
echo "📖 See RAILWAY_DEPLOYMENT_GUIDE.md for deployment instructions"
echo ""
