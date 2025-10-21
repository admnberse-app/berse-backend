# BerseMuka API Documentation

Welcome to the BerseMuka Platform API documentation. This directory contains comprehensive guides for all API endpoints.

## Quick Links

- 🔐 [Authentication API](./AUTH_API.md) - User registration, login, session management, and device tracking
- 👤 [User & Profile API](./USER_API.md) - Profile management, user discovery, activity tracking, and social connections
- 🤝 [Connections API](./CONNECTIONS_API.md) - Connection management, vouching system, and trust scores ([Quick Ref](./CONNECTIONS_QUICKREF.md))

- 🔐 [Authentication API](./AUTH_API.md) - User registration, login, session management, and device tracking
- 👤 [User & Profile API](./USER_API.md) - Profile management, user discovery, activity tracking, and social connections
- 📱 [QR Code Identity API](./QR_CODE_API.md) - JWT-based QR codes for connections and event check-ins ([Quick Ref](./QR_CODE_QUICKREF.md))
- 🤝 [Connections API](./CONNECTIONS_API.md) - Connection management, vouching system, and trust scores ([Quick Ref](./CONNECTIONS_QUICKREF.md))
- � [Trust Score API](./TRUST_SCORE_API.md) - Trust score calculation, dashboard, badges, and leaderboard
- ⚖️ [Accountability API](./ACCOUNTABILITY_API.md) - Accountability chain where vouchers are affected by vouchees' behavior
- 🔒 [Trust Level Gating](./TRUST_LEVEL_GATING.md) - Feature access control based on trust score
- 🎁 [Community Vouch Offers API](./COMMUNITY_VOUCH_OFFERS_API.md) - Automatic vouch offers for eligible community members
- �🏘️ [Communities API](./COMMUNITIES_API.md) - Community management, membership, and community vouching ([Quick Ref](./COMMUNITIES_QUICKREF.md))
- 🎯 [Onboarding API V2](./ONBOARDING_V2_API.md) - Two-phase onboarding: app preview (pre-auth) + personalized setup (post-auth) ([Legacy V1](./ONBOARDING_API.md))
- 🌍 [Metadata API](./METADATA_API.md) - Countries, regions, timezone data, and **Profile Metadata** (interests, languages, professions, username validation) ([Quick Ref](./PROFILE_METADATA_QUICKREF.md) | [Test Results](./USERNAME_VALIDATION_TEST_RESULTS.md))
- 🎉 [Events API](./EVENTS_API.md) - Event management, ticket sales, RSVPs, and attendance tracking ([Quick Ref](./EVENTS_QUICKREF.md))
- 🔔 [Notifications API](./NOTIFICATIONS_API.md) - In-app notifications for user actions and system alerts

## Base URL

**Production:** `https://api.bersemuka.com/v2`  
**Staging:** `https://staging-api.bersemuka.com/v2`  
**Development:** `http://localhost:3000/v2`

**Legacy V1:** `http://localhost:3000/api/v1` (backward compatibility only)

## Authentication

Most API endpoints require authentication using JWT (JSON Web Tokens).

### Getting Started

1. **Register** a new account: `POST /v2/auth/register`
2. **Login** to get access token: `POST /v2/auth/login`
3. **Use token** in requests: `Authorization: Bearer <access_token>`

### Token Lifecycle

- **Access Token:** Expires in 15 minutes
- **Refresh Token:** Expires in 365 days (stored in HTTP-only cookie)
- **Refresh:** Use `POST /v2/auth/refresh-token` to get new access token

## API Modules

### Authentication Module (`/v2/auth`)
Handles user authentication, registration, password management, and session control.

**Key Endpoints:**
- `POST /register` - Create new account
- `POST /login` - User login
- `POST /refresh-token` - Refresh access token
- `GET /me` - Get current user
- `POST /logout` - Logout current session
- `POST /logout-all` - Logout from all devices
- `POST /change-password` - Change password
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token

📖 [Full Authentication Documentation](./AUTH_API.md)

### User & Profile Module (`/v2/users`)
Manages user profiles, discovery, search, and basic user operations.

**Key Endpoints:**
- `GET /profile` - Get current user profile
- `PUT /profile` - Update profile
- `POST /upload-avatar` - Upload profile picture
- `GET /all` - Get all users (discovery)
- `GET /search` - Search users
- `GET /nearby` - Find nearby users
- `GET /:id` - Get user by ID

📖 [Full User API Documentation](./USER_API.md)

### Connections & Vouching Module (`/v2/connections`, `/v2/vouches`)
Comprehensive connection management with trust-based vouching system and intelligent suggestions.

**Key Endpoints:**
- `POST /connections/request` - Send connection request
- `PUT /connections/:id/respond` - Accept/reject request
- `DELETE /connections/:id/remove` - Remove connection
- `GET /connections` - List connections with filters
- `GET /connections/stats` - Connection statistics
- `GET /connections/mutual/:userId` - Mutual connections
- `GET /connections/suggestions` - AI-powered suggestions
- `POST /connections/block/:userId` - Block user
- `POST /vouches/request` - Request vouch
- `PUT /vouches/:id/respond` - Approve/decline vouch
- `GET /vouches/summary` - Vouch & trust score summary

📖 [Full Connections API Documentation](./CONNECTIONS_API.md) | [Quick Reference](./CONNECTIONS_QUICKREF.md)

### Communities Module (`/v2/communities`)
Comprehensive community management system with role-based permissions, member approval workflows, and community vouching.

**Key Endpoints:**
- `POST /communities` - Create community
- `GET /communities` - List/search communities
- `GET /communities/my` - Get my communities
- `GET /communities/:id` - Get community details
- `PUT /communities/:id` - Update community
- `DELETE /communities/:id` - Delete community
- `POST /communities/:id/join` - Join community
- `DELETE /communities/:id/leave` - Leave community
- `GET /communities/:id/members` - List members
- `POST /communities/:id/members/:userId/approve` - Approve member
- `POST /communities/:id/members/:userId/reject` - Reject member
- `PUT /communities/:id/members/:userId/role` - Update role
- `DELETE /communities/:id/members/:userId` - Remove member
- `GET /communities/:id/stats` - Get statistics
- `GET /communities/:id/members/:userId/vouch-eligibility` - Check vouch eligibility
- `POST /communities/:id/members/:userId/vouch` - Grant community vouch
- `DELETE /communities/:id/members/:userId/vouch` - Revoke vouch

📖 [Full Communities API Documentation](./COMMUNITIES_API.md) | [Quick Reference](./COMMUNITIES_QUICKREF.md)

### Metadata Module (`/v2/metadata`)
Provides access to geographical and timezone data for the platform.

**Key Endpoints:**
- `GET /countries` - Get all countries
- `GET /regions` - Get regions for a country
- `GET /timezones` - Get available timezones

📖 [Full Metadata Documentation](./METADATA_API.md)

### Events Module (`/v2/events`)
Comprehensive event management system with ticket sales, RSVPs, and QR code-based check-ins.

**Key Endpoints:**
- `POST /events` - Create event
- `GET /events` - List/search events
- `GET /events/:id` - Get event details
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event
- `POST /ticket-tiers` - Create ticket tier
- `POST /tickets/purchase` - Purchase ticket
- `POST /events/:id/rsvp` - RSVP to free event
- `GET /rsvps/:id/qr-code` - Generate check-in QR code
- `POST /events/:id/check-in` - Check in attendee

📖 [Full Events Documentation](./EVENTS_API.md)

### Notifications Module (`/v2/notifications`)
In-app notification system for user actions including connections, vouches, events, and security alerts.

**Key Endpoints:**
- `GET /notifications` - Get user notifications (paginated)
- `GET /notifications/unread-count` - Get unread count (for badge)
- `PUT /notifications/read-all` - Mark all as read
- `PUT /notifications/:id/read` - Mark specific as read
- `DELETE /notifications/read` - Delete all read notifications
- `DELETE /notifications/:id` - Delete specific notification

📖 [Full Notifications Documentation](./NOTIFICATIONS_API.md)

### QR Code Identity Module (`/v2/users/qr-code`, `/v2/connections/scan-qr`, `/v2/events/scan-qr`)
Secure JWT-based QR code system for user identity verification, instant connections, and event check-ins with nonce-based replay protection.

**Key Endpoints:**
- `POST /users/me/qr-code` - Generate QR code (CONNECT or CHECKIN purpose)
- `POST /users/qr-code/validate` - Validate QR code without action
- `POST /connections/scan-qr` - Scan QR to send connection request
- `POST /events/scan-qr` - Scan QR to check in attendee at event

**Key Features:**
- **JWT-Based:** HS256 signed tokens with user identity and purpose
- **Time-Limited:** CONNECT (15 min), CHECKIN (5 min)
- **Replay Protection:** One-time use nonces stored in Redis
- **Purpose Validation:** Can't use CONNECT QR for CHECKIN
- **Permission Checks:** Organizers only for event check-ins
- **Security:** Self-connection prevention, status validation, blocked user handling

📖 [Full QR Code API Documentation](./QR_CODE_API.md) | [Quick Reference](./QR_CODE_QUICKREF.md)

### Onboarding Module V2 (`/v2/onboarding-v2`)
Two-phase onboarding system: anonymous app preview before authentication, and personalized setup after registration.

**Phase 1: App Preview (No Auth Required) - `/v2/onboarding-v2/app-preview`**
- `GET /screens` - Get app introduction screens (title, description, image, order)
- `POST /track` - Track anonymous user interactions (views, skips, completions)
- `POST /link` - Link pre-auth session to newly registered user account
- `GET /analytics` - Get app preview analytics and conversion metrics (admin)

**Phase 2: User Setup (Auth Required) - `/v2/onboarding-v2/user-setup`**
- `GET /screens` - Get personalized setup screens (profile, network, community, preferences)
- `POST /track` - Track user progress through setup flow
- `GET /status` - Get user's setup completion status and progress
- `POST /complete` - Mark entire setup as complete
- `GET /analytics` - Get user setup completion analytics (admin)

**Key Features:**
- **Anonymous Tracking:** Track app preview engagement before user signs up
- **Session Linking:** Connect pre-auth activity to user account post-registration
- **Screen Types:** Support for PROFILE, NETWORK, COMMUNITY, PREFERENCES, TUTORIAL, VERIFICATION
- **Progress Tracking:** Required vs optional screens with completion status
- **Analytics:** Comprehensive metrics for both phases (conversion rates, drop-off points, completion times)

📖 [Full Onboarding V2 Documentation](./ONBOARDING_V2_API.md) | [Legacy V1 (Deprecated)](./ONBOARDING_API.md)

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
  const response = await fetch('https://api.bersemuka.com/v2/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // Important for refresh token cookie
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store access token in memory or secure storage (NOT localStorage for production)
    sessionStorage.setItem('accessToken', data.data.token);
    return data.data.user;
  } else {
    throw new Error(data.error.message);
  }
};

// Authenticated Request
const getProfile = async () => {
  const token = sessionStorage.getItem('accessToken');
  
  const response = await fetch('https://api.bersemuka.com/v2/users/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
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
  const response = await fetch('https://api.bersemuka.com/v2/auth/refresh-token', {
    method: 'POST',
    credentials: 'include', // Sends refresh token cookie
  });
  
  const data = await response.json();
  
  if (data.success) {
    sessionStorage.setItem('accessToken', data.data.token);
    return data.data.token;
  } else {
    // Refresh failed, redirect to login
    sessionStorage.clear();
    window.location.href = '/login';
  }
};

// Send Connection Request
const sendConnectionRequest = async (userId) => {
  const token = sessionStorage.getItem('accessToken');
  
  const response = await fetch(`https://api.bersemuka.com/v2/users/connections/${userId}/request`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  });
  
  return await response.json();
};
```

### cURL

```bash
# Login
curl -X POST https://api.bersemuka.com/v2/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'

# Get Profile
curl -X GET https://api.bersemuka.com/v2/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt

# Update Profile
curl -X PUT https://api.bersemuka.com/v2/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "bio": "Updated bio",
    "interests": ["travel", "photography"]
  }'

# Send Connection Request
curl -X POST https://api.bersemuka.com/v2/users/connections/USER_ID/request \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt

# Search Nearby Users
curl -X GET "https://api.bersemuka.com/v2/users/nearby?latitude=40.7128&longitude=-74.0060&radius=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt
```

## Error Handling

### Client-Side Error Handling

```javascript
const apiRequest = async (url, options = {}) => {
  try {
    const token = sessionStorage.getItem('accessToken');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
      credentials: 'include', // Always include for refresh token cookie
    });
    
    const data = await response.json();
    
    if (!data.success) {
      // Handle specific error codes
      switch (response.status) {
        case 401:
          // Try to refresh token
          if (url !== '/v2/auth/refresh-token') {
            await refreshToken();
            return apiRequest(url, options); // Retry
          }
          // Refresh failed, redirect to login
          sessionStorage.clear();
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

## Recent Changes (October 2025)

### ✅ What's New in V2.2 (October 20, 2025)

**🏆 Comprehensive Trust System**
- **Trust Dashboard:** Comprehensive overview with rank percentile, recent changes, suggestions, accountability impact, and decay warnings
- **Trust Badges:** 8 achievement badges (bronze/silver/gold/platinum) for trust milestones
- **Trust Leaderboard:** Global, community, and friends leaderboards with anonymization
- **Trust Score History:** Detailed tracking of all score changes with reasons and metadata
- **Trust Level Gating:** Feature access control (26%/51%/76% thresholds) to prevent abuse
- **Accountability Chain:** Vouchers affected by vouchees' behavior (40% penalty / 20% reward formula)
- **Community Vouch Offers:** Automatic vouch offers for eligible community members (5+ events, 90+ days, zero negative feedback)
- **Trust Decay System:** Scores decay after inactivity (-1% after 30 days, -2% after 90 days) with warnings and reactivation bonuses

**🎯 Trust Level Tiers:**
- **Starter (0-10%):** Read-only access
- **Newcomer (11-25%):** Basic participation (attend events, message)
- **Growing (26-50%):** Active participation (create events, join communities)
- **Established (51-75%):** Leadership (publish events, create services)
- **Trusted (76-90%):** Advanced features (create communities, fundraisers)
- **Leader (91-100%):** Platform governance

**📊 Key Features:**
- Real-time trust score updates
- Personalized suggestions for improvement
- Accountability notifications for vouchers
- Automated eligibility job for vouch offers
- Comprehensive trust score formula (40% vouches + 30% activity + 30% trust moments)
- Feature gating middleware protecting sensitive routes

### ✅ What's New in V2.1 (October 15, 2025)

**🔐 Enhanced Authentication & Security**
- **Device Tracking:** Capture device information during registration and login
- **Location Data:** Store GPS coordinates, city, country, and timezone
- **Push Notifications:** Support for FCM/APNs token storage
- **Session Management:** Track active sessions per device with full device details
- **Security Features:** Detect unusual login locations and new devices
- **Flexible API:** Accept device data in request body OR headers

**📱 Device Information Support**
Clients can now send:
- Device ID (unique identifier)
- Device name (user-friendly name)
- Device type (iOS, Android, web, desktop)
- OS version
- App version
- Push notification token

**🌍 Location Information Support**
Clients can now send:
- GPS coordinates (latitude/longitude)
- City and country
- Timezone

**📊 What Gets Captured Automatically**
- IP address
- User-Agent
- Browser details
- Operating system
- Device type
- Platform information

### ✅ What's New in V2.0

- **Modular Architecture:** Clean separation of concerns with dedicated modules
- **UserConnection System:** New connection system replacing old follow/follower model
- **Enhanced Profile Data:** Separated profile data into UserProfile, UserLocation, UserMetadata relations
- **Better Token Security:** Refresh tokens stored in HTTP-only cookies
- **Improved Error Handling:** More descriptive error messages and validation
- **Geospatial Features:** Nearby user search with radius-based filtering
- **Onboarding API:** Complete onboarding screen management with analytics tracking

### 🔄 Migration from V1 to V2

Key changes when migrating:

1. **Base URL:** Change from `/api/v1/*` to `/v2/*`
2. **Connections:** Use `/connections/:id/request` instead of `/follow/:id`
3. **Profile Structure:** Profile data now includes separate relations (profile, location, metadata)
4. **Token Refresh:** Endpoint changed to `/refresh-token` and uses cookies
5. **Response Format:** Consistent success/error structure across all endpoints
6. **Device Tracking (NEW):** Optionally send device info during login/register for enhanced security
7. **Location Data (NEW):** Optionally send location info for security and analytics

### 🗂️ Active Modules

The API is currently focused on core functionality:
- ✅ **Authentication** - Full user auth lifecycle with device tracking and security features
- ✅ **User Management** - Profiles, connections, discovery, activity tracking, security events
- ✅ **Trust System** - Trust scores, accountability chain, trust level gating, badges, leaderboard
- ✅ **Communities** - Community management, membership, community vouching, automatic vouch offers
- ✅ **Connections** - Connection management, vouching system, trust moments
- ✅ **Onboarding V2** - Two-phase onboarding: app preview (pre-auth) + personalized setup (post-auth)
- ✅ **Metadata** - Countries, regions, timezones
- ✅ **Events** - Event management, ticket sales, RSVPs, QR code check-ins

### 🚧 Coming Soon

- 💬 Messaging API (V2)
- 🔔 Notifications API (V2)
- 🎯 Matching API (V2)
- 💳 Payments API (V2)
- 🎮 Card Game API (V2)

---

**Last Updated:** October 20, 2025  
**API Version:** v2.2.0  
**Status:** Active Development

---

## 🆕 Latest Features (v2.1.0)

### Device & Location Tracking

**Why Track Device Data?**
- 🔒 **Security:** Detect suspicious logins from unusual locations or devices
- 📊 **Analytics:** Understand user behavior, app version adoption, and platform distribution
- 🔔 **Notifications:** Store push tokens for targeted notifications
- 👤 **User Experience:** Show "trusted devices" and enable device management

**What You Should Send:**

**iOS Apps:**
```json
{
  "deviceInfo": {
    "deviceId": "UUID().uuidString",
    "deviceName": "UIDevice.current.name",
    "deviceType": "ios",
    "osVersion": "iOS 17.0",
    "appVersion": "1.2.3",
    "pushToken": "APNs-token"
  }
}
```

**Android Apps:**
```json
{
  "deviceInfo": {
    "deviceId": "Settings.Secure.ANDROID_ID",
    "deviceName": "Build.MODEL",
    "deviceType": "android",
    "osVersion": "Android 14",
    "appVersion": "1.2.3",
    "pushToken": "FCM-token"
  }
}
```

**Web Apps:**
```json
{
  "deviceInfo": {
    "deviceId": "localStorage-uuid",
    "deviceName": "Chrome on Windows",
    "deviceType": "web",
    "osVersion": "Windows 11",
    "appVersion": "1.2.3"
  }
}
```

**Location Data (Optional but Recommended):**
```json
{
  "locationInfo": {
    "latitude": 1.3521,
    "longitude": 103.8198,
    "city": "Singapore",
    "country": "Singapore",
    "timezone": "Asia/Singapore"
  }
}
```

See [Authentication API](./AUTH_API.md) for full details and examples.
