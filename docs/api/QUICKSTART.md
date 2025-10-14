# Quick Start: V2 API

## 🎯 What's New?

The API has been updated to **v2** with cleaner URLs:
- ✅ **Old:** `https://api.berse-app.com/api/v1/auth/login`
- ✅ **New:** `https://api.berse-app.com/v2/auth/login`

The `/api/` prefix has been removed since the domain is already `api.berse-app.com`.

## 🚀 Quick Start

### Base URLs
- **Production:** `https://api.berse-app.com/v2`
- **Development:** `http://localhost:3000/v2`

### Authentication Example

```typescript
// 1. Register
const response = await fetch('https://api.berse-app.com/v2/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
    fullName: 'John Doe',
    username: 'johndoe'
  })
});

const { data } = await response.json();
const { token, refreshToken, user } = data;

// 2. Use token for authenticated requests
const profileResponse = await fetch('https://api.berse-app.com/v2/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 📖 Available Endpoints

### Authentication (`/v2/auth`)
- `POST /v2/auth/register` - Register
- `POST /v2/auth/login` - Login
- `POST /v2/auth/refresh-token` - Refresh token
- `POST /v2/auth/logout` - Logout
- `GET /v2/auth/me` - Get current user
- `POST /v2/auth/change-password` - Change password
- `POST /v2/auth/forgot-password` - Forgot password
- `POST /v2/auth/reset-password` - Reset password

### Users (`/v2/users`)
- `GET /v2/users/profile` - Get profile
- `PUT /v2/users/profile` - Update profile
- `POST /v2/users/upload-avatar` - Upload avatar
- `GET /v2/users/all` - Get all users
- `GET /v2/users/search` - Search users
- `GET /v2/users/:id` - Get user by ID
- `POST /v2/users/follow/:id` - Follow user
- `DELETE /v2/users/follow/:id` - Unfollow user

## 📚 Full Documentation

- **Auth API:** [docs/api/AUTH_API.md](./AUTH_API.md)
- **User API:** [docs/api/USER_API.md](./USER_API.md)
- **Migration Guide:** [docs/api/MIGRATION_V1_TO_V2.md](./MIGRATION_V1_TO_V2.md)
- **Full Summary:** [docs/V2_API_UPDATE.md](../V2_API_UPDATE.md)

## ⚠️ Backward Compatibility

V1 endpoints still work at `/api/v1/*` but will be deprecated:
- **Now - Jan 2026:** Both v1 and v2 available
- **Jan 2026 - Apr 2026:** v1 deprecated with warnings
- **Apr 2026:** v1 removed

## 🔑 API Response Format

All endpoints return:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

## 🧪 Testing

```bash
# Test health check
curl https://api.berse-app.com/v2/health

# Test registration
curl -X POST https://api.berse-app.com/v2/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "fullName": "Test User",
    "username": "testuser"
  }'
```

## 💡 Tips

1. **Always include `Authorization` header** for protected endpoints
2. **Store refresh token securely** (httpOnly cookie recommended)
3. **Handle 401 errors** by refreshing the token
4. **Respect rate limits** (see documentation)
5. **Validate inputs** before sending requests

## 🆘 Need Help?

- Check [AUTH_API.md](./AUTH_API.md) for detailed auth documentation
- Check [USER_API.md](./USER_API.md) for user/profile documentation
- Review [MIGRATION_V1_TO_V2.md](./MIGRATION_V1_TO_V2.md) for migration guidance

---

**Version:** 2.0.0  
**Last Updated:** October 14, 2025
