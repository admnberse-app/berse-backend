# 📚 API Documentation - Quick Reference

## 🌐 Documentation URLs

| Interface | URL | Description |
|-----------|-----|-------------|
| **Swagger UI** | `http://localhost:3000/api-docs` | Interactive API testing |
| **ReDoc** | `http://localhost:3000/docs` | Beautiful documentation |
| **OpenAPI JSON** | `http://localhost:3000/api-docs.json` | Raw specification |
| **API Overview** | `http://localhost:3000/` | Quick endpoint list |

## 🚀 Quick Test

```bash
# 1. Start server
npm run dev

# 2. Open Swagger UI
open http://localhost:3000/api-docs

# 3. Register a user (in Swagger UI)
POST /v2/auth/register
{
  "email": "test@example.com",
  "password": "Test123!",
  "fullName": "Test User"
}

# 4. Click "Authorize" and paste: Bearer <your-access-token>

# 5. Test any protected endpoint!
```

## 🔑 Authentication

### Get Token:
1. Register or login via Swagger UI
2. Copy `accessToken` from response
3. Click "Authorize" button (top right)
4. Enter: `Bearer <your-token>`
5. Click "Authorize"

### Token Format:
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📋 Endpoint Categories

### 🔐 Authentication (`/v2/auth`)
- `POST /register` - Create account
- `POST /login` - Sign in
- `POST /logout` - Sign out
- `POST /refresh-token` - Get new token
- `POST /forgot-password` - Request reset
- `POST /reset-password` - Reset with token
- `POST /verify-email` - Verify email
- `POST /resend-verification` - Resend email
- `POST /change-password` - Update password
- `GET /me` - Current user info

### 👥 Users (`/v2/users`)
- `GET /profile` - My profile
- `PUT /profile` - Update profile
- `GET /search` - Find users
- `GET /:id` - User details
- `POST /connection-request` - Send request
- `POST /accept-connection/:id` - Accept
- `POST /reject-connection/:id` - Reject
- `POST /cancel-connection/:id` - Cancel
- `DELETE /remove-connection/:id` - Remove
- `GET /connections` - My connections
- `POST /upload-avatar` - Upload photo

### ❤️ Health
- `GET /health` - Server status
- `GET /v2/health` - API v2 status

## 🎨 Swagger UI Features

- ✅ Interactive testing
- ✅ Authorization support
- ✅ Request/response examples
- ✅ Schema validation
- ✅ "Try it out" buttons
- ✅ Persistent auth
- ✅ Search filter
- ✅ Dark theme

## 📖 ReDoc Features

- ✅ Beautiful design
- ✅ Three-panel layout
- ✅ Better readability
- ✅ Search functionality
- ✅ Downloadable spec
- ✅ Sorted properties
- ✅ Mobile responsive

## 🔧 Import to Other Tools

### Postman
```
Import → From URL → http://localhost:3000/api-docs.json
```

### Insomnia
```
Import/Export → Import Data → From URL → http://localhost:3000/api-docs.json
```

### cURL
```bash
curl http://localhost:3000/api-docs.json > openapi.json
```

## 📝 Example Request (cURL)

```bash
# Register
curl -X POST http://localhost:3000/v2/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "fullName": "John Doe"
  }'

# Login
curl -X POST http://localhost:3000/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'

# Get Profile (authenticated)
curl http://localhost:3000/v2/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🎯 Response Format

### Success (200/201)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error (4xx/5xx)
```json
{
  "success": false,
  "message": "Error occurred",
  "error": "Error details",
  "statusCode": 400
}
```

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## 🔒 Security

- **Authentication:** Bearer JWT tokens
- **Refresh:** httpOnly cookies or request body
- **Expiry:** Access (15min), Refresh (365 days)
- **Rate Limits:** Applied per endpoint

## 🌍 Environment

### Development
- Base URL: `http://localhost:3000`
- Docs enabled: ✅
- CORS: Permissive

### Production
- Base URL: `https://api.berse-app.com`
- Docs: Optional (can be protected)
- CORS: Restricted to allowed origins

## 💡 Pro Tips

1. **Save Time:** Use Swagger UI's "Authorize" once for all endpoints
2. **Export Collection:** Download OpenAPI spec for offline use
3. **Test Flow:** Register → Login → Copy Token → Test endpoints
4. **Debug:** Check response times in Swagger UI
5. **Compare:** Use ReDoc for reading, Swagger for testing

## 📞 Support

- **Documentation:** `/docs/API_DOCUMENTATION_SETUP.md`
- **Markdown Docs:** `/docs/api/AUTH_API.md`, `/docs/api/USER_API.md`
- **Schema Reference:** `/docs/PRISMA_SCHEMA_REFERENCE.md`

---

**Happy Testing! 🚀**
