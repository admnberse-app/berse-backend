# 🔐 Password Management Quick Reference

## API Endpoints

### 1. Forgot Password (Public)
```bash
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```
**Response:** Always returns success (prevents enumeration)

---

### 2. Reset Password (Public)
```bash
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "token_from_email",
  "password": "NewPassword123!"
}
```
**Response:** Success or invalid/expired token error

---

### 3. Change Password (Protected)
```bash
POST /api/v1/auth/change-password
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```
**Response:** Success or current password incorrect error

---

## Password Requirements

✅ Minimum 8 characters  
✅ At least 1 uppercase letter (A-Z)  
✅ At least 1 lowercase letter (a-z)  
✅ At least 1 number (0-9)  
✅ At least 1 special character (@$!%*?&)

**Valid Examples:**
- `TestPass123!`
- `MySecure2024@`
- `Welcome2025$`

**Invalid Examples:**
- `password` (no uppercase, number, special char)
- `Pass123` (too short, no special char)
- `PASSWORD123!` (no lowercase)

---

## Quick Test Commands

### Test Forgot Password
```bash
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Test Reset Password (after getting token from email)
```bash
curl -X POST http://localhost:3000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN_HERE",
    "password": "NewPassword123!"
  }'
```

### Test Change Password (requires authentication)
```bash
# First login to get token
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "OldPassword123!"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

# Then change password
curl -X POST http://localhost:3000/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword456!"
  }'
```

---

## Token Details

**Generation:**
- 32 random bytes → 64 hex characters
- SHA-256 hashed before storage
- Expires in 1 hour

**Security:**
- Cryptographically secure (crypto.randomBytes)
- Single use only
- Cleared after password reset
- Token not visible in logs

**Email Content:**
- Reset URL: `{FRONTEND_URL}/reset-password?token={TOKEN}`
- 6-digit backup code
- Expiration time
- Security notice

---

## Common Workflows

### User Forgot Password
```
1. User clicks "Forgot Password"
2. Enters email address
3. Receives email with reset link
4. Clicks link or uses 6-digit code
5. Enters new password
6. Logs in with new password
```

### User Wants to Change Password (Logged In)
```
1. User goes to "Change Password" in settings
2. Enters current password
3. Enters new password
4. Submits form
5. Gets logged out (all sessions cleared)
6. Logs in with new password
```

---

## Security Features

✅ **Email Enumeration Prevention**
- Always returns success
- Same response for existing/non-existing emails

✅ **Token Security**
- Cryptographically secure generation
- SHA-256 hashed storage
- 1-hour expiration
- Single use

✅ **Session Management**
- All sessions revoked on password change
- User must re-authenticate
- Cookies cleared

✅ **Audit Trail**
- All changes logged
- Failed attempts tracked
- User ID logged

---

## Troubleshooting

### Email Not Received
1. Check spam/junk folder
2. Verify SMTP configuration
3. Check server logs
4. Test email service

### Invalid Token Error
1. Token expired (1 hour limit)
2. Token already used
3. Wrong token from URL
4. Request new reset link

### Password Validation Failed
1. Check minimum 8 characters
2. Verify uppercase + lowercase
3. Ensure number included
4. Include special character (@$!%*?&)

### Current Password Incorrect
1. Verify password is correct
2. Check caps lock
3. Try password reset if forgotten

---

## Environment Setup

```env
# Frontend URL for reset links
FRONTEND_URL=http://localhost:5173

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@bersemuka.com
FROM_NAME=Berse
```

---

## Files Reference

**Documentation:**
- `docs/PASSWORD_MANAGEMENT.md` - Full technical docs
- `artifacts/AUTH_ENHANCEMENTS_SUMMARY.md` - Implementation summary

**Code:**
- `src/controllers/auth.controller.ts` - Controllers
- `src/routes/api/v1/auth.routes.ts` - Routes

**Tests:**
- `test-auth-password.sh` - Automated tests
- `test-password-quick.sh` - Quick tests

---

## Status

✅ Forgot Password - WORKING  
✅ Reset Password - IMPLEMENTED  
✅ Change Password - WORKING  
✅ Email Integration - WORKING  
✅ Security - IMPLEMENTED  
✅ Documentation - COMPLETE

**Branch:** `feat/auth-enhancements`  
**Last Updated:** October 13, 2025
