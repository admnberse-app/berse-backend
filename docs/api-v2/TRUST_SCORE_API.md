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

Get the current trust score and breakdown for a user.

**Endpoint:** `GET /v2/users/:userId/trust-score`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "userId": "cm123abc456",
    "trustScore": 72.5,
    "trustLevel": "established",
    "components": {
      "vouches": {
        "score": 28.0,
        "maxScore": 40,
        "breakdown": {
          "primary": { "count": 1, "score": 12 },
          "secondary": { "count": 2, "score": 8 },
          "community": { "count": 1, "score": 8 }
        }
      },
      "activity": {
        "score": 22.5,
        "maxScore": 30,
        "breakdown": {
          "eventsAttended": { "count": 7, "score": 10 },
          "eventsHosted": { "count": 2, "score": 6 },
          "communitiesJoined": { "count": 3, "score": 6 },
          "servicesProvided": { "count": 1, "score": 0.5 }
        }
      },
      "trustMoments": {
        "score": 22.0,
        "maxScore": 30,
        "breakdown": {
          "averageRating": 4.5,
          "totalMoments": 8,
          "ratingScore": 24.3,
          "quantityBonus": 2.4
        }
      }
    },
    "lastUpdated": "2025-10-17T10:30:00.000Z",
    "nextLevel": {
      "level": "trusted",
      "scoreNeeded": 2.5
    }
  }
}
```

### Trigger Manual Recalculation

Force a trust score recalculation (admin only).

**Endpoint:** `POST /v2/trust-score/:userId/recalculate`

**Authentication:** Required (Admin)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "userId": "cm123abc456",
    "previousScore": 70.0,
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

## Related Documentation

- [Connections API](./CONNECTIONS_API.md) - Connection management and vouching system
- [Events API](./EVENTS_API.md) - Event attendance and check-in
- [Trust Moments API](./TRUST_MOMENTS_API.md) - Feedback and rating system (coming soon)
- [Connection Module README](../../src/modules/connections/README.md) - Technical implementation details

---

**Last Updated:** October 17, 2025  
**API Version:** v2.1.0  
**Module Status:** Trust Score ✅ Complete | Event Triggers ✅ Complete | Trust Moments 🚧 Coming Soon
