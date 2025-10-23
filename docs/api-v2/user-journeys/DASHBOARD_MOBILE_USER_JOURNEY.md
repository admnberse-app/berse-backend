# Dashboard - Mobile User Journey
**Version:** 1.0.0  
**Last Updated:** October 23, 2025  
**Purpose:** Comprehensive mobile UX documentation for the Dashboard tab - the centralized hub for all user-owned content and activities

---

## Table of Contents
1. [Overview](#overview)
2. [Dashboard Home](#dashboard-home)
3. [My Communities](#my-communities)
4. [My Events](#my-events)
5. [My Listings](#my-listings)
6. [Activity Feed](#activity-feed)
7. [Quick Actions](#quick-actions)
8. [Navigation Flows](#navigation-flows)
9. [API Integration](#api-integration)
10. [Error Handling](#error-handling)
11. [Implementation Phases](#implementation-phases)

---

## 1. Overview

### Purpose
The Dashboard tab serves as the user's personal command center, providing quick access to all owned content, pending actions, and recent activities across the platform.

### Key Principles
- **Centralized Management**: All "My" content in one place
- **Action-Oriented**: Highlight items requiring attention
- **Quick Stats**: At-a-glance overview of user's presence
- **Contextual Navigation**: Easy drill-down to detailed views
- **Notification Integration**: Badge counts for pending items

### Bottom Navigation Context
```
┌────────────────────────────────────────┐
│                                        │
│         [Dashboard Content]            │
│                                        │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│  🏠     🔍     🤝     📊     👤        │
│ Home  Discover Connect Dashboard Profile│
│                         ^               │
│                      ACTIVE             │
└────────────────────────────────────────┘
```

---

## 2. Dashboard Home

### 2.1 Main Screen Layout

```
┌────────────────────────────────────────┐
│ ← Dashboard                    ⚙️ 🔔³  │ Header
├────────────────────────────────────────┤
│                                        │
│  👋 Hey David!                         │
│  Here's what's happening               │
│                                        │
│  ┌──────────────────────────────────┐ │ Stats Overview
│  │ 🏘️ Communities      3  →         │ │
│  │ 📅 Events          5  →         │ │
│  │ 🏪 Listings        2  →         │ │
│  │ 🤝 Connections    45  →         │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ⚡ Needs Attention                    │ Section Header
│  ┌──────────────────────────────────┐ │
│  │ 🔴 5 pending community approvals  │ │ Alert Card
│  │ Digital Nomads SF      [Review]   │ │
│  └──────────────────────────────────┘ │
│  ┌──────────────────────────────────┐ │
│  │ 🟡 3 upcoming events this week    │ │
│  │ Coffee Meetup Today   [Details]   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  📊 My Content                         │ Section Header
│  ┌──────────────────────────────────┐ │
│  │ 🏘️ My Communities            3 → │ │ Card
│  │ Admin: 1  •  Member: 2            │ │
│  └──────────────────────────────────┘ │
│  ┌──────────────────────────────────┐ │
│  │ 📅 My Events                 5 → │ │
│  │ Hosting: 2  •  Attending: 3       │ │
│  └──────────────────────────────────┘ │
│  ┌──────────────────────────────────┐ │
│  │ 🏪 My Listings               2 → │ │
│  │ Active: 2  •  Sold: 0             │ │
│  └──────────────────────────────────┘ │
│                                        │
│  🕐 Recent Activity                    │ Section Header
│  ┌──────────────────────────────────┐ │
│  │ 🎉 Sarah joined your community    │ │ Activity Item
│  │ Digital Nomads SF  •  2h ago      │ │
│  └──────────────────────────────────┘ │
│  ┌──────────────────────────────────┐ │
│  │ 💬 New comment on your listing    │ │
│  │ iPhone 15 Pro  •  5h ago          │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

### 2.2 API Call on Page Load

```javascript
// Load dashboard summary
GET /v2/dashboard/summary
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123",
      "firstName": "David",
      "profilePicture": "https://..."
    },
    "stats": {
      "communities": 3,
      "events": 5,
      "listings": 2,
      "connections": 45
    },
    "alerts": [
      {
        "type": "community_approvals",
        "count": 5,
        "priority": "high",
        "communityId": "com_456",
        "communityName": "Digital Nomads SF",
        "message": "5 pending community approvals"
      },
      {
        "type": "upcoming_events",
        "count": 3,
        "priority": "medium",
        "nextEvent": {
          "id": "evt_789",
          "title": "Coffee Meetup",
          "startsAt": "2025-10-23T14:00:00Z"
        }
      }
    ],
    "communitySummary": {
      "total": 3,
      "admin": 1,
      "member": 2
    },
    "eventSummary": {
      "total": 5,
      "hosting": 2,
      "attending": 3
    },
    "listingSummary": {
      "total": 2,
      "active": 2,
      "sold": 0
    },
    "recentActivity": [
      {
        "id": "act_001",
        "type": "community_join",
        "icon": "🎉",
        "message": "Sarah joined your community",
        "targetName": "Digital Nomads SF",
        "timestamp": "2025-10-23T10:00:00Z",
        "targetId": "com_456",
        "targetType": "community"
      },
      {
        "id": "act_002",
        "type": "listing_comment",
        "icon": "💬",
        "message": "New comment on your listing",
        "targetName": "iPhone 15 Pro",
        "timestamp": "2025-10-23T07:00:00Z",
        "targetId": "lst_789",
        "targetType": "listing"
      }
    ]
  }
}
```

### 2.3 User Interactions

**Tap Stats Card (e.g., Communities)**
- Navigate to detailed "My Communities" page
- Shows filtered list of user's communities

**Tap Alert Card**
- Navigate to relevant section (e.g., pending approvals page)
- Auto-filter to show items needing attention

**Tap Content Card (e.g., My Communities)**
- Navigate to dedicated management page
- Shows full list with filters and actions

**Tap Activity Item**
- Navigate to relevant detail page (community, listing, event)
- Deep link to specific content

**Pull to Refresh**
- Reload dashboard summary
- Update all counts and alerts
- Show loading indicator

---

## 3. My Communities

### 3.1 My Communities Screen

```
┌────────────────────────────────────────┐
│ ← My Communities            ＋ Create   │ Header
├────────────────────────────────────────┤
│                                        │
│  [All (3)] [Admin (1)] [Member (2)]   │ Filter Chips
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 📸  Digital Nomads SF         ⋮  │ │ Community Card
│  │ San Francisco, CA                 │ │
│  │                                   │ │
│  │ 🔴 5 pending approvals            │ │ Alert Badge
│  │                                   │ │
│  │ 👤 245 members  •  🎖️ ADMIN      │ │ Stats + Role
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 📸  Coffee Lovers Club        ⋮  │ │
│  │ San Francisco Bay Area            │ │
│  │                                   │ │
│  │ 👤 89 members  •  👥 MEMBER       │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 📸  SF Tech Meetups           ⋮  │ │
│  │ San Francisco, CA                 │ │
│  │                                   │ │
│  │ 👤 456 members  •  👥 MEMBER      │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

### 3.2 Three-Dot Menu (Contextual Actions)

**For Admin Role:**
```
┌──────────────────────┐
│ 🎖️ Admin Actions    │
├──────────────────────┤
│ 📊 View Dashboard    │
│ ✅ Review Members    │
│ 📝 Edit Details      │
│ 📢 Create Post       │
│ 📅 Create Event      │
│ ⚙️ Settings          │
└──────────────────────┘
```

**For Member Role:**
```
┌──────────────────────┐
│ 👥 Member Actions   │
├──────────────────────┤
│ 📊 View Details      │
│ 📢 Create Post       │
│ 🔕 Mute              │
│ 🚪 Leave Community   │
└──────────────────────┘
```

### 3.3 API Calls

```javascript
// Load user's communities
GET /v2/communities/my?limit=50
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "communities": [
      {
        "id": "com_123",
        "name": "Digital Nomads SF",
        "slug": "digital-nomads-sf",
        "profileImage": "https://...",
        "location": "San Francisco, CA",
        "memberCount": 245,
        "userRole": "admin",
        "pendingApprovals": 5,
        "isPrivate": true,
        "joinedAt": "2025-09-15T10:00:00Z"
      },
      {
        "id": "com_456",
        "name": "Coffee Lovers Club",
        "slug": "coffee-lovers-club",
        "profileImage": "https://...",
        "location": "San Francisco Bay Area",
        "memberCount": 89,
        "userRole": "member",
        "pendingApprovals": null,
        "isPrivate": false,
        "joinedAt": "2025-10-01T14:30:00Z"
      }
    ],
    "summary": {
      "total": 3,
      "admin": 1,
      "member": 2
    }
  }
}
```

### 3.4 User Interactions

**Tap Filter Chip**
- Filter communities by role (All, Admin, Member)
- Update displayed list
- Persist filter selection

**Tap Community Card**
- Navigate to Community Detail page
- Show full community information

**Tap Three-Dot Menu → Admin Action**
- View Dashboard: Navigate to admin dashboard
- Review Members: Navigate to member approval page (filtered to pending)
- Edit Details: Navigate to edit community form
- Create Post: Open post creation modal
- Create Event: Navigate to event creation form
- Settings: Navigate to community settings

**Tap Three-Dot Menu → Member Action**
- View Details: Navigate to community detail page
- Create Post: Open post creation modal
- Mute: Show confirmation → Update preferences
- Leave Community: Show confirmation → Call leave endpoint

**Tap "Create" Button**
- Check trust level (requires TS ≥ 76)
- If eligible: Navigate to create community form
- If not eligible: Show trust level requirement modal

**Tap Alert Badge (e.g., "5 pending approvals")**
- Navigate to member approval page
- Auto-filter to pending requests

---

## 4. My Events

### 4.1 My Events Screen

```
┌────────────────────────────────────────┐
│ ← My Events                 ＋ Create   │ Header
├────────────────────────────────────────┤
│                                        │
│  [Upcoming (3)] [Hosting (2)] [Past]  │ Filter Tabs
│                                        │
│  ⚡ Today                               │ Time Group
│  ┌──────────────────────────────────┐ │
│  │ 📅 Coffee Meetup              ⋮  │ │ Event Card
│  │ 🕐 Today at 2:00 PM               │ │
│  │ 📍 Blue Bottle Coffee             │ │
│  │                                   │ │
│  │ 👤 12/15 attending  •  🎖️ HOST   │ │ Stats + Role
│  └──────────────────────────────────┘ │
│                                        │
│  📅 This Week                          │ Time Group
│  ┌──────────────────────────────────┐ │
│  │ 📅 SF Tech Talks              ⋮  │ │
│  │ 🕐 Oct 25 at 6:00 PM              │ │
│  │ 📍 WeWork Market St               │ │
│  │                                   │ │
│  │ 👤 45/50 attending  •  👥 GOING   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 📅 Hiking @ Marin Headlands   ⋮  │ │
│  │ 🕐 Oct 26 at 9:00 AM              │ │
│  │ 📍 Marin Headlands Trailhead      │ │
│  │                                   │ │
│  │ 👤 8/12 attending  •  🎖️ HOST    │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

### 4.2 Three-Dot Menu (Contextual Actions)

**For Host Role:**
```
┌──────────────────────┐
│ 🎖️ Host Actions     │
├──────────────────────┤
│ 📊 View Dashboard    │
│ ✅ Manage RSVPs      │
│ 📝 Edit Event        │
│ 📢 Send Update       │
│ 🗑️ Cancel Event      │
└──────────────────────┘
```

**For Attendee Role:**
```
┌──────────────────────┐
│ 👥 Attendee Actions │
├──────────────────────┤
│ 📊 View Details      │
│ 📅 Add to Calendar   │
│ 🚪 Cancel RSVP       │
│ 📤 Share Event       │
└──────────────────────┘
```

### 4.3 API Calls

```javascript
// Load user's events
GET /v2/events/my?status=upcoming&limit=50
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "evt_123",
        "title": "Coffee Meetup",
        "startsAt": "2025-10-23T14:00:00Z",
        "endsAt": "2025-10-23T16:00:00Z",
        "location": {
          "name": "Blue Bottle Coffee",
          "address": "66 Mint St, San Francisco, CA 94103"
        },
        "coverImage": "https://...",
        "attendeeCount": 12,
        "maxAttendees": 15,
        "userRole": "host",
        "rsvpStatus": "going",
        "community": {
          "id": "com_123",
          "name": "Coffee Lovers Club"
        }
      },
      {
        "id": "evt_456",
        "title": "SF Tech Talks",
        "startsAt": "2025-10-25T18:00:00Z",
        "endsAt": "2025-10-25T20:00:00Z",
        "location": {
          "name": "WeWork Market St",
          "address": "123 Market St, San Francisco, CA 94105"
        },
        "coverImage": "https://...",
        "attendeeCount": 45,
        "maxAttendees": 50,
        "userRole": "attendee",
        "rsvpStatus": "going",
        "community": {
          "id": "com_789",
          "name": "SF Tech Meetups"
        }
      }
    ],
    "summary": {
      "total": 5,
      "hosting": 2,
      "attending": 3,
      "upcoming": 3,
      "past": 2
    }
  }
}
```

### 4.4 User Interactions

**Tap Filter Tab**
- Upcoming: Show all future events
- Hosting: Filter to events where user is host
- Past: Show completed events
- Update displayed list

**Tap Event Card**
- Navigate to Event Detail page
- Show full event information

**Tap Three-Dot Menu → Host Action**
- View Dashboard: Navigate to host dashboard
- Manage RSVPs: Navigate to attendee list
- Edit Event: Navigate to edit event form
- Send Update: Open notification composer
- Cancel Event: Show confirmation → Cancel event

**Tap Three-Dot Menu → Attendee Action**
- View Details: Navigate to event detail page
- Add to Calendar: Export to device calendar
- Cancel RSVP: Show confirmation → Update RSVP status
- Share Event: Open share sheet

**Tap "Create" Button**
- Navigate to create event form
- Pre-fill with user's communities

---

## 5. My Listings

### 5.1 My Listings Screen

```
┌────────────────────────────────────────┐
│ ← My Listings               ＋ Create   │ Header
├────────────────────────────────────────┤
│                                        │
│  [Active (2)] [Sold (0)] [Draft (1)]  │ Filter Tabs
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 📸          📸          📸    ⋮  │ │ Listing Card
│  │ iPhone 15 Pro Max 256GB           │ │
│  │                                   │ │
│  │ 💰 $899                           │ │ Price
│  │ 👁️ 45 views  •  💬 3 messages     │ │ Stats
│  │ 📍 San Francisco, CA              │ │ Location
│  │ 🕐 Posted 2 days ago              │ │ Time
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 📸          📸          📸    ⋮  │ │
│  │ Sony WH-1000XM5 Headphones        │ │
│  │                                   │ │
│  │ 💰 $280                           │ │
│  │ 👁️ 23 views  •  💬 1 message      │ │
│  │ 📍 San Francisco, CA              │ │
│  │ 🕐 Posted 5 days ago              │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

### 5.2 Three-Dot Menu

```
┌──────────────────────┐
│ Listing Actions      │
├──────────────────────┤
│ 📊 View Details      │
│ 📝 Edit Listing      │
│ 📈 Boost Visibility  │
│ 💬 View Messages     │
│ ✅ Mark as Sold      │
│ 🗑️ Delete Listing    │
└──────────────────────┘
```

### 5.3 API Calls

```javascript
// Load user's listings
GET /v2/marketplace/my?status=active&limit=50
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": "lst_123",
        "title": "iPhone 15 Pro Max 256GB",
        "price": 899,
        "currency": "USD",
        "images": [
          "https://...",
          "https://...",
          "https://..."
        ],
        "location": "San Francisco, CA",
        "status": "active",
        "viewCount": 45,
        "messageCount": 3,
        "createdAt": "2025-10-21T10:00:00Z",
        "category": "electronics"
      },
      {
        "id": "lst_456",
        "title": "Sony WH-1000XM5 Headphones",
        "price": 280,
        "currency": "USD",
        "images": [
          "https://...",
          "https://...",
          "https://..."
        ],
        "location": "San Francisco, CA",
        "status": "active",
        "viewCount": 23,
        "messageCount": 1,
        "createdAt": "2025-10-18T15:30:00Z",
        "category": "electronics"
      }
    ],
    "summary": {
      "total": 3,
      "active": 2,
      "sold": 0,
      "draft": 1
    }
  }
}
```

### 5.4 User Interactions

**Tap Filter Tab**
- Active: Show published listings
- Sold: Show sold listings
- Draft: Show unpublished drafts
- Update displayed list

**Tap Listing Card**
- Navigate to Listing Detail page
- Show full listing information

**Tap Three-Dot Menu**
- View Details: Navigate to listing detail
- Edit Listing: Navigate to edit form
- Boost Visibility: Show boost options (premium feature)
- View Messages: Navigate to messages for this listing
- Mark as Sold: Show confirmation → Update status
- Delete Listing: Show confirmation → Delete listing

**Tap "Create" Button**
- Navigate to create listing form
- Select category → Fill details → Upload photos

---

## 6. Activity Feed

### 6.1 Activity Feed Screen

```
┌────────────────────────────────────────┐
│ ← Activity                             │ Header
├────────────────────────────────────────┤
│                                        │
│  🕐 Today                               │ Time Group
│  ┌──────────────────────────────────┐ │
│  │ 🎉 Sarah joined your community    │ │ Activity Item
│  │ Digital Nomads SF                 │ │
│  │ 2h ago                            │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 💬 New comment on your listing    │ │
│  │ "Is this still available?"        │ │
│  │ iPhone 15 Pro  •  5h ago          │ │
│  └──────────────────────────────────┘ │
│                                        │
│  📅 Yesterday                          │ Time Group
│  ┌──────────────────────────────────┐ │
│  │ ✅ Event check-in confirmed       │ │
│  │ Coffee Meetup  •  Yesterday       │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 🏆 New badge earned!              │ │
│  │ Community Builder                 │ │
│  │ Yesterday                         │ │
│  └──────────────────────────────────┘ │
│                                        │
│  📅 This Week                          │ Time Group
│  ┌──────────────────────────────────┐ │
│  │ 👤 New connection request         │ │
│  │ Michael Chen  •  2 days ago       │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

### 6.2 API Calls

```javascript
// Load activity feed
GET /v2/users/me/activity?limit=50
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "act_001",
        "type": "community_join",
        "icon": "🎉",
        "message": "Sarah joined your community",
        "targetName": "Digital Nomads SF",
        "timestamp": "2025-10-23T10:00:00Z",
        "targetId": "com_456",
        "targetType": "community",
        "read": false
      },
      {
        "id": "act_002",
        "type": "listing_comment",
        "icon": "💬",
        "message": "New comment on your listing",
        "details": "Is this still available?",
        "targetName": "iPhone 15 Pro",
        "timestamp": "2025-10-23T07:00:00Z",
        "targetId": "lst_789",
        "targetType": "listing",
        "read": false
      },
      {
        "id": "act_003",
        "type": "event_checkin",
        "icon": "✅",
        "message": "Event check-in confirmed",
        "targetName": "Coffee Meetup",
        "timestamp": "2025-10-22T14:00:00Z",
        "targetId": "evt_123",
        "targetType": "event",
        "read": true
      },
      {
        "id": "act_004",
        "type": "badge_earned",
        "icon": "🏆",
        "message": "New badge earned!",
        "targetName": "Community Builder",
        "timestamp": "2025-10-22T10:00:00Z",
        "targetId": "badge_456",
        "targetType": "badge",
        "read": true
      }
    ],
    "hasMore": true
  }
}
```

### 6.3 User Interactions

**Tap Activity Item**
- Navigate to relevant detail page based on targetType
- community: Community detail page
- listing: Listing detail page
- event: Event detail page
- badge: Badge detail modal
- connection: User profile page
- Mark activity as read

**Pull to Refresh**
- Reload activity feed
- Show new activities

**Scroll to Bottom**
- Load more activities (pagination)
- Show loading indicator

---

## 7. Quick Actions

### 7.1 Floating Action Button (Optional)

```
┌────────────────────────────────────────┐
│                                        │
│         [Dashboard Content]            │
│                                        │
│                                        │
│                                    ＋  │ FAB
│                                    🎯  │
└────────────────────────────────────────┘
```

**Tap FAB → Show Quick Actions Menu:**
```
┌──────────────────────┐
│ Quick Create         │
├──────────────────────┤
│ 🏘️ Community        │
│ 📅 Event             │
│ 🏪 Listing           │
│ 📝 Post              │
└──────────────────────┘
```

---

## 8. Navigation Flows

### 8.1 Primary Navigation Paths

```
Dashboard Home
├── My Communities
│   ├── Community Detail
│   │   ├── Admin Dashboard (if admin)
│   │   ├── Member List
│   │   └── Community Settings
│   └── Create Community
│
├── My Events
│   ├── Event Detail
│   │   ├── Host Dashboard (if host)
│   │   ├── Attendee List
│   │   └── Edit Event
│   └── Create Event
│
├── My Listings
│   ├── Listing Detail
│   │   ├── Edit Listing
│   │   └── Messages
│   └── Create Listing
│
└── Activity Feed
    └── Deep links to:
        ├── Communities
        ├── Events
        ├── Listings
        ├── Profiles
        └── Badges
```

### 8.2 Cross-Tab Navigation

**From Dashboard to Other Tabs:**
- Tap stat card → Navigate to relevant discovery tab
  - Communities → Discover tab (Communities section)
  - Events → Discover tab (Events section)
  - Listings → Discover tab (Marketplace section)

**From Other Tabs to Dashboard:**
- Join community → Badge on Dashboard tab icon
- RSVP to event → Badge on Dashboard tab icon
- Receive message → Badge on Dashboard tab icon

---

## 9. API Integration

### 9.1 Required Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v2/dashboard/summary` | GET | Load dashboard overview |
| `/v2/communities/my` | GET | Load user's communities |
| `/v2/events/my` | GET | Load user's events |
| `/v2/marketplace/my` | GET | Load user's listings |
| `/v2/users/me/activity` | GET | Load activity feed |
| `/v2/communities/{id}/leave` | POST | Leave community |
| `/v2/events/{id}/rsvp` | DELETE | Cancel event RSVP |
| `/v2/marketplace/{id}` | DELETE | Delete listing |
| `/v2/marketplace/{id}/status` | PATCH | Update listing status |

### 9.2 Real-time Updates (WebSocket)

```javascript
// Subscribe to dashboard updates
ws.send({
  type: 'subscribe',
  channel: 'dashboard',
  userId: 'usr_123'
});

// Receive real-time updates
{
  "type": "dashboard_update",
  "data": {
    "updateType": "new_activity",
    "activity": {
      "id": "act_005",
      "type": "community_join",
      "message": "Sarah joined your community",
      "timestamp": "2025-10-23T12:00:00Z"
    }
  }
}

// Update badge count
{
  "type": "dashboard_update",
  "data": {
    "updateType": "badge_count",
    "count": 3
  }
}
```

---

## 10. Error Handling

### 10.1 Empty States

**No Communities:**
```
┌────────────────────────────────────────┐
│                                        │
│          🏘️                            │
│                                        │
│     No Communities Yet                 │
│                                        │
│  Join or create your first             │
│  community to get started!             │
│                                        │
│     [Discover Communities]             │
│                                        │
└────────────────────────────────────────┘
```

**No Events:**
```
┌────────────────────────────────────────┐
│                                        │
│          📅                            │
│                                        │
│       No Events Yet                    │
│                                        │
│  Find events or host your own!         │
│                                        │
│     [Discover Events]                  │
│                                        │
└────────────────────────────────────────┘
```

**No Listings:**
```
┌────────────────────────────────────────┐
│                                        │
│          🏪                            │
│                                        │
│       No Listings Yet                  │
│                                        │
│  Start selling items to your           │
│  community!                            │
│                                        │
│     [Create Listing]                   │
│                                        │
└────────────────────────────────────────┘
```

**No Activity:**
```
┌────────────────────────────────────────┐
│                                        │
│          🕐                            │
│                                        │
│       No Activity Yet                  │
│                                        │
│  Your recent activities will           │
│  appear here                           │
│                                        │
└────────────────────────────────────────┘
```

### 10.2 Error States

**Network Error:**
```
┌────────────────────────────────────────┐
│          ⚠️                            │
│                                        │
│    Connection Error                    │
│                                        │
│  Unable to load dashboard data         │
│                                        │
│         [Try Again]                    │
│                                        │
└────────────────────────────────────────┘
```

**Loading State:**
```
┌────────────────────────────────────────┐
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │ │ Skeleton
│  │ ░░░░░░░░░░░░░░░░░░               │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │ │
│  │ ░░░░░░░░░░░░░░░░░░               │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

---

## 11. Implementation Phases

### Phase 1: Core Dashboard (Week 1-2)
**Priority: Critical**
- ✅ Dashboard home screen
- ✅ Stats overview
- ✅ Alerts section
- ✅ API integration for `/dashboard/summary`
- ✅ Basic navigation to detail pages
- ✅ Pull-to-refresh

**Deliverables:**
- Functional dashboard home
- Working navigation flows
- Real-time stat updates

---

### Phase 2: My Communities (Week 2-3)
**Priority: High**
- ✅ My Communities list screen
- ✅ Filter chips (All, Admin, Member)
- ✅ Community cards with role badges
- ✅ Three-dot menu with contextual actions
- ✅ API integration for `/communities/my`
- ✅ Leave community flow

**Deliverables:**
- Complete community management
- Admin vs member action differentiation
- Pending approval indicators

---

### Phase 3: My Events (Week 3-4)
**Priority: High**
- ✅ My Events list screen
- ✅ Filter tabs (Upcoming, Hosting, Past)
- ✅ Event cards with role indicators
- ✅ Three-dot menu (host vs attendee)
- ✅ API integration for `/events/my`
- ✅ Cancel RSVP flow
- ✅ Add to calendar export

**Deliverables:**
- Event management for hosts
- RSVP management for attendees
- Calendar integration

---

### Phase 4: My Listings (Week 4-5)
**Priority: Medium**
- ✅ My Listings list screen
- ✅ Filter tabs (Active, Sold, Draft)
- ✅ Listing cards with stats
- ✅ Three-dot menu actions
- ✅ API integration for `/marketplace/my`
- ✅ Mark as sold flow
- ✅ Delete listing flow

**Deliverables:**
- Complete listing management
- Status updates
- View/message tracking

---

### Phase 5: Activity Feed & Polish (Week 5-6)
**Priority: Medium**
- ✅ Activity feed screen
- ✅ Time-grouped activities
- ✅ Deep links to detail pages
- ✅ API integration for `/users/me/activity`
- ✅ Real-time WebSocket updates
- ✅ Badge count on Dashboard tab icon
- ✅ Loading & error states
- ✅ Empty states for all sections
- ✅ FAB with quick actions (optional)

**Deliverables:**
- Complete activity tracking
- Real-time notifications
- Polished user experience
- All edge cases handled

---

## Testing Scenarios

### Scenario 1: New User (Empty Dashboard)
1. User opens Dashboard tab for first time
2. Shows empty states for all sections
3. CTAs encourage discovery and creation
4. Tap "Discover Communities" → Navigate to Discover tab

### Scenario 2: Active User with Alerts
1. User opens Dashboard tab
2. Shows "5 pending approvals" alert
3. Tap alert → Navigate to pending members page
4. Approve/reject members
5. Return to dashboard → Alert badge updated

### Scenario 3: Community Admin Managing Content
1. User navigates to "My Communities"
2. Filter to "Admin (1)" communities
3. Tap three-dot menu → "View Dashboard"
4. Navigate to admin dashboard
5. Review members, create post, edit details

### Scenario 4: Event Host Managing RSVPs
1. User navigates to "My Events"
2. Filter to "Hosting (2)" events
3. Tap event card with "12/15 attending"
4. View attendee list
5. Send update to all attendees

### Scenario 5: Activity Feed Monitoring
1. User navigates to Activity Feed
2. Sees "Sarah joined your community"
3. Tap activity → Navigate to community detail
4. View new member's profile
5. Send welcome message

---

## Design Notes

### Visual Hierarchy
- **Dashboard Home**: Focus on alerts & quick actions
- **My Content Pages**: Emphasize role-based actions
- **Activity Feed**: Chronological timeline with grouping

### Interaction Patterns
- **Tap Card**: Navigate to detail
- **Tap Three-Dot**: Show contextual menu
- **Pull Down**: Refresh content
- **Scroll Down**: Load more items

### Badge Indicators
- **Red Badge (🔴)**: Urgent action required
- **Yellow Badge (🟡)**: Upcoming deadline
- **Green Badge (🟢)**: Positive update
- **Gray Badge**: Neutral information

### Performance Considerations
- **Lazy Load**: Load stats on demand
- **Cache**: Cache dashboard summary for 5 minutes
- **Pagination**: Load 20 items per page
- **Image Optimization**: Use thumbnails in lists

---

## Accessibility

- **Screen Reader**: Full VoiceOver/TalkBack support
- **Color Contrast**: WCAG AA compliant
- **Touch Targets**: Minimum 44x44pt
- **Haptic Feedback**: On important actions
- **Dynamic Type**: Support for larger text sizes

---

**End of Document**
