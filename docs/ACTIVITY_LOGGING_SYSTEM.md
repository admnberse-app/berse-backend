# Activity Logging System

## Overview
Comprehensive activity logging and security tracking system for monitoring user actions, security events, sessions, and device registrations.

## Database Tables

### Core Logging Tables

#### 1. **user_activities**
Tracks all user actions across the platform
- `activityType`: Type of activity (AUTH_LOGIN, PROFILE_UPDATE, etc.)
- `entityType`: Type of entity affected (user, event, connection, etc.)
- `entityId`: ID of the affected entity
- `visibility`: Who can see this activity (public, friends, private)
- `createdAt`: Timestamp of the activity

#### 2. **security_events**
Logs security-related events
- `userId`: User who triggered the event
- `eventType`: Type of security event (BRUTE_FORCE_ATTEMPT, PASSWORD_CHANGED, etc.)
- `severity`: Event severity (low, medium, high, critical)
- `description`: Human-readable description
- `metadata`: Additional event data (JSON)
- `ipAddress`: IP address of the request
- `userAgent`: User agent string
- `createdAt`: Event timestamp

#### 3. **login_attempts**
Tracks all login attempts (successful and failed)
- `userId`: User ID (null for failed attempts with non-existent user)
- `identifier`: Email/username/phone used for login
- `ipAddress`: IP address of the attempt
- `userAgent`: User agent string
- `success`: Whether the attempt succeeded
- `failureReason`: Reason for failure (if applicable)
- `attemptedAt`: Timestamp of the attempt

#### 4. **user_sessions**
Manages active user sessions
- `userId`: User ID
- `sessionToken`: Unique session identifier
- `deviceInfo`: Device information (JSON)
- `ipAddress`: IP address of the session
- `userAgent`: User agent string
- `locationData`: Location information (JSON)
- `isActive`: Whether the session is currently active
- `lastActivityAt`: Last activity timestamp
- `expiresAt`: Session expiration time
- `createdAt`: Session creation time

#### 5. **device_registrations**
Tracks registered devices per user
- `userId`: User ID
- `deviceFingerprint`: Unique device identifier
- `deviceName`: User-provided device name
- `deviceInfo`: Device details (JSON)
- `isTrusted`: Whether the device is trusted
- `lastSeenAt`: Last time device was used
- `createdAt`: Device registration time

#### 6. **email_verification_tokens**
Manages email verification tokens
- `userId`: User ID
- `email`: Email to verify
- `token`: Verification token
- `expiresAt`: Token expiration
- `verifiedAt`: Verification timestamp
- `createdAt`: Token creation time

#### 7. **password_reset_tokens**
Manages password reset tokens
- `userId`: User ID
- `token`: Reset token (hashed)
- `expiresAt`: Token expiration
- `usedAt`: When token was used
- `ipAddress`: IP address of requester
- `createdAt`: Token creation time

#### 8. **refresh_tokens**
Manages JWT refresh tokens
- `userId`: User ID
- `tokenHash`: Hashed token
- `tokenFamily`: Token family for rotation
- `isRevoked`: Whether token is revoked
- `expiresAt`: Token expiration
- `createdAt`: Token creation time

## Activity Logger Service

### Core Methods

#### Activity Logging
```typescript
ActivityLoggerService.logActivity({
  userId: string,
  activityType: ActivityType,
  entityType?: string,
  entityId?: string,
  visibility?: ActivityVisibility,
  metadata?: Record<string, any>
})
```

#### Security Event Logging
```typescript
ActivityLoggerService.logSecurityEvent({
  userId: string,
  eventType: string,
  severity?: SecuritySeverity,
  description: string,
  metadata?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
})
```

#### Login Attempt Logging
```typescript
ActivityLoggerService.logLoginAttempt({
  userId?: string,
  identifier: string,
  success: boolean,
  failureReason?: string,
  ipAddress: string,
  userAgent?: string
})
```

#### Session Management
```typescript
// Create session
ActivityLoggerService.createSession({
  userId: string,
  deviceInfo?: Record<string, any>,
  ipAddress: string,
  userAgent?: string,
  locationData?: Record<string, any>
})

// Update session activity
ActivityLoggerService.updateSessionActivity(sessionToken: string)

// Terminate session
ActivityLoggerService.terminateSession(sessionToken: string, userId?: string)

// Terminate all user sessions
ActivityLoggerService.terminateAllUserSessions(userId: string)
```

#### Device Management
```typescript
ActivityLoggerService.registerDevice(
  userId: string,
  deviceFingerprint: string,
  deviceName: string | null,
  deviceInfo: Record<string, any>
)
```

### Activity Types

#### Authentication
- `AUTH_REGISTER` - User registration
- `AUTH_LOGIN` - User login
- `AUTH_LOGOUT` - Single session logout
- `AUTH_LOGOUT_ALL` - Logout from all devices
- `AUTH_TOKEN_REFRESH` - Token refresh
- `AUTH_PASSWORD_CHANGE` - Password change (authenticated)
- `AUTH_PASSWORD_RESET_REQUEST` - Password reset request
- `AUTH_PASSWORD_RESET_COMPLETE` - Password reset completion
- `AUTH_EMAIL_VERIFY_REQUEST` - Email verification request
- `AUTH_EMAIL_VERIFY_COMPLETE` - Email verification completion
- `AUTH_MFA_ENABLE` - Enable two-factor auth
- `AUTH_MFA_DISABLE` - Disable two-factor auth

#### Profile
- `PROFILE_UPDATE` - Profile information update
- `PROFILE_PICTURE_UPDATE` - Profile picture change
- `PROFILE_VIEW` - Profile view by another user
- `PROFILE_DELETE` - Profile deletion

#### User Actions
- `USER_SEARCH` - Search for users
- `USER_VIEW` - View user profile
- `USER_BLOCK` - Block user
- `USER_UNBLOCK` - Unblock user
- `USER_REPORT` - Report user

#### Connections
- `CONNECTION_REQUEST_SEND` - Send connection request
- `CONNECTION_REQUEST_ACCEPT` - Accept connection
- `CONNECTION_REQUEST_REJECT` - Reject connection
- `CONNECTION_REMOVE` - Remove connection
- `CONNECTION_REVIEW` - Review connection

#### Events
- `EVENT_CREATE` - Create event
- `EVENT_UPDATE` - Update event
- `EVENT_DELETE` - Delete event
- `EVENT_VIEW` - View event
- `EVENT_RSVP` - RSVP to event
- `EVENT_CANCEL_RSVP` - Cancel RSVP
- `EVENT_CHECKIN` - Check in to event
- `EVENT_TICKET_PURCHASE` - Purchase ticket

#### Marketplace
- `LISTING_CREATE` - Create listing
- `LISTING_UPDATE` - Update listing
- `LISTING_DELETE` - Delete listing
- `LISTING_VIEW` - View listing
- `ORDER_CREATE` - Create order
- `ORDER_CONFIRM` - Confirm order
- `ORDER_CANCEL` - Cancel order
- `ORDER_COMPLETE` - Complete order

#### Security
- `SECURITY_DEVICE_REGISTER` - Register new device
- `SECURITY_DEVICE_REMOVE` - Remove device
- `SECURITY_SESSION_TERMINATE` - Terminate session
- `SECURITY_SUSPICIOUS_LOGIN` - Suspicious login detected
- `SECURITY_ACCOUNT_LOCK` - Account locked
- `SECURITY_ACCOUNT_UNLOCK` - Account unlocked

#### Admin
- `ADMIN_USER_UPDATE` - Admin updates user
- `ADMIN_USER_DELETE` - Admin deletes user
- `ADMIN_USER_BAN` - Admin bans user
- `ADMIN_USER_UNBAN` - Admin unbans user
- `ADMIN_CONFIG_UPDATE` - Admin updates config

### Security Severity Levels
- `LOW` - Informational events
- `MEDIUM` - Standard security events
- `HIGH` - Important security events requiring attention
- `CRITICAL` - Critical security events requiring immediate action

## Integrated Features

### 1. Automatic Brute Force Detection
- Monitors failed login attempts
- Triggers security alert after 5 failed attempts in 15 minutes
- Logs high-severity security event
- Can be extended to implement account lockout

### 2. Session Management
- Creates session on login/register
- Tracks session activity
- Automatically expires sessions
- Supports session termination (single or all)

### 3. Device Tracking
- Registers devices with fingerprinting
- Tracks device last seen time
- Supports trusted device management
- Captures device information (platform, OS, app version)

### 4. Request Metadata Extraction
Automatically captures:
- IP address
- User agent
- Platform (from headers)
- App version (from headers)
- OS (from headers)
- Device ID (from headers)

## Integration Points

### Authentication Controller
All authentication operations now log:
- ✅ User registration
- ✅ Login attempts (success/failure)
- ✅ Session creation
- ✅ Device registration
- ✅ Logout (single/all)
- ✅ Password changes
- ✅ Password reset requests/completions
- ✅ Security events

### Upcoming Integrations
- User Controller (profile updates, searches, blocks)
- Connection Controller (requests, accepts, rejections)
- Event Controller (create, update, RSVP, check-in)
- Marketplace Controller (listings, orders)
- Admin operations

## API Endpoints

### Get User Activity History
```
GET /v2/users/activity
Authorization: Bearer <token>
Query Parameters:
  - limit: number (default: 50)
  - offset: number (default: 0)
```

### Get Security Events
```
GET /v2/users/security-events
Authorization: Bearer <token>
Query Parameters:
  - limit: number (default: 50)
  - offset: number (default: 0)
```

### Get Active Sessions
```
GET /v2/users/sessions
Authorization: Bearer <token>
```

### Get Login History
```
GET /v2/users/login-history
Authorization: Bearer <token>
Query Parameters:
  - limit: number (default: 50)
  - offset: number (default: 0)
```

### Terminate Session
```
DELETE /v2/users/sessions/:sessionToken
Authorization: Bearer <token>
```

## Best Practices

### 1. Activity Visibility
- Set `visibility: 'private'` for sensitive activities (auth, security)
- Set `visibility: 'friends'` for social activities (connections, reviews)
- Set `visibility: 'public'` for public activities (events, listings)

### 2. Security Event Severity
- Use `CRITICAL` for: account compromise, unauthorized access
- Use `HIGH` for: password resets, suspicious logins, account lockouts
- Use `MEDIUM` for: password changes, logout all, MFA changes
- Use `LOW` for: normal auth operations, device registrations

### 3. Metadata
Always include relevant context in metadata:
```typescript
metadata: {
  previousValue: '...',
  newValue: '...',
  reason: '...',
  triggeredBy: '...'
}
```

### 4. Error Handling
- Activity logging failures should NOT break the main operation
- All logging is wrapped in try-catch
- Failures are logged to application logger
- Continue with the main operation even if logging fails

## Maintenance Tasks

### Cleanup Expired Sessions
Run periodically (e.g., daily cron job):
```typescript
await ActivityLoggerService.cleanupExpiredSessions();
```

### Data Retention
Consider implementing:
- Archive old activity logs (> 1 year)
- Delete old login attempts (> 6 months)
- Remove expired sessions (> 30 days inactive)
- Clean up revoked tokens (> 90 days old)

## Monitoring & Alerts

### Key Metrics to Monitor
1. Failed login attempt rate
2. Suspicious login patterns
3. Account lockout frequency
4. Password reset frequency
5. Active session count per user
6. Device registration patterns

### Alert Triggers
- Multiple failed logins from same IP
- Login from new device/location
- Unusual activity patterns
- High-severity security events
- Account lockout attempts

## Security Considerations

1. **Token Hashing**: All tokens are hashed before storage
2. **IP Logging**: IP addresses are logged for security auditing
3. **User Agent Tracking**: Helps identify device/browser
4. **Session Expiration**: Sessions automatically expire
5. **Token Rotation**: Refresh tokens use family-based rotation
6. **Device Fingerprinting**: Helps identify returning devices

## Future Enhancements

1. **Anomaly Detection**: ML-based detection of unusual patterns
2. **Geolocation**: Track login locations and alert on suspicious changes
3. **Risk Scoring**: Calculate risk score based on activity patterns
4. **Session Management UI**: Allow users to view/manage active sessions
5. **Device Management UI**: Allow users to manage trusted devices
6. **Activity Feed**: User-facing activity timeline
7. **Audit Logs**: Comprehensive admin audit trail
8. **GDPR Compliance**: Data export and deletion capabilities
