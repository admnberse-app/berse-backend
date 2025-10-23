# Mobile App User Journey Documentation

This directory contains comprehensive user journey documentation for the Berse mobile app, organized by navigation tabs and feature modules.

**Last Updated:** October 23, 2025

---

## 📱 Navigation Architecture

The mobile app uses a 5-tab bottom navigation structure:

```
┌────────────────────────────────────────┐
│         [Screen Content]               │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│  🏠     🔍     🤝     📊     👤        │
│ Home  Discover Connect Dashboard Profile│
└────────────────────────────────────────┘
```

### Tab Overview

| Tab | Icon | Purpose | Documentation |
|-----|------|---------|---------------|
| **Home** | 🏠 | Activity feed, quick actions | _(Coming soon)_ |
| **Discover** | 🔍 | Explore communities, events, marketplace | See: Communities, Events, Marketplace docs |
| **Connect** | 🤝 | Connections, vouching, networking | _(Coming soon)_ |
| **Dashboard** | 📊 | Manage your content (My Communities, Events, Listings) | `DASHBOARD_MOBILE_USER_JOURNEY.md` |
| **Profile** | 👤 | Account settings, public profile, trust score | _(Coming soon)_ |

---

## 📚 Available Documentation

### 1. **Dashboard Tab** (`DASHBOARD_MOBILE_USER_JOURNEY.md`)
Comprehensive guide for managing all user-owned content.

**Covers:**
- Dashboard Home (stats overview, alerts, quick actions)
- My Communities (role-based management for admins & members)
- My Events (host vs attendee functionality)
- My Listings (marketplace items)
- Activity Feed (recent interactions)
- Real-time WebSocket updates

**Implementation:** 5 phases / 10 weeks

---

### 2. **Communities Discovery** (`COMMUNITY_DISCOVERY_MOBILE_USER_JOURNEY.md`)
User journey for discovering and joining communities in the Discover tab.

**Covers:**
- Community Discovery Page (trending, suggested, new, browse by category)
- Community Details Page (read-only view for non-members)
- Join Community Flow (public & private communities)
- Create Community Flow (trust level gating)
- API Endpoints Reference
- Screen States & Error Handling

**Implementation:** 3 phases / 6 weeks

**Note:** For managing owned communities, see Dashboard documentation above.

---

## 🎯 Information Architecture Principles

### Clear Separation of Concerns

**Discover Tab = Exploration**
- Finding new content
- Browsing categories
- Searching
- Viewing details (read-only)
- Joining/registering

**Dashboard Tab = Management**
- My owned content
- Admin functions
- Pending actions
- Activity monitoring
- Content creation shortcuts

**Profile Tab = Settings**
- Account preferences
- Privacy controls
- Public profile view
- Trust score details

---

## 📊 Cross-Tab Navigation Flows

### Typical User Journeys

**1. Discover → Join → Manage**
```
Discover Tab (🔍)
  → View community details
  → Join community
  → [Badge appears on Dashboard tab]
  → Navigate to Dashboard Tab (📊)
  → My Communities
  → Manage membership
```

**2. Create → Manage → Invite**
```
Discover Tab (🔍)
  → Create Community button
  → Fill community details
  → [Community created]
  → Auto-navigate to Dashboard Tab (📊)
  → My Communities (Admin)
  → Invite members
```

**3. Dashboard → Discover → Join More**
```
Dashboard Tab (📊)
  → View My Communities
  → Tap "Discover More"
  → Navigate to Discover Tab (🔍)
  → Browse & join new communities
```

---

## 🔗 Related Documentation

- **API Documentation:** `/docs/api-v2/COMMUNITIES_API.md`
- **Backend Logic:** `/docs/app logic business.md`
- **Database Schema:** See Prisma schema
- **Notification Integration:** See notification service docs

---

## 🚀 Implementation Status

| Feature | Design | Documentation | Backend | Mobile |
|---------|--------|---------------|---------|--------|
| Communities Discovery | ✅ | ✅ | ✅ | 🔄 In Progress |
| Dashboard Home | ✅ | ✅ | 🔄 Partial | ⏸️ Pending |
| My Communities | ✅ | ✅ | ✅ | ⏸️ Pending |
| My Events | ✅ | ✅ | ✅ | ⏸️ Pending |
| My Listings | ✅ | ✅ | ✅ | ⏸️ Pending |
| Activity Feed | ✅ | ✅ | 🔄 Partial | ⏸️ Pending |

**Legend:**
- ✅ Complete
- 🔄 In Progress
- ⏸️ Pending
- ❌ Not Started

---

## 📝 Document Conventions

### Screen Mockups
All user journey documents include ASCII screen mockups for visual clarity:

```
┌────────────────────────────────────────┐
│  Screen Title               🔍  👤     │ ← Header
├────────────────────────────────────────┤
│                                        │
│  Content area with                     │
│  visual elements                       │
│                                        │
└────────────────────────────────────────┘
```

### API Integration
Each interaction includes corresponding API endpoints:

```javascript
// Example
GET /v2/communities/discovery/trending?limit=10
Authorization: Bearer {token}
```

### User Flows
Step-by-step interaction sequences with expected outcomes.

### Error States
Comprehensive coverage of loading, empty, error, and success states.

---

## 🤝 Contributing

When adding new user journey documents:

1. **Follow the template structure** from existing docs
2. **Include ASCII screen mockups** for all key screens
3. **Document API calls** with request/response examples
4. **Cover all states:** loading, empty, error, success
5. **Add implementation phases** with realistic timelines
6. **Cross-reference related docs** for navigation flows

---

## 📧 Questions?

For questions about user journeys or mobile implementation:
- Backend: See `/docs/api-v2/` documentation
- Design: Review screen mockups in this directory
- API: Check Swagger UI at `/docs/api-v2`

---

**Status:** 🟢 Active Development  
**Target Release:** Q1 2026
