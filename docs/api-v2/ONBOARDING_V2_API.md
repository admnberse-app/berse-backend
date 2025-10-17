# Two-Phase Onboarding System - Complete Guide

## 🎯 Overview

Berse implements a **two-phase onboarding system** to optimize user experience and conversion:

### **Phase 1: App Preview** (Pre-Authentication)
- **Purpose**: Introduce the app to new visitors before they commit to registration
- **Screens**: 3-4 brief screens highlighting key features
- **Authentication**: ❌ Not required
- **Tracking**: Anonymous via session ID
- **Goal**: Convert visitors → registered users

### **Phase 2: User Setup** (Post-Authentication)
- **Purpose**: Personalized onboarding after registration/email verification
- **Screens**: 5-7 screens for profile completion, network building, community joining
- **Authentication**: ✅ Required
- **Tracking**: Per authenticated user
- **Goal**: Convert registered users → active engaged members

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER JOURNEY                              │
└─────────────────────────────────────────────────────────────┘

1. App Launch
   ↓
2. App Preview Screens (3-4 screens)
   - Welcome to Berse
   - Trust Through Vouches
   - Discover Events  
   - Ready to Join?
   ↓
3. Sign Up / Log In
   ↓
4. Email Verification
   ↓
5. User Setup Screens (5-7 screens)
   - Complete Your Profile ⭐ (Required)
   - Build Your Trust Network
   - Join Communities
   - Notification Preferences
   - Discover Features
   - Verify Your Identity
   - All Set! 🎉
   ↓
6. Main App Experience
```

---

## 📊 Database Schema

### App Preview Tables

```prisma
model AppPreviewScreen {
  id               String    @id @default(cuid())
  screenOrder      Int
  title            String
  subtitle         String?
  description      String?
  imageUrl         String?
  videoUrl         String?
  animationUrl     String?
  iconName         String?
  ctaText          String?
  ctaAction        String?
  backgroundColor  String?   @default("#FFFFFF")
  textColor        String?   @default("#000000")
  isSkippable      Boolean   @default(true)
  isActive         Boolean   @default(true)
  minAppVersion    String?
  metadata         Json?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  analytics        AppPreviewAnalytic[]
}

model AppPreviewAnalytic {
  id               String    @id @default(cuid())
  screenId         String
  sessionId        String?   // Anonymous session identifier
  userId           String?   // Linked after registration
  viewed           Boolean   @default(false)
  viewedAt         DateTime?
  completed        Boolean   @default(false)
  completedAt      DateTime?
  skipped          Boolean   @default(false)
  skippedAt        DateTime?
  timeSpentSeconds Int?
  deviceInfo       Json?
  appVersion       String?
  createdAt        DateTime  @default(now())
}
```

### User Setup Tables

```prisma
model UserSetupScreen {
  id               String               @id @default(cuid())
  screenOrder      Int
  screenType       UserSetupScreenType  // PROFILE, NETWORK, COMMUNITY, etc.
  title            String
  subtitle         String?
  description      String?
  imageUrl         String?
  videoUrl         String?
  iconName         String?
  ctaText          String?
  ctaAction        String?
  ctaUrl           String?
  backgroundColor  String?              @default("#FFFFFF")
  textColor        String?              @default("#000000")
  isRequired       Boolean              @default(false)  // Cannot skip if true
  isSkippable      Boolean              @default(true)
  isActive         Boolean              @default(true)
  targetAudience   String               @default("all")
  requiredFields   String[]             @default([])
  minAppVersion    String?
  metadata         Json?
  createdAt        DateTime             @default(now())
  updatedAt        DateTime             @updatedAt
  analytics        UserSetupAnalytic[]
}

model UserSetupAnalytic {
  id               String    @id @default(cuid())
  screenId         String
  userId           String    // Always required (authenticated users only)
  viewed           Boolean   @default(false)
  viewedAt         DateTime?
  completed        Boolean   @default(false)
  completedAt      DateTime?
  skipped          Boolean   @default(false)
  skippedAt        DateTime?
  timeSpentSeconds Int?
  actionsTaken     Json?     // Track specific actions
  deviceInfo       Json?
  appVersion       String?
  createdAt        DateTime  @default(now())
  
  @@unique([screenId, userId])
}

enum UserSetupScreenType {
  PROFILE       // Complete profile information
  NETWORK       // Set up trust network, add connections
  COMMUNITY     // Join communities, follow interests
  PREFERENCES   // Notification, privacy, app preferences
  TUTORIAL      // Feature tours and walkthroughs
  VERIFICATION  // Additional verification steps
}
```

---

## 🔌 API Endpoints

### Phase 1: App Preview (Pre-Auth)

#### Get App Preview Screens
```http
GET /v2/onboarding/app-preview/screens
```

**Authentication:** ❌ Not required

**Response:**
```json
{
  "success": true,
  "data": {
    "screens": [
      {
        "id": "ee1fb15f-c740-4aaa-b7df-e6e452f027cf",
        "screenOrder": 1,
        "title": "Welcome to Berse",
        "subtitle": "Connect with verified, trusted people",
        "description": "Berse is a community-driven platform...",
        "imageUrl": "https://cdn.pixabay.com/photo/2021/10/11/23/49/app-6702045_1280.png",
        "videoUrl": null,
        "animationUrl": null,
        "iconName": "handshake",
        "ctaText": "Next",
        "ctaAction": "next",
        "backgroundColor": "#4F46E5",
        "textColor": "#FFFFFF",
        "isSkippable": false,
        "metadata": null
      }
      // ... more screens
    ]
  },
  "message": "App preview screens retrieved successfully"
}
```

#### Track App Preview Action
```http
POST /v2/onboarding/app-preview/track
Content-Type: application/json

{
  "screenId": "ee1fb15f-c740-4aaa-b7df-e6e452f027cf",
  "action": "view",
  "sessionId": "optional-session-id",
  "timeSpentSeconds": 5,
  "deviceInfo": {
    "platform": "iOS",
    "version": "16.0"
  },
  "appVersion": "1.0.0"
}
```

**Actions:** `view`, `complete`, `skip`

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "generated-or-provided-session-id"
  },
  "message": "App preview action tracked successfully"
}
```

#### Link Anonymous Analytics to User
```http
POST /v2/onboarding/app-preview/link-user
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "session-id-from-preview"
}
```

**Purpose:** After registration, link anonymous app preview analytics to the user account

**Response:**
```json
{
  "success": true,
  "data": {
    "recordsLinked": 4
  },
  "message": "App preview analytics linked to user account"
}
```

#### Get App Preview Analytics (Admin)
```http
GET /v2/onboarding/app-preview/analytics?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overallStats": {
      "totalSessions": 5000,
      "convertedToUsers": 1250,
      "conversionRate": 25.0
    },
    "screenStats": [
      {
        "screenId": "...",
        "screenTitle": "Welcome to Berse",
        "screenOrder": 1,
        "totalInteractions": 5000,
        "uniqueSessions": 4800,
        "linkedToUsers": 1200,
        "viewedCount": 4950,
        "completedCount": 4500,
        "skippedCount": 50,
        "completionRate": 90.9,
        "skipRate": 1.0,
        "conversionRate": 25.0,
        "avgTimeSpentSeconds": 8.5
      }
      // ... more screens
    ]
  }
}
```

---

### Phase 2: User Setup (Post-Auth)

#### Get User Setup Screens
```http
GET /v2/onboarding/user-setup/screens
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "screens": [
      {
        "id": "11b77d95-0d79-459c-9dfc-cd5bad9d0c15",
        "screenOrder": 1,
        "screenType": "PROFILE",
        "title": "Complete Your Profile",
        "subtitle": "Help others get to know you",
        "description": "Add your photo, bio, and interests...",
        "imageUrl": "https://cdn.pixabay.com/photo/2017/06/13/22/42/profile-2398782_1280.png",
        "videoUrl": null,
        "iconName": "user-circle",
        "ctaText": "Complete Profile",
        "ctaAction": "complete_profile",
        "ctaUrl": "/profile/edit",
        "backgroundColor": "#FFFFFF",
        "textColor": "#000000",
        "isRequired": true,
        "isSkippable": false,
        "requiredFields": ["profilePicture", "bio", "interests"],
        "metadata": null,
        "status": {
          "viewed": false,
          "viewedAt": null,
          "completed": false,
          "completedAt": null,
          "skipped": false,
          "skippedAt": null
        }
      }
      // ... more screens
    ]
  },
  "message": "User setup screens retrieved successfully"
}
```

#### Track User Setup Action
```http
POST /v2/onboarding/user-setup/track
Authorization: Bearer <token>
Content-Type: application/json

{
  "screenId": "11b77d95-0d79-459c-9dfc-cd5bad9d0c15",
  "action": "complete",
  "timeSpentSeconds": 120,
  "actionsTaken": {
    "uploadedPhoto": true,
    "addedBio": true,
    "selectedInterests": 5
  },
  "deviceInfo": {
    "platform": "iOS",
    "version": "16.0"
  },
  "appVersion": "1.0.0"
}
```

**Actions:** `view`, `complete`, `skip`

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "User setup action tracked successfully"
}
```

#### Get User Setup Status
```http
GET /v2/onboarding/user-setup/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "fc86b834-d5c2-493a-8afc-945138832761",
    "isCompleted": false,
    "totalScreens": 7,
    "requiredScreens": 1,
    "viewedCount": 3,
    "completedCount": 1,
    "skippedCount": 0,
    "requiredCompletedCount": 1,
    "progress": 14.3,
    "requiredProgress": 100.0,
    "screens": [
      {
        "screenId": "11b77d95-0d79-459c-9dfc-cd5bad9d0c15",
        "screenOrder": 1,
        "screenType": "PROFILE",
        "title": "Complete Your Profile",
        "isRequired": true,
        "viewed": true,
        "viewedAt": "2024-01-15T10:30:00.000Z",
        "completed": true,
        "completedAt": "2024-01-15T10:35:00.000Z",
        "skipped": false,
        "skippedAt": null
      }
      // ... more screens
    ]
  },
  "message": "User setup status retrieved successfully"
}
```

#### Complete User Setup
```http
POST /v2/onboarding/user-setup/complete
Authorization: Bearer <token>
```

**Requirements:** All required screens must be completed first

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "User setup completed successfully"
}
```

**Error (if incomplete):**
```json
{
  "success": false,
  "error": {
    "message": "Please complete all required setup steps. 0/1 completed.",
    "statusCode": 400
  }
}
```

#### Get User Setup Analytics (Admin)
```http
GET /v2/onboarding/user-setup/analytics?screenType=PROFILE&startDate=2024-01-01
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date
- `screenId` (optional): Filter by specific screen
- `screenType` (optional): Filter by type (PROFILE, NETWORK, COMMUNITY, PREFERENCES, TUTORIAL, VERIFICATION)

**Response:**
```json
{
  "success": true,
  "data": {
    "overallStats": {
      "uniqueUsers": 1250,
      "totalScreens": 7,
      "requiredScreens": 1,
      "usersWhoCompleted": 980,
      "overallCompletionRate": 78.4
    },
    "screenStats": [
      {
        "screenId": "...",
        "screenTitle": "Complete Your Profile",
        "screenType": "PROFILE",
        "screenOrder": 1,
        "isRequired": true,
        "totalUsers": 1250,
        "viewedCount": 1230,
        "completedCount": 1100,
        "skippedCount": 20,
        "completionRate": 89.4,
        "skipRate": 1.6,
        "avgTimeSpentSeconds": 125.5
      }
      // ... more screens
    ]
  }
}
```

---

## 💻 Implementation Guide

### Mobile App (React Native/Flutter)

#### 1. App Launch - Show Preview

```typescript
// App.tsx
import { useEffect, useState } from 'react';

function App() {
  const [showAppPreview, setShowAppPreview] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Check if user has seen preview before
    const hasSeenPreview = localStorage.getItem('hasSeenAppPreview');
    const isAuthenticated = !!localStorage.getItem('authToken');
    
    if (!hasSeenPreview && !isAuthenticated) {
      setShowAppPreview(true);
      // Generate session ID for tracking
      setSessionId(generateUUID());
    }
  }, []);

  if (showAppPreview) {
    return (
      <AppPreviewFlow
        sessionId={sessionId}
        onComplete={() => {
          localStorage.setItem('hasSeenAppPreview', 'true');
          setShowAppPreview(false);
        }}
      />
    );
  }

  return <MainApp />;
}
```

#### 2. App Preview Flow

```typescript
// AppPreviewFlow.tsx
import { useState, useEffect } from 'react';

export function AppPreviewFlow({ sessionId, onComplete }) {
  const [screens, setScreens] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Fetch app preview screens
    fetch('https://api.berse.com/v2/onboarding/app-preview/screens')
      .then(res => res.json())
      .then(data => setScreens(data.data.screens));
  }, []);

  const trackAction = async (action: 'view' | 'complete' | 'skip') => {
    await fetch('https://api.berse.com/v2/onboarding/app-preview/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        screenId: screens[currentIndex].id,
        action,
        sessionId,
        timeSpentSeconds: calculateTimeSpent(),
        deviceInfo: getDeviceInfo(),
        appVersion: '1.0.0',
      }),
    });
  };

  const handleNext = async () => {
    await trackAction('complete');
    
    if (currentIndex < screens.length - 1) {
      setCurrentIndex(currentIndex + 1);
      await trackAction('view'); // Track next screen view
    } else {
      // Last screen - navigate to sign up
      onComplete();
      navigateToSignUp();
    }
  };

  const handleSkip = async () => {
    await trackAction('skip');
    onComplete();
    navigateToSignUp();
  };

  return (
    <PreviewScreen
      screen={screens[currentIndex]}
      onNext={handleNext}
      onSkip={screens[currentIndex]?.isSkippable ? handleSkip : undefined}
    />
  );
}
```

#### 3. After Registration - Link Analytics

```typescript
// auth.service.ts
export async function registerUser(userData) {
  const response = await fetch('https://api.berse.com/v2/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const result = await response.json();
  
  if (result.success) {
    // Store token
    localStorage.setItem('authToken', result.data.token);
    
    // Link anonymous app preview analytics
    const sessionId = localStorage.getItem('appPreviewSessionId');
    if (sessionId) {
      await fetch('https://api.berse.com/v2/onboarding/app-preview/link-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${result.data.token}`,
        },
        body: JSON.stringify({ sessionId }),
      });
      localStorage.removeItem('appPreviewSessionId');
    }
  }

  return result;
}
```

#### 4. After Login - Show User Setup

```typescript
// UserSetupFlow.tsx
export function UserSetupFlow({ onComplete }) {
  const [screens, setScreens] = useState([]);
  const [status, setStatus] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadUserSetup();
  }, []);

  const loadUserSetup = async () => {
    const token = localStorage.getItem('authToken');
    
    // Get screens with completion status
    const screensRes = await fetch(
      'https://api.berse.com/v2/onboarding/user-setup/screens',
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const screensData = await screensRes.json();
    
    // Get overall status
    const statusRes = await fetch(
      'https://api.berse.com/v2/onboarding/user-setup/status',
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const statusData = await statusRes.json();
    
    setScreens(screensData.data.screens);
    setStatus(statusData.data);
    
    // Skip to first incomplete screen
    const firstIncomplete = screensData.data.screens.findIndex(
      s => !s.status.completed
    );
    if (firstIncomplete !== -1) {
      setCurrentIndex(firstIncomplete);
    }
  };

  const trackAction = async (action: 'view' | 'complete' | 'skip', actionsTaken?: any) => {
    const token = localStorage.getItem('authToken');
    
    await fetch('https://api.berse.com/v2/onboarding/user-setup/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        screenId: screens[currentIndex].id,
        action,
        timeSpentSeconds: calculateTimeSpent(),
        actionsTaken,
        deviceInfo: getDeviceInfo(),
        appVersion: '1.0.0',
      }),
    });
  };

  const handleComplete = async (actionsTaken: any) => {
    await trackAction('complete', actionsTaken);
    
    if (currentIndex < screens.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All screens done
      await completeUserSetup();
      onComplete();
    }
  };

  const completeUserSetup = async () => {
    const token = localStorage.getItem('authToken');
    await fetch('https://api.berse.com/v2/onboarding/user-setup/complete', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  };

  const currentScreen = screens[currentIndex];

  if (!currentScreen) return <Loading />;

  return (
    <SetupScreen
      screen={currentScreen}
      onComplete={handleComplete}
      onSkip={currentScreen.isSkippable ? () => trackAction('skip') : undefined}
      progress={(currentIndex + 1) / screens.length * 100}
    />
  );
}
```

---

## 🎨 Best Practices

### 1. App Preview (Pre-Auth)

✅ **DO:**
- Keep it brief (3-4 screens max)
- Highlight unique value propositions
- Use high-quality images
- Make last screen non-skippable with clear CTA
- Track anonymous sessions for conversion analysis
- Link analytics after registration

❌ **DON'T:**
- Show too many screens (causes drop-off)
- Make all screens skippable (ensure they see key messages)
- Collect personal data before registration
- Require authentication

### 2. User Setup (Post-Auth)

✅ **DO:**
- Mark profile completion as required
- Make other screens optional but recommended
- Provide clear value for each step
- Show progress indicator
- Allow users to return later
- Track specific actions taken

❌ **DON'T:**
- Make everything required (causes abandonment)
- Show too many screens at once
- Hide the skip button on optional screens
- Lose user's progress

### 3. Analytics & Optimization

Monitor these key metrics:

**App Preview:**
- Conversion rate (sessions → registrations): Target > 25%
- Per-screen completion rate: Target > 85%
- Skip rate: Keep < 15%
- Average time spent: 5-10s per screen

**User Setup:**
- Overall completion rate: Target > 70%
- Required screens completion: Target > 95%
- Time to complete setup: Target < 10 minutes
- Return rate (users who complete later): Monitor trend

---

## 🔧 Testing

### Test App Preview Flow
```bash
# 1. Get app preview screens
curl http://localhost:3001/api/v2/onboarding/app-preview/screens

# 2. Track anonymous view
curl -X POST http://localhost:3001/api/v2/onboarding/app-preview/track \
  -H "Content-Type: application/json" \
  -d '{
    "screenId": "screen-id-here",
    "action": "view",
    "sessionId": "test-session-123"
  }'

# 3. Register user
curl -X POST http://localhost:3001/api/v2/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "fullName": "Test User"
  }'

# 4. Link anonymous analytics
curl -X POST http://localhost:3001/api/v2/onboarding/app-preview/link-user \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test-session-123"}'
```

### Test User Setup Flow
```bash
# 1. Get user setup screens
curl http://localhost:3001/api/v2/onboarding/user-setup/screens \
  -H "Authorization: Bearer <token>"

# 2. Check status
curl http://localhost:3001/api/v2/onboarding/user-setup/status \
  -H "Authorization: Bearer <token>"

# 3. Track completion
curl -X POST http://localhost:3001/api/v2/onboarding/user-setup/track \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "screenId": "screen-id-here",
    "action": "complete",
    "actionsTaken": {
      "uploadedPhoto": true,
      "addedBio": true
    }
  }'

# 4. Complete setup
curl -X POST http://localhost:3001/api/v2/onboarding/user-setup/complete \
  -H "Authorization: Bearer <token>"
```

---

## 📱 Screen Examples

### App Preview Screens (Pre-Auth)

| Order | Title | Purpose | Skippable |
|-------|-------|---------|-----------|
| 1 | Welcome to Berse | Brand introduction | ❌ No |
| 2 | Trust Through Vouches | Key differentiator | ✅ Yes |
| 3 | Discover Events | Core feature | ✅ Yes |
| 4 | Ready to Join? | CTA to register | ❌ No |

### User Setup Screens (Post-Auth)

| Order | Type | Title | Required | Purpose |
|-------|------|-------|----------|---------|
| 1 | PROFILE | Complete Your Profile | ⭐ Yes | Essential for platform use |
| 2 | NETWORK | Build Your Trust Network | ❌ No | Encourage connections |
| 3 | COMMUNITY | Join Communities | ❌ No | Community engagement |
| 4 | PREFERENCES | Notification Preferences | ❌ No | User customization |
| 5 | TUTORIAL | Discover Features | ❌ No | Feature education |
| 6 | VERIFICATION | Verify Your Identity | ❌ No | Trust score boost |
| 7 | TUTORIAL | All Set! 🎉 | ❌ No | Celebration & CTA |

---

## 🚀 Quick Start

1. **Migration already applied** ✅
2. **Seed data loaded** ✅
3. **Endpoints registered** ✅

**Mobile app integration:**
```typescript
// 1. On app launch, check if user should see preview
if (!hasSeenPreview && !isAuthenticated) {
  showAppPreview();
}

// 2. After registration, link analytics
await linkAppPreviewToUser(sessionId);

// 3. After first login, show user setup
if (!user.hasCompletedSetup) {
  showUserSetup();
}
```

---

## 📝 Summary

The two-phase onboarding system provides:

- ✅ **Better conversion**: Preview app before commitment
- ✅ **Personalized experience**: Post-auth setup tailored to user
- ✅ **Flexible progression**: Required + optional screens
- ✅ **Complete analytics**: Track anonymous + authenticated users
- ✅ **Mobile-optimized**: Designed for native app flows
- ✅ **Resumable**: Users can complete setup later

For questions or issues, check the [main API documentation](/docs/api-v2/README.md) or contact the development team.
