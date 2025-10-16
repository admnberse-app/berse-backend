# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Berse App Backend** - A comprehensive social networking and trust-building platform backend API for connecting people through authentic relationships, travel experiences, service offerings, and community engagement. Built with Node.js, Express, TypeScript, and Prisma ORM.

**Production URLs:**
- Frontend: https://berse.app
- Backend API: https://api.berse.app
- Health Check: https://api.berse.app/health

**Staging URLs:**
- Frontend: https://staging.berse.app
- Backend API: https://staging-api.berse.app
- Health Check: https://staging-api.berse.app/health

## Common Commands

### Development
```bash
npm run dev                    # Start development server with hot reload
npm run typecheck              # Type check without compilation
npm run build                  # Build for production (rimraf dist && tsc && copy-files)
npm run build:check            # Type check only (tsc --noEmit)
npm start                      # Start production server
npm run start:prod             # Start in production mode with NODE_ENV=production
```

### Database (Prisma)
```bash
npm run prisma:generate        # Generate Prisma client
npm run prisma:migrate         # Run migrations in development
npm run prisma:migrate:prod    # Deploy migrations to production
npm run prisma:studio          # Open Prisma Studio database GUI
npm run prisma:seed            # Seed database with initial data (badges, rewards)
```

### Testing
```bash
npm run test:backend           # Run backend tests with Jest
npm run test:unit              # Run unit tests only
npm run test:integration       # Run integration tests only
npm run test:e2e               # Run end-to-end tests
npm run test:watch             # Run tests in watch mode
npm run test:coverage          # Generate test coverage report
```

### Code Quality
```bash
npm run lint                   # Lint TypeScript files
npm run lint:fix               # Auto-fix linting issues
npm run format                 # Format code with Prettier
```

### Docker
```bash
npm run docker:up              # Start all services in detached mode
npm run docker:down            # Stop all services
npm run docker:rebuild         # Rebuild from scratch (down, build --no-cache, up)
npm run docker:logs            # View logs (follows)
```

### Email System
```bash
npm run test:email             # Test email configuration (scripts/test-email.ts)
npm run setup:email-logo       # Convert logo to base64 for emails
```

## Architecture

### Modular Route Structure

The API uses a **modular route architecture** with two versioned endpoints:

- **V2 (Primary)**: `/v2/*` - Modern, modular API with feature-based organization
- **V1 (Legacy)**: `/api/v1/*` - Older monolithic routes, maintained for backward compatibility

**V2 Module Structure:**
```
src/modules/
├── auth/               # Authentication (register, login, password management)
├── user/               # User profiles, connections, search
├── onboarding/         # Onboarding screens and analytics
└── metadata/           # Countries, regions, timezones
```

Each module contains:
- `*.controller.ts` - Request handlers
- `*.routes.ts` - Route definitions
- `*.validators.ts` - Input validation schemas
- `*.types.ts` - TypeScript type definitions
- `index.ts` - Module exports

### Core Application Flow

1. **Entry Point**: `src/server.ts`
   - Initializes cluster mode in production (multi-worker)
   - Database connection with retry logic
   - Fixes missing membership IDs on startup
   - Graceful shutdown handling

2. **Application Setup**: `src/app.ts`
   - Security middleware (Helmet, CORS, CSRF)
   - Body parsing, compression, logging
   - Static file serving for `/uploads` and `/assets`
   - API documentation (Swagger UI, ReDoc)
   - Route mounting and error handling

3. **Route Mounting Order** (CRITICAL):
   ```typescript
   app.use('/api/v1', apiV1Router);  // Legacy routes
   app.use('/v2', apiV2Router);      // Primary routes
   ```

### Database Schema Architecture

**User System** (Multi-table normalized design):
- `users` - Core user data (email, phone, password, fullName, username)
- `user_profiles` - Extended profile (bio, interests, languages, profession)
- `user_locations` - Location data (city, country, nationality, lat/lon with privacy)
- `user_metadata` - Tracking data (membershipId, referralCode, UTM params)
- `user_security` - Security settings (emailVerifiedAt, mfaEnabled, lockout)
- `user_preferences` - User preferences (darkMode, notifications)
- `user_privacy` - Privacy settings (profileVisibility, consent)
- `user_service_profiles` - Service offerings (isHostAvailable, isGuideAvailable)
- `connection_stats` - Connection metrics (totalConnections, averageRating)
- `profile_completion_status` - Profile completeness tracking

**Key Features:**
- **Connections**: `user_connections` with status (PENDING, ACCEPTED, REJECTED, REMOVED)
- **Trust System**: `vouches` (PRIMARY, SECONDARY, COMMUNITY), `connection_reviews`
- **Events**: `events`, `event_rsvps`, `event_tickets`, `event_ticket_tiers`
- **Gamification**: `point_histories`, `badges`, `user_badges`, `rewards`, `redemptions`
- **Services**: `services`, `service_bookings` (guiding, homestay, etc.)
- **Travel**: `travel_trips`, `travel_locations`, `travel_companions`, `travel_stats`
- **Marketplace**: `marketplace_listings`, `marketplace_orders`, `marketplace_reviews`
- **Payments**: `payment_transactions`, `payment_providers`, `payout_distributions`

**Important Prisma Relation Names:**
Prisma generates verbose relation names for self-referencing tables. Always transform these in responses:
```typescript
// BAD (Prisma default)
user_connections_user_connections_initiatorIdTousers
user_connections_user_connections_receiverIdTousers

// GOOD (transformed)
connectionsInitiated
connectionsReceived
```

Use the `transformUserResponse()` helper in controllers to clean up relation names.

### Authentication & Security

**JWT Token System** (`src/utils/jwt.ts`):
- **Access Token**: 15 minutes (JWT_EXPIRES_IN)
- **Refresh Token**: 365 days (JWT_REFRESH_EXPIRES_IN)
- Token rotation on refresh (family-based revocation)
- httpOnly cookies for refresh tokens
- Token revocation via `refresh_tokens` table

**Activity Logging** (`src/services/activityLogger.service.ts`):
Comprehensive tracking of user activities, security events, sessions, and login attempts:
```typescript
// Log user actions
ActivityLoggerService.logActivity({
  userId, activityType: ActivityType.AUTH_LOGIN,
  entityType: 'user', entityId: userId
});

// Log security events
ActivityLoggerService.logSecurityEvent({
  userId, eventType: 'PASSWORD_CHANGED',
  severity: SecuritySeverity.MEDIUM,
  description: 'User changed their password',
  ...ActivityLoggerService.getRequestMetadata(req)
});

// Create/manage sessions
ActivityLoggerService.createSession({
  userId, ipAddress, userAgent, deviceInfo, locationData
});
```

**Device Tracking**:
- `device_registrations` table tracks trusted devices
- Device fingerprinting via `deviceFingerprint` field
- Push token storage for notifications
- Last seen tracking

**Email Verification** (optional, toggled via `ENABLE_EMAIL_VERIFICATION`):
- Verification tokens stored in `email_verification_tokens`
- SHA-256 hashed tokens for security
- 24-hour expiration
- Welcome email sent on successful verification

### Email System

**Email Queue Service** (`src/services/emailQueue.service.ts`):
- Queue-based email sending (supports background processing)
- Template-based emails (verification, password reset, welcome)
- Retry logic with exponential backoff
- Email templates in `src/utils/emailTemplates.ts`

**Email Templates** (`EmailTemplate` enum):
- `VERIFICATION` - Email verification
- `PASSWORD_RESET` - Password reset link
- `PASSWORD_CHANGED` - Password change confirmation
- `WELCOME` - Welcome email after verification

**Email Configuration**:
- SMTP settings in `.env` (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
- Logo embedded as base64 for email compatibility
- Responsive HTML templates with inline CSS

### Points & Gamification

**Points System** (`src/services/points.service.ts`):
- Automatic point awarding for actions (register, referral, event attendance)
- Point history tracking in `point_histories` table
- User total updated in `users.totalPoints`

**Badge System** (`src/services/badge.service.ts`):
- 13 badge types (FIRST_FACE, CAFE_FRIEND, SUKAN_SQUAD_MVP, etc.)
- Badge criteria evaluated on user actions
- Awards tracked in `user_badges` table

**Membership IDs** (`src/services/membership.service.ts`):
- Format: `BRS-YYYY-XXXXXX` (e.g., BRS-2024-123456)
- Generated on user registration
- Unique constraint enforced
- Startup job fixes missing IDs

### Geospatial Features

**Location Privacy** (`src/utils/geospatial.ts`):
- Privacy levels: `public`, `friends`, `private`
- Haversine distance calculation
- Bounding box filtering for efficient queries
- Nearby user search with privacy controls
- Last location update tracking

**Nearby Users** (`GET /v2/users/nearby`):
```typescript
// Requires latitude, longitude, radius (1-500km)
// Respects locationPrivacy setting
// Returns distance in meters/kilometers
// Shows full location only if:
//   - locationPrivacy === 'public' OR
//   - locationPrivacy === 'friends' AND users are connected
```

## Important Patterns & Conventions

### Error Handling

Use `AppError` class for consistent error responses:
```typescript
import { AppError } from '../../middleware/error';

throw new AppError('User not found', 404);
throw new AppError('Invalid credentials', 401);
```

**Error Handler** (`src/middleware/error.ts`):
- `errorHandler` - Global error middleware
- `notFoundHandler` - 404 handler
- Automatic logging via Winston

### Response Format

Use `sendSuccess()` for consistent response structure:
```typescript
import { sendSuccess } from '../../utils/response';

sendSuccess(res, data, 'Success message', 201);
// Returns: { success: true, message: '...', data: {...} }
```

### Async Handling

All async route handlers use `asyncHandler` wrapper to catch errors:
```typescript
import asyncHandler from '../../utils/asyncHandler';

router.get('/profile', asyncHandler(async (req, res) => {
  // Errors automatically caught and passed to error middleware
}));
```

### Input Validation

Use `express-validator` for request validation:
```typescript
// In *.validators.ts files
export const registerValidator = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('fullName').trim().notEmpty(),
];
```

Validate in routes:
```typescript
router.post('/register', registerValidator, AuthController.register);
```

### Database Transactions

Use Prisma transactions for multi-table operations:
```typescript
await prisma.$transaction(async (tx) => {
  await tx.user.update({ where: { id }, data: userUpdate });
  await tx.userProfile.upsert({ where: { userId }, update: profileUpdate, create: {...} });
  return tx.user.findUnique({ where: { id } });
});
```

### Username Generation

Usernames are auto-generated if not provided during registration:
```typescript
// Format: firstname_lastname_randomnumber (e.g., john_doe_1234)
// Falls back to timestamp if collision after 10 attempts
// Max length: 20 characters
```

### Referral System

**Referral Code Format**: 3 letters + 4 numbers (e.g., ABC1234)
- Generated on registration
- Stored in `user_metadata.referralCode`
- Referrer awarded points when referee signs up
- Tracked via `referrals` table

### Profile Completion Tracking

`profile_completion_status` table tracks:
- Completion score (0-100%)
- Completion level (starter, basic, intermediate, complete, expert)
- Individual field flags (hasProfilePicture, hasBio, etc.)
- Missing fields recommendations
- Points earned for completion milestones

## Testing & Development

### API Documentation

**Access Points**:
- Swagger UI: `http://localhost:3001/api-docs`
- ReDoc: `http://localhost:3001/docs`
- OpenAPI JSON: `http://localhost:3001/api-docs.json`

**Quick Test Flow**:
1. Start server: `npm run dev`
2. Open Swagger UI: http://localhost:3001/api-docs
3. Test `POST /v2/auth/register` to create a user
4. Copy `accessToken` from response
5. Click "Authorize" button, enter: `Bearer <token>`
6. Test protected endpoints

### Environment Variables

**Development (.env.local)**:
- `NODE_ENV=development`
- `DATABASE_URL` - Railway dev database connection string
- `JWT_SECRET` - Development secret (can be simple for dev)
- `CORS_ORIGIN=http://localhost:3000,http://localhost:5173`
- `ENABLE_EMAIL_VERIFICATION=false` - Disabled for dev
- `FRONTEND_URL=http://localhost:5173`

**Staging (Railway)**:
- `NODE_ENV=staging`
- `DATABASE_URL=${{Postgres.DATABASE_URL}}` - Auto-filled by Railway
- `JWT_SECRET` - Unique staging secret (64+ chars)
- `JWT_REFRESH_SECRET` - Unique staging secret (64+ chars)
- `CORS_ORIGIN=https://staging.berse.app,https://staging-api.berse.app`
- `ENABLE_EMAIL_VERIFICATION=true`
- `FRONTEND_URL=https://staging.berse.app`
- `API_URL=https://staging-api.berse.app`

**Production (Railway)**:
- `NODE_ENV=production`
- `DATABASE_URL=${{Postgres.DATABASE_URL}}` - Auto-filled by Railway
- `JWT_SECRET` - Unique production secret (64+ chars, different from staging!)
- `JWT_REFRESH_SECRET` - Unique production secret (64+ chars)
- `COOKIE_SECRET` - 32+ character secret
- `CORS_ORIGIN=https://berse.app,https://api.berse.app`
- `ENABLE_EMAIL_VERIFICATION=true`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email configuration
- `FRONTEND_URL=https://berse.app`
- `API_URL=https://api.berse.app`

**Optional Features**:
- `ENABLE_SMS_VERIFICATION` - Enable SMS verification (default: false)
- `ENABLE_MFA` - Enable multi-factor authentication (default: false)
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` - Redis for caching/sessions
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default: 100)
- `RATE_LIMIT_WINDOW_MS` - Window duration in ms (default: 900000 / 15 min)

**Important**: Never use the same secrets across environments!

### Test Scripts in Root Directory

Several test scripts are available for endpoint verification:
- `test-auth-endpoints.ts` - Test authentication flow
- `test-user-endpoints.ts` - Test user profile operations
- `test-activity-endpoints.ts` - Test activity logging
- `test-onboarding-endpoints.ts` - Test onboarding flow
- `test-complete-login.ts` - Full login flow with device tracking

Run with: `ts-node <script-name>.ts`

### Logging

**Winston Logger** (`src/utils/logger.ts`):
- Development: Console output with colors
- Production: Daily rotating log files (`logs/` directory)
- Log levels: error, warn, info, debug
- HTTP request logging via Morgan

## Key Files Reference

### Core Application
- `src/server.ts` - Server initialization, clustering, graceful shutdown
- `src/app.ts` - Express app configuration, middleware, routes
- `src/config/index.ts` - Environment variable validation (Zod schemas)
- `src/config/database.ts` - Prisma client initialization
- `src/config/swagger.ts` - Swagger/OpenAPI configuration

### Authentication
- `src/modules/auth/auth.controller.ts` - Auth handlers (register, login, password reset)
- `src/modules/auth/auth.routes.ts` - Auth routes
- `src/modules/auth/auth.validators.ts` - Auth input validation
- `src/utils/jwt.ts` - JWT token management (generation, rotation, revocation)
- `src/utils/auth.ts` - Password hashing utilities
- `src/middleware/auth.ts` - Auth middleware (token verification)

### User Management
- `src/modules/user/user.controller.ts` - User CRUD, connections, search, nearby users
- `src/modules/user/user.routes.ts` - User routes
- `src/modules/user/user.validators.ts` - User input validation

### Services
- `src/services/activityLogger.service.ts` - Activity, security, session tracking
- `src/services/email.service.ts` - Email sending (Nodemailer)
- `src/services/emailQueue.service.ts` - Email queue management
- `src/services/points.service.ts` - Points awarding and tracking
- `src/services/badge.service.ts` - Badge awarding
- `src/services/membership.service.ts` - Membership ID generation
- `src/services/mfa.service.ts` - Multi-factor authentication

### Utilities
- `src/utils/logger.ts` - Winston logger
- `src/utils/response.ts` - Standardized API responses
- `src/utils/emailTemplates.ts` - HTML email templates
- `src/utils/geospatial.ts` - Distance calculation, bounding box, privacy
- `src/utils/asyncHandler.ts` - Async error handling wrapper

### Middleware
- `src/middleware/error.ts` - Error handling middleware
- `src/middleware/validation.ts` - Security validation middleware
- `src/middleware/rateLimiter.ts` - Rate limiting (currently disabled)
- `src/middleware/csrf.ts` - CSRF protection
- `src/middleware/upload.ts` - File upload handling (Multer)

## Deployment

### Railway (All Environments)

**Three Environments:**
1. **Development**: Local dev with Railway PostgreSQL database
2. **Staging**: Auto-deploys from `staging` branch
3. **Production**: Auto-deploys from `main` branch

**Services:**
- `berse-production` - Production backend + frontend (from `main` branch)
- `berse-staging` - Staging backend + frontend (from `staging` branch)
- `berse-dev-database` - PostgreSQL database for local development

**Auto-Deployment Flow:**
```bash
# Push to staging
git push origin staging
# → Railway automatically builds and deploys to staging

# Merge staging to main (via PR)
git push origin main
# → Railway automatically builds and deploys to production
```

**Build & Start:**
- Build: `npm run railway:build` (builds backend + frontend)
- Start: `npm run railway:start` (runs migrations → starts server)
- Cluster mode enabled in production (multi-worker)

### Database Strategy

**Development:**
- Use Railway PostgreSQL database (no local database needed)
- Connection string in `.env.local`
- Run migrations: `npm run prisma:migrate`

**Staging/Production:**
- Separate PostgreSQL databases on Railway
- Migrations run automatically on deployment via `railway:start` script
- Manual migration: `railway run npm run prisma:migrate:prod`

### Database Migrations

```bash
# Development: Create and apply migration
npm run prisma:migrate

# Staging/Production: Applied automatically on deployment
# Or manually:
railway link  # Select service
railway run npm run prisma:migrate:prod
```

**Migration Best Practices**:
- Always commit migration files to git
- Test migrations on staging before production
- Use descriptive migration names
- Review generated SQL before applying
- Migrations run automatically on Railway deployment

**Deployment Checklist:**
1. Make changes locally with Railway dev database
2. Create migration: `npm run prisma:migrate`
3. Commit including `prisma/migrations/` folder
4. Push to `staging` branch → auto-deploys
5. Test on staging environment
6. Create PR: `staging` → `main`
7. Merge PR → auto-deploys to production

See `RAILWAY_DEPLOYMENT_GUIDE.md` for complete setup instructions.

## Code Quality Standards

### TypeScript
- Strict mode enabled
- No implicit any
- Explicit return types on exported functions
- Interface over type for object shapes

### File Naming
- Controllers: `*.controller.ts`
- Routes: `*.routes.ts`
- Services: `*.service.ts`
- Validators: `*.validators.ts`
- Types: `*.types.ts`
- Utilities: camelCase (e.g., `emailTemplates.ts`)

### Import Organization
```typescript
// 1. External packages
import { Router } from 'express';
import { prisma } from '../../config/database';

// 2. Internal utilities/services
import { sendSuccess } from '../../utils/response';
import { ActivityLoggerService } from '../../services/activityLogger.service';

// 3. Local imports
import { AuthRequest } from './auth.types';
```

### Controller Patterns
- Static class methods for route handlers
- First parameter: `req` (typed as `Request` or `AuthRequest`)
- Second parameter: `res: Response`
- Third parameter: `next: NextFunction`
- Use try-catch and pass errors to `next(error)`
- Transform Prisma relation names before returning responses

### Route Patterns
```typescript
import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { UserController } from './user.controller';
import { updateProfileValidator } from './user.validators';

const router = Router();

// Public routes
router.get('/:id', UserController.getUserById);

// Protected routes (require authentication)
router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, updateProfileValidator, UserController.updateProfile);

export const userRoutes = router;
```

## Common Issues & Solutions

### Missing Membership IDs
If users are created without membership IDs:
```typescript
// Run on startup (already implemented)
await MembershipService.fixMissingMembershipIds();

// Or manually fix a specific user
await MembershipService.ensureMembershipId(userId);
```

### Prisma Relation Names
Always transform verbose Prisma relation names:
```typescript
private static transformUserResponse(user: any) {
  if (user && user._count) {
    const {
      user_connections_user_connections_initiatorIdTousers,
      user_connections_user_connections_receiverIdTousers,
      ...otherCounts
    } = user._count;

    user._count = {
      ...otherCounts,
      connectionsInitiated: user_connections_user_connections_initiatorIdTousers || 0,
      connectionsReceived: user_connections_user_connections_receiverIdTousers || 0,
    };
  }
  return user;
}
```

### Database Connection Issues
- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Server retries connection 5 times on startup
- Falls back to exit if connection fails

### Email Sending Issues
- Check SMTP credentials in `.env`
- Test with: `npm run test:email`
- Check logs for email queue errors
- Verify FROM_EMAIL is set

### Rate Limiting (when enabled)
- Currently disabled for testing (`app.ts` line 94)
- Enable by uncommenting: `app.use('/api/', generalLimiter);`
- Configure limits in `.env` (RATE_LIMIT_*)

## Documentation References

Key documentation files in `/docs`:
- `API_DOCS_QUICK_REF.md` - Quick API reference and Swagger guide
- `EMAIL_SERVICE.md` - Email system architecture
- `PASSWORD_MANAGEMENT.md` - Password reset flow
- `ACTIVITY_LOGGING_SYSTEM.md` - Activity tracking documentation
- `GEOSPATIAL_PRIVACY_CACHING.md` - Location privacy system

For feature planning:
- `trust-chain-integration-plan.md` - Trust system design
- `travel-logbook-user-journey.md` - Travel features
- `offerings-erd.md` - Service offerings data model

## Additional Notes

### Cluster Mode
- Production runs in cluster mode (multi-worker)
- One worker per CPU core
- Workers auto-restart on crash
- Primary process manages workers

### Static File Serving
- `/uploads` - User-uploaded files (avatars, event images)
- `/assets` - Read-only public assets (logos, static images)
- Both have security restrictions (file type validation, no directory listing)

### Email Logo Embedding
Logos are embedded as base64 in emails for compatibility:
```bash
npm run setup:email-logo  # Converts logo to base64
```

### Graceful Shutdown
Server handles SIGTERM/SIGINT:
1. Stops accepting new requests
2. Closes database connections
3. Waits up to 30 seconds for pending requests
4. Force exit if timeout exceeded

### Frontend Integration
Frontend code lives in `/frontend` directory (React + Vite):
- Separate build process
- Auto-deployed to Netlify
- Communicates with backend via CORS-enabled API

### Job Scheduling
Profile completion reminder job is currently disabled:
```typescript
// TEMPORARILY DISABLED - Job needs schema compliance updates
// See src/jobs/profileCompletionReminders.ts
```

## Quick Start for New Developers

1. **Install Railway CLI**:
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Get Development Database**:
   ```bash
   # Link to dev database service
   railway link  # Select: berse-dev-database
   railway variables  # Copy DATABASE_URL
   ```

3. **Setup Local Environment**:
   ```bash
   npm install
   cp .env.example .env.local
   # Edit .env.local and add DATABASE_URL from Railway
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   mkdir uploads
   ```

4. **Run Development Server**:
   ```bash
   npm run dev  # Starts on port 3001
   ```

5. **Test API**:
   - Open http://localhost:3001/api-docs
   - Register a user
   - Copy access token
   - Click "Authorize" and paste token
   - Test protected endpoints

6. **Database GUI**:
   ```bash
   npm run prisma:studio  # Opens at http://localhost:5555
   ```

7. **Make Changes & Deploy**:
   - Add routes in `src/modules/`
   - Add services in `src/services/`
   - Update Prisma schema in `prisma/schema.prisma`
   - Create migration: `npm run prisma:migrate`
   - Commit changes (include migration files!)
   - Push to `staging` branch for testing
   - Create PR to `main` for production

**No local PostgreSQL needed!** Use Railway database for all development.
