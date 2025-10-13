# Password Management Features

## Overview
This document describes the password management features implemented in the Berse authentication system, including change password, forgot password, and reset password functionality.

## Features

### 1. Change Password (Protected)
Allows authenticated users to change their password.

**Endpoint:** `POST /api/v1/auth/change-password`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!@#",
  "newPassword": "NewPassword123!@#"
}
```

**Validation:**
- Current password must be provided
- New password must meet strength requirements:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character (@$!%*?&)
- New password must be different from current password

**Response (Success):**
```json
{
  "success": true,
  "message": "Password changed successfully. Please log in again.",
  "data": null
}
```

**Security Features:**
- Verifies current password before allowing change
- Hashes new password using bcrypt
- Revokes all refresh tokens after password change
- Clears refresh token cookie
- Requires re-authentication after change
- Logs password change event

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `404 Not Found`: User not found
- `400 Bad Request`: Current password is incorrect or validation failed

---

### 2. Forgot Password (Public)
Initiates the password reset process by sending a reset link to the user's email.

**Endpoint:** `POST /api/v1/auth/forgot-password`

**Authentication:** Not required (public endpoint)

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent.",
  "data": null
}
```

**Security Features:**
- Always returns success to prevent email enumeration attacks
- Generates cryptographically secure reset token (32 bytes)
- Stores hashed token in database (SHA-256)
- Token expires after 1 hour
- Sends email with reset link and backup 6-digit code
- Logs reset attempt with user ID and expiration time

**Email Content:**
The password reset email includes:
- User's name
- Reset link: `{FRONTEND_URL}/reset-password?token={TOKEN}`
- 6-digit backup code
- Expiration time (1 hour)

**Token Generation:**
```
1. Generate 32 random bytes
2. Convert to hex string (64 characters)
3. Hash with SHA-256 for database storage
4. Send unhashed token in email
```

---

### 3. Reset Password (Public)
Completes the password reset process using the token from email.

**Endpoint:** `POST /api/v1/auth/reset-password`

**Authentication:** Not required (token-based verification)

**Request Body:**
```json
{
  "token": "abc123...xyz789",
  "password": "NewPassword123!@#"
}
```

**Validation:**
- Token must be provided
- New password must meet strength requirements (same as change password)

**Response (Success):**
```json
{
  "success": true,
  "message": "Password reset successfully. Please log in with your new password.",
  "data": null
}
```

**Security Features:**
- Validates token by comparing SHA-256 hash with database
- Checks token expiration (must be used within 1 hour)
- Hashes new password using bcrypt
- Clears reset token and expiration from database
- Updates `lastPasswordChangeAt` timestamp
- Revokes all refresh tokens for security
- Logs successful password reset with user ID
- Requires user to log in again with new password

**Error Responses:**
- `400 Bad Request`: Invalid or expired reset token, or validation failed

---

## Database Schema

The following fields in the `User` model support password management:

```prisma
model User {
  // ... other fields
  
  password                   String
  passwordResetToken         String?
  passwordResetExpires       DateTime?
  lastPasswordChangeAt       DateTime?
  passwordHistory            String[]           @default([])
  requirePasswordChange      Boolean?           @default(false)
  
  // ... other fields
}
```

---

## Workflow Diagrams

### Change Password Flow
```
User (Authenticated)
  ↓
POST /change-password
  ↓
Verify current password
  ↓
Hash new password
  ↓
Update password in database
  ↓
Revoke all refresh tokens
  ↓
Clear cookies
  ↓
Log event
  ↓
Return success
  ↓
User must re-authenticate
```

### Forgot Password Flow
```
User
  ↓
POST /forgot-password
  ↓
Check if email exists
  ↓
Generate secure token (32 bytes)
  ↓
Hash token (SHA-256)
  ↓
Store hash + expiry in DB
  ↓
Send email with reset link
  ↓
Return success (always)
```

### Reset Password Flow
```
User clicks email link
  ↓
POST /reset-password
  ↓
Hash provided token
  ↓
Find user with matching hash
  ↓
Check token not expired
  ↓
Hash new password
  ↓
Update password
  ↓
Clear reset token
  ↓
Revoke all refresh tokens
  ↓
Return success
  ↓
User must log in
```

---

## Security Considerations

### 1. Password Strength
- Minimum 8 characters
- Mixed case, numbers, and special characters required
- Prevents use of same password when changing

### 2. Token Security
- Cryptographically secure random generation
- SHA-256 hashing before database storage
- Short expiration time (1 hour)
- Single-use tokens (cleared after reset)

### 3. Email Enumeration Prevention
- Forgot password always returns success
- Same response time for existing/non-existing emails
- No indication if email exists or not

### 4. Session Management
- All refresh tokens revoked after password change/reset
- User forced to re-authenticate
- Cookies cleared automatically

### 5. Audit Trail
- All password changes logged with user ID
- Reset attempts logged with timestamps
- Failed attempts logged for monitoring

### 6. Rate Limiting
Rate limiters should be enabled in production:
```typescript
// In auth.routes.ts
router.post('/forgot-password', authLimiter, ...);
router.post('/reset-password', authLimiter, ...);
router.post('/change-password', authenticateToken, authLimiter, ...);
```

---

## Email Templates

Password reset emails use the `EmailTemplate.PASSWORD_RESET` template with the following data:

```typescript
{
  userName: string;        // User's full name
  resetUrl: string;        // Full reset URL with token
  resetCode: string;       // 6-digit backup code
  expiresIn: string;       // "1 hour"
}
```

Template features:
- Responsive HTML design
- Clear call-to-action button
- Backup code display
- Expiration warning
- Plain text fallback

---

## Testing

### Automated Tests
Run the test script:
```bash
chmod +x test-auth-password.sh
./test-auth-password.sh
```

### Manual Testing

#### 1. Test Change Password
```bash
# Login first to get token
TOKEN="your_jwt_token"

curl -X POST http://localhost:3000/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "currentPassword": "OldPassword123!@#",
    "newPassword": "NewPassword123!@#"
  }'
```

#### 2. Test Forgot Password
```bash
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

#### 3. Test Reset Password
```bash
# Get token from email, then:
curl -X POST http://localhost:3000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "token_from_email",
    "password": "NewPassword123!@#"
  }'
```

---

## Environment Variables

Required environment variables:

```env
# Email service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@bersemuka.com
FROM_NAME=Berse

# Frontend URL for reset links
FRONTEND_URL=http://localhost:5173
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Error details"
}
```

Common error codes:
- `400`: Validation failed or invalid request
- `401`: Unauthorized (missing or invalid token)
- `404`: Resource not found
- `500`: Internal server error

---

## Future Enhancements

### Planned Features
1. **Password History**: Prevent reuse of last N passwords
2. **Account Lockout**: Lock account after multiple failed attempts
3. **2FA Integration**: Require 2FA for password changes
4. **Password Strength Meter**: Client-side password strength indicator
5. **Custom Expiration Times**: Configurable token expiration
6. **SMS Reset Option**: Alternative to email for password reset
7. **Security Questions**: Additional verification for sensitive accounts

### Configuration Options
```typescript
// config/password.config.ts
export const passwordConfig = {
  resetTokenExpiry: 3600000,     // 1 hour in milliseconds
  maxPasswordAge: 90,             // Days before password expires
  minPasswordLength: 8,
  requireSpecialChar: true,
  requireNumber: true,
  requireUppercase: true,
  requireLowercase: true,
  preventPasswordReuse: 5,        // Last N passwords
  maxLoginAttempts: 5,
  lockoutDuration: 900000,        // 15 minutes
};
```

---

## API Reference

### Change Password
- **URL**: `/api/v1/auth/change-password`
- **Method**: `POST`
- **Auth**: Required
- **Rate Limit**: 5 requests per 15 minutes

### Forgot Password
- **URL**: `/api/v1/auth/forgot-password`
- **Method**: `POST`
- **Auth**: Not required
- **Rate Limit**: 3 requests per 15 minutes

### Reset Password
- **URL**: `/api/v1/auth/reset-password`
- **Method**: `POST`
- **Auth**: Not required
- **Rate Limit**: 5 requests per 15 minutes

---

## Troubleshooting

### Common Issues

**1. Password reset email not received**
- Check spam folder
- Verify SMTP configuration
- Check email service logs
- Verify user email is correct in database

**2. Invalid or expired token**
- Token expires after 1 hour
- Token can only be used once
- Ensure token from URL matches request

**3. Password validation fails**
- Must be at least 8 characters
- Must contain uppercase, lowercase, number, and special character
- Cannot be same as current password

**4. Unauthorized error**
- Ensure Bearer token is included in Authorization header
- Token may have expired (re-login required)
- Token may have been revoked

---

## Compliance

This implementation follows security best practices and helps comply with:

- **GDPR**: Secure password storage and reset mechanisms
- **PCI DSS**: Strong password requirements
- **OWASP**: Protection against common vulnerabilities
  - Credential Stuffing
  - Brute Force Attacks
  - Account Enumeration
  - Token Prediction

---

## Support

For issues or questions:
- Check server logs: `tail -f logs/app.log`
- Enable debug mode: `DEBUG=auth:* npm start`
- Review email queue: `GET /api/v1/email/queue/status`

---

**Last Updated**: October 13, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
