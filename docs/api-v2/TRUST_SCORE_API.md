# Trust Score API Documentation

## Overview
The Trust Score system is a core component of the Berse app that calculates and maintains user trust levels based on vouches, activity participation, and trust moments. Trust scores are calculated dynamically and updated automatically when relevant events occur.

**Base URL:**
- **Production:** `https://api.berse-app.com/v2/`
- **Development:** `http://localhost:3000/v2/`

**Authentication:** Bearer token required for all endpoints

---

## Table of Contents
1. [Trust Score Calculation](#trust-score-calculation)
2. [Trust Levels](#trust-levels)
3. [Event-Driven Updates](#event-driven-updates)
4. [API Endpoints](#api-endpoints)
5. [Examples](#examples)

---

## Trust Score Calculation

### Score Composition (Out of 100)

Your trust score is calculated from three main components:

#### **40% from Vouches**
- **Primary Vouch** (1 max): 30% weight = **12 points**
  - Closest relationship, highest trust indicator
  - Can only give/receive one primary vouch
- **Secondary Vouches** (3 max): 30% weight = **12 points total**
  - Regular connections, approximately 4 points each
- **Community Vouches** (2 max): 40% weight = **16 points total**
  - Issued by community admins/moderators
  - Approximately 8 points each

**Total Vouch Component:** Up to 40 points

#### **30% from Activity Participation**
Activity is measured across four categories:

1. **Events Attended** (max 10 points)
   - 5+ events = 10 points
   - Scaled linearly for fewer events

2. **Events Hosted** (max 9 points)
   - 3+ events = 9 points
   - Scaled linearly for fewer events

3. **Communities Joined** (max 6 points)
   - 3+ communities = 6 points
   - Scaled linearly for fewer communities

4. **Services Provided** (max 5 points)
   - 5+ services = 5 points
   - Scaled linearly for fewer services

**Total Activity Component:** Up to 30 points

#### **30% from Trust Moments**
Trust moments are feedback ratings from connections after shared experiences:

1. **Average Rating Score** (max 27 points)
   - Based on 1-5 star ratings from connections
   - 5 stars = 27 points, 4 stars = 21.6 points, etc.
   - Formula: `(averageRating / 5) * 27`

2. **Quantity Bonus** (max 3 points)
   - 10+ trust moments = 3 points
   - Scaled linearly: 0.3 points per trust moment

**Total Trust Moments Component:** Up to 30 points

### Calculation Formula

```typescript
totalScore = vouchScore + activityScore + trustMomentsScore
finalScore = Math.min(Math.max(totalScore, 0), 100) // Clamped between 0-100
```

---

## Trust Levels

Trust levels are assigned based on your total trust score:

| Level | Score Range | Description | Badge Color |
|-------|-------------|-------------|-------------|
| **Elite** | 90-100 | Highly trusted, verified by community | Gold |
| **Trusted** | 75-89 | Well-established, strong vouches | Green |
| **Established** | 60-74 | Good standing, active participant | Blue |
| **Growing** | 40-59 | Building trust, some vouches | Light Blue |
| **Starter** | 20-39 | New with minimal vouches | Gray |
| **New** | 0-19 | Just joined, no vouches yet | Light Gray |

---

## Event-Driven Updates

Trust scores are **automatically recalculated** when these events occur:

### 1. Vouch Approval ✅
**Trigger:** When a vouch request is approved
- **Service:** `VouchService.respondToVouchRequest()`
- **Impact:** Immediate trust score increase (12-16 points depending on type)
- **Example:**
  ```typescript
  // Approve PRIMARY vouch
  POST /v2/vouches/:vouchId/respond
  { "action": "approve", "approvedType": "PRIMARY" }
  
  // Result: +12 points to vouchee's trust score
  ```

### 2. Event Check-In ✅
**Trigger:** When user checks in to an event
- **Service:** `EventService.checkInAttendee()`
- **Impact:** Gradual trust score increase as event count grows
- **Example:**
  ```typescript
  // Check in to event
  POST /v2/events/:eventId/check-in
  { "userId": "user123" }
  
  // Result: Activity score recalculated, up to +10 points at 5 events
  ```

### 3. Trust Moment Creation 🚧
**Trigger:** When a connection leaves feedback (coming soon)
- **Service:** `TrustMomentService.createTrustMoment()`
- **Impact:** Trust score adjusted based on rating (1-5 stars)
- **Example:**
  ```typescript
  // Create trust moment (future implementation)
  POST /v2/trust-moments
  { "receiverId": "user123", "rating": 5, "feedback": "Great person!" }
  
  // Result: Trust moments score recalculated, up to +30 points
  ```

### 4. Vouch Revocation
**Trigger:** When a vouch is revoked
- **Service:** `VouchService.revokeVouch()`
- **Impact:** Trust score decrease (removes vouch points)
- **Example:**
  ```typescript
  // Revoke vouch
  DELETE /v2/vouches/:vouchId/revoke
  { "reason": "Trust broken" }
  
  // Result: -12 to -16 points from vouchee's trust score
  ```

### Update Flow

```
Event Occurs → Service Method Called → TrustScoreService.triggerTrustScoreUpdate()
              → Calculate All Components → Update User Record → New Trust Level Assigned
```

**Non-Blocking:** Trust score updates are non-blocking. If the calculation fails, the primary operation (e.g., event check-in) still succeeds.

---

## API Endpoints

### Get User Trust Score

The trust score and trust level are included in the user profile endpoint and vouch summary.

#### 1. Get Trust Score via User Profile

**Endpoint:** `GET /v2/users/profile`

**Authentication:** Required (Bearer token)

**Description:** Returns the authenticated user's complete profile including `trustScore` and `trustLevel`.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "cm123abc456",
    "email": "user@example.com",
    "username": "johndoe",
    "fullName": "John Doe",
    "trustScore": 72.5,
    "trustLevel": "ESTABLISHED",
    "totalPoints": 1500,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "profile": {
      "profilePicture": "https://...",
      "bio": "Adventure seeker and community builder"
    },
    "location": { ... },
    "security": { ... }
  }
}
```

#### 2. Get Trust Contribution via Vouch Summary

**Endpoint:** `GET /v2/vouches/summary`

**Authentication:** Required (Bearer token)

**Description:** Returns vouch statistics that contribute to your trust score.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Vouch summary retrieved successfully",
  "data": {
    "totalVouchesReceived": 4,
    "totalVouchesGiven": 3,
    "primaryVouches": 1,
    "secondaryVouches": 2,
    "communityVouches": 1,
    "pendingRequests": 1,
    "activeVouches": 4,
    "revokedVouches": 0,
    "declinedVouches": 0,
    "availableSlots": {
      "primary": 0,
      "secondary": 1,
      "community": 1
    }
  }
}
```

**Trust Score Calculation from Vouches:**
- Primary vouch (1): 12 points
- Secondary vouches (2): 8 points (4 each)
- Community vouches (1): 8 points

**Total from vouches:** 28 points out of 40 possible

**Note:** The trust score is automatically calculated and updated when:
- A vouch is approved or revoked
- User checks into an event
- Trust moments are created (future feature)

- A vouch is approved or revoked
- User checks into an event
- Trust moments are created (future feature)

There is no dedicated endpoint to view the detailed breakdown of trust score components. The score and level are calculated automatically by the `TrustScoreService` and stored on the user record.

---

## Examples

### Example 1: Check Your Trust Score

---

## Examples
    "newScore": 72.5,
    "previousLevel": "established",
    "newLevel": "established",
    "updatedAt": "2025-10-17T10:35:00.000Z"
  }
}
```

### Batch Recalculation

Recalculate trust scores for multiple users (admin only).

**Endpoint:** `POST /v2/trust-score/batch-recalculate`

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "userIds": ["cm123abc", "cm456def", "cm789ghi"]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "processed": 3,
    "failed": 0,
    "results": [
      { "userId": "cm123abc", "newScore": 72.5, "status": "success" },
      { "userId": "cm456def", "newScore": 85.0, "status": "success" },
      { "userId": "cm789ghi", "newScore": 45.0, "status": "success" }
    ]
  }
}
```

---

## Examples

### Example 1: New User Journey

```bash
# Day 1: New user joins
# Trust Score: 0, Level: "new"

# Day 3: Attends first event
POST /v2/events/evt123/check-in
# Trust Score: 2.0 (activity: 2/30), Level: "new"

# Week 2: Receives first SECONDARY vouch
POST /v2/vouches/vouch123/respond
{"action": "approve", "approvedType": "SECONDARY"}
# Trust Score: 14.0 (vouches: 12/40, activity: 2/30), Level: "new"

# Month 1: Attends 5 events, joins 2 communities
# Trust Score: 32.0 (vouches: 12/40, activity: 20/30), Level: "starter"

# Month 3: Receives PRIMARY vouch + trust moments
# Trust Score: 68.0 (vouches: 24/40, activity: 25/30, moments: 19/30)
# Level: "established" ✅
```

### Example 2: Trust Score Breakdown

```bash
# Get detailed trust score information
GET /v2/users/cm123abc/trust-score
Authorization: Bearer <token>

# Response shows:
{
  "trustScore": 72.5,
  "trustLevel": "established",
  "components": {
    "vouches": {
      "score": 28.0,  // 1 PRIMARY (12) + 2 SECONDARY (8) + 1 COMMUNITY (8)
      "percentage": 70  // 28/40 = 70% of max vouch score
    },
    "activity": {
      "score": 22.5,  // Events + communities + services
      "percentage": 75  // 22.5/30 = 75% of max activity score
    },
    "trustMoments": {
      "score": 22.0,  // Average 4.5 stars from 8 moments
      "percentage": 73  // 22/30 = 73% of max moments score
    }
  }
}
```

### Example 3: Monitoring Trust Score Changes

```typescript
// Subscribe to user trust score updates
const userId = 'cm123abc';

// Before action
const before = await getTrustScore(userId);
console.log(`Before: ${before.trustScore} (${before.trustLevel})`);

// Perform action (e.g., approve vouch)
await approveVouch(vouchId);

// After action (trust score auto-updated)
const after = await getTrustScore(userId);
console.log(`After: ${after.trustScore} (${after.trustLevel})`);
console.log(`Change: +${after.trustScore - before.trustScore} points`);
```

---

## Best Practices

### For Users
1. **Build Trust Gradually:** Focus on attending events, getting vouches, and receiving positive feedback
2. **Quality Over Quantity:** A PRIMARY vouch is worth more than multiple SECONDARY vouches
3. **Stay Active:** Regular event attendance improves your activity score
4. **Be Trustworthy:** Trust moments from connections have significant impact (30% of score)

### For Developers
1. **Use Event-Driven Updates:** Trust scores update automatically, don't manually recalculate
2. **Handle Async Updates:** Trust score updates are non-blocking, handle them gracefully
3. **Cache Trust Scores:** Trust scores change infrequently, cache them appropriately
4. **Monitor Failed Updates:** Log trust score update failures for debugging

### For Admins
1. **Batch Recalculations:** Use batch endpoint for bulk trust score updates
2. **Monitor Trust Distribution:** Track how many users fall into each trust level
3. **Adjust Weights:** Modify VouchConfig to adjust score component weights
4. **Prevent Gaming:** Monitor for suspicious vouch patterns

---

## Troubleshooting

### Trust Score Not Updating

**Problem:** Trust score doesn't update after vouch approval

**Solutions:**
1. Check server logs for trust score update errors
2. Verify TrustScoreService is being called
3. Manually trigger recalculation via admin endpoint
4. Check database for vouch record (should have `approvedAt` timestamp)

### Incorrect Trust Score

**Problem:** Trust score seems incorrect

**Solutions:**
1. Get detailed breakdown via `/trust-score` endpoint
2. Verify vouch counts and types
3. Check activity counts (events, communities, services)
4. Recalculate manually to ensure consistency

### Performance Issues

**Problem:** Trust score calculation is slow

**Solutions:**
1. Trust scores are cached on user record, avoid frequent recalculations
2. Use batch recalculation for multiple users
3. Optimize database queries (indexes on userId, voucheeId, etc.)
4. Consider background job for non-critical updates

---

## Platform Configuration

**All trust system values are dynamically configurable** through the platform configuration system. Platform administrators can adjust formulas, thresholds, and rules via database updates without requiring code changes.

### Configurable Components

#### 1. Trust Formula Weights
The component weights (40/30/30 default split) can be adjusted:

```sql
-- Example: Change vouch weight from 40% to 50%
UPDATE platform_configs 
SET value = jsonb_set(
  value, 
  '{vouchWeight}', 
  '0.50'
)
WHERE category = 'TRUST_FORMULA' AND key = 'weights';
```

Configurable weights:
- `vouchWeight` - Contribution from vouches (default: 0.40 = 40%)
- `activityWeight` - Contribution from activity (default: 0.30 = 30%)
- `trustMomentWeight` - Contribution from trust moments (default: 0.30 = 30%)
- `vouchBreakdown.primaryWeight` - Primary vouch contribution (default: 0.12 = 12%)
- `vouchBreakdown.secondaryWeight` - Secondary vouch contribution (default: 0.12 = 12%)
- `vouchBreakdown.communityWeight` - Community vouch contribution (default: 0.16 = 16%)

**Validation Rules:**
- Main weights must sum to 1.0 (100%)
- Vouch breakdown weights must sum to vouchWeight
- All weights must be between 0 and 1

#### 2. Trust Levels and Thresholds
The 6 trust level tiers and their score ranges can be modified:

```sql
-- Example: Adjust "Established" level range
UPDATE platform_configs 
SET value = jsonb_set(
  jsonb_set(value, '{levels,2,minScore}', '55'),
  '{levels,2,maxScore}', '74'
)
WHERE category = 'TRUST_LEVELS' AND key = 'levels';
```

Each level has:
- `name` - Display name (e.g., "Elite", "Trusted")
- `minScore` - Minimum score (0-100)
- `maxScore` - Maximum score (0-100)
- `description` - Level description
- `color` - Badge color

#### 3. Badge Definitions
All 8 badge types with their tier requirements:

```sql
-- Example: Adjust "Trusted Member" badge requirement
UPDATE platform_configs 
SET value = jsonb_set(
  value, 
  '{TRUSTED_MEMBER,tiers,silver}', 
  '55'
)
WHERE category = 'BADGE_DEFINITIONS' AND key = 'badges';
```

#### 4. Activity Weights
Point values for different activity types:

```sql
-- Example: Increase event attendance value
UPDATE platform_configs 
SET value = jsonb_set(
  value, 
  '{eventAttended}', 
  '{"maxPoints": 12, "threshold": 5}'
)
WHERE category = 'ACTIVITY_WEIGHTS' AND key = 'weights';
```

### Best Practices for Admins

1. **Test Changes in Staging** - Validate config changes before production
2. **Document Reasons** - Use the `reason` field when updating configs
3. **Monitor Impact** - Watch trust score distribution after changes
4. **Gradual Adjustments** - Make small incremental changes
5. **Backup Before Changes** - Config history is tracked, but backup first

### Configuration Documentation

For complete configuration management details, see:
- [Platform Configuration Guide](../PLATFORM_CONFIGURATION.md) - Full admin documentation
- SQL update examples for all config categories
- Validation rules and constraints
- Rollback procedures

---

## Related Documentation

- [Connections API](./CONNECTIONS_API.md) - Connection management and vouching system
- [Events API](./EVENTS_API.md) - Event attendance and check-in
- [Trust Moments API](./TRUST_MOMENTS_API.md) - Feedback and rating system
- [Accountability API](./ACCOUNTABILITY_API.md) - Accountability chain system
- [Trust Level Gating](./TRUST_LEVEL_GATING.md) - Feature access control
- [Connection Module README](../../src/modules/connections/README.md) - Technical implementation details
- [Platform Configuration](../PLATFORM_CONFIGURATION.md) - Admin configuration guide

---

## New Trust System Features (v2.2.0)

### Trust Dashboard

Get a comprehensive overview of your trust score with actionable insights.

**Endpoint:** `GET /api/v2/users/:userId/trust-dashboard`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "fullName": "John Doe",
      "trustScore": 75.5,
      "trustLevel": "trusted"
    },
    "rank": {
      "percentile": 82.4,
      "position": 127,
      "totalUsers": 5432
    },
    "recentChanges": [
      {
        "timestamp": "2025-10-18T10:00:00Z",
        "change": 2.5,
        "reason": "Trust moment positive feedback",
        "newScore": 75.5
      }
    ],
    "suggestions": [
      "Request vouches from trusted connections",
      "Attend more community events",
      "Provide services to increase activity score"
    ],
    "accountabilityImpact": {
      "totalImpact": 3.2,
      "affectedVouchees": 4
    },
    "decayWarning": null,
    "lastActivity": {
      "date": "2025-10-19T15:30:00Z",
      "daysAgo": 1
    }
  }
}
```

**Features:**
- Rank percentile among all active users
- Recent trust score changes (last 7 days)
- Personalized suggestions for improvement
- Accountability impact (if you're a voucher)
- Decay warning (if 23-30 days inactive)
- Last activity tracking

---

### Trust Badges

Earn and display achievement badges based on trust milestones.

**Endpoint:** `GET /api/v2/users/:userId/badges`

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "totalBadges": 8,
    "badges": [
      {
        "name": "First Vouch",
        "description": "Received your first vouch",
        "tier": "bronze",
        "icon": "🤝",
        "earned": true,
        "earnedAt": "2025-09-15T10:00:00Z"
      },
      {
        "name": "Trusted Member",
        "description": "Achieve 50%+ trust score",
        "tier": "silver",
        "icon": "⭐",
        "earned": true,
        "earnedAt": "2025-10-01T14:30:00Z"
      },
      {
        "name": "Community Leader",
        "description": "Achieve 76%+ trust score",
        "tier": "gold",
        "icon": "👑",
        "earned": false,
        "progress": 99.3,
        "target": 76
      }
    ],
    "progress": {
      "nextBadge": "Community Leader",
      "description": "Achieve 76%+ trust score",
      "progress": 75.5,
      "target": 76
    }
  }
}
```

**Badge Types:**

| Badge | Tier | Requirement |
|-------|------|-------------|
| First Vouch | Bronze | Receive 1+ vouch |
| Service Provider | Bronze | Provide 10+ services |
| Trusted Member | Silver | Achieve 50%+ trust score |
| Event Enthusiast | Silver | Attend 25+ events |
| Community Builder | Silver | Join 10+ communities |
| Community Leader | Gold | Achieve 76%+ trust score |
| Accountability Hero | Gold | 5+ positive accountability impacts |
| Perfect Record | Platinum | Zero negative feedback for 90+ days |

---

### Trust Leaderboard

See how you rank among other users in the platform.

**Endpoint:** `GET /api/v2/trust/leaderboard`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| type | enum | global | Leaderboard type: global, community, friends |
| communityId | string | - | Required for community type |
| limit | integer | 100 | Maximum number of results |

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "global",
    "timestamp": "2025-10-20T15:00:00Z",
    "leaderboard": [
      {
        "rank": 1,
        "username": "User9234",
        "trustScore": 98.5,
        "trustLevel": "elite",
        "isMe": false
      },
      {
        "rank": 2,
        "username": "john_doe",
        "trustScore": 95.2,
        "trustLevel": "elite",
        "isMe": true
      }
    ],
    "userRank": {
      "rank": 2,
      "percentile": 99.8
    }
  }
}
```

**Leaderboard Types:**
- **Global**: All active users on the platform
- **Community**: Users in a specific community
- **Friends**: Your accepted connections only

**Privacy:**
- Usernames are anonymized for users not in your network
- Only trust score and level are shown for anonymized users

---

### Trust Score History

View historical trust score changes with detailed reasons.

**Endpoint:** `GET /api/v2/users/:userId/trust-history`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Logs per page |
| startDate | date | - | Filter from date |
| endDate | date | - | Filter to date |
| component | enum | - | Filter by component: vouches, activity, trustMoments |

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "hist_123",
        "timestamp": "2025-10-18T10:00:00Z",
        "score": 75.5,
        "change": 2.5,
        "previousScore": 73.0,
        "reason": "Trust moment positive feedback",
        "component": "trustMoments",
        "relatedEntityType": "trust_moment",
        "relatedEntityId": "tm_456",
        "metadata": {
          "rating": 5,
          "giverName": "Jane Smith"
        }
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

---

### Community Vouch Offers

Automatic vouch offers for eligible community members.

**Endpoint:** `GET /api/v2/communities/:communityId/vouch-offers`

**Response:**
```json
{
  "success": true,
  "data": {
    "offers": [
      {
        "id": "offer_123",
        "communityId": "comm_456",
        "communityName": "Tech Enthusiasts",
        "status": "PENDING",
        "eligibilityReason": "5+ events attended, 90+ days membership, zero negative feedback",
        "eventsAttended": 12,
        "membershipDays": 127,
        "hasNegativeFeedback": false,
        "createdAt": "2025-10-10T08:00:00Z",
        "expiresAt": "2025-11-09T08:00:00Z",
        "daysRemaining": 20
      }
    ]
  }
}
```

**Actions:**
- `POST /api/v2/communities/:communityId/vouch-offers/:offerId/accept` - Accept offer
- `POST /api/v2/communities/:communityId/vouch-offers/:offerId/reject` - Reject offer

**Eligibility Criteria:**
- 5+ events attended in the community
- 90+ days of membership
- Zero negative feedback (trust moments with rating ≤ 2)

---

### Trust Decay System

Trust scores decay after periods of inactivity to ensure currency.

**Decay Rules:**
- **After 30 days inactivity**: -1% per week
- **After 90 days inactivity**: -2% per week

**Warning Notifications:**
- Sent 7 days before decay starts (23 days inactive)
- Message: "Your trust score will start decaying in X days"

**Last Activity Tracked From:**
- Event participation
- Trust moments given
- Marketplace listings created
- New connections made

**Reactivation Bonus:**
- Return after decay: +2% bonus to encourage re-engagement

---

## Trust Level Gating

Features are now gated based on trust level to prevent abuse and ensure quality.

### Access Requirements

| Feature | Minimum Trust Score | Level |
|---------|-------------------|-------|
| View profiles, events, marketplace | 0% | Any |
| Attend events, message connections | 11% | Newcomer |
| Create events, join communities | 26% | Growing |
| Publish events, create listings | 51% | Established |
| Create communities, fundraisers | 76% | Trusted |
| Platform governance, unlimited vouches | 91% | Leader |

### Middleware Implementation

Routes are protected with `requireTrustLevel` middleware:

```typescript
router.post('/events', 
  authenticate, 
  requireTrustLevel(26, 'create events'),
  createEvent
);
```

**Error Response (403):**
```json
{
  "success": false,
  "error": "Insufficient trust level",
  "message": "You need a higher trust score to create events",
  "requirements": {
    "feature": "create events",
    "minimumScore": 26,
    "minimumLevel": "Growing"
  },
  "current": {
    "score": 18.5,
    "level": "Starter",
    "levelName": "starter"
  },
  "progress": {
    "pointsNeeded": 7.5,
    "percentage": 71
  },
  "suggestions": [
    "Request vouches from trusted connections",
    "Attend community events to build reputation"
  ],
  "helpUrl": "/help/trust-score"
}
```

---

**Last Updated:** October 20, 2025  
**API Version:** v2.2.0  
**Module Status:** Trust Score ✅ Complete | Accountability ✅ Complete | Decay System ✅ Complete | Badges ✅ Complete
