# BerseMuka API Documentation

Welcome to the BerseMuka Platform API documentation. This directory contains comprehensive guides for all API endpoints.

## Quick Links

- 🔐 [Authentication API](./AUTH_API.md) - User registration, login, and session management
- 👤 [User & Profile API](./USER_API.md) - Profile management, user discovery, and social connections

## Base URL

**Production:** `https://api.bersemuka.com/api/v1`  
**Staging:** `https://staging-api.bersemuka.com/api/v1`  
**Development:** `http://localhost:3000/api/v1`

## Authentication

Most API endpoints require authentication using JWT (JSON Web Tokens).

### Getting Started

1. **Register** a new account: `POST /auth/register`
2. **Login** to get access token: `POST /auth/login`
3. **Use token** in requests: `Authorization: Bearer <access_token>`

### Token Lifecycle

- **Access Token:** Expires in 15 minutes
- **Refresh Token:** Expires in 365 days
- **Refresh:** Use `POST /auth/refresh-token` to get new access token

## API Modules

### Authentication Module (`/api/v1/auth`)
Handles user authentication, registration, password management, and session control.

**Key Endpoints:**
- `POST /register` - Create new account
- `POST /login` - User login
- `POST /refresh-token` - Refresh access token
- `GET /me` - Get current user
- `POST /logout` - Logout current session
- `POST /change-password` - Change password
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token

📖 [Full Authentication Documentation](./AUTH_API.md)

### User & Profile Module (`/api/v1/users`)
Manages user profiles, discovery, search, and social connections.

**Key Endpoints:**
- `GET /profile` - Get current user profile
- `PUT /profile` - Update profile
- `POST /upload-avatar` - Upload profile picture
- `GET /all` - Get all users
- `GET /search` - Search users
- `GET /:id` - Get user by ID
- `POST /follow/:id` - Send friend request
- `DELETE /follow/:id` - Unfollow user

📖 [Full User API Documentation](./USER_API.md)

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

### Validation Error Response
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
      }
    ]
  }
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Rate Limiting

API endpoints have rate limiting to prevent abuse:

| Endpoint Type | Limit |
|--------------|-------|
| Login | 5 requests / 15 minutes |
| Register | 3 requests / hour |
| Password Reset | 3 requests / hour |
| General API | 100 requests / 15 minutes |
| File Upload | 10 requests / hour |

## Security

### Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely:**
   - Access tokens: Memory or secure storage (not localStorage)
   - Refresh tokens: Handled via HTTP-only cookies
3. **Implement token refresh logic** before access token expires
4. **Handle 401 errors** by refreshing token or redirecting to login
5. **Use environment variables** for API URLs and sensitive data

### Password Requirements

- Minimum 8 characters
- Must include:
  - Uppercase letter (A-Z)
  - Lowercase letter (a-z)
  - Number (0-9)
  - Special character (@$!%*?&)

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "pages": 8
    }
  }
}
```

## Code Examples

### JavaScript/Fetch

```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('https://api.bersemuka.com/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('accessToken', data.data.token);
    return data.data.user;
  } else {
    throw new Error(data.error.message);
  }
};

// Authenticated Request
const getProfile = async () => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('https://api.bersemuka.com/api/v1/users/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  
  if (!data.success && response.status === 401) {
    // Token expired, refresh it
    await refreshToken();
    return getProfile(); // Retry
  }
  
  return data.data;
};

// Token Refresh
const refreshToken = async () => {
  const response = await fetch('https://api.bersemuka.com/api/v1/auth/refresh-token', {
    method: 'POST',
    credentials: 'include',
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

### cURL

```bash
# Login
curl -X POST https://api.bersemuka.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'

# Get Profile
curl -X GET https://api.bersemuka.com/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Update Profile
curl -X PUT https://api.bersemuka.com/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Updated bio",
    "interests": ["travel", "photography"]
  }'
```

## Error Handling

### Client-Side Error Handling

```javascript
const apiRequest = async (url, options = {}) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (!data.success) {
      // Handle specific error codes
      switch (response.status) {
        case 401:
          // Try to refresh token
          if (url !== '/api/v1/auth/refresh-token') {
            await refreshToken();
            return apiRequest(url, options); // Retry
          }
          // Redirect to login
          window.location.href = '/login';
          break;
        case 403:
          throw new Error('You don\'t have permission to perform this action');
        case 404:
          throw new Error('Resource not found');
        case 429:
          throw new Error('Too many requests. Please try again later');
        default:
          throw new Error(data.error.message || 'An error occurred');
      }
    }
    
    return data.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

## Testing

### Postman Collection

Download our Postman collection for easy API testing:
[BerseMuka API Postman Collection](./BerseMuka_API.postman_collection.json) *(Coming Soon)*

### Test Accounts

**Development Environment:**
- Email: `test@bersemuka.com`
- Password: `TestPass123!`

## Support

### Need Help?

- 📧 Email: support@bersemuka.com
- 💬 Discord: [BerseMuka Community](https://discord.gg/bersemuka)
- 🐛 Issues: [GitHub Issues](https://github.com/berse-app/backend/issues)

### Changelog

See [CHANGELOG.md](../../CHANGELOG.md) for API version history and breaking changes.

## Coming Soon

- 🎫 Events API
- 💬 Messaging API
- 🔔 Notifications API
- 🎯 Matching API
- 🏘️ Communities API
- 💳 Payments API
- 🎮 Card Game API

---

**Last Updated:** January 15, 2024  
**API Version:** v1.0.0
