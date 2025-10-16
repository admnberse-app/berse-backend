# Activity & Security Endpoints Fix

## Issue Summary
The following endpoints were not working as expected:
- `GET /v2/users/activity` - User activity history
- `GET /v2/users/security-events` - Security events
- `GET /v2/users/sessions` - Active sessions
- `GET /v2/users/login-history` - Login history
- `DELETE /v2/users/sessions/:sessionToken` - Terminate session

## Root Cause
**Route Order Conflict**: The specific activity/security routes were defined AFTER the dynamic `/:id` route in the Express router. This caused Express to treat paths like `/activity` as user IDs and route them to the `getUserById` handler instead of the intended handlers.

### Before (Incorrect Order)
```typescript
// ... other routes ...
router.get('/:id', UserController.getUserById);  // ❌ This catches everything!

// These routes were unreachable:
router.get('/activity', UserController.getUserActivity);
router.get('/security-events', UserController.getUserSecurityEvents);
router.get('/sessions', UserController.getUserSessions);
router.get('/login-history', UserController.getUserLoginHistory);
router.delete('/sessions/:sessionToken', UserController.terminateSession);
```

## Fix Applied

### 1. Route Reordering
Moved all specific routes BEFORE the dynamic `/:id` route in `src/modules/user/user.routes.ts`:

```typescript
// ✅ Specific routes FIRST
router.get('/activity', UserController.getUserActivity);
router.get('/security-events', UserController.getUserSecurityEvents);
router.get('/sessions', UserController.getUserSessions);
router.get('/login-history', UserController.getUserLoginHistory);
router.delete('/sessions/:sessionToken', UserController.terminateSession);

// ✅ Dynamic route LAST
router.get('/:id', UserController.getUserById);
```

### 2. Files Modified
- `src/modules/user/user.routes.ts` - Reordered route definitions

### 3. Files Already Working
- `src/modules/user/user.controller.ts` - All controller methods were correctly implemented
- `src/services/activityLogger.service.ts` - Service was complete and functional
- `prisma/schema.prisma` - Database models exist:
  - `UserActivity`
  - `SecurityEvent`
  - `UserSession`
  - `LoginAttempt`

## Endpoint Details

### 1. GET /v2/users/activity
Get authenticated user's activity history

**Query Parameters:**
- `limit` (optional, default: 50) - Number of activities to return
- `offset` (optional, default: 0) - Number of activities to skip

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "string",
        "userId": "string",
        "activityType": "AUTH_LOGIN",
        "entityType": "user",
        "entityId": "string",
        "visibility": "private",
        "createdAt": "2025-10-15T14:20:19.000Z"
      }
    ],
    "pagination": {
      "limit": 50,
      "offset": 0,
      "total": 100,
      "pages": 2
    }
  },
  "message": "User activity retrieved successfully"
}
```

### 2. GET /v2/users/security-events
Get authenticated user's security event history

**Query Parameters:**
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "string",
        "userId": "string",
        "eventType": "LOGIN_SUCCESS",
        "severity": "low",
        "description": "Successful login",
        "metadata": {},
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2025-10-15T14:20:19.000Z"
      }
    ],
    "pagination": {
      "limit": 50,
      "offset": 0,
      "total": 25,
      "pages": 1
    }
  },
  "message": "Security events retrieved successfully"
}
```

### 3. GET /v2/users/sessions
Get all active sessions for the authenticated user

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "string",
        "userId": "string",
        "sessionToken": "abc123...",
        "deviceInfo": {},
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "locationData": {},
        "isActive": true,
        "lastActivityAt": "2025-10-15T14:20:19.000Z",
        "expiresAt": "2025-11-14T14:20:19.000Z",
        "createdAt": "2025-10-15T14:20:19.000Z"
      }
    ]
  },
  "message": "Active sessions retrieved successfully"
}
```

### 4. GET /v2/users/login-history
Get authenticated user's login attempt history

**Query Parameters:**
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "loginHistory": [
      {
        "id": "string",
        "userId": "string",
        "identifier": "user@example.com",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "success": true,
        "failureReason": null,
        "attemptedAt": "2025-10-15T14:20:19.000Z"
      }
    ],
    "pagination": {
      "limit": 50,
      "offset": 0,
      "total": 150,
      "pages": 3
    }
  },
  "message": "Login history retrieved successfully"
}
```

### 5. DELETE /v2/users/sessions/:sessionToken
Terminate a specific active session

**URL Parameters:**
- `sessionToken` (required) - The session token to terminate

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Session terminated successfully"
}
```

## Testing

### Prerequisites
1. Server running on port 3000
2. Valid authentication token

### Quick Test with curl

```bash
# 1. Login to get token
curl -X POST http://localhost:3000/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# 2. Test activity endpoint (replace TOKEN with actual token)
curl -X GET http://localhost:3000/v2/users/activity \
  -H "Authorization: Bearer TOKEN"

# 3. Test security events
curl -X GET http://localhost:3000/v2/users/security-events \
  -H "Authorization: Bearer TOKEN"

# 4. Test sessions
curl -X GET http://localhost:3000/v2/users/sessions \
  -H "Authorization: Bearer TOKEN"

# 5. Test login history
curl -X GET http://localhost:3000/v2/users/login-history \
  -H "Authorization: Bearer TOKEN"

# 6. Terminate a session
curl -X DELETE http://localhost:3000/v2/users/sessions/SESSION_TOKEN \
  -H "Authorization: Bearer TOKEN"
```

### Using the Test Script

A test script has been created at `test-activity-endpoints.ts`:

```bash
# Update the test credentials in the file first
npx ts-node test-activity-endpoints.ts
```

## Activity Types
The system logs various activity types (from `ActivityLoggerService`):

### Authentication Activities
- `AUTH_REGISTER` - User registration
- `AUTH_LOGIN` - User login
- `AUTH_LOGOUT` - User logout
- `AUTH_LOGOUT_ALL` - Logout from all devices
- `AUTH_TOKEN_REFRESH` - Token refresh
- `AUTH_PASSWORD_CHANGE` - Password change
- `AUTH_PASSWORD_RESET_REQUEST` - Password reset request
- `AUTH_PASSWORD_RESET_COMPLETE` - Password reset complete
- `AUTH_EMAIL_VERIFY_REQUEST` - Email verification request
- `AUTH_EMAIL_VERIFY_COMPLETE` - Email verification complete
- `AUTH_MFA_ENABLE` - MFA enabled
- `AUTH_MFA_DISABLE` - MFA disabled

### Profile Activities
- `PROFILE_UPDATE` - Profile updated
- `PROFILE_PICTURE_UPDATE` - Profile picture updated
- `PROFILE_VIEW` - Profile viewed
- `PROFILE_DELETE` - Profile deleted

### Connection Activities
- `CONNECTION_REQUEST_SEND` - Connection request sent
- `CONNECTION_REQUEST_ACCEPT` - Connection request accepted
- `CONNECTION_REQUEST_REJECT` - Connection request rejected
- `CONNECTION_REMOVE` - Connection removed

### Security Events
- `LOGIN_SUCCESS` - Successful login
- `LOGIN_FAILED` - Failed login attempt
- `BRUTE_FORCE_ATTEMPT` - Multiple failed login attempts detected
- `SECURITY_SESSION_TERMINATE` - Session terminated
- `SECURITY_SUSPICIOUS_LOGIN` - Suspicious login activity
- `SECURITY_ACCOUNT_LOCK` - Account locked
- `SECURITY_ACCOUNT_UNLOCK` - Account unlocked

## Severity Levels
Security events are categorized by severity:
- `low` - Normal operations (successful login, etc.)
- `medium` - Notable events (password change, etc.)
- `high` - Suspicious activity (brute force attempts, etc.)
- `critical` - Security breaches or critical events

## Integration Notes

### Automatic Logging
The `ActivityLoggerService` automatically logs activities when:
- User logs in/out
- Password is changed or reset
- Profile is updated
- Connections are made/removed
- Security events occur

### Manual Logging
To log custom activities in your code:

```typescript
import { ActivityLoggerService, ActivityType } from '../services/activityLogger.service';

// Log user activity
await ActivityLoggerService.logActivity({
  userId: user.id,
  activityType: ActivityType.PROFILE_UPDATE,
  entityType: 'user',
  entityId: user.id,
  visibility: 'private',
});

// Log security event
await ActivityLoggerService.logSecurityEvent({
  userId: user.id,
  eventType: 'SUSPICIOUS_ACTIVITY',
  severity: SecuritySeverity.HIGH,
  description: 'Multiple failed login attempts',
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
});
```

## Verification Checklist

✅ Route order fixed in `user.routes.ts`
✅ All controller methods exist and are implemented
✅ ActivityLoggerService is complete and functional
✅ Database models exist (UserActivity, SecurityEvent, UserSession, LoginAttempt)
✅ All endpoints properly documented with Swagger comments
✅ Test script created for verification

## Next Steps

1. **Restart the server** to apply the route changes
2. **Test each endpoint** using the test script or curl commands
3. **Verify authentication** - All endpoints require valid JWT token
4. **Check database** - Ensure tables have data by triggering some activities
5. **Monitor logs** - Check application logs for any errors

## Status
✅ **FIXED** - All endpoints are now properly configured and should work as expected.

---

**Date Fixed:** October 15, 2025
**Fixed By:** GitHub Copilot
**Related Files:**
- `src/modules/user/user.routes.ts`
- `src/modules/user/user.controller.ts`
- `src/services/activityLogger.service.ts`
- `test-activity-endpoints.ts`
