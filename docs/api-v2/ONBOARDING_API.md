# Onboarding API Documentation (Legacy)

> ⚠️ **DEPRECATED**: This documentation describes the legacy unified onboarding system.  
> **NEW**: Please use the [Two-Phase Onboarding System V2](/docs/api-v2/ONBOARDING_V2_API.md) instead.
>
> **Migration Guide**: The new system separates:
> - **App Preview** (pre-auth): `/v2/onboarding/app-preview/*`
> - **User Setup** (post-auth): `/v2/onboarding/user-setup/*`
>
> See full documentation: [ONBOARDING_V2_API.md](/docs/api-v2/ONBOARDING_V2_API.md)

---

## Overview

The legacy Onboarding API provides endpoints for managing user onboarding screens and tracking user interactions during the onboarding flow.

**Base URL:** `/v2/onboarding`

**Version:** 2.0.0 (Legacy)

**Status:** ⚠️ Deprecated - Use [Onboarding V2](/docs/api-v2/ONBOARDING_V2_API.md)

---

## Table of Contents

- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Get Onboarding Screens](#get-onboarding-screens)
  - [Track Onboarding Action](#track-onboarding-action)
  - [Complete Onboarding](#complete-onboarding)
  - [Get Onboarding Status](#get-onboarding-status)
  - [Get Onboarding Analytics](#get-onboarding-analytics)
- [Data Models](#data-models)
- [Action Types](#action-types)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)
- [Migration to V2](#migration-to-v2)

---

## Authentication

Most onboarding endpoints are **public** to allow guest users to view onboarding screens before authentication.

**Authenticated Endpoints:**
- `POST /v2/onboarding/complete` - Requires Bearer token
- `GET /v2/onboarding/status` - Requires Bearer token
- `GET /v2/onboarding/analytics` - Requires Bearer token (Admin)

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

### Get Onboarding Status

Get the current user's onboarding progress and completion status.

**Endpoint:** `GET /v2/onboarding/status`

**Authentication:** Required (Bearer token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:** None

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "fc86b834-d5c2-493a-8afc-945138832761",
    "isCompleted": false,
    "totalScreens": 5,
    "viewedCount": 1,
    "completedCount": 1,
    "skippedCount": 0,
    "progress": 20.0,
    "screens": [
      {
        "screenId": "cmgub3zrn000ccpvubivzvmig",
        "screenOrder": 1,
        "title": "Welcome to Berse",
        "viewed": true,
        "viewedAt": "2025-10-17T10:30:00.000Z",
        "completed": true,
        "completedAt": "2025-10-17T10:30:45.000Z",
        "skipped": false,
        "skippedAt": null
      },
      {
        "screenId": "cmgub3zro000dcpvup8s8ccsd",
        "screenOrder": 2,
        "title": "Build Your Trust Network",
        "viewed": false,
        "viewedAt": null,
        "completed": false,
        "completedAt": null,
        "skipped": false,
        "skippedAt": null
      }
    ]
  },
  "message": "Onboarding status retrieved successfully"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | ID of the authenticated user |
| `isCompleted` | boolean | Whether user completed all screens |
| `totalScreens` | number | Total number of active screens |
| `viewedCount` | number | Number of screens user has viewed |
| `completedCount` | number | Number of screens user has completed |
| `skippedCount` | number | Number of screens user has skipped |
| `progress` | number | Completion percentage (0-100) |
| `screens` | array | Detailed status for each screen |

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server error

**Use Cases:**
- Check if user needs to see onboarding on app launch
- Display progress indicator during onboarding
- Resume onboarding from last incomplete screen
- Show completion badge/achievement

---

### Get Onboarding Analytics

Get comprehensive analytics about onboarding performance (Admin only).

**Endpoint:** `GET /v2/onboarding/analytics`

**Authentication:** Required (Bearer token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string (ISO 8601) | No | Filter analytics from this date |
| `endDate` | string (ISO 8601) | No | Filter analytics until this date |
| `screenId` | string (UUID) | No | Filter for specific screen |

**Response:**

```json
{
  "success": true,
  "data": {
    "overallStats": {
      "uniqueUsers": 1250,
      "totalScreens": 5,
      "usersWhoCompleted": 980,
      "overallCompletionRate": 78.4
    },
    "screenStats": [
      {
        "screenId": "cmgub3zrn000ccpvubivzvmig",
        "screenTitle": "Welcome to Berse",
        "screenOrder": 1,
        "totalInteractions": 1500,
        "viewedCount": 1480,
        "completedCount": 1200,
        "skippedCount": 150,
        "completionRate": 81.08,
        "skipRate": 10.14,
        "avgTimeSpentSeconds": 12.5
      },
      {
        "screenId": "cmgub3zro000dcpvup8s8ccsd",
        "screenTitle": "Build Your Trust Network",
        "screenOrder": 2,
        "totalInteractions": 1450,
        "viewedCount": 1400,
        "completedCount": 1100,
        "skippedCount": 250,
        "completionRate": 78.57,
        "skipRate": 17.86,
        "avgTimeSpentSeconds": 15.2
      }
    ]
  },
  "message": "Onboarding analytics retrieved successfully"
}
```

**Overall Stats Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `uniqueUsers` | number | Total unique users who viewed onboarding |
| `totalScreens` | number | Total number of active screens |
| `usersWhoCompleted` | number | Users who completed all screens |
| `overallCompletionRate` | number | Percentage of users who completed (0-100) |

**Screen Stats Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `screenId` | string | Screen identifier |
| `screenTitle` | string | Screen title |
| `screenOrder` | number | Screen position in flow |
| `totalInteractions` | number | Total user interactions with screen |
| `viewedCount` | number | Number of views |
| `completedCount` | number | Number of completions |
| `skippedCount` | number | Number of skips |
| `completionRate` | number | Completion percentage (0-100) |
| `skipRate` | number | Skip percentage (0-100) |
| `avgTimeSpentSeconds` | number | Average time users spent on screen |

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server error

**Use Cases:**
- Monitor onboarding funnel performance
- Identify problematic screens with high skip rates
- Optimize screen content based on time spent
- A/B test different onboarding flows
- Generate reports for stakeholders
- Track improvements after UI changes

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

// Get onboarding status
export async function getOnboardingStatus(token: string) {
  try {
    const response = await axios.get(`${API_BASE}/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to get onboarding status:', error);
    throw error;
  }
}

// Get onboarding analytics (Admin)
export async function getOnboardingAnalytics(
  token: string,
  params?: { startDate?: string; endDate?: string; screenId?: string }
) {
  try {
    const response = await axios.get(`${API_BASE}/analytics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to get analytics:', error);
    throw error;
  }
}

// Usage in component with status check
export function OnboardingFlow() {
  const [screens, setScreens] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    checkStatusAndLoadScreens();
  }, []);

  const checkStatusAndLoadScreens = async () => {
    // Check if user has already completed onboarding
    if (token) {
      const userStatus = await getOnboardingStatus(token);
      setStatus(userStatus);
      
      if (userStatus.isCompleted) {
        // User already completed, skip to main app
        navigation.navigate('Home');
        return;
      }
      
      // Resume from last incomplete screen
      const lastIncomplete = userStatus.screens.findIndex(s => !s.completed);
      if (lastIncomplete > 0) {
        setCurrentIndex(lastIncomplete);
      }
    }
    
    // Load screens
    const data = await fetchOnboardingScreens();
    setScreens(data);
    
    // Track view of current screen
    if (data.length > 0) {
      await trackOnboardingAction(
        data[currentIndex].id,
        'view',
        user?.id
      );
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

**Get onboarding status:**
```bash
curl -X GET http://localhost:3000/v2/onboarding/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Get analytics (all screens):**
```bash
curl -X GET http://localhost:3000/v2/onboarding/analytics \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Get analytics (filtered by date):**
```bash
curl -X GET "http://localhost:3000/v2/onboarding/analytics?startDate=2025-01-01&endDate=2025-10-17" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Get analytics (specific screen):**
```bash
curl -X GET "http://localhost:3000/v2/onboarding/analytics?screenId=SCREEN_UUID" \
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

**4. Get Onboarding Status**
```
GET http://localhost:3000/v2/onboarding/status
Authorization: Bearer {{accessToken}}
```

**5. Get Analytics**
```
GET http://localhost:3000/v2/onboarding/analytics
Authorization: Bearer {{accessToken}}
```

**6. Get Analytics (with filters)**
```
GET http://localhost:3000/v2/onboarding/analytics?startDate=2025-01-01&endDate=2025-10-17&screenId={{screenId}}
Authorization: Bearer {{accessToken}}
```

---

## Best Practices

### 1. Check Status Before Showing Onboarding

Always check if user already completed onboarding:

```javascript
async function shouldShowOnboarding(token) {
  try {
    const status = await getOnboardingStatus(token);
    return !status.isCompleted;
  } catch (error) {
    // If error, show onboarding to be safe
    return true;
  }
}

// In app initialization
if (isAuthenticated && await shouldShowOnboarding(token)) {
  navigation.navigate('Onboarding');
} else {
  navigation.navigate('Home');
}
```

### 2. Progressive Tracking

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

### 3. Guest User Tracking

Track guest users without authentication:

```javascript
// Generate temporary guest ID
const guestId = await AsyncStorage.getItem('guestId') || 
                 `guest_${Date.now()}`;

await trackAction(screenId, 'view', guestId);
```

### 4. Error Handling

Always handle errors gracefully:

```javascript
try {
  await trackAction(screenId, 'view');
} catch (error) {
  // Don't block user flow if tracking fails
  console.warn('Failed to track onboarding action:', error);
}
```

### 5. Offline Support

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

### 6. Screen Order Management

Always respect the `screenOrder` field:

```javascript
const screens = await fetchScreens();
// Screens are already sorted by screenOrder
// Don't re-sort or shuffle them
```

---

## Analytics Insights

Use the analytics endpoint and tracked data to optimize your onboarding:

### Using the Analytics Endpoint

```javascript
// Fetch analytics for the last 30 days
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const analytics = await getOnboardingAnalytics(adminToken, {
  startDate: thirtyDaysAgo.toISOString(),
  endDate: new Date().toISOString(),
});

// Identify problematic screens
const problematicScreens = analytics.screenStats.filter(
  screen => screen.skipRate > 20 || screen.completionRate < 70
);

console.log('Screens needing improvement:', problematicScreens);

// Find best performing screens
const bestScreens = analytics.screenStats.filter(
  screen => screen.completionRate > 90 && screen.skipRate < 5
);

console.log('High-performing screens:', bestScreens);

// Overall funnel health
const { overallStats } = analytics;
if (overallStats.overallCompletionRate < 60) {
  console.warn('Onboarding completion rate is below 60%!');
}
```

### Key Metrics to Monitor

1. **Overall Completion Rate**: Should be > 70%
   - If lower, review the entire flow
   - Consider reducing number of screens
   
2. **Per-Screen Completion Rate**: Should be > 80%
   - Screens below 70% need content review
   - High skip rates indicate unclear value proposition

3. **Average Time Spent**: 
   - Too low (< 5s): Users not reading content
   - Too high (> 30s): Content might be confusing

4. **Drop-off Points**:
   - Identify which screen has highest drop-off
   - A/B test different content/designs

### Funnel Analysis (SQL)
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
LEFT JOIN onboarding_analytics a ON s.id = a."screenId"
GROUP BY s.id, s.title
ORDER BY s."screenOrder";
```

### Drop-off Analysis (SQL)
```sql
-- Identify where users drop off
SELECT 
  s."screenOrder",
  s.title,
  COUNT(*) as drop_offs
FROM onboarding_analytics a
JOIN onboarding_screens s ON a."screenId" = s.id
WHERE a.viewed = true AND a.completed = false
GROUP BY s."screenOrder", s.title
ORDER BY drop_offs DESC;
```

### Admin Dashboard Example

```typescript
export function OnboardingDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: getLastMonthDate(),
    endDate: new Date().toISOString(),
  });

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    const data = await getOnboardingAnalytics(adminToken, dateRange);
    setAnalytics(data);
  };

  return (
    <div>
      <h1>Onboarding Analytics</h1>
      
      <div className="overall-stats">
        <StatCard 
          title="Unique Users" 
          value={analytics?.overallStats.uniqueUsers} 
        />
        <StatCard 
          title="Completion Rate" 
          value={`${analytics?.overallStats.overallCompletionRate.toFixed(1)}%`}
          status={analytics?.overallStats.overallCompletionRate > 70 ? 'good' : 'warning'}
        />
        <StatCard 
          title="Users Completed" 
          value={analytics?.overallStats.usersWhoCompleted} 
        />
      </div>

      <div className="screen-stats">
        <h2>Screen Performance</h2>
        <table>
          <thead>
            <tr>
              <th>Screen</th>
              <th>Views</th>
              <th>Completions</th>
              <th>Completion Rate</th>
              <th>Skip Rate</th>
              <th>Avg Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {analytics?.screenStats.map(screen => (
              <tr key={screen.screenId}>
                <td>{screen.screenTitle}</td>
                <td>{screen.viewedCount}</td>
                <td>{screen.completedCount}</td>
                <td className={getStatusClass(screen.completionRate)}>
                  {screen.completionRate.toFixed(1)}%
                </td>
                <td className={getStatusClass(screen.skipRate, true)}>
                  {screen.skipRate.toFixed(1)}%
                </td>
                <td>{screen.avgTimeSpentSeconds.toFixed(1)}s</td>
                <td>
                  {screen.completionRate > 80 ? '✅' : 
                   screen.completionRate > 60 ? '⚠️' : '❌'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## Testing

Test script available: `test-onboarding-endpoints.ts`

```bash
npx ts-node test-onboarding-endpoints.ts
```

---

## Migration to V2

### Why Migrate?

The new **Two-Phase Onboarding System** provides:

✅ **Better Conversion**: Show app preview before requiring registration  
✅ **Personalized Experience**: Post-auth setup tailored to user needs  
✅ **Flexible Progression**: Required + optional screens  
✅ **Complete Analytics**: Track anonymous + authenticated users separately  
✅ **Mobile-Optimized**: Designed specifically for native app flows

### Migration Steps

1. **Read New Documentation**: [ONBOARDING_V2_API.md](/docs/api-v2/ONBOARDING_V2_API.md)

2. **Update Mobile App**:
   ```typescript
   // OLD (Deprecated)
   GET /v2/onboarding/screens
   POST /v2/onboarding/track
   
   // NEW (V2)
   // Pre-auth:
   GET /v2/onboarding/app-preview/screens
   POST /v2/onboarding/app-preview/track
   
   // Post-auth:
   GET /v2/onboarding/user-setup/screens
   POST /v2/onboarding/user-setup/track
   ```

3. **Test New Flow**: Use Postman collection or test scripts

4. **Monitor Analytics**: Compare conversion rates between old and new

5. **Deprecate Old Endpoints**: Once all users migrated

### Comparison

| Feature | Legacy (This Doc) | V2 (New) |
|---------|------------------|----------|
| Pre-auth screens | ❌ Mixed with post-auth | ✅ Separate app preview |
| Post-auth screens | ❌ Mixed with pre-auth | ✅ Personalized setup |
| Anonymous tracking | ✅ Basic | ✅ Enhanced with session linking |
| Required screens | ❌ Not supported | ✅ Supported |
| Progress tracking | ✅ Basic | ✅ Required vs overall progress |
| Screen types | ❌ Generic | ✅ Typed (PROFILE, NETWORK, etc.) |

### Quick Start with V2

```typescript
// 1. Show app preview before registration
const previewScreens = await fetch('/v2/onboarding/app-preview/screens');

// 2. Track anonymous interactions
await fetch('/v2/onboarding/app-preview/track', {
  method: 'POST',
  body: JSON.stringify({
    screenId: screen.id,
    action: 'view',
    sessionId: generateSessionId(),
  }),
});

// 3. After registration, link analytics
await fetch('/v2/onboarding/app-preview/link-user', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ sessionId }),
});

// 4. Show personalized setup after login
const setupScreens = await fetch('/v2/onboarding/user-setup/screens', {
  headers: { 'Authorization': `Bearer ${token}` },
});
```

**Full Guide**: [ONBOARDING_V2_API.md](/docs/api-v2/ONBOARDING_V2_API.md)

---

## Changelog

### Version 2.1.0 (October 17, 2025)
- ⚠️ **DEPRECATED**: Legacy onboarding system
- ✅ **NEW**: Two-phase onboarding system (V2)
- Added migration guide
- Updated documentation with deprecation notice

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
