# Gamification API Documentation

## Overview
The Gamification API provides a comprehensive points, badges, rewards, and leaderboards system to incentivize user engagement and track achievements on the Berse platform.

**Base URL**: `/v2/gamification`  
**Authentication**: Required for all endpoints  
**Version**: 1.0.0

---

## Table of Contents
- [Dashboard](#dashboard)
- [Badges](#badges)
- [Points](#points)
- [Rewards](#rewards)
- [Leaderboards](#leaderboards)
- [Platform Statistics](#platform-statistics)
- [Badge Types](#badge-types)
- [Point Actions](#point-actions)
- [Data Models](#data-models)
- [Error Responses](#error-responses)

---

## Dashboard

### Get My Dashboard
Get comprehensive gamification overview including points, badges, rewards, and leaderboard ranks.

**Endpoint**: `GET /v2/gamification/dashboard`  
**Authentication**: Required

#### Example Request
```bash
curl -X GET http://localhost:3001/v2/gamification/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "points": {
      "total": 450,
      "rank": 15,
      "recentEarnings": [
        {
          "id": "clx123",
          "action": "ATTEND_EVENT",
          "points": 10,
          "description": "Attended Tech Meetup",
          "createdAt": "2024-01-15T10:30:00Z",
          "userId": "clx789"
        }
      ]
    },
    "badges": {
      "total": 5,
      "earned": [
        {
          "id": "clx456",
          "type": "FIRST_FACE",
          "name": "First Face",
          "description": "Attended your first event",
          "criteria": "Attend first event",
          "imageUrl": null,
          "earnedAt": "2024-01-10T14:20:00Z",
          "userBadgeId": "clx999"
        }
      ],
      "progress": [
        {
          "badge": {
            "id": "clx888",
            "type": "TOP_FRIEND",
            "name": "Top Friend",
            "description": "Make 10+ connections",
            "criteria": "Make 10+ connections",
            "imageUrl": null
          },
          "isEarned": false,
          "currentProgress": 7,
          "requiredProgress": 10,
          "percentage": 70,
          "nextMilestone": "Make 3 more connections to earn this badge"
        }
      ]
    },
    "rewards": {
      "availableCount": 12,
      "canAffordCount": 8,
      "recentRedemptions": [
        {
          "id": "clx999",
          "rewardId": "clx111",
          "userId": "clx789",
          "status": "APPROVED",
          "redeemedAt": "2024-01-14T16:00:00Z",
          "approvedAt": "2024-01-14T18:00:00Z",
          "rewards": {
            "id": "clx111",
            "title": "Coffee Voucher",
            "pointsRequired": 50
          }
        }
      ]
    },
    "leaderboard": {
      "pointsRank": 15,
      "trustScoreRank": 8,
      "badgesRank": 12
    },
    "stats": {
      "eventsAttended": 8,
      "connectionsCount": 7,
      "trustScore": 85,
      "profileCompletion": 80
    }
  }
}
```

### Get User Dashboard (Admin)
Get gamification dashboard for specific user.

**Endpoint**: `GET /v2/gamification/dashboard/user/:userId`  
**Authentication**: Required (Admin only)

---

## Badges

### Get All Badges
List all available badges with their criteria.

**Endpoint**: `GET /v2/gamification/badges`  
**Authentication**: Required

#### Example Request
```bash
curl -X GET http://localhost:3001/v2/gamification/badges \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "badges": [
      {
        "id": "clx111",
        "type": "FIRST_FACE",
        "name": "First Face",
        "description": "Attended your first event",
        "criteria": "Attend first event",
        "imageUrl": null
      },
      {
        "id": "clx222",
        "type": "TOP_FRIEND",
        "name": "Top Friend",
        "description": "Master of networking",
        "criteria": "Make 10+ connections",
        "imageUrl": null
      }
    ],
    "total": 14
  }
}
```

### Get Badge by ID
Get detailed information about a specific badge.

**Endpoint**: `GET /v2/gamification/badges/:id`  
**Authentication**: Required

### Get My Badges
Get all badges earned by current user.

**Endpoint**: `GET /v2/gamification/badges/my`  
**Authentication**: Required

#### Example Response
```json
{
  "success": true,
  "data": {
    "badges": [
      {
        "id": "clx111",
        "type": "FIRST_FACE",
        "name": "First Face",
        "description": "Attended your first event",
        "criteria": "Attend first event",
        "imageUrl": null,
        "earnedAt": "2024-01-10T14:20:00Z"
      }
    ],
    "total": 1
  }
}
```

### Get User Badges
Get badges for a specific user.

**Endpoint**: `GET /v2/gamification/badges/user/:userId`  
**Authentication**: Required

### Get Badge Progress
Get progress toward earning badges for current user.

**Endpoint**: `GET /v2/gamification/badges/progress`  
**Authentication**: Required

#### Example Response
```json
{
  "success": true,
  "data": {
    "progress": [
      {
        "badge": {
          "id": "clx888",
          "type": "TOP_FRIEND",
          "name": "Top Friend",
          "description": "Make 10+ connections",
          "criteria": "Make 10+ connections",
          "imageUrl": null
        },
        "isEarned": false,
        "currentProgress": 7,
        "requiredProgress": 10,
        "percentage": 70,
        "nextMilestone": "Make 3 more connections to earn this badge"
      },
      {
        "badge": {
          "id": "clx999",
          "type": "STREAK_CHAMP",
          "name": "Streak Champ",
          "description": "Attend events 4 weeks in a row",
          "criteria": "Attend events 4 weeks in a row",
          "imageUrl": null
        },
        "isEarned": false,
        "currentProgress": 2,
        "requiredProgress": 4,
        "percentage": 50,
        "nextMilestone": "Attend events for 2 more consecutive weeks"
      }
    ],
    "total": 14
  }
}
```

### Award Badge (Admin)
Manually award a badge to a user.

**Endpoint**: `POST /v2/gamification/badges/award`  
**Authentication**: Required (Admin only)

#### Request Body
```json
{
  "userId": "clx123",
  "badgeType": "FIRST_FACE",
  "reason": "Special recognition"
}
```

### Revoke Badge (Admin)
Revoke a badge from a user.

**Endpoint**: `DELETE /v2/gamification/badges/:badgeId/revoke/:userId`  
**Authentication**: Required (Admin only)

---

## Points

### Get My Points
Get current points balance.

**Endpoint**: `GET /v2/gamification/points`  
**Authentication**: Required

#### Example Response
```json
{
  "success": true,
  "data": {
    "totalPoints": 450,
    "pointHistories": [
      {
        "id": "clx123",
        "points": 10,
        "action": "ATTEND_EVENT",
        "description": "Attended Tech Meetup",
        "createdAt": "2024-01-15T10:30:00Z",
        "userId": "clx789"
      }
    ]
  }
}
```

### Get Points History
Get points transaction history with filters.

**Endpoint**: `GET /v2/gamification/points/history`  
**Authentication**: Required

#### Query Parameters
- `action` (optional): Filter by action type
- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Items per page

#### Example Request
```bash
curl -X GET "http://localhost:3001/v2/gamification/points/history?action=ATTEND_EVENT&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "clx456",
        "points": 10,
        "action": "ATTEND_EVENT",
        "description": "Attended Tech Meetup",
        "createdAt": "2024-01-15T10:30:00Z",
        "userId": "clx789"
      },
      {
        "id": "clx457",
        "points": 5,
        "action": "MAKE_CONNECTION",
        "description": "Connected with John Doe",
        "createdAt": "2024-01-14T16:00:00Z",
        "userId": "clx789"
      }
    ],
    "total": 52,
    "totalPoints": 450
  }
}
```

### Get Point Actions
Get list of all point actions with their values and descriptions.

**Endpoint**: `GET /v2/gamification/points/actions`  
**Authentication**: Required

#### Example Response
```json
{
  "success": true,
  "data": {
    "actions": [
      {
        "action": "ATTEND_EVENT",
        "points": 10,
        "description": "Attend an event",
        "category": "Events"
      },
      {
        "action": "MAKE_CONNECTION",
        "points": 5,
        "description": "Make a new connection",
        "category": "Social"
      },
      {
        "action": "VOUCH_SOMEONE",
        "points": 10,
        "description": "Vouch for another user",
        "category": "Social"
      }
    ],
    "total": 43
  }
}
```

### Get User Points (Admin)
Get points information for a specific user.

**Endpoint**: `GET /v2/gamification/points/user/:userId`  
**Authentication**: Required (Admin only)

### Award Points (Admin)
Manually award points to a user.

**Endpoint**: `POST /v2/gamification/points/award`  
**Authentication**: Required (Admin only)

#### Request Body
```json
{
  "userId": "clx123",
  "points": 50,
  "action": "SPECIAL_EVENT",
  "description": "Bonus for outstanding contribution"
}
```

### Deduct Points (Admin)
Deduct points from a user.

**Endpoint**: `POST /v2/gamification/points/deduct`  
**Authentication**: Required (Admin only)

#### Request Body
```json
{
  "userId": "clx123",
  "points": 20,
  "reason": "Policy violation penalty"
}
```

---

## Rewards

### Get Rewards
List all available rewards with filters.

**Endpoint**: `GET /v2/gamification/rewards`  
**Authentication**: Required

#### Query Parameters
- `category` (optional): Filter by category
- `minPoints` (optional): Minimum points cost
- `maxPoints` (optional): Maximum points cost
- `available` (optional): Show only available rewards (true/false)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Items per page

#### Example Request
```bash
curl -X GET "http://localhost:3001/v2/gamification/rewards?category=Vouchers&available=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "rewards": [
      {
        "id": "clx111",
        "title": "Coffee Voucher",
        "description": "Free coffee at partner cafes",
        "category": "Food & Drinks",
        "pointsRequired": 50,
        "partner": "Kopikku",
        "quantity": 25,
        "imageUrl": "https://example.com/coffee.jpg",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      },
      {
        "id": "clx222",
        "title": "Event Ticket Discount",
        "description": "20% off next event ticket",
        "category": "Event Access",
        "pointsRequired": 100,
        "partner": "BerseMuka",
        "quantity": 50,
        "imageUrl": null,
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 12,
    "userPoints": 450
  }
}
```

### Get Reward by ID
Get detailed information about a specific reward.

**Endpoint**: `GET /v2/gamification/rewards/:id`  
**Authentication**: Required

### Create Reward (Admin)
Create a new reward.

**Endpoint**: `POST /v2/gamification/rewards`  
**Authentication**: Required (Admin only)

#### Request Body
```json
{
  "title": "Coffee Voucher",
  "description": "Free coffee at partner cafes",
  "category": "Food & Drinks",
  "pointsRequired": 50,
  "partner": "Kopikku",
  "quantity": 100,
  "imageUrl": "https://example.com/coffee.jpg"
}
```

### Update Reward (Admin)
Update an existing reward.

**Endpoint**: `PUT /v2/gamification/rewards/:id`  
**Authentication**: Required (Admin only)

### Delete Reward (Admin)
Delete a reward.

**Endpoint**: `DELETE /v2/gamification/rewards/:id`  
**Authentication**: Required (Admin only)

### Redeem Reward
Redeem a reward using points.

**Endpoint**: `POST /v2/gamification/rewards/redeem`  
**Authentication**: Required

#### Request Body
```json
{
  "rewardId": "clx111"
}
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "id": "clx999",
    "userId": "clx789",
    "rewardId": "clx111",
    "status": "PENDING",
    "redeemedAt": "2024-01-15T18:00:00Z",
    "approvedAt": null,
    "completedAt": null,
    "rewards": {
      "id": "clx111",
      "title": "Coffee Voucher",
      "pointsRequired": 50
    }
  },
  "message": "Reward redeemed successfully! Please wait for admin approval."
}
```

### Get My Redemptions
Get redemption history for current user.

**Endpoint**: `GET /v2/gamification/rewards/redemptions`  
**Authentication**: Required

#### Query Parameters
- `status` (optional): Filter by status (PENDING, APPROVED, REJECTED, COMPLETED)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Items per page

#### Example Response
```json
{
  "success": true,
  "data": {
    "redemptions": [
      {
        "id": "clx999",
        "userId": "clx789",
        "rewardId": "clx111",
        "status": "APPROVED",
        "redeemedAt": "2024-01-15T18:00:00Z",
        "approvedAt": "2024-01-15T20:00:00Z",
        "completedAt": "2024-01-15T21:00:00Z",
        "rewards": {
          "id": "clx111",
          "title": "Coffee Voucher",
          "pointsRequired": 50,
          "category": "Food & Drinks"
        }
      }
    ],
    "total": 3
  }
}
```

### Get Redemption by ID
Get details of a specific redemption.

**Endpoint**: `GET /v2/gamification/rewards/redemptions/:id`  
**Authentication**: Required

### Update Redemption Status (Admin)
Approve or reject a redemption.

**Endpoint**: `PUT /v2/gamification/rewards/redemptions/:id`  
**Authentication**: Required (Admin only)

#### Request Body
```json
{
  "status": "APPROVED",
  "adminNotes": "Verified and approved"
}
```

### Get Reward Categories
Get list of all reward categories.

**Endpoint**: `GET /v2/gamification/rewards/categories`  
**Authentication**: Required

#### Example Response
```json
{
  "success": true,
  "data": {
    "categories": [
      "Food & Drinks",
      "E-Commerce",
      "Lifestyle",
      "Transportation",
      "Event Access"
    ]
  }
}
```

---

## Leaderboards

All leaderboard endpoints support pagination and time filtering.

### Common Query Parameters
- `timeframe` (optional): Filter by time period (all, week, month, year)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 50): Items per page

### Points Leaderboard
Get top users by total points.

**Endpoint**: `GET /v2/gamification/leaderboard/points`  
**Authentication**: Required

#### Example Request
```bash
curl -X GET "http://localhost:3001/v2/gamification/leaderboard/points?timeframe=month&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "userId": "clx123",
        "userName": "Ahmad Abdullah",
        "value": 1250,
        "rank": 1
      },
      {
        "userId": "clx456",
        "userName": "Sarah Lee",
        "value": 980,
        "rank": 2
      }
    ],
    "total": 1542
  }
}
```

### Trust Score Leaderboard
Get top users by trust score.

**Endpoint**: `GET /v2/gamification/leaderboard/trust`  
**Authentication**: Required

### Badges Leaderboard
Get top users by number of badges earned.

**Endpoint**: `GET /v2/gamification/leaderboard/badges`  
**Authentication**: Required

### Events Leaderboard
Get top users by events attended.

**Endpoint**: `GET /v2/gamification/leaderboard/events`  
**Authentication**: Required

### Connections Leaderboard
Get top users by number of connections.

**Endpoint**: `GET /v2/gamification/leaderboard/connections`  
**Authentication**: Required

### Referrals Leaderboard
Get top users by successful referrals.

**Endpoint**: `GET /v2/gamification/leaderboard/referrals`  
**Authentication**: Required

---

## Platform Statistics

### Get Platform Stats (Admin)
Get aggregate gamification statistics for the platform.

**Endpoint**: `GET /v2/gamification/stats`  
**Authentication**: Required (Admin only)

#### Example Response
```json
{
  "success": true,
  "data": {
    "points": {
      "totalAwarded": 485230,
      "totalSpent": 12450,
      "averageBalance": 285,
      "topEarner": {
        "user": {
          "id": "clx123",
          "displayName": "Ahmad Abdullah"
        },
        "balance": 1250
      }
    },
    "badges": {
      "totalAwarded": 3842,
      "uniqueUsers": 1542,
      "mostEarned": {
        "badge": {
          "type": "FIRST_FACE",
          "name": "First Face"
        },
        "count": 1542
      }
    },
    "rewards": {
      "totalRedeemed": 245,
      "totalPending": 12,
      "popularReward": {
        "reward": {
          "id": "clx111",
          "title": "Coffee Voucher"
        },
        "redemptionCount": 87
      }
    },
    "leaderboards": {
      "topPointsUser": {
        "user": {
          "id": "clx123",
          "displayName": "Ahmad Abdullah"
        },
        "points": 1250
      },
      "topTrustUser": {
        "user": {
          "id": "clx456",
          "displayName": "Sarah Lee"
        },
        "trustScore": 95.8
      }
    }
  }
}
```

---

## Badge Types

### Complete Badge List

1. **FIRST_FACE** 🎉
   - Name: First Face
   - Criteria: Attend 1+ event
   - Category: Events
   - Points Value: 25

2. **CAFE_FRIEND** ☕
   - Name: Cafe Friend
   - Criteria: Attend 3+ cafe meetups
   - Category: Events
   - Points Value: 25

3. **SUKAN_SQUAD_MVP** ⚽
   - Name: Sukan Squad MVP
   - Criteria: Attend 5+ sports events
   - Category: Events
   - Points Value: 25

4. **SOUL_NOURISHER** 🤲
   - Name: Soul Nourisher
   - Criteria: Attend 5+ spiritual/ilm events
   - Category: Events
   - Points Value: 25

5. **HELPERS_HAND** 🤝
   - Name: Helper's Hand
   - Criteria: Volunteer at 3+ events
   - Category: Community
   - Points Value: 25

6. **CONNECTOR** 🔗
   - Name: Connector
   - Criteria: Refer 3+ activated users
   - Category: Referrals
   - Points Value: 25

7. **TOP_FRIEND** 👥
   - Name: Top Friend
   - Criteria: Make 10+ connections
   - Category: Social
   - Points Value: 25

8. **ICEBREAKER** 🧊
   - Name: Icebreaker
   - Criteria: Make 1+ connection
   - Category: Social
   - Points Value: 25

9. **CERTIFIED_HOST** 🎭
   - Name: Certified Host
   - Criteria: Host 1+ event
   - Category: Events
   - Points Value: 25

10. **STREAK_CHAMP** 🔥
    - Name: Streak Champ
    - Criteria: Attend events 4 weeks in a row
    - Category: Events
    - Points Value: 25

11. **LOCAL_GUIDE** 📍
    - Name: Local Guide
    - Criteria: Attend events in 5+ locations
    - Category: Events
    - Points Value: 25

12. **KIND_SOUL** 💝
    - Name: Kind Soul
    - Criteria: Give 10+ positive trust moments
    - Category: Social
    - Points Value: 25

13. **KNOWLEDGE_SHARER** 📚
    - Name: Knowledge Sharer
    - Criteria: Submit 5+ helpful card game feedbacks
    - Category: Community
    - Points Value: 25

14. **ALL_ROUNDER** 🌟
    - Name: All Rounder
    - Criteria: Earn 5+ different badges
    - Category: Achievements
    - Points Value: 25

---

## Point Actions

### Complete Action List

#### Profile Actions (6)
- **REGISTER**: 30 pts - Register account
- **COMPLETE_PROFILE_BASIC**: 50 pts - Complete basic profile
- **COMPLETE_PROFILE_FULL**: 100 pts - Complete full profile
- **VERIFY_EMAIL**: 20 pts - Verify email
- **VERIFY_PHONE**: 20 pts - Verify phone
- **UPLOAD_PROFILE_PHOTO**: 10 pts - Upload profile photo

#### Event Actions (9)
- **ATTEND_EVENT**: 10 pts - Attend event
- **HOST_EVENT**: 15 pts - Host event
- **RSVP_EVENT**: 2 pts - RSVP to event
- **CANCEL_RSVP**: -2 pts - Cancel RSVP
- **JOIN_TRIP**: 5 pts - Join trip
- **CAFE_MEETUP**: 2 pts - Attend cafe meetup
- **ILM_EVENT**: 3 pts - Attend spiritual event
- **VOLUNTEER**: 6 pts - Volunteer at event
- **DONATE**: 4 pts - Make donation

#### Social Actions (7)
- **FIRST_CONNECTION**: 15 pts - Make first connection
- **MAKE_CONNECTION**: 5 pts - Make connection
- **RECEIVE_CONNECTION**: 3 pts - Receive connection
- **VOUCH_SOMEONE**: 10 pts - Vouch for user
- **RECEIVE_VOUCH**: 20 pts - Receive vouch
- **GIVE_TRUST_MOMENT**: 5 pts - Give trust moment
- **RECEIVE_POSITIVE_TRUST_MOMENT**: 10 pts - Receive positive trust moment

#### Community Actions (3)
- **JOIN_COMMUNITY**: 5 pts - Join community
- **COMMUNITY_PARTICIPATION**: 3 pts - Participate in community
- **BECOME_MODERATOR**: 50 pts - Become moderator

#### Referral Actions (2)
- **REFERRAL**: 10 pts - Successful referral
- **REFEREE_SIGNUP**: 5 pts - Sign up from referral

#### Card Game Actions (3)
- **SUBMIT_CARD_GAME_FEEDBACK**: 5 pts - Submit feedback
- **RECEIVE_HELPFUL_VOTE**: 2 pts - Receive helpful vote
- **REPLY_TO_FEEDBACK**: 3 pts - Reply to feedback

#### Marketplace Actions (3)
- **FIRST_LISTING**: 10 pts - Create first listing
- **COMPLETE_TRANSACTION**: 5 pts - Complete transaction
- **RECEIVE_POSITIVE_REVIEW**: 10 pts - Receive positive review

#### Achievement Actions (4)
- **EARN_BADGE**: 25 pts - Earn badge
- **REACH_TRUST_MILESTONE**: 30 pts - Reach trust milestone
- **MAINTAIN_STREAK_WEEK**: 10 pts - Maintain weekly streak
- **MAINTAIN_STREAK_MONTH**: 50 pts - Maintain monthly streak

#### Penalty Actions (3)
- **RECEIVE_NEGATIVE_TRUST_MOMENT**: -10 pts - Receive negative trust moment
- **REPORT_VALIDATED**: -20 pts - Validated report
- **SPAM_DETECTED**: -50 pts - Spam detected

---

## Data Models

### Badge
```typescript
{
  id: string;
  type: string;
  name: string;
  description: string;
  criteria: string;
  imageUrl?: string;
}
```

### UserBadge
```typescript
{
  id: string;
  userId: string;
  badgeId: string;
  badge: Badge;
  earnedAt: string;
}
```

### PointHistory
```typescript
{
  id: string;
  userId: string;
  action: string;
  points: number;
  description: string;
  createdAt: string;
  metadata?: object;
}
```

### Reward
```typescript
{
  id: string;
  title: string;
  description: string;
  category: string;
  pointsRequired: number;
  partner?: string;
  quantity: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Redemption
```typescript
{
  id: string;
  userId: string;
  rewardId: string;
  rewards: Reward;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  redeemedAt: string;
  approvedAt?: string;
  completedAt?: string;
}
```

### LeaderboardEntry
```typescript
{
  userId: string;
  userName: string;
  value: number;
  rank: number;
}
```

---

## Error Responses

### Common Errors

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "pointsRequired",
      "message": "Must be a positive number"
    }
  ]
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Reward not found"
}
```

#### 409 Conflict
```json
{
  "success": false,
  "error": "Insufficient points balance",
  "details": {
    "required": 50,
    "available": 30
  }
}
```

### Specific Error Cases

#### Insufficient Points
```json
{
  "success": false,
  "error": "Insufficient points balance",
  "details": {
    "required": 100,
    "current": 45
  }
}
```

#### Reward Out of Stock
```json
{
  "success": false,
  "error": "Reward is out of stock",
  "details": {
    "rewardTitle": "Coffee Voucher"
  }
}
```

#### Badge Already Earned
```json
{
  "success": false,
  "error": "Badge already earned",
  "details": {
    "badgeType": "FIRST_FACE",
    "earnedAt": "2024-01-10T14:20:00Z"
  }
}
```

---

## Usage Examples

### Complete Badge Earning Flow
```bash
# 1. Check badge progress
curl -X GET http://localhost:3001/v2/gamification/badges/progress \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Perform qualifying action (e.g., attend event)
# Badge is automatically awarded by backend

# 3. Check earned badges
curl -X GET http://localhost:3001/v2/gamification/badges/my \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. View updated dashboard
curl -X GET http://localhost:3001/v2/gamification/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Complete Reward Redemption Flow
```bash
# 1. Browse available rewards
curl -X GET http://localhost:3001/v2/gamification/rewards?available=true \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Check points balance
curl -X GET http://localhost:3001/v2/gamification/points \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Redeem reward
curl -X POST http://localhost:3001/v2/gamification/rewards/redeem \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rewardId": "clx111"}'

# 4. Check redemption status
curl -X GET http://localhost:3001/v2/gamification/rewards/redemptions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Checking Leaderboard Position
```bash
# 1. Get points leaderboard
curl -X GET "http://localhost:3001/v2/gamification/leaderboard/points?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Get trust score leaderboard
curl -X GET "http://localhost:3001/v2/gamification/leaderboard/trust?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Get events leaderboard
curl -X GET "http://localhost:3001/v2/gamification/leaderboard/events?timeframe=month" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Integration Guide

### Awarding Points Automatically
```typescript
// After user attends event
import { PointsService } from './services/points.service';

await PointsService.awardPoints(
  userId,
  'ATTEND_EVENT',
  'Attended Tech Meetup'
);
```

### Checking for Badge Awards
```typescript
// After any qualifying action
import { BadgeService } from './services/badge.service';

await BadgeService.checkAndAwardBadges(userId);
```

### Getting User Dashboard
```typescript
// Display in user profile
import { GamificationService } from './modules/gamification';

const dashboard = await GamificationService.getDashboard(userId);
```

---

## Rate Limits
- General endpoints: 100 requests per 15 minutes
- Leaderboard endpoints: 60 requests per 15 minutes
- Admin endpoints: 200 requests per 15 minutes

---

## Support
For issues or questions, contact support@berse-app.com or check the main API documentation at `/docs/api-v2/README.md`.
