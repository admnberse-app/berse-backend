# Community Discovery - Mobile User Journey

## Overview
This document outlines the user journey for **discovering and joining** communities in the **Discover tab** of the mobile app. This tab focuses purely on exploration, search, and joining new communities.

**For managing your owned/joined communities** (My Communities, admin functions, member management, settings), see `DASHBOARD_MOBILE_USER_JOURNEY.md`.

**Last Updated:** October 23, 2025  
**Status:** ✅ Ready for Implementation

---

## Bottom Navigation Context
The mobile app has 5 main tabs:
- **Home** 🏠: Activity feed & quick actions
- **Discover** 🔍: Explore communities, events, marketplace _(this document covers Communities section)_
- **Connect** 🤝: Connections & networking
- **Dashboard** 📊: My communities, events, listings _(see DASHBOARD_MOBILE_USER_JOURNEY.md)_
- **Profile** 👤: Account settings & public profile

---

## Table of Contents
1. [Community Discovery Page](#1-community-discovery-page)
2. [Community Details Page](#2-community-details-page)
3. [Join Community Flow](#3-join-community-flow)
4. [Create Community Flow](#4-create-community-flow)
5. [API Endpoints Reference](#5-api-endpoints-reference)
6. [Screen States & Error Handling](#6-screen-states--error-handling)

---

## 1. Main Communities Discovery Page

### Purpose
The entry point for users to **discover** new communities based on trending topics, interests, and connections.

### Screen Layout

```
┌─────────────────────────────────────┐
│  Discover Communities       🔍  �  │ ← Header with search + profile
├─────────────────────────────────────┤
│  � Trending Now                    │
│  [Horizontal Scroll] →              │
│  ┌───────┐ ┌───────┐ ┌───────┐    │
│  │ 🖼️    │ │ 🖼️    │ │ 🖼️    │    │
│  │ Tech  │ │ Food  │ │ Arts  │    │
│  │ 1.2k  │ │ 980   │ │ 750   │    │
│  └───────┘ └───────┘ └───────┘    │
│                                     │
│  🎯 Suggested For You               │
│  ┌───────────────────────────────┐ │
│  │ �️ Photography Club        ⭐  │ │
│  │ 1.2k members • 15 events      │ │
│  │ Based on your interests       │ │
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │ 🖼️ Running Enthusiasts        │ │
│  │ 850 members • 8 events        │ │
│  │ 3 connections are members     │ │
│  └───────────────────────────────┘ │
│                                     │
│  🆕 New Communities                 │
│  [Horizontal Scroll] →              │
│  ┌───────┐ ┌───────┐ ┌───────┐    │
│  │ 🖼️    │ │ 🖼️    │ │ 🖼️    │    │
│  │Startup│ │Design │ │Parents│    │
│  │  45   │ │  32   │ │  28   │    │
│  └───────┘ └───────┘ └───────┘    │
│                                     │
│  🏷️ Browse by Category             │
│  [Technology] [Sports] [Arts]      │
│  [Travel] [Food] [Business]        │
│  [See All Categories →]            │
│                                     │
│  + Create Community                │
└─────────────────────────────────────┘
```

**Note:** "My Communities" is accessed via the **profile icon (👤)** in the top right, which opens a slide-out menu with quick access to user-specific features.

### API Calls on Page Load

**1. Get Trending Communities (Horizontal carousel)**
```http
GET /v2/communities/discovery/trending?limit=10
```
**Response:**
```json
{
  "success": true,
  "data": {
    "communities": [
      {
        "id": "cm123",
        "name": "KL Foodies United",
        "description": "...",
        "imageUrl": "...",
        "category": "Food & Drinks",
        "isVerified": true,
        "memberCount": 1200,
        "eventCount": 15,
        "creator": {
          "id": "usr123",
          "fullName": "Admin User",
          "trustLevel": "leader"
        }
      }
    ]
  }
}
```

**2. Get Suggested For You (Personalized cards)**
```http
GET /v2/communities/discovery/suggested?limit=5
Authorization: Bearer {token}
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cm123",
      "name": "Photography Club",
      "imageUrl": "...",
      "memberCount": 1200,
      "eventCount": 15,
      "suggestionType": "interest-match",
      "matchReason": "Based on your interests"
    }
  ]
}
```

**3. Get New Communities (Horizontal carousel)**
```http
GET /v2/communities/discovery/new?limit=10
```
**Response:**
```json
{
  "success": true,
  "data": {
    "communities": [
      {
        "id": "cm456",
        "name": "Parents Support Network",
        "description": "...",
        "imageUrl": "...",
        "category": "Family & Parenting",
        "isVerified": true,
        "memberCount": 45,
        "eventCount": 3,
        "createdAt": "2025-10-21T07:53:12.357Z"
      }
    ]
  }
}
```

### User Interactions

#### 1.1 Profile Menu (👤)
**Action:** User taps profile icon in top right
```
┌─────────────────────────────────────┐
│  Profile Menu                    ✕  │
├─────────────────────────────────────┤
│  👤 John Doe                        │
│  @johndoe                           │
│  ──────────────────────────────────│
│  My Communities (3)            →    │
│  Saved Communities (5)         →    │
│  ──────────────────────────────────│
│  Settings                      →    │
│  Help & Support                →    │
└─────────────────────────────────────┘
```
**Tap "My Communities":** Navigate to [My Communities Page](#4-my-communities-page)

#### 1.2 Search Communities
**Action:** User taps search icon
```
┌─────────────────────────────────────┐
│  ← Search Communities               │
├─────────────────────────────────────┤
│  🔍 Search by name or category...   │
├─────────────────────────────────────┤
│  Recent Searches                    │
│  • Tech Enthusiasts                 │
│  • Photography                      │
│                                     │
│  Suggested Categories               │
│  [Technology] [Sports] [Arts]       │
└─────────────────────────────────────┘
```

**API Call (when typing):**
```http
GET /v2/communities?search=photo&limit=20
```

**API Call (filter by category):**
```http
GET /v2/communities?category=Technology&sortBy=memberCount&sortOrder=desc
```

#### 1.2 Filter & Sort
**Action:** User taps filter icon
```
┌─────────────────────────────────────┐
│  Filters & Sort                  ✕  │
├─────────────────────────────────────┤
│  Sort By                            │
│  ○ Most Popular                     │
│  ○ Newest                           │
│  ○ Most Active                      │
│                                     │
│  Category                           │
│  ☑ Technology                       │
│  ☐ Sports                           │
│  ☐ Arts & Culture                   │
│                                     │
│  Status                             │
│  ☐ Verified Only                    │
│                                     │
│  [Clear All]    [Apply Filters]     │
└─────────────────────────────────────┘
```

**API Call:**
```http
GET /v2/communities?category=Technology&isVerified=true&sortBy=memberCount&sortOrder=desc
```

#### 1.3 Browse by Category
**Action:** User taps interest chip (e.g., "Technology")
```http
GET /v2/communities/discovery/by-interest?interest=Technology&limit=20
```

#### 1.4 Pull-to-Refresh
**Action:** User pulls down to refresh
- Re-fetches all discovery sections
- Shows loading indicators
- Updates with latest data

---

## 2. Community Details Page

### Purpose
Show comprehensive community information, members preview, upcoming events, and membership status.

### Screen Layout

```
┌─────────────────────────────────────┐
│  ← Tech Enthusiasts Malaysia    ⋮   │ ← Back & Menu
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │   [Community Cover Image]       ││
│  │                             ⭐   ││ ← Verified badge
│  └─────────────────────────────────┘│
│                                     │
│  Tech Enthusiasts Malaysia          │
│  Technology • 1,250 members         │
│                                     │
│  About                              │
│  A vibrant community for technology │
│  lovers in Malaysia. Join us for    │
│  meetups, workshops, and networking.│
│  [Read more...]                     │
│                                     │
│  📊 Quick Stats                     │
│  250 Members  •  42 Events  •  67 Vouches│
│                                     │
│  👥 Members Preview                 │
│  [Horizontal avatars] +245          │
│  John, Jane, Alex, Bob, +246 more   │
│  [View All Members →]               │
│                                     │
│  📅 Upcoming Events (3)             │
│  ┌───────────────────────────────┐ │
│  │ Oct 25 • Tech Meetup #42      │ │
│  │ 50 attending                  │ │
│  └───────────────────────────────┘ │
│  [View All Events →]               │
│                                     │
│  🏆 Community Achievements          │
│  • Active for 6 months             │
│  • 100+ events organized           │
│                                     │
│  ──────────────────────────────────│
│  [Join Community] or [Joined ✓]    │ ← Primary CTA
└─────────────────────────────────────┘
```

### API Call

```http
GET /v2/communities/{communityId}
Authorization: Bearer {token} (optional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cm123",
    "name": "Tech Enthusiasts Malaysia",
    "description": "A vibrant community...",
    "imageUrl": "...",
    "category": "Technology",
    "isVerified": true,
    "memberCount": 1250,
    "eventCount": 42,
    "membersPreview": [
      {
        "id": "user123",
        "displayName": "John Doe",
        "profilePicture": "..."
      }
    ],
    "eventsPreview": [
      {
        "id": "event123",
        "title": "Tech Meetup #42",
        "date": "2025-10-25T18:00:00Z",
        "attendeeCount": 50
      }
    ],
    "userMembershipStatus": {
      "isMember": false,
      "isPending": false,
      "role": null
    }
  }
}
```

### User Interactions

#### 2.1 View All Members
**Action:** Tap "View All Members"
```http
GET /v2/communities/{communityId}/members?page=1&limit=20&isApproved=true
```

#### 2.2 View All Events
**Action:** Tap "View All Events"
- Navigate to Events module filtered by this community

#### 2.3 Menu Options (⋮)
```
┌─────────────────────────────────────┐
│  Share Community                    │
│  Report Community                   │
│  ──────────────────────────────────│
│  [Cancel]                           │
└─────────────────────────────────────┘
```

---

## 3. Join Community Flow

### 3.1 Not a Member State

```
┌─────────────────────────────────────┐
│  [Join Community]                   │ ← Primary CTA
└─────────────────────────────────────┘
```

**Action:** User taps "Join Community"

```
┌─────────────────────────────────────┐
│  Join Tech Enthusiasts Malaysia  ✕  │
├─────────────────────────────────────┤
│  Why do you want to join?           │
│  (Optional)                         │
│  ┌─────────────────────────────────┐│
│  │ I'm passionate about tech...    ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  Your request will be reviewed by   │
│  community admins.                  │
│                                     │
│  [Cancel]          [Send Request]   │
└─────────────────────────────────────┘
```

**API Call:**
```http
POST /v2/communities/{communityId}/join
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "I'm passionate about technology and would love to join this community."
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Join request sent successfully. Awaiting approval.",
  "data": {
    "id": "cmmem123",
    "communityId": "cm123",
    "userId": "user456",
    "role": "MEMBER",
    "isApproved": false,
    "joinedAt": "2025-10-23T10:00:00.000Z"
  }
}
```

### 3.2 Pending Approval State

```
┌─────────────────────────────────────┐
│  [Pending Approval] 🕐              │
└─────────────────────────────────────┘
```

**Long press:** Shows "Cancel Request" option

**API Call to Cancel:**
```http
DELETE /v2/communities/{communityId}/leave
Authorization: Bearer {token}
```

### 3.3 Approved Member State

```
┌─────────────────────────────────────┐
│  [Joined ✓]                         │
└─────────────────────────────────────┘
```

**Long press menu:**
```
┌─────────────────────────────────────┐
│  Leave Community                    │
│  Notification Settings              │
│  ──────────────────────────────────│
│  [Cancel]                           │
└─────────────────────────────────────┘
```

---

## 4. Create Community Flow

### Purpose
Allow eligible users (trust score ≥76) to create new communities.

### 4.1 Eligibility Check

**Trigger:** User taps "+ Create Community" button

**If trust score < 76:**
```
┌─────────────────────────────────────┐
│  Trust Level Required            ✕  │
├─────────────────────────────────────┤
│  � Creating communities requires   │
│  a trust score of 76 or higher.     │
│                                     │
│  Your current trust score: 68       │
│  Required: 76                       │
│                                     │
│  💡 Increase your trust score by:   │
│  • Getting vouched by others        │
│  • Attending events                 │
│  • Building connections             │
│                                     │
│  [Learn More]          [OK]         │
└─────────────────────────────────────┘
```

### 4.2 Create Community Form

**If trust score ≥76:**
```
┌─────────────────────────────────────┐
│  ← Create Community                 │
├─────────────────────────────────────┤
│  Community Photo                    │
│  ┌─────────────────────────────────┐│
│  │  📷  Add Cover Photo            ││
│  └─────────────────────────────────┘│
│                                     │
│  Community Name *                   │
│  ┌─────────────────────────────────┐│
│  │ Tech Enthusiasts KL             ││
│  └─────────────────────────────────┘│
│  3-100 characters                   │
│                                     │
│  Category                           │
│  ┌─────────────────────────────────┐│
│  │ Technology              ▾       ││
│  └─────────────────────────────────┘│
│                                     │
│  Description *                      │
│  ┌─────────────────────────────────┐│
│  │ A community for tech lovers...  ││
│  │                                 ││
│  │                                 ││
│  └─────────────────────────────────┘│
│  10-2000 characters                 │
│                                     │
│  ℹ️ You'll be the admin of this    │
│  community and can invite members.  │
│                                     │
│  [Cancel]        [Create Community] │
└─────────────────────────────────────┘
```

**API Call:**
```http
POST /v2/communities
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Tech Enthusiasts KL",
  "description": "A community for technology lovers in Kuala Lumpur...",
  "imageUrl": "https://cdn.berse.com/communities/tech-kl.jpg",
  "category": "Technology"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "cm789",
    "name": "Tech Enthusiasts KL",
    "description": "...",
    "category": "Technology",
    "isVerified": false,
    "createdBy": "user123",
    "memberCount": 1,
    "eventCount": 0,
    "userRole": "ADMIN",
    "userMembership": {
      "role": "ADMIN",
      "isApproved": true,
      "joinedAt": "2025-10-23T10:00:00.000Z"
    }
  }
}
```

**On Success:**
- Show success toast: "Community created! You're the admin"
- Navigate to newly created community details page
- Prompt to invite connections

---

## 5. API Endpoints Reference

### Discovery Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|----------|
| `/v2/communities/discovery/trending` | GET | Optional | Get trending communities |
| `/v2/communities/discovery/suggested` | GET | Required | Get personalized suggestions |
| `/v2/communities/discovery/new` | GET | Optional | Get newest communities |
| `/v2/communities/discovery/by-interest` | GET | Optional | Filter by interest/category |

### Search & Filter

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|----------|
| `/v2/communities?search={query}` | GET | Optional | Search communities |
| `/v2/communities?category={cat}` | GET | Optional | Filter by category |
| `/v2/communities?isVerified=true` | GET | Optional | Filter verified only |

### Community Details

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|----------|
| `/v2/communities/{id}` | GET | Optional | Get community details |
| `/v2/communities/{id}/members` | GET | Optional | List community members |

### Membership Actions

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|----------|
| `/v2/communities/{id}/join` | POST | Required | Join/request to join |
| `/v2/communities/{id}/leave` | DELETE | Required | Leave community |

### Create Community

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|----------|
| `/v2/communities` | POST | Required (TS≥76) | Create new community |

---

## 6. Screen States & Error Handling

### 6.1 Loading States

**Discovery Page Loading:**
```
┌─────────────────────────────────────┐
│  Discover Communities           🔍  │
├─────────────────────────────────────┤
│  🔥 Trending Now                    │
│  ┌─────┐ ┌─────┐ ┌─────┐           │
│  │ ░░░ │ │ ░░░ │ │ ░░░ │ Skeleton │
│  │ ░░░ │ │ ░░░ │ │ ░░░ │           │
│  └─────┘ └─────┘ └─────┘           │
└─────────────────────────────────────┘
```

**Community Details Loading:**
```
┌─────────────────────────────────────┐
│  ← ░░░░░░░░░░░                      │
├─────────────────────────────────────┤
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░        │
│  ░░░░░░░░░░░░░░░                    │
└─────────────────────────────────────┘
```

### 6.2 Empty States

**No Communities Found:**
```
┌─────────────────────────────────────┐
│  Discover Communities           🔍  │
├─────────────────────────────────────┤
│                                     │
│         🏘️                          │
│                                     │
│   No communities found              │
│                                     │
│   Try adjusting your filters or     │
│   be the first to create one!       │
│                                     │
│   [Create Community]                │
│                                     │
└─────────────────────────────────────┘
```

**No Search Results:**
```
┌─────────────────────────────────────┐
│         🔍                          │
│                                     │
│   No results for "design"           │
│                                     │
│   Try different keywords            │
└─────────────────────────────────────┘
```

### 6.3 Error States

**Network Error:**
```
┌─────────────────────────────────────┐
│         ⚠️                          │
│                                     │
│   Connection Error                  │
│                                     │
│   Unable to load communities        │
│   Please check your connection      │
│                                     │
│   [Try Again]                       │
└─────────────────────────────────────┘
```

**Join Request Failed:**
```
┌─────────────────────────────────────┐
│  ⚠️ Unable to Join                  │
├─────────────────────────────────────┤
│  Something went wrong. Please try   │
│  again later.                       │
│                                     │
│  [Dismiss]          [Try Again]     │
└─────────────────────────────────────┘
```

**Trust Level Insufficient:**
```
┌─────────────────────────────────────┐
│  🔒 Trust Level Required            │
├─────────────────────────────────────┤
│  You need a Trust Score of 76 or    │
│  higher to create communities.      │
│                                     │
│  Your current score: 68             │
│                                     │
│  [Learn More]          [Close]      │
└─────────────────────────────────────┘
```

### 6.4 Success States

**Join Request Submitted:**
```
┌─────────────────────────────────────┐
│  ✅ Request Submitted               │
├─────────────────────────────────────┤
│  Your join request has been sent    │
│  to the community admins.           │
│                                     │
│  You'll be notified when approved.  │
│                                     │
│  [OK]                               │
└─────────────────────────────────────┘
```

**Community Created:**
```
┌─────────────────────────────────────┐
│  🎉 Community Created!              │
├─────────────────────────────────────┤
│  Your community is now live.        │
│  Invite members to get started!     │
│                                     │
│  [Invite Members]   [View Community]│
└─────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Core Discovery (Week 1-2)
- [ ] Main Communities Discovery page
- [ ] Trending, Suggested, New sections
- [ ] Community Details page (read-only view)
- [ ] Search functionality
- [ ] Filter & Sort

### Phase 2: Join & Create (Week 3-4)
- [ ] Join community flow (public & private)
- [ ] Create community flow
- [ ] Trust score validation
- [ ] Success/error states

### Phase 3: Polish & Optimization (Week 5-6)
- [ ] Loading states & skeletons
- [ ] Empty states
- [ ] Error handling
- [ ] Pull-to-refresh
- [ ] Analytics integration
- [ ] Performance optimization

**Note:** For My Communities management features, see implementation plan in `DASHBOARD_MOBILE_USER_JOURNEY.md`

---

## API Response Caching Strategy

### Cache Duration
- **Discovery endpoints:** 5 minutes
- **Community Details:** 5 minutes
- **Search Results:** 2 minutes

### Invalidation Rules
- Clear on join/leave
- Clear on create
- Manual refresh via pull-to-refresh

---

**Document Status:** ✅ Ready for Mobile Team  
  
**API Version:** v2.2.0  
**Last Updated:** October 23, 2025
