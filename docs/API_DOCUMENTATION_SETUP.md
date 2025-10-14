# API Documentation Setup Complete! 🎉

## Documentation URLs

Your Berse Platform API now has three professional documentation interfaces:

### 1. **Swagger UI** (Interactive)
**URL:** `http://localhost:3000/api-docs`

Features:
- ✅ Interactive API testing directly from the browser
- ✅ Try out endpoints with your own data
- ✅ Authentication support (Bearer tokens)
- ✅ Request/response examples
- ✅ Schema validation
- ✅ Automatic "Try it out" buttons
- ✅ Syntax highlighting (Monokai theme)
- ✅ Persistent authorization (stays logged in)

### 2. **ReDoc** (Beautiful Documentation)
**URL:** `http://localhost:3000/docs`

Features:
- ✅ Beautiful, modern design
- ✅ Three-panel layout (navigation, content, examples)
- ✅ Better readability for complex APIs
- ✅ Responsive design
- ✅ Search functionality
- ✅ Downloadable OpenAPI spec
- ✅ Alphabetically sorted properties
- ✅ Auto-expanded 200/201 responses

### 3. **OpenAPI JSON Specification**
**URL:** `http://localhost:3000/api-docs.json`

Features:
- ✅ Raw OpenAPI 3.0 specification
- ✅ Machine-readable format
- ✅ Can be imported into Postman, Insomnia, etc.
- ✅ Used by code generators
- ✅ CI/CD integration ready

## Quick Start

### Access Documentation

1. **Start your server:**
   ```bash
   npm run dev
   ```

2. **Open Swagger UI:**
   ```
   http://localhost:3000/api-docs
   ```

3. **Open ReDoc:**
   ```
   http://localhost:3000/docs
   ```

### Test Endpoints

1. Go to Swagger UI (`/api-docs`)
2. Click "Authorize" button at the top
3. Register a new user:
   - Expand `POST /v2/auth/register`
   - Click "Try it out"
   - Fill in the request body
   - Click "Execute"
4. Copy the `accessToken` from the response
5. Click "Authorize" again and paste the token in format: `Bearer <your-token>`
6. Now you can test all protected endpoints!

## What's Documented

### Current Coverage:
- ✅ Authentication endpoints (register, login)
- ✅ User management endpoints
- ✅ Connection system endpoints
- ✅ Health check endpoints
- ✅ All schemas (User, UserProfile, UserLocation, UserConnection)
- ✅ Error responses
- ✅ Security schemes (Bearer JWT)

### API Structure:
```
📚 Berse Platform API v2.0.0
├── 🔐 Authentication
│   ├── POST /v2/auth/register
│   ├── POST /v2/auth/login
│   ├── POST /v2/auth/logout
│   ├── POST /v2/auth/refresh-token
│   ├── POST /v2/auth/forgot-password
│   ├── POST /v2/auth/reset-password
│   ├── POST /v2/auth/verify-email
│   ├── POST /v2/auth/resend-verification
│   ├── POST /v2/auth/change-password
│   ├── POST /v2/auth/logout-all
│   └── GET  /v2/auth/me
├── 👥 Users & Connections
│   ├── GET  /v2/users/profile
│   ├── PUT  /v2/users/profile
│   ├── GET  /v2/users/search
│   ├── GET  /v2/users/:id
│   ├── POST /v2/users/connection-request
│   ├── POST /v2/users/accept-connection/:id
│   ├── POST /v2/users/reject-connection/:id
│   ├── POST /v2/users/cancel-connection/:id
│   ├── DELETE /v2/users/remove-connection/:id
│   ├── GET  /v2/users/connections
│   └── POST /v2/users/upload-avatar
└── ❤️ Health
    ├── GET  /health
    └── GET  /v2/health
```

## Configuration

### Swagger Options (in `/src/app.ts`)

```typescript
swaggerOptions: {
  persistAuthorization: true,  // Remember auth token
  displayRequestDuration: true, // Show request time
  docExpansion: 'none',        // Collapse all by default
  filter: true,                // Enable search filter
  syntaxHighlight: {
    activate: true,
    theme: 'monokai',          // Dark theme
  },
}
```

### ReDoc Options

```typescript
redocOptions: {
  theme: {
    colors: {
      primary: { main: '#6366f1' }, // Indigo color
    },
  },
  hideDownloadButton: false,     // Allow downloading spec
  disableSearch: false,          // Enable search
  expandResponses: '200,201',    // Auto-expand success responses
  pathInMiddlePanel: true,       // Show paths in center
  sortPropsAlphabetically: true, // Sort properties A-Z
}
```

## Adding Documentation to New Endpoints

To add Swagger documentation to a new endpoint:

```typescript
/**
 * @swagger
 * /v2/your/endpoint:
 *   post:
 *     summary: Short description
 *     description: Longer detailed description
 *     tags: [YourTag]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fieldName
 *             properties:
 *               fieldName:
 *                 type: string
 *                 example: example value
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/YourSchema'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/your/endpoint', YourController.yourMethod);
```

## OpenAPI Specification

The OpenAPI spec is configured in `/src/config/swagger.ts`:

**Key Features:**
- OpenAPI 3.0.0 standard
- Development and production servers
- Bearer JWT authentication
- Cookie-based refresh token auth
- Comprehensive schemas
- Reusable error responses
- Tagged endpoints

**Schemas Defined:**
- `User` - User account information
- `UserProfile` - Profile details
- `UserLocation` - Location information
- `UserConnection` - Connection/relationship
- `AuthTokens` - JWT tokens
- `Error` - Standard error format
- `ValidationError` - Validation error format

## Security Configuration

For Swagger UI to work, we adjusted the Content Security Policy:

```typescript
helmet({
  contentSecurityPolicy: config.isDevelopment ? false : {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "validator.swagger.io"],
    },
  },
})
```

This allows Swagger UI assets to load properly while maintaining security in production.

## Integration with Other Tools

### Postman
1. Open Postman
2. Click "Import"
3. Enter URL: `http://localhost:3000/api-docs.json`
4. Click "Import"
5. All endpoints are now in Postman!

### Insomnia
1. Open Insomnia
2. Click "Import/Export" > "Import Data"
3. Choose "From URL"
4. Enter: `http://localhost:3000/api-docs.json`
5. Done!

### VS Code REST Client
Create a `.http` file with:
```http
@baseUrl = http://localhost:3000
@token = your-jwt-token

### Register
POST {{baseUrl}}/v2/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!",
  "fullName": "Test User"
}
```

## Production Deployment

When deploying to production:

1. **Update server URL** in `/src/config/swagger.ts`:
   ```typescript
   servers: [
     {
       url: 'https://api.berse-app.com',
       description: 'Production server',
     },
   ],
   ```

2. **Secure documentation endpoints** (optional):
   ```typescript
   // Add authentication middleware
   app.use('/api-docs', authenticateToken);
   app.use('/docs', authenticateToken);
   ```

3. **Environment-based access**:
   ```typescript
   if (config.isDevelopment) {
     app.use('/api-docs', swaggerUi.serve);
     app.get('/api-docs', swaggerUi.setup(swaggerSpec));
   }
   ```

## Troubleshooting

### Swagger UI not loading
- Check if port 3000 is accessible
- Check browser console for errors
- Verify Content Security Policy allows Swagger assets
- Clear browser cache

### Documentation not updating
- Restart the server
- Check JSDoc syntax in route files
- Verify file paths in `swagger.ts` apis array
- Check for TypeScript compilation errors

### Authentication not working
- Make sure token format is: `Bearer <token>`
- Check token expiration
- Verify token is valid JWT
- Check if endpoint requires authentication

## Next Steps

To complete the documentation:

1. **Add docs for remaining endpoints:**
   - [ ] Forgot password
   - [ ] Reset password
   - [ ] Email verification
   - [ ] User connections (accept, reject, cancel, remove)
   - [ ] User search
   - [ ] Profile update

2. **Add more examples:**
   - [ ] Request body examples
   - [ ] Response examples
   - [ ] Error examples

3. **Add authentication flows:**
   - [ ] Registration flow diagram
   - [ ] Login flow diagram
   - [ ] Password reset flow diagram

4. **Add rate limiting info:**
   - [ ] Document rate limits per endpoint
   - [ ] Show rate limit headers in responses

## Resources

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [ReDoc Documentation](https://redocly.com/docs/redoc/)
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)

---

**Your documentation is now live! 🚀**

Visit: `http://localhost:3000/api-docs` to start exploring!
