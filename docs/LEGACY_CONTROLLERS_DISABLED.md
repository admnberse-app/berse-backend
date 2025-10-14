# Legacy Controllers - Temporarily Disabled

## Status: October 14, 2025

The legacy controllers have been temporarily disabled to allow the server to start with the new schema-compliant v2 modules.

## What's Working ✅

### Server
- ✅ Server starts successfully on port 3000
- ✅ Database connection established
- ✅ Membership ID generation working
- ✅ Email service ready

### V2 API Endpoints (Schema-Compliant)
All v2 endpoints are fully functional at `/v2/*` and `/api/v1/*` (using v2 modules):

#### Authentication (`/v2/auth` or `/api/v1/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/verify-email` - Verify email address
- `POST /auth/resend-verification` - Resend verification email

#### Users (`/v2/users` or `/api/v1/users`)
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update user profile
- `GET /users/search` - Search users
- `GET /users/:id` - Get user by ID
- `POST /users/connection-request` - Send connection request (replaced follow)
- `POST /users/accept-connection/:connectionId` - Accept connection
- `POST /users/reject-connection/:connectionId` - Reject connection
- `POST /users/cancel-connection/:connectionId` - Cancel pending connection
- `DELETE /users/remove-connection/:connectionId` - Remove connection
- `GET /users/connections` - Get user connections

## What's Disabled 🚫

### Legacy Controllers (Not Schema-Compliant)
The following controllers have schema compliance issues and are temporarily disabled:

1. **Event Controller** (`src/controllers/event.controller.ts`)
   - Trying to access `profilePicture`, `bio`, `city` directly on User model
   - Missing relation includes for `rsvps`, `host`, `_count`
   - 19+ TypeScript errors

2. **Community Controller** (`src/controllers/community.controller.ts`)
   - Schema compliance not verified

3. **Matching Controller** (`src/controllers/matching.controller.ts`)
   - Schema compliance not verified

4. **Card Game Controller** (`src/controllers/cardgame.controller.ts`)
   - Direct access to `profilePicture` on User model (3 instances)

5. **Message Controller** (`src/controllers/message.controller.ts`)
   - Schema compliance not verified

6. **Email Controller** (`src/controllers/email.controller.ts`)
   - Schema compliance not verified

7. **Badge Controller** (`src/controllers/badge.controller.ts`)
   - Schema compliance not verified

8. **Points Controller** (`src/controllers/points.controller.ts`)
   - Schema compliance not verified

9. **Rewards Controller** (`src/controllers/rewards.controller.ts`)
   - Schema compliance not verified

10. **Notification Controller** (`src/controllers/notification.controller.ts`)
    - Schema compliance not verified

### Legacy Jobs
- **Profile Completion Reminders** (`src/jobs/profileCompletionReminders.ts`)
  - Trying to access profile fields directly on User model
  - 10+ TypeScript errors

## Schema Changes That Broke Legacy Code

The new normalized Prisma schema moved fields from the `User` model to related models:

### UserProfile Model
- `profilePicture`
- `bio`
- `shortBio`
- `coverPhoto`

### UserLocation Model
- `city`
- `currentCity`
- `homeTown`
- `country`
- `coordinates`

### UserMetadata Model
- `membershipId` (newly added)
- `referralCode`
- `lifetimeValue`
- `tags`
- `notes`

### UserServiceProfile Model
- `isHostCertified`
- `isHostAvailable`
- `isGuideAvailable`

### UserConnection Model (New)
Replaced the old follow/unfollow system:
- Proper bidirectional relationships
- Connection status: PENDING, ACCEPTED, REJECTED, CANCELED, REMOVED
- Connection metadata

## How to Access Fields Now

### Before (Legacy - Broken)
```typescript
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    fullName: true,
    profilePicture: true, // ❌ WRONG
    bio: true,             // ❌ WRONG
    city: true,            // ❌ WRONG
  }
});
```

### After (Schema-Compliant)
```typescript
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    fullName: true,
    profile: {
      select: {
        profilePicture: true, // ✅ CORRECT
        bio: true,            // ✅ CORRECT
      }
    },
    location: {
      select: {
        currentCity: true,    // ✅ CORRECT
      }
    }
  }
});

// Access: user.profile.profilePicture, user.location.currentCity
```

## Files Modified to Disable Legacy Code

### `/src/routes/api/v1/index.ts`
Commented out all legacy route imports:
- `eventsRouter`
- `communitiesRouter`
- `matchingRouter`
- `pushRouter`
- `cardgameRouter`
- `messagesRouter`
- `emailRouter`

Updated `/api/v1/docs` endpoint to show migration status.

### `/src/server.ts`
Commented out:
- Import of `initializeProfileReminderJob`
- Job initialization code

## Next Steps (TODO)

### High Priority
1. ✅ V2 auth module - COMPLETE
2. ✅ V2 user module - COMPLETE
3. 🔨 Update event controller for schema compliance
4. 🔨 Update matching controller for schema compliance
5. 🔨 Update community controller for schema compliance

### Medium Priority
6. 🔨 Update cardgame controller
7. 🔨 Update message controller
8. 🔨 Update notification controller
9. 🔨 Fix profile completion reminder job

### Low Priority
10. 🔨 Update email controller
11. 🔨 Update badge controller
12. 🔨 Update points controller
13. 🔨 Update rewards controller

## Migration Guide

See these documents for detailed migration information:
- `/docs/V2_CONNECTION_SYSTEM_UPDATE.md` - UserConnection system
- `/docs/PRISMA_SCHEMA_REFERENCE.md` - Quick schema reference
- `/docs/SCHEMA_FIXES_NEEDED.md` - Comprehensive fix guide
- `/docs/api/AUTH_API.md` - V2 auth documentation
- `/docs/api/USER_API.md` - V2 user documentation

## Testing V2 Endpoints

The server is running on `http://localhost:3000`

Test auth:
```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","fullName":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

Or use v2 paths:
```bash
curl -X POST http://localhost:3000/v2/auth/register ...
curl -X POST http://localhost:3000/v2/auth/login ...
```

## Benefits of This Approach

1. **Server Can Start** - No blocking TypeScript errors
2. **V2 API Works** - Schema-compliant auth and user endpoints functional
3. **Backward Compatible** - V1 paths still work for auth/users
4. **Clear Migration Path** - Legacy code preserved, not deleted
5. **Safe Testing** - Can test v2 endpoints while fixing legacy controllers
6. **Documentation** - Clear status of what works and what doesn't

## Rollback Plan

If needed, uncomment the imports in:
1. `/src/routes/api/v1/index.ts` - Restore route imports
2. `/src/server.ts` - Restore job initialization

Note: Server won't start until schema compliance issues are fixed!
