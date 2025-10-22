# API Changelog

All notable changes to the BerseMuka API will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v2.2.0] - 2025-10-21

### 🎉 Enhanced - Profile Metadata & Documentation

#### Profile Metadata API
- **Enhanced Username Validation** with user-friendly messaging
  - Context-specific messages for different validation scenarios
  - Mobile-optimized responses for better UX
  - Smart suggestions when username is unavailable
  - Clear guidance instead of technical validation data

#### Documentation Organization
- **Unified Documentation Structure** in `/docs/api-v2/`
- **Comprehensive Profile Metadata Guide** with integration examples
- **Enhanced Swagger Documentation** with detailed response examples
- **Mobile Integration Patterns** for Flutter/mobile apps

#### New Documentation Files
- `PROFILE_METADATA_INDEX.md` - Profile metadata documentation hub
- `PROFILE_METADATA_QUICKREF.md` - Developer quick reference
- `USERNAME_VALIDATION_TEST_RESULTS.md` - Comprehensive test results
- `API_DOCUMENTATION_STRUCTURE.md` - Documentation organization guide

#### API Improvements
- **Better Response Structure** for username validation
- **User-Friendly Messages** in API responses
- **Enhanced Error Handling** with contextual messages
- **Mobile-First Design** for profile completion flows

---

## [v2.1.0] - 2025-10-15

### 🆕 Added - Device & Location Tracking

#### Authentication Module
- **Device Information Capture** during registration and login
  - `deviceInfo.deviceId` - Unique device identifier
  - `deviceInfo.deviceName` - User-friendly device name
  - `deviceInfo.deviceType` - Platform (ios, android, web, desktop)
  - `deviceInfo.osVersion` - Operating system version
  - `deviceInfo.appVersion` - Application version
  - `deviceInfo.pushToken` - Push notification token (FCM/APNs)

- **Location Information Capture** during registration and login
  - `locationInfo.latitude` - GPS latitude
  - `locationInfo.longitude` - GPS longitude
  - `locationInfo.city` - City name
  - `locationInfo.country` - Country name
  - `locationInfo.timezone` - IANA timezone identifier

- **Hybrid Data Capture Approach**
  - Accept device data in request body (recommended)
  - Support legacy headers (`x-device-id`, `x-device-name`, `x-app-version`)
  - Automatic detection of IP address and User-Agent
  - Merge provided data with auto-detected information

#### Database Storage
- Device information stored in `device_registrations.deviceInfo` (JSON)
- Location data stored in `user_sessions.locationData` (JSON)
- Push tokens stored within device info for notification delivery
- Session tracking includes full device context

#### Security Enhancements
- Track login locations for anomaly detection
- Detect unusual device access
- Store device fingerprints for trusted device features
- Enhanced session management per device

#### User Management Module
- **Activity Tracking** - 80+ activity types logged
- **Security Events** - Comprehensive security event logging
- **Session Management** - View and manage active sessions by device
- **Login History** - Complete login attempt tracking

#### Onboarding Module
- **Screen Management** - CRUD operations for onboarding screens
- **Analytics Tracking** - Track user interactions (view, skip, complete)
- **Completion Flow** - Mark onboarding as complete
- Real Unsplash placeholder images

### 📝 Changed

#### Swagger Documentation
- Updated `/v2/auth/register` with device and location fields
- Updated `/v2/auth/login` with device and location fields
- Added header parameter documentation
- Added comprehensive request/response examples
- Enhanced error response documentation

#### API Documentation
- Updated `AUTH_API.md` with device tracking details
- Updated `README.md` with v2.1.0 features
- Added `ONBOARDING_API.md` for onboarding endpoints
- Added `USER_API.md` updates for activity and security endpoints
- Created `DEVICE_DATA_IMPLEMENTATION.md` with client integration examples
- Created `DEVICE_DATA_CAPTURE_ANALYSIS.md` with technical analysis

### 🔧 Fixed

#### Onboarding Module
- Fixed missing `crypto` import in onboarding controller
- Removed non-existent `ctaClicked` fields from schema
- Fixed completion tracking to use `OnboardingAnalytic` table
- Corrected `DeviceRegistration` queries to use `deviceFingerprint`

#### User Module
- Fixed route ordering (specific routes before dynamic `:id` routes)
- Resolved activity and security endpoints returning 404
- Corrected authentication middleware placement

### ⚡ Performance
- Optimized device registration queries
- Efficient session lookup with proper indexing
- Batch device update operations

### 🔒 Security
- Enhanced login attempt tracking
- Improved session security with device context
- Better anomaly detection with location data
- Secure push token storage

### 📱 Client Integration
- Added iOS Swift examples
- Added Android Kotlin examples
- Added React Native TypeScript examples
- Added Web JavaScript examples
- Complete cURL examples for testing

---

## [v2.0.3] - 2025-10-15

### 🆕 Added - Activity & Security Endpoints

#### User Module
- `GET /v2/users/activity` - Get user activity history
- `GET /v2/users/security-events` - Get security events
- `GET /v2/users/sessions` - Get active sessions
- `GET /v2/users/login-history` - Get login history
- `DELETE /v2/users/sessions/:sessionToken` - Terminate specific session

### 📝 Changed
- Updated `USER_API.md` with activity and security documentation
- Enhanced server startup logs to show all endpoints

### 🔧 Fixed
- Fixed route ordering in `user.routes.ts`
- Placed specific routes before dynamic `:id` route

---

## [v2.0.2] - 2025-10-14

### 🆕 Added - Onboarding System

#### Onboarding Module
- `GET /v2/onboarding/screens` - Get onboarding screens
- `POST /v2/onboarding/track` - Track user interactions
- `POST /v2/onboarding/complete` - Mark onboarding complete

### 📝 Changed
- Seeded 5 default onboarding screens
- Updated images with Unsplash CDN URLs

---

## [v2.0.1] - 2025-10-13

### 🔧 Fixed
- Verified all authentication endpoints
- Updated points system (30 points for registration)
- Updated membership ID format (BSE prefix)
- Clarified error response format
- Updated validation error format

---

## [v2.0.0] - 2025-10-01

### 🎉 Initial V2 Release

#### Breaking Changes
- Base URL changed from `/api/v1/*` to `/v2/*`
- New connection system (replaced follow/follower)
- Restructured profile data (separate relations)
- Token refresh endpoint updated

#### Added
- **Modular Architecture** - Clean module separation
- **UserConnection System** - Request-based connections
- **Enhanced Profiles** - Separate UserProfile, UserLocation, UserMetadata
- **Better Security** - HTTP-only cookies for refresh tokens
- **Improved Errors** - Descriptive validation messages
- **Geospatial Features** - Nearby user search

#### Authentication Module (`/v2/auth`)
- `POST /register` - User registration
- `POST /login` - User authentication
- `POST /refresh-token` - Token refresh
- `GET /me` - Get current user
- `POST /logout` - Logout current session
- `POST /logout-all` - Logout all sessions
- `POST /change-password` - Change password
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset with token

#### User Module (`/v2/users`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `POST /upload-avatar` - Upload avatar
- `GET /all` - User discovery
- `GET /search` - Search users
- `GET /nearby` - Find nearby users
- `GET /:id` - Get user by ID
- Connection management endpoints

#### Metadata Module (`/v2/metadata`)
- `GET /countries` - Get countries
- `GET /regions` - Get regions
- `GET /timezones` - Get timezones

---

## Migration Guides

### Migrating to v2.1.0 from v2.0.x

**No Breaking Changes** - v2.1.0 is fully backward compatible.

**Recommended Updates:**

1. **Add Device Information** to login/register calls:
```javascript
// Before (still works)
await register({ email, password, fullName });

// After (recommended)
await register({
  email,
  password,
  fullName,
  deviceInfo: {
    deviceId: getDeviceId(),
    deviceName: getDeviceName(),
    deviceType: 'ios',
    appVersion: '1.2.3',
    pushToken: await getPushToken(),
  },
});
```

2. **Add Location Information** (optional):
```javascript
const location = await getCurrentLocation();
await login({
  email,
  password,
  locationInfo: {
    latitude: location.latitude,
    longitude: location.longitude,
    city: location.city,
    country: location.country,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
});
```

3. **Update Type Definitions** if using TypeScript:
```typescript
import { DeviceInfo, LocationInfo } from './types';

interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  deviceInfo?: DeviceInfo;
  locationInfo?: LocationInfo;
}
```

### Migrating to v2.0.0 from v1.x

**Breaking Changes:**

1. **Base URL:** Update all API calls
```javascript
// Before
fetch('/api/v1/auth/login', ...)

// After
fetch('/v2/auth/login', ...)
```

2. **Connections:** Update endpoint paths
```javascript
// Before
POST /api/v1/users/follow/:id

// After
POST /v2/users/connections/:id/request
```

3. **Token Refresh:** Update endpoint and include credentials
```javascript
// Before
POST /api/v1/auth/refresh

// After
POST /v2/auth/refresh-token
// With credentials: 'include' for cookie
```

4. **Profile Structure:** Handle new nested structure
```javascript
// Before
user.nationality

// After
user.location.nationality
```

---

## Deprecation Notices

### v1 API (Deprecated)
- **Status:** Deprecated but functional
- **Support End:** June 30, 2026
- **Action Required:** Migrate to v2 API before support ends
- **Documentation:** Available at `/api/v1/docs`

---

## Upcoming Features

### v2.2.0 (Planned - Q1 2026)
- [ ] IP-based geolocation (automatic location detection)
- [ ] Device management UI endpoints
- [ ] Trusted device features
- [ ] Security alert notifications
- [ ] Enhanced analytics dashboard

### v2.3.0 (Planned - Q2 2026)
- [ ] Events API v2
- [ ] Messaging API v2
- [ ] Notifications API v2
- [ ] Real-time features (WebSocket)

### v3.0.0 (Planned - Q3 2026)
- [ ] GraphQL API
- [ ] Advanced caching strategies
- [ ] API versioning in headers
- [ ] Expanded geospatial features

---

## Support & Resources

- 📖 **Documentation:** `/docs/api-v2/`
- 🐛 **Report Issues:** GitHub Issues
- 💬 **Community:** Discord Server
- 📧 **Support:** support@bersemuka.com

---

**Last Updated:** October 15, 2025  
**Current Version:** v2.1.0  
**API Status:** ✅ Stable & Production Ready
