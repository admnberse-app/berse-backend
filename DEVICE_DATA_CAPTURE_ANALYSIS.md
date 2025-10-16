# Device Data Capture Analysis

## Current State ✅

The authentication system **IS capturing** device and user data, but it's done through:
1. **HTTP Headers** (not documented in Swagger)
2. **Request metadata extraction** (automatic)
3. **IP address and User-Agent** (from Express request)

## What's Being Captured

### During Registration & Login

| Data | Source | Stored In | Currently Working |
|------|--------|-----------|-------------------|
| IP Address | `req.ip` / `req.socket.remoteAddress` | `UserMetadata.ipAddress`, `UserSession.ipAddress`, `LoginAttempt.ipAddress` | ✅ Yes |
| User Agent | `req.get('user-agent')` | `UserMetadata.userAgent`, `UserSession.userAgent`, `LoginAttempt.userAgent` | ✅ Yes |
| Device Info | `ActivityLoggerService.getRequestMetadata()` | `UserSession.deviceInfo` (JSON) | ✅ Yes |
| Device ID | Header: `x-device-id` | `DeviceRegistration.deviceId` | ✅ Yes (if header sent) |
| Device Name | Header: `x-device-name` | `DeviceRegistration.deviceName` | ✅ Yes (if header sent) |
| Location Data | Not captured | `UserSession.locationData` (JSON) | ❌ No |
| UTM Parameters | Query params: `utm_source`, `utm_medium`, `utm_campaign` | `UserMetadata` fields | ✅ Yes |
| Referral Source | From referral code or 'direct' | `UserMetadata.referralSource` | ✅ Yes |

### Device Data Structure (from ActivityLoggerService)

```typescript
{
  deviceInfo: {
    browser: string,
    browserVersion: string,
    os: string,
    osVersion: string,
    platform: string,
    isMobile: boolean,
    isTablet: boolean,
    isDesktop: boolean,
    deviceType: string,
    userAgent: string
  }
}
```

## Database Tables Involved

### 1. UserMetadata
Stores user-level metadata captured during registration:
```prisma
model UserMetadata {
  userId         String   @id
  referralCode   String   @unique
  membershipId   String?  @unique
  referralSource String?  // 'referral' or 'direct'
  utmSource      String?  // Marketing attribution
  utmMedium      String?  // Marketing attribution
  utmCampaign    String?  // Marketing attribution
  affiliateId    String?
  lifetimeValue  Float    @default(0.0)
  ipAddress      String?  // ✅ Captured on registration
  userAgent      String?  // ✅ Captured on registration
  tags           String[] @default([])
  notes          String?
  internalNotes  String?
  updatedAt      DateTime
}
```

### 2. UserSession
Stores session data for each login:
```prisma
model UserSession {
  id             String   @id
  userId         String
  sessionToken   String   @unique
  deviceInfo     Json?    // ✅ Captured on login
  ipAddress      String   // ✅ Captured on login
  userAgent      String?  // ✅ Captured on login
  locationData   Json?    // ❌ NOT being captured
  isActive       Boolean  @default(true)
  lastActivityAt DateTime @default(now())
  expiresAt      DateTime
  createdAt      DateTime @default(now())
}
```

### 3. LoginAttempt
Tracks all login attempts (success or failure):
```prisma
model LoginAttempt {
  id            String   @id
  userId        String?
  identifier    String   // email/username used
  ipAddress     String   // ✅ Captured
  userAgent     String?  // ✅ Captured
  success       Boolean
  failureReason String?
  attemptedAt   DateTime @default(now())
}
```

### 4. DeviceRegistration
Stores registered devices per user:
```prisma
model DeviceRegistration {
  id              String    @id
  userId          String
  deviceId        String    // ✅ From x-device-id header
  deviceName      String?   // ✅ From x-device-name header
  deviceType      String?   // ios, android, web
  pushToken       String?   // For notifications
  lastUsedAt      DateTime  @default(now())
  registeredAt    DateTime  @default(now())
  isActive        Boolean   @default(true)
}
```

## The Problem ❌

### 1. **Headers Not Documented**
Clients don't know they should send:
```
x-device-id: unique-device-identifier
x-device-name: iPhone 14 Pro
x-app-version: 1.2.3
```

### 2. **Location Data Not Captured**
`UserSession.locationData` field exists but is always `null` because we're not capturing:
- GPS coordinates
- City/Country (from IP geolocation)
- Timezone

### 3. **Inconsistent API Documentation**
Swagger doesn't show:
- Optional device-related fields
- Header requirements
- What gets captured automatically

### 4. **Missing Request Body Fields**
The request body could accept additional data:

**What we COULD capture:**
```typescript
interface RegisterRequest {
  // Current fields
  email: string;
  password: string;
  fullName: string;
  
  // MISSING - Device/App info
  deviceInfo?: {
    deviceId?: string;        // Unique device identifier
    deviceName?: string;      // e.g., "John's iPhone"
    deviceType?: string;      // "ios" | "android" | "web"
    osVersion?: string;       // e.g., "iOS 17.0"
    appVersion?: string;      // e.g., "1.2.3"
    pushToken?: string;       // For notifications
  };
  
  // MISSING - Location info
  locationInfo?: {
    latitude?: number;
    longitude?: number;
    city?: string;
    country?: string;
    timezone?: string;
  };
  
  // MISSING - Marketing attribution (currently only from query params)
  attribution?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmContent?: string;
    referralCode?: string;
    affiliateId?: string;
  };
}
```

## Recommendations 💡

### Option 1: Keep Header-Based (Current Approach) ✅ **RECOMMENDED**
**Pros:**
- Cleaner API
- Security (device IDs in headers, not logged)
- Follows REST conventions
- Already implemented

**Cons:**
- Not discoverable without documentation
- Client needs to know about headers

**Action Items:**
1. ✅ Document all required/optional headers in Swagger
2. ✅ Create client integration guide
3. ✅ Add location data capture via IP geolocation
4. ✅ Update validators to check headers

### Option 2: Move to Request Body (Alternative)
**Pros:**
- Self-documenting
- Explicit in API contracts
- Easier for clients to discover

**Cons:**
- Pollutes request body
- Mixes authentication data with device data
- More validation complexity

### Option 3: Hybrid Approach ⚡ **BEST**
**Combine both:**
- Keep automatic capture (IP, User-Agent) via headers
- Accept optional device info in request body
- Document both methods

```typescript
// Request Body (Optional)
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "deviceInfo": {  // ✅ Optional, enhances data
    "deviceId": "abc-123",
    "deviceName": "John's iPhone",
    "deviceType": "ios",
    "appVersion": "1.2.3"
  }
}

// Headers (Automatic)
x-device-id: abc-123
x-device-name: John's iPhone
x-app-version: 1.2.3
User-Agent: MyApp/1.2.3 (iOS 17.0)
```

## Implementation Plan 🚀

### Phase 1: Documentation (Immediate)
- [ ] Update Swagger docs with header documentation
- [ ] Add header parameters to auth endpoints
- [ ] Create device integration guide
- [ ] Document automatic vs manual data capture

### Phase 2: Enhanced Capture (Short-term)
- [ ] Add optional `deviceInfo` to request body
- [ ] Add optional `locationInfo` to request body
- [ ] Implement IP-based geolocation for location data
- [ ] Add validators for device fields

### Phase 3: Client SDK (Long-term)
- [ ] Create client helper functions
- [ ] Auto-capture device info in SDK
- [ ] Handle header injection automatically
- [ ] Provide location permission helpers

## Example API Calls

### Current (Working but Undocumented)
```bash
curl -X POST http://localhost:3000/v2/auth/register \
  -H "Content-Type: application/json" \
  -H "x-device-id: device-abc-123" \
  -H "x-device-name: My iPhone" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "fullName": "John Doe"
  }'
```

### Proposed (Explicit + Documented)
```bash
curl -X POST http://localhost:3000/v2/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "fullName": "John Doe",
    "deviceInfo": {
      "deviceId": "device-abc-123",
      "deviceName": "My iPhone",
      "deviceType": "ios",
      "osVersion": "iOS 17.0",
      "appVersion": "1.2.3",
      "pushToken": "fcm-token-here"
    },
    "locationInfo": {
      "city": "Singapore",
      "country": "Singapore",
      "timezone": "Asia/Singapore"
    }
  }'
```

## What Data Different Clients Should Send

### iOS App
```json
{
  "deviceInfo": {
    "deviceId": "UUID from identifierForVendor",
    "deviceName": "UIDevice.current.name",
    "deviceType": "ios",
    "osVersion": "iOS 17.0",
    "appVersion": "1.2.3 (build 456)",
    "pushToken": "APNs device token"
  }
}
```

### Android App
```json
{
  "deviceInfo": {
    "deviceId": "Settings.Secure.ANDROID_ID",
    "deviceName": "Build.MODEL",
    "deviceType": "android",
    "osVersion": "Android 14",
    "appVersion": "1.2.3 (build 456)",
    "pushToken": "FCM token"
  }
}
```

### Web App
```json
{
  "deviceInfo": {
    "deviceId": "localStorage UUID",
    "deviceName": "navigator.userAgent",
    "deviceType": "web",
    "osVersion": "Windows 11",
    "appVersion": "1.2.3",
    "pushToken": null
  }
}
```

## Conclusion

**YES, you are correct!** Device and user-related data should be sent during login/register. 

**Current Status:**
- ✅ System IS capturing device data (via headers and automatic detection)
- ❌ API documentation doesn't show this
- ❌ Clients don't know what to send
- ❌ Location data field exists but isn't being used

**Next Steps:**
1. Update Swagger documentation (Priority 1)
2. Add optional deviceInfo to request body (Priority 2)
3. Implement IP geolocation for location data (Priority 3)
4. Create client integration guide (Priority 4)

---

**Files to Update:**
1. `src/modules/auth/auth.routes.ts` - Add Swagger header documentation
2. `src/modules/auth/auth.types.ts` - Add deviceInfo and locationInfo types
3. `src/modules/auth/auth.validators.ts` - Add validation for new fields
4. `src/modules/auth/auth.controller.ts` - Use explicit device data if provided
5. `docs/api-v2/AUTH_API.md` - Document device data requirements

Would you like me to implement these updates?
