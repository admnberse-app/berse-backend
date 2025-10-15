# Authentication API Documentation

## Overview
The Authentication API provides endpoints for user registration, login, password management, and session control.

**Base URL:**
- **Production:** `https://api.berse-app.com/v2/auth`
- **Development:** `http://localhost:3000/v2/auth`

> **Note:** v2 endpoints do not include the `/api/` prefix. Legacy v1 endpoints are still available at `/api/v1/auth` for backward compatibility.

---

## Table of Contents
- [Public Endpoints](#public-endpoints)
  - [Register](#register)
  - [Login](#login)
  - [Refresh Token](#refresh-token)
  - [Forgot Password](#forgot-password)
  - [Reset Password](#reset-password)
- [Protected Endpoints](#protected-endpoints)
  - [Get Current User](#get-current-user)
  - [Logout](#logout)
  - [Logout All Devices](#logout-all-devices)
  - [Change Password](#change-password)
- [Error Responses](#error-responses)

---

## Public Endpoints

### Register
Create a new user account.

**Endpoint:** `POST /v2/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "username": "johndoe",
  "phone": "+60123456789",
  "nationality": "Malaysian",
  "countryOfResidence": "Malaysia",
  "currentCity": "Kuala Lumpur",
  "gender": "male",
  "dateOfBirth": "1990-01-15",
  "referralCode": "ABC123XYZ"
}
```

**Required Fields:**
- `email` - Valid email address
- `password` - Minimum 8 characters, must include uppercase, lowercase, number, and special character
- `fullName` - 2-100 characters, letters only
- `username` - 2-30 characters, alphanumeric with underscores and hyphens

**Optional Fields:**
- `phone` - Valid phone number
- `nationality` - 2-50 characters
- `countryOfResidence` - 2-50 characters
- `currentCity` - 2-50 characters
- `latitude` - GPS latitude (-90 to 90)
- `longitude` - GPS longitude (-180 to 180)
- `gender` - "male" or "female"
- `dateOfBirth` - ISO 8601 date format
- `referralCode` - 6-10 characters

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "username": "johndoe",
      "role": "GENERAL_USER",
      "totalPoints": 100,
      "profile": {
        "dateOfBirth": "1990-01-15T00:00:00.000Z",
        "gender": "male",
        "profilePicture": null
      },
      "location": {
        "nationality": "Malaysian",
        "countryOfResidence": "Malaysia",
        "currentCity": "Kuala Lumpur",
        "currentLocation": null,
        "originallyFrom": null,
        "latitude": null,
        "longitude": null,
        "lastLocationUpdate": null
      },
      "metadata": {
        "referralCode": "GENERATED_CODE",
        "membershipId": "BM-123456"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` - User already exists (email, phone, or username taken)
- `400` - Invalid referral code
- `400` - Validation errors

---

### Login
Authenticate a user and receive access tokens.

**Endpoint:** `POST /v2/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "username": "johndoe",
      "role": "GENERAL_USER",
      "status": "ACTIVE",
      "trustScore": 0.0,
      "trustLevel": "starter",
      "totalPoints": 100
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `401` - Invalid credentials

**Notes:**
- The `refreshToken` is also set as an HTTP-only cookie
- Access token expires in 15 minutes
- Refresh token expires in 365 days

---

### Refresh Token
Get a new access token using a refresh token.

**Endpoint:** `POST /v2/auth/refresh-token`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note:** The refresh token can also be provided via HTTP-only cookie.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `401` - Refresh token not found
- `401` - Invalid refresh token

---

### Forgot Password
Request a password reset email.

**Endpoint:** `POST /v2/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent.",
  "data": null
}
```

**Notes:**
- Always returns success to prevent email enumeration
- Reset token expires in 1 hour
- Email contains both a reset link and a 6-digit backup code

---

### Reset Password
Reset password using a token from email.

**Endpoint:** `POST /v2/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully. Please log in with your new password.",
  "data": null
}
```

**Error Responses:**
- `400` - Invalid or expired reset token
- `400` - Password validation errors

**Notes:**
- All refresh tokens are revoked after password reset for security
- User must log in again with the new password

---

## Protected Endpoints
All protected endpoints require a valid JWT access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Get Current User
Get the currently authenticated user's profile.

**Endpoint:** `GET /v2/auth/me`

**Success Response (200):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "username": "johndoe",
      "phone": "+60123456789",
      "role": "GENERAL_USER",
      "totalPoints": 150,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "profile": {
        "profilePicture": "https://...",
        "bio": "Adventurous traveler...",
        "interests": ["travel", "photography"],
        "dateOfBirth": "1990-01-15T00:00:00.000Z",
        "gender": "male"
      },
      "location": {
        "currentCity": "Kuala Lumpur",
        "countryOfResidence": "Malaysia",
        "currentLocation": "KLCC Area",
        "nationality": "Malaysian",
        "originallyFrom": "Penang",
        "latitude": 3.1390,
        "longitude": 101.6869,
        "lastLocationUpdate": "2024-01-15T10:30:00.000Z",
        "timezone": "Asia/Kuala_Lumpur",
        "preferredLanguage": "en",
        "currency": "MYR"
      },
      "metadata": {
        "membershipId": "BM-123456",
        "referralCode": "GENERATED_CODE"
      }
    }
  }
}
```

**Error Responses:**
- `401` - User not authenticated
- `404` - User not found

---

### Logout
Logout from the current session.

**Endpoint:** `POST /v2/auth/logout`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

**Notes:**
- Revokes the current refresh token
- Clears the refresh token cookie

---

### Logout All Devices
Logout from all devices/sessions.

**Endpoint:** `POST /v2/auth/logout-all`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out from all devices successfully",
  "data": null
}
```

**Notes:**
- Revokes all refresh tokens for the user
- User must log in again on all devices

---

### Change Password
Change the password for the authenticated user.

**Endpoint:** `POST /v2/auth/change-password`

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass123!"
}
```

**Validation:**
- `currentPassword` - Required
- `newPassword` - Must be at least 8 characters with uppercase, lowercase, number, and special character
- `newPassword` - Must be different from current password

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully. Please log in again.",
  "data": null
}
```

**Error Responses:**
- `400` - Current password is incorrect
- `400` - New password validation errors
- `401` - User not authenticated

**Notes:**
- All refresh tokens are revoked for security
- User must log in again with the new password

---

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

### Common Status Codes
- `400` - Bad Request (validation errors, invalid data)
- `401` - Unauthorized (missing/invalid token, invalid credentials)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Validation Error Format
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "statusCode": 400,
    "errors": [
      {
        "field": "email",
        "message": "Valid email is required"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters..."
      }
    ]
  }
}
```

---

## Rate Limiting

Authentication endpoints have rate limiting to prevent abuse:

- **Login:** 5 requests per 15 minutes per IP
- **Register:** 3 requests per hour per IP
- **Password Reset:** 3 requests per hour per IP
- **General Auth:** 100 requests per 15 minutes per IP

When rate limited, you'll receive a `429` response:
```json
{
  "success": false,
  "error": {
    "message": "Too many requests, please try again later",
    "statusCode": 429
  }
}
```

---

## Security Best Practices

1. **Token Storage:**
   - Store access tokens in memory or secure storage (not localStorage)
   - Refresh tokens are automatically stored in HTTP-only cookies

2. **HTTPS:**
   - Always use HTTPS in production
   - Tokens are transmitted securely

3. **Token Expiration:**
   - Access tokens expire in 15 minutes
   - Implement automatic token refresh logic
   - Refresh tokens expire in 365 days

4. **Password Requirements:**
   - Minimum 8 characters
   - Must include: uppercase, lowercase, number, special character
   - Passwords are hashed with bcrypt

5. **Session Management:**
   - Use logout-all when suspicious activity is detected
   - Change password immediately if account compromise is suspected

---

## Examples

### cURL Examples

**Register:**
```bash
curl -X POST https://api.bersemuka.com/v2/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "fullName": "John Doe",
    "username": "johndoe"
  }'
```

**Login:**
```bash
curl -X POST https://api.bersemuka.com/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Get Current User:**
```bash
curl -X GET https://api.bersemuka.com/v2/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### JavaScript/Fetch Examples

**Login:**
```javascript
const login = async (email, password) => {
  const response = await fetch('https://api.bersemuka.com/v2/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // Include cookies
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store access token
    localStorage.setItem('accessToken', data.data.token);
    return data.data.user;
  } else {
    throw new Error(data.error.message);
  }
};
```

**Authenticated Request:**
```javascript
const getCurrentUser = async () => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('https://api.bersemuka.com/v2/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  });
  
  const data = await response.json();
  return data.data.user;
};
```

**Token Refresh:**
```javascript
const refreshToken = async () => {
  const response = await fetch('https://api.bersemuka.com/v2/auth/refresh-token', {
    method: 'POST',
    credentials: 'include', // Send refresh token cookie
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('accessToken', data.data.token);
    return data.data.token;
  } else {
    // Redirect to login
    window.location.href = '/login';
  }
};
```

---

## Changelog

### v1.0.0 (2024-01-15)
- Initial authentication API
- JWT-based authentication
- Password reset functionality
- Session management
- Referral code support during registration
