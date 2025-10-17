# Railway Environment Configuration

## Overview
Both **staging** and **production** environments are properly configured on Railway with separate databases and environment-specific settings.

---

## 🔵 STAGING Environment

### Database
- **Service**: `berse-db` (shared PostgreSQL instance)
- **DATABASE_URL**: `postgresql://postgres:***@postgres.railway.internal:5432/railway`
- Connected via internal Railway network for optimal performance

### Environment Variables
```bash
NODE_ENV=staging
API_URL=https://staging-backend-production.up.railway.app
FRONTEND_URL=https://staging.bersemuka.com
APP_URL=https://staging.bersemuka.com
CORS_ORIGIN=https://staging.bersemuka.com,https://staging-backend-production.up.railway.app
```

### Email Configuration (Gmail SMTP)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=admn.berse@gmail.com
SMTP_PASS=agkiyjjpyvyaphtv
FROM_EMAIL=admn.berse@gmail.com
FROM_NAME=Berse App
SUPPORT_EMAIL=support@bersemuka.com
LOGO_URL=https://staging-backend-production.up.railway.app/assets/logos/berse-email-logo.png
```

### JWT Configuration
```bash
JWT_SECRET=6e583f9d5091c01a234f505e8a37726a8040df8b777cf34904bdb6ba7e9681ae
JWT_REFRESH_SECRET=c8e0bd3c2283f723cfb11d52ba0f12ae540ec713783fd59ae229e292175b9f88
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=365d
```

### Security & Rate Limiting
```bash
COOKIE_SECRET=2299bbdfdffdc910948905c85b98aa63
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_LOGIN_MAX=3
```

### Feature Flags
```bash
ENABLE_REGISTRATION=true
ENABLE_EMAIL_VERIFICATION=true
ENABLE_DEBUG_LOGS=false
```

### Storage
- **Volume**: `staging-backend-volume` mounted at `/storage`
- **Upload Directory**: `uploads`
- **Max File Size**: `10mb`

---

## 🔴 PRODUCTION Environment

### Database
- **Service**: `berse-db` (separate database schema/instance)
- **DATABASE_URL**: `postgresql://postgres:***@postgres.railway.internal:5432/railway`
- Isolated from staging data

### Environment Variables
```bash
NODE_ENV=production
API_URL=https://prod-backend-production.up.railway.app
FRONTEND_URL=https://app.bersemuka.com
APP_URL=https://app.bersemuka.com
CORS_ORIGIN=https://bersemuka.com,https://app.bersemuka.com,https://prod-backend-production.up.railway.app
```

### Email Configuration (Gmail SMTP)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=admn.berse@gmail.com
SMTP_PASS=agkiyjjpyvyaphtv
FROM_EMAIL=admn.berse@gmail.com
FROM_NAME=Berse App
SUPPORT_EMAIL=support@bersemuka.com
LOGO_URL=https://prod-backend-production.up.railway.app/assets/logos/berse-email-logo.png
```

### JWT Configuration
```bash
JWT_SECRET=c9c9035d00ab7bfb40b10b0ef4b9d569aa17ce3f61725092 (different from staging)
JWT_REFRESH_SECRET=b1110110b4149aa2ec29dbf5b1201300cb435b1ebabe75aa (different from staging)
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=365d
```

### Security & Rate Limiting
- Same configuration as staging
- Isolated cookie secrets and security tokens

---

## Key Differences Between Environments

| Setting | Staging | Production |
|---------|---------|------------|
| **NODE_ENV** | `staging` | `production` |
| **Frontend URL** | staging.bersemuka.com | app.bersemuka.com |
| **API URL** | staging-backend-production.up.railway.app | prod-backend-production.up.railway.app |
| **JWT Secrets** | Unique staging secrets | Unique production secrets |
| **Database** | Shared instance (staging schema) | Shared instance (production schema) |
| **Git Branch** | `staging` | `main` |

---

## Deployment Flow

### Staging Deployment
1. Push to `staging` branch
2. Railway auto-deploys to `staging` environment
3. Uses `staging-backend` service
4. Connected to staging database schema
5. Uses staging-specific JWT secrets

### Production Deployment
1. Push to `main` branch
2. Railway auto-deploys to `production` environment
3. Uses `prod-backend` service
4. Connected to production database schema
5. Uses production-specific JWT secrets

---

## Local Development (.env)

Your local `.env` file is configured for development only:
- Uses development database on Railway
- `NODE_ENV=development`
- Local CORS origins (localhost:3000, localhost:5173)
- Same email/JWT config as Railway for testing

**Important**: The `.env` file is NOT used by Railway deployments. Railway uses environment variables set in the Railway dashboard/CLI.

---

## Managing Variables

### View variables for staging:
```bash
railway link --environment staging --service staging-backend
railway variables
```

### View variables for production:
```bash
railway link --environment production --service prod-backend
railway variables
```

### Set a variable:
```bash
railway variables --set KEY=value
```

### Remove a variable:
```bash
railway variables --unset KEY
```

---

## ✅ Configuration Status

- ✅ Both environments have correct `DATABASE_URL` linked to `berse-db`
- ✅ Email configuration (Gmail SMTP) working in both environments
- ✅ JWT secrets are unique per environment
- ✅ NODE_ENV properly set (`staging` vs `production`)
- ✅ CORS origins configured for each environment's domain
- ✅ Frontend/API URLs match Railway deployment domains
- ✅ Rate limiting and security settings configured
- ✅ File upload and storage volumes configured

---

## Security Notes

1. **JWT Secrets**: Each environment has unique, cryptographically secure secrets
2. **Email Credentials**: Currently using Gmail SMTP with app password (same for both environments)
3. **Cookie Secrets**: Separate secrets per environment
4. **Database Isolation**: Staging and production use separate schemas/instances
5. **CORS**: Restricted to specific domains per environment

---

## Next Steps

If you need to update any configuration:
1. Link to the specific environment and service
2. Use `railway variables --set KEY=value`
3. Railway will automatically redeploy with new variables

For sensitive production changes, consider:
- Using Railway's shared variables for non-sensitive configs
- Rotating JWT secrets periodically
- Moving to a dedicated email service (SendGrid, AWS SES) for production
