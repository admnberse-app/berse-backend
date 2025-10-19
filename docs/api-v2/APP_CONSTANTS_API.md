# App Constants API Documentation

## Overview

The App Constants API provides centralized access to application enums, validation rules, and configuration settings. This prevents mobile frontends from hard-coding values and ensures consistency across the platform.

**Base URL**: `/v2/app-constants`

---

## Endpoints

### 1. Get All Enums

Returns all enumeration types used in the application.

**Endpoint**: `GET /v2/app-constants/enums`

**Authentication**: Not required

**Response**:
```json
{
  "success": true,
  "message": "Enums retrieved successfully",
  "data": {
    "version": "1.0.0",
    "lastUpdated": "2025-10-19T10:00:00.000Z",
    "enums": {
      "userRole": {
        "category": "User Role",
        "description": "User role types in the system",
        "values": [
          {
            "key": "GENERAL_USER",
            "value": "GENERAL_USER",
            "label": "General User",
            "description": "Regular user"
          },
          {
            "key": "GUIDE",
            "value": "GUIDE",
            "label": "Guide",
            "description": "Certified guide"
          }
        ]
      },
      "connectionStatus": {
        "category": "Connection Status",
        "description": "Status of user connections",
        "values": [
          {
            "key": "PENDING",
            "value": "PENDING",
            "label": "Pending",
            "description": "Connection request pending"
          },
          {
            "key": "ACCEPTED",
            "value": "ACCEPTED",
            "label": "Accepted",
            "description": "Connection accepted"
          }
        ]
      }
    }
  }
}
```

**Available Enums**:
- `userRole` - User role types (GENERAL_USER, GUIDE, MODERATOR, ADMIN)
- `userStatus` - User account status (ACTIVE, DEACTIVATED, BANNED, PENDING)
- `connectionStatus` - Connection statuses (PENDING, ACCEPTED, REJECTED, CANCELED, REMOVED)
- `vouchType` - Vouch types (PRIMARY, SECONDARY, COMMUNITY)
- `vouchStatus` - Vouch statuses (PENDING, APPROVED, ACTIVE, REVOKED, DECLINED)
- `eventType` - Event types (SOCIAL, SPORTS, TRIP, ILM, CAFE_MEETUP, VOLUNTEER, etc.)
- `eventStatus` - Event statuses (DRAFT, PUBLISHED, CANCELED, COMPLETED)
- `eventParticipantStatus` - Participant statuses (REGISTERED, CONFIRMED, CHECKED_IN, CANCELED, NO_SHOW)
- `eventHostType` - Host types (PERSONAL, COMMUNITY)
- `notificationType` - Notification types (EVENT, MATCH, POINTS, MESSAGE, SYSTEM, etc.)
- `paymentStatus` - Payment statuses (PENDING, PROCESSING, SUCCEEDED, FAILED, CANCELED, REFUNDED, etc.)
- `transactionType` - Transaction types (EVENT_TICKET, MARKETPLACE_ORDER, SERVICE_BOOKING, SUBSCRIPTION, etc.)
- `listingStatus` - Marketplace listing statuses (DRAFT, ACTIVE, SOLD, EXPIRED, REMOVED)
- `orderStatus` - Order statuses (CART, PENDING, CONFIRMED, SHIPPED, DELIVERED, etc.)
- `bookingStatus` - Service booking statuses (PENDING, CONFIRMED, ACTIVE, COMPLETED, CANCELED, REFUNDED)
- `serviceType` - Service types (GUIDING, HOMESTAY, TUTORING, CONSULTATION, TRANSPORT, OTHER)
- `serviceStatus` - Service statuses (DRAFT, ACTIVE, PAUSED, INACTIVE, SUSPENDED)
- `pricingType` - Pricing models (PER_HOUR, PER_DAY, PER_PERSON, PER_NIGHT, FIXED)
- `badgeType` - Achievement badges (FIRST_FACE, CAFE_FRIEND, CONNECTOR, LOCAL_GUIDE, etc.)
- `communityRole` - Community roles (MEMBER, MODERATOR, ADMIN, OWNER)
- `matchType` - Match types (SPORTS, SOCIAL, VOLUNTEER, STUDY, PROFESSIONAL, HOBBY)
- `matchStatus` - Match statuses (PENDING, ACCEPTED, REJECTED, EXPIRED)
- `redemptionStatus` - Reward redemption statuses (PENDING, APPROVED, REJECTED)
- `subscriptionStatus` - Subscription statuses (ACTIVE, TRIALING, PAST_DUE, CANCELED, EXPIRED, etc.)
- `disputeStatus` - Dispute statuses (OPEN, UNDER_REVIEW, RESOLVED, CLOSED)
- `payoutStatus` - Payout statuses (PENDING, PROCESSING, RELEASED, HELD, FROZEN, FAILED, CANCELED)
- `announcementPriority` - Announcement priorities (LOW, NORMAL, HIGH, URGENT)
- `appPlatform` - App platforms (IOS, ANDROID, WEB)
- `legalDocumentType` - Legal document types (TOS, PRIVACY_POLICY, EULA, etc.)
- `maintenanceStatus` - Maintenance statuses (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, DELAYED)
- `eventTicketStatus` - Event ticket statuses (PENDING, CONFIRMED, CHECKED_IN, CANCELED, REFUNDED, EXPIRED)
- `referralRewardStatus` - Referral reward statuses (PENDING, APPROVED, AWARDED, CLAIMED, EXPIRED, CANCELED)

---

### 2. Get Validation Rules

Returns validation rules for common input fields.

**Endpoint**: `GET /v2/app-constants/validation-rules`

**Authentication**: Not required

**Response**:
```json
{
  "success": true,
  "message": "Validation rules retrieved successfully",
  "data": {
    "version": "1.0.0",
    "rules": {
      "username": {
        "field": "username",
        "type": "string",
        "required": false,
        "minLength": 3,
        "maxLength": 30,
        "pattern": "^[a-zA-Z0-9_-]+$",
        "description": "Username must be 3-30 characters, alphanumeric with underscores and hyphens"
      },
      "email": {
        "field": "email",
        "type": "email",
        "required": true,
        "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        "description": "Valid email address required"
      },
      "phone": {
        "field": "phone",
        "type": "phone",
        "required": false,
        "pattern": "^\\+?[1-9]\\d{1,14}$",
        "description": "Phone number in E.164 format (e.g., +60123456789)"
      },
      "password": {
        "field": "password",
        "type": "string",
        "required": true,
        "minLength": 8,
        "maxLength": 128,
        "description": "Password must be at least 8 characters"
      },
      "rating": {
        "field": "rating",
        "type": "number",
        "required": true,
        "min": 1,
        "max": 5,
        "description": "Rating must be between 1 and 5"
      }
    }
  }
}
```

**Available Validation Rules**:
- `username` - Username format and length
- `email` - Email address format
- `phone` - Phone number format (E.164)
- `password` - Password length requirements
- `fullName` - Full name requirements
- `displayName` - Display name requirements
- `bio` - Bio length limit (500 chars)
- `shortBio` - Short bio length limit (160 chars)
- `rating` - Rating range (1-5)
- `price` - Price validation (positive number)
- `quantity` - Quantity validation (min 1)

---

### 3. Get App Configuration

Returns application configuration including features, limits, and settings.

**Endpoint**: `GET /v2/app-constants/config`

**Authentication**: Not required

**Response**:
```json
{
  "success": true,
  "message": "App configuration retrieved successfully",
  "data": {
    "version": "1.0.0",
    "features": {
      "vouch": {
        "enabled": true,
        "description": "Vouch system for trust building",
        "metadata": {
          "maxPrimaryVouches": 1,
          "maxSecondaryVouches": 3,
          "maxCommunityVouches": 2
        }
      },
      "marketplace": {
        "enabled": true,
        "description": "Marketplace for buying and selling"
      }
    },
    "limits": {
      "maxImageUploadSize": {
        "value": 5242880,
        "description": "Maximum image upload size",
        "unit": "bytes"
      },
      "maxImagesPerListing": {
        "value": 10,
        "description": "Maximum images per marketplace listing",
        "unit": "images"
      },
      "bioMaxLength": {
        "value": 500,
        "description": "Maximum bio length",
        "unit": "characters"
      }
    },
    "settings": {
      "defaultCurrency": {
        "value": "MYR",
        "type": "string",
        "description": "Default currency for transactions",
        "options": ["MYR", "SGD", "USD", "EUR", "GBP"]
      },
      "defaultTimezone": {
        "value": "Asia/Kuala_Lumpur",
        "type": "string",
        "description": "Default timezone"
      },
      "paginationDefaultLimit": {
        "value": 20,
        "type": "number",
        "description": "Default pagination limit"
      }
    }
  }
}
```

**Configuration Sections**:

**Features**:
- `vouch` - Vouch system configuration
- `marketplace` - Marketplace feature status
- `events` - Events feature status
- `services` - Service bookings feature status
- `subscriptions` - Premium subscriptions feature status
- `gamification` - Points, badges, and rewards feature status

**Limits**:
- `maxImageUploadSize` - Max image size (5MB)
- `maxImagesPerListing` - Max marketplace images (10)
- `maxEventImages` - Max event images (5)
- `maxInterests` - Max user interests (20)
- `maxLanguages` - Max user languages (10)
- `messageMaxLength` - Max message length (1000 chars)
- `bioMaxLength` - Max bio length (500 chars)
- `shortBioMaxLength` - Max short bio length (160 chars)

**Settings**:
- `defaultCurrency` - Default currency (MYR)
- `defaultTimezone` - Default timezone (Asia/Kuala_Lumpur)
- `defaultLanguage` - Default language (en)
- `supportedCountries` - Supported countries array
- `paginationDefaultLimit` - Default pagination (20)
- `paginationMaxLimit` - Max pagination limit (100)

---

### 4. Get All Constants

Returns all constants (enums + validation rules + config) in one request.

**Endpoint**: `GET /v2/app-constants/all`

**Authentication**: Not required

**Response**:
```json
{
  "success": true,
  "message": "All constants retrieved successfully",
  "data": {
    "enums": {
      "version": "1.0.0",
      "lastUpdated": "2025-10-19T10:00:00.000Z",
      "enums": { /* All enums */ }
    },
    "validationRules": {
      "version": "1.0.0",
      "rules": { /* All validation rules */ }
    },
    "config": {
      "version": "1.0.0",
      "features": { /* All features */ },
      "limits": { /* All limits */ },
      "settings": { /* All settings */ }
    }
  }
}
```

**Use Case**: Initial app load - fetch all constants at once for offline use.

---

## Usage Examples

### Mobile App Initialization

```typescript
// Fetch all constants on app startup
const response = await fetch('https://api.berse-app.com/v2/app-constants/all');
const { data } = await response.json();

// Store in local cache
await AsyncStorage.setItem('app_constants', JSON.stringify(data));

// Use enums instead of hard-coding
const eventTypes = data.enums.enums.eventType.values;
// [{ key: 'SOCIAL', value: 'SOCIAL', label: 'Social', ... }, ...]

// Validate inputs using rules
const usernameRule = data.validationRules.rules.username;
if (username.length < usernameRule.minLength) {
  showError(usernameRule.description);
}

// Check feature availability
if (data.config.features.marketplace.enabled) {
  showMarketplaceTab();
}

// Apply limits
const maxImages = data.config.limits.maxImagesPerListing.value;
if (images.length > maxImages) {
  showError(`Maximum ${maxImages} images allowed`);
}
```

### Dropdown Population

```typescript
// Fetch event types for dropdown
const { data } = await fetch('/v2/app-constants/enums').then(r => r.json());
const eventTypes = data.enums.eventType.values;

// Populate picker
<Picker>
  {eventTypes.map(type => (
    <Picker.Item 
      key={type.key} 
      label={type.label} 
      value={type.value} 
    />
  ))}
</Picker>
```

### Form Validation

```typescript
// Fetch validation rules
const { data } = await fetch('/v2/app-constants/validation-rules').then(r => r.json());
const emailRule = data.rules.email;

// Validate email
const emailRegex = new RegExp(emailRule.pattern);
if (!emailRegex.test(email)) {
  showError(emailRule.description);
}
```

---

## Benefits

✅ **No Hard-Coding**: All enum values fetched from API
✅ **Consistency**: Same validation rules across web and mobile
✅ **Centralized Updates**: Update enums/rules once, applies everywhere
✅ **Offline Support**: Cache constants locally for offline use
✅ **Dynamic Features**: Enable/disable features without app updates
✅ **Proper Labels**: User-friendly labels instead of technical enum keys
✅ **Descriptions**: Helpful descriptions for each enum value
✅ **Version Control**: Track constants version for compatibility

---

## Best Practices

1. **Fetch on App Start**: Load constants when app initializes
2. **Cache Locally**: Store in AsyncStorage/localStorage for offline use
3. **Check Version**: Compare cached version with server version
4. **Refresh Periodically**: Update constants every 24 hours or on app foreground
5. **Fallback Values**: Have default values if API fails
6. **Use Enums Everywhere**: Replace all hard-coded strings with enum values
7. **Validate Before Submit**: Use validation rules before API calls
8. **Respect Limits**: Check limits before allowing user actions
9. **Feature Flags**: Check feature availability before showing UI

---

## Error Handling

All endpoints return standard error format:

```json
{
  "success": false,
  "message": "Error message here",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

---

## Caching Strategy

**Recommended approach**:

```typescript
const CONSTANTS_CACHE_KEY = 'app_constants';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function getConstants() {
  const cached = await AsyncStorage.getItem(CONSTANTS_CACHE_KEY);
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    
    // Check if cache is still valid
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  
  // Fetch fresh data
  const response = await fetch('/v2/app-constants/all');
  const { data } = await response.json();
  
  // Cache with timestamp
  await AsyncStorage.setItem(CONSTANTS_CACHE_KEY, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
  
  return data;
}
```

---

## Version History

- **v1.0.0** (2025-10-19): Initial release with 30+ enums, 11 validation rules, and full app configuration

---

## Related Documentation

- [Main API Documentation](./API_DOCUMENTATION.md)
- [Connection Module](./CONNECTION_MODULE_QUICKREF.md)
- [Marketplace Module](./MARKETPLACE_MODULE_COMPLETE.md)
- [Mobile User Journey](./MOBILE_USER_JOURNEY_CONNECTIONS_VOUCHES.md)
