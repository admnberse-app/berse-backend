# Onboarding API Documentation

## Overview

The Onboarding API provides endpoints for managing user onboarding screens and tracking user interactions during the onboarding flow.

**Base URL:** `/v2/onboarding`

**Version:** 2.0.0

---

## Table of Contents

- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Get Onboarding Screens](#get-onboarding-screens)
  - [Track Onboarding Action](#track-onboarding-action)
  - [Complete Onboarding](#complete-onboarding)
- [Data Models](#data-models)
- [Action Types](#action-types)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)

---

## Authentication

Most onboarding endpoints are **public** to allow guest users to view onboarding screens before authentication.

**Authenticated Endpoints:**
- `POST /v2/onboarding/complete` - Requires Bearer token

**Public Endpoints:**
- `GET /v2/onboarding/screens` - No authentication required
- `POST /v2/onboarding/track` - No authentication required (can track guest interactions)

---

## Endpoints

### Get Onboarding Screens

Retrieve all active onboarding screens in the correct order.

**Endpoint:** `GET /v2/onboarding/screens`

**Authentication:** Not required

**Query Parameters:** None

**Response:**

```json
{
  "success": true,
  "data": {
    "screens": [
      {
        "id": "uuid",
        "screenOrder": 1,
        "title": "Welcome to Berse",
        "subtitle": "Connect with verified, trusted people",
        "description": null,
        "imageUrl": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
        "videoUrl": null,
        "ctaText": "Next",
        "ctaAction": null,
        "ctaUrl": null,
        "backgroundColor": null,
        "isSkippable": true,
        "targetAudience": "all",
        "metadata": null
      }
    ]
  },
  "message": "Onboarding screens retrieved successfully"
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

### Track Onboarding Action

Track user interactions with onboarding screens for analytics.

**Endpoint:** `POST /v2/onboarding/track`

**Authentication:** Not required

**Request Body:**

```json
{
  "screenId": "uuid",
  "action": "view",
  "userId": "uuid-optional"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `screenId` | string | Yes | ID of the onboarding screen |
| `action` | string | Yes | Action type: `view`, `skip`, `complete`, `cta_click` |
| `userId` | string | No | User ID (optional, for guest tracking) |

**Response:**

```json
{
  "success": true,
  "data": null,
  "message": "Onboarding action tracked successfully"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request (missing screenId)
- `404` - Screen not found
- `500` - Server error

---

### Complete Onboarding

Mark the entire onboarding process as completed for an authenticated user.

**Endpoint:** `POST /v2/onboarding/complete`

**Authentication:** Required (Bearer token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** None

**Response:**

```json
{
  "success": true,
  "data": null,
  "message": "Onboarding completed successfully"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized (missing or invalid token)
- `500` - Server error

---

## Data Models

### OnboardingScreen

```typescript
interface OnboardingScreen {
  id: string;
  screenOrder: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  ctaText: string | null;
  ctaAction: string | null;
  ctaUrl: string | null;
  backgroundColor: string | null;
  isSkippable: boolean;
  targetAudience: string;
  metadata: object | null;
}
```

### OnboardingAnalytic

```typescript
interface OnboardingAnalytic {
  id: string;
  screenId: string;
  userId: string | null;
  viewed: boolean;
  viewedAt: DateTime | null;
  completed: boolean;
  completedAt: DateTime | null;
  skipped: boolean;
  skippedAt: DateTime | null;
  timeSpentSeconds: number | null;
  deviceInfo: object | null;
  appVersion: string | null;
  createdAt: DateTime;
}
```

---

## Action Types

Track different user interactions with onboarding screens:

| Action | Description | Use Case |
|--------|-------------|----------|
| `view` | User viewed the screen | Track screen impressions |
| `skip` | User skipped the screen | Track skip rate for optimization |
| `complete` | User completed the screen | Track completion funnel |
| `cta_click` | User clicked the CTA button | Track engagement with CTAs |

**Analytics Use Cases:**

```javascript
// Track when screen is displayed
await trackAction(screenId, 'view');

// Track when user clicks "Next" button
await trackAction(screenId, 'complete');

// Track when user clicks "Skip" button
await trackAction(screenId, 'skip');

// Track when user clicks custom CTA
await trackAction(screenId, 'cta_click');
```

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "statusCode": 400
  }
}
```

**Common Error Codes:**

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Bad Request | Missing required fields or invalid data |
| 401 | Unauthorized | Missing or invalid authentication token |
| 404 | Not Found | Onboarding screen not found |
| 500 | Internal Server Error | Server-side error |

---

## Usage Examples

### JavaScript/TypeScript (React Native)

```typescript
import axios from 'axios';

const API_BASE = 'http://localhost:3000/v2/onboarding';

// Fetch onboarding screens
export async function fetchOnboardingScreens() {
  try {
    const response = await axios.get(`${API_BASE}/screens`);
    return response.data.data.screens;
  } catch (error) {
    console.error('Failed to fetch screens:', error);
    throw error;
  }
}

// Track user action
export async function trackOnboardingAction(
  screenId: string,
  action: 'view' | 'skip' | 'complete' | 'cta_click',
  userId?: string
) {
  try {
    await axios.post(`${API_BASE}/track`, {
      screenId,
      action,
      userId,
    });
  } catch (error) {
    console.error('Failed to track action:', error);
  }
}

// Complete onboarding
export async function completeOnboarding(token: string) {
  try {
    await axios.post(
      `${API_BASE}/complete`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error('Failed to complete onboarding:', error);
    throw error;
  }
}

// Usage in component
export function OnboardingFlow() {
  const [screens, setScreens] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadScreens();
  }, []);

  const loadScreens = async () => {
    const data = await fetchOnboardingScreens();
    setScreens(data);
    
    // Track view of first screen
    if (data.length > 0) {
      await trackOnboardingAction(data[0].id, 'view');
    }
  };

  const handleNext = async () => {
    const currentScreen = screens[currentIndex];
    
    // Track completion
    await trackOnboardingAction(currentScreen.id, 'complete');
    
    if (currentIndex < screens.length - 1) {
      // Move to next screen
      setCurrentIndex(currentIndex + 1);
      await trackOnboardingAction(screens[currentIndex + 1].id, 'view');
    } else {
      // Last screen - complete onboarding
      const token = await getAuthToken();
      await completeOnboarding(token);
      navigation.navigate('Home');
    }
  };

  const handleSkip = async () => {
    const currentScreen = screens[currentIndex];
    
    if (currentScreen.isSkippable) {
      await trackOnboardingAction(currentScreen.id, 'skip');
      handleNext();
    }
  };

  const handleCTAClick = async () => {
    const currentScreen = screens[currentIndex];
    await trackOnboardingAction(currentScreen.id, 'cta_click');
    // Handle custom CTA action
  };

  return (
    <View>
      <Image source={{ uri: screens[currentIndex]?.imageUrl }} />
      <Text>{screens[currentIndex]?.title}</Text>
      <Text>{screens[currentIndex]?.subtitle}</Text>
      
      <Button onPress={handleNext} title={screens[currentIndex]?.ctaText} />
      
      {screens[currentIndex]?.isSkippable && (
        <Button onPress={handleSkip} title="Skip" />
      )}
    </View>
  );
}
```

### cURL Examples

**Get screens:**
```bash
curl -X GET http://localhost:3000/v2/onboarding/screens
```

**Track view:**
```bash
curl -X POST http://localhost:3000/v2/onboarding/track \
  -H "Content-Type: application/json" \
  -d '{
    "screenId": "uuid",
    "action": "view"
  }'
```

**Track skip:**
```bash
curl -X POST http://localhost:3000/v2/onboarding/track \
  -H "Content-Type: application/json" \
  -d '{
    "screenId": "uuid",
    "action": "skip",
    "userId": "uuid-optional"
  }'
```

**Complete onboarding:**
```bash
curl -X POST http://localhost:3000/v2/onboarding/complete \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Postman Collection

**1. Get Onboarding Screens**
```
GET http://localhost:3000/v2/onboarding/screens
```

**2. Track Action**
```
POST http://localhost:3000/v2/onboarding/track
Content-Type: application/json

{
  "screenId": "{{screenId}}",
  "action": "view"
}
```

**3. Complete Onboarding**
```
POST http://localhost:3000/v2/onboarding/complete
Authorization: Bearer {{accessToken}}
```

---

## Best Practices

### 1. Progressive Tracking

Track user actions progressively to understand user behavior:

```javascript
// Track view when screen is displayed
onScreenDisplayed(screenId);

// Track time spent
const startTime = Date.now();
onScreenExit(() => {
  const timeSpent = Math.floor((Date.now() - startTime) / 1000);
  // Send timeSpent in deviceInfo metadata
});

// Track completion when user proceeds
onNextClick(() => {
  trackAction(screenId, 'complete');
});
```

### 2. Guest User Tracking

Track guest users without authentication:

```javascript
// Generate temporary guest ID
const guestId = await AsyncStorage.getItem('guestId') || 
                 `guest_${Date.now()}`;

await trackAction(screenId, 'view', guestId);
```

### 3. Error Handling

Always handle errors gracefully:

```javascript
try {
  await trackAction(screenId, 'view');
} catch (error) {
  // Don't block user flow if tracking fails
  console.warn('Failed to track onboarding action:', error);
}
```

### 4. Offline Support

Queue actions when offline:

```javascript
import NetInfo from '@react-native-community/netinfo';

const actionQueue = [];

async function trackActionWithOfflineSupport(screenId, action) {
  const isConnected = await NetInfo.fetch().then(state => state.isConnected);
  
  if (isConnected) {
    await trackAction(screenId, action);
  } else {
    actionQueue.push({ screenId, action });
  }
}

// Sync when back online
NetInfo.addEventListener(state => {
  if (state.isConnected && actionQueue.length > 0) {
    syncQueuedActions();
  }
});
```

### 5. Screen Order Management

Always respect the `screenOrder` field:

```javascript
const screens = await fetchScreens();
// Screens are already sorted by screenOrder
// Don't re-sort or shuffle them
```

---

## Analytics Insights

Use the tracked data to optimize your onboarding:

### Funnel Analysis
```sql
-- View to completion rate per screen
SELECT 
  s.title,
  COUNT(CASE WHEN a.viewed THEN 1 END) as views,
  COUNT(CASE WHEN a.completed THEN 1 END) as completions,
  COUNT(CASE WHEN a.skipped THEN 1 END) as skips,
  (COUNT(CASE WHEN a.completed THEN 1 END)::float / 
   NULLIF(COUNT(CASE WHEN a.viewed THEN 1 END), 0) * 100) as completion_rate
FROM onboarding_screens s
LEFT JOIN onboarding_analytics a ON s.id = a.screen_id
GROUP BY s.id, s.title
ORDER BY s.screen_order;
```

### Drop-off Analysis
```sql
-- Identify where users drop off
SELECT 
  screen_order,
  COUNT(*) as drop_offs
FROM onboarding_analytics a
JOIN onboarding_screens s ON a.screen_id = s.id
WHERE a.viewed = true AND a.completed = false
GROUP BY screen_order
ORDER BY drop_offs DESC;
```

---

## Testing

Test script available: `test-onboarding-endpoints.ts`

```bash
npx ts-node test-onboarding-endpoints.ts
```

---

## Changelog

### Version 2.0.0 (October 15, 2025)
- Initial onboarding API implementation
- Added screen fetching endpoint
- Added action tracking endpoint
- Added completion endpoint
- Integrated with database models
- Updated image URLs with Unsplash placeholders
- Added comprehensive documentation

---

## Support

For questions or issues:
- Check the [main API documentation](./README.md)
- Review error logs in the server console
- Test endpoints using the provided test scripts

---

**Last Updated:** October 15, 2025  
**API Version:** v2.0.0  
**Status:** Production Ready ✅
