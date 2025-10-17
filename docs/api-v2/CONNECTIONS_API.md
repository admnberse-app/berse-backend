# Connections API Documentation

## Overview
The Connections API provides comprehensive endpoints for managing user connections, vouching system, trust scores, and relationship management. It supports symmetric connections (mutual relationships), trust-based vouching, and intelligent connection suggestions.

**Base URL:**
- **Production:** `https://api.berse-app.com/v2/connections`
- **Development:** `http://localhost:3000/v2/connections`

**Authentication:** Bearer token required for all endpoints

---

## Table of Contents
1. [Core Connections](#core-connections)
   - [Send Connection Request](#send-connection-request)
   - [Respond to Connection Request](#respond-to-connection-request)
   - [Withdraw Connection Request](#withdraw-connection-request)
   - [Remove Connection](#remove-connection)
   - [Update Connection](#update-connection)
   - [Get Connections](#get-connections)
   - [Get Connection Stats](#get-connection-stats)
   - [Get Mutual Connections](#get-mutual-connections)
   - [Get Connection Suggestions](#get-connection-suggestions)
   - [Block User](#block-user)
   - [Unblock User](#unblock-user)
   - [Get Blocked Users](#get-blocked-users)
2. [Vouching System](#vouching-system)
   - [Request Vouch](#request-vouch)
   - [Respond to Vouch Request](#respond-to-vouch-request)
   - [Revoke Vouch](#revoke-vouch)
   - [Community Vouch](#community-vouch)
   - [Check Auto-Vouch Eligibility](#check-auto-vouch-eligibility)
   - [Get Received Vouches](#get-received-vouches)
   - [Get Given Vouches](#get-given-vouches)
   - [Get Vouch Limits](#get-vouch-limits)
   - [Get Vouch Summary](#get-vouch-summary)
3. [Trust Score System](#trust-score-system)
4. [Enums & Types](#enums--types)
5. [Error Codes](#error-codes)
6. [Examples](#examples)

---

## Core Connections

### Send Connection Request

Send a connection request to another user.

**Endpoint:** `POST /v2/connections/request`

**Authentication:** Required

**Request Body:**
```json
{
  "targetUserId": "cm123abc456def789",
  "message": "Hi! I'd love to connect. Met you at the Tech Meetup yesterday!",
  "relationshipType": "friend",
  "relationshipDetails": {
    "howWeMet": "Tech Conference 2025",
    "mutualInterests": ["technology", "startups"],
    "referredBy": "cm789xyz123"
  }
}
```

**Field Validations:**
- `targetUserId` (required): Valid user ID, not yourself, not already connected
- `message` (optional): Max 500 characters
- `relationshipType` (optional): One of: `friend`, `professional`, `family`, `mentor`, `travel`, `community`
- `relationshipDetails` (optional): Additional context object

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Connection request sent successfully",
  "data": {
    "id": "clx1abc2def3ghi4jkl5mno6p",
    "userId1": "cm123abc456def789",
    "userId2": "cm456def789ghi123",
    "status": "PENDING",
    "initiatorId": "cm123abc456def789",
    "message": "Hi! I'd love to connect...",
    "relationshipType": "friend",
    "relationshipDetails": { ... },
    "createdAt": "2025-10-17T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid user ID, already connected, or blocked
- `404 Not Found` - Target user not found
- `429 Too Many Requests` - Connection request limit reached

---

### Respond to Connection Request

Accept or reject a pending connection request.

**Endpoint:** `PUT /v2/connections/:connectionId/respond`

**Authentication:** Required

**Request Body:**
```json
{
  "action": "accept",
  "message": "Great to connect with you!"
}
```

**Field Validations:**
- `action` (required): `accept` or `reject`
- `message` (optional): Response message (max 500 characters)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Connection request accepted",
  "data": {
    "id": "clx1abc2def3ghi4jkl5mno6p",
    "status": "ACCEPTED",
    "connectedAt": "2025-10-17T10:05:00.000Z",
    "userId1": "cm123abc456def789",
    "userId2": "cm456def789ghi123",
    "relationshipType": "friend",
    "mutualConnectionsCount": 5
  }
}
```

**Error Responses:**
- `403 Forbidden` - Not the recipient of this request
- `404 Not Found` - Connection request not found
- `409 Conflict` - Request already responded to

---

### Withdraw Connection Request

Cancel a pending connection request you sent.

**Endpoint:** `DELETE /v2/connections/:connectionId/withdraw`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Connection request withdrawn"
}
```

**Error Responses:**
- `403 Forbidden` - Not the initiator of this request
- `404 Not Found` - Connection request not found
- `409 Conflict` - Request already responded to

---

### Remove Connection

Remove an existing connection (30-day cooldown before reconnection).

**Endpoint:** `DELETE /v2/connections/:connectionId/remove`

**Authentication:** Required

**Request Body:**
```json
{
  "reason": "No longer interested in maintaining this connection"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Connection removed successfully",
  "data": {
    "status": "REMOVED",
    "removedAt": "2025-10-17T10:10:00.000Z",
    "cooldownUntil": "2025-11-16T10:10:00.000Z"
  }
}
```

**Notes:**
- 30-day cooldown period before reconnection
- Both users can no longer see each other's private content
- Connection history is preserved for trust score calculation

---

### Update Connection

Update connection details (relationship type, tags, notes).

**Endpoint:** `PATCH /v2/connections/:connectionId`

**Authentication:** Required

**Request Body:**
```json
{
  "relationshipType": "professional",
  "tags": ["colleague", "mentor", "tech"],
  "howWeMet": "Tech Conference 2025",
  "notes": "Works at ABC Company, interested in AI"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Connection updated successfully",
  "data": {
    "id": "clx1abc2def3ghi4jkl5mno6p",
    "relationshipType": "professional",
    "tags": ["colleague", "mentor", "tech"],
    "howWeMet": "Tech Conference 2025",
    "updatedAt": "2025-10-17T10:15:00.000Z"
  }
}
```

---

### Get Connections

Get your connections with advanced filtering.

**Endpoint:** `GET /v2/connections`

**Authentication:** Required

**Query Parameters:**
- `status` (optional): Filter by status - `PENDING`, `ACCEPTED`, `REJECTED`, `CANCELED`, `REMOVED`
- `relationshipType` (optional): Filter by type - `friend`, `professional`, `family`, `mentor`, `travel`, `community`
- `search` (optional): Search by name or username
- `sortBy` (optional): `connectedAt`, `name`, `trustScore` (default: `connectedAt`)
- `order` (optional): `asc` or `desc` (default: `desc`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Example:**
```
GET /v2/connections?status=ACCEPTED&relationshipType=professional&page=1&limit=20
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "connections": [
      {
        "id": "clx1abc2def3ghi4jkl5mno6p",
        "user": {
          "id": "cm456def789ghi123",
          "displayName": "John Doe",
          "username": "johndoe",
          "profilePicture": "https://cdn.berse.com/avatars/john.jpg",
          "trustScore": 85.5,
          "trustLevel": "trusted"
        },
        "status": "ACCEPTED",
        "relationshipType": "professional",
        "tags": ["colleague", "mentor"],
        "mutualConnectionsCount": 12,
        "connectedAt": "2025-10-10T10:00:00.000Z",
        "lastInteraction": "2025-10-16T14:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

---

### Get Connection Stats

Get aggregated statistics about your connections.

**Endpoint:** `GET /v2/connections/stats`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total": 45,
    "byStatus": {
      "PENDING": 3,
      "ACCEPTED": 40,
      "REJECTED": 1,
      "REMOVED": 1
    },
    "byRelationshipType": {
      "friend": 25,
      "professional": 15,
      "community": 5
    },
    "pendingReceived": 2,
    "pendingSent": 1,
    "averageTrustScore": 72.3,
    "mutualConnectionsAverage": 8.5
  }
}
```

---

### Get Mutual Connections

Get mutual connections between you and another user.

**Endpoint:** `GET /v2/connections/mutual/:userId`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "count": 8,
    "mutualConnections": [
      {
        "id": "cm789xyz123abc456",
        "displayName": "Alice Smith",
        "username": "alice",
        "profilePicture": "https://cdn.berse.com/avatars/alice.jpg",
        "trustScore": 78.0,
        "relationshipType": "friend"
      }
    ]
  }
}
```

---

### Get Connection Suggestions

Get personalized connection suggestions based on mutual connections, interests, and communities.

**Endpoint:** `GET /v2/connections/suggestions`

**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Max suggestions (default: 10, max: 50)
- `basedOn` (optional): Algorithm focus - `mutual`, `interests`, `communities`, `location`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "user": {
          "id": "cm999abc111def222",
          "displayName": "Emma Wilson",
          "username": "emmaw",
          "profilePicture": "https://cdn.berse.com/avatars/emma.jpg",
          "trustScore": 82.0,
          "bio": "Tech enthusiast | Coffee lover"
        },
        "score": 85.5,
        "reasons": [
          "12 mutual connections",
          "Member of Tech Talk KL",
          "Similar interests: technology, startups"
        ],
        "mutualConnections": 12,
        "mutualCommunities": 2
      }
    ],
    "metadata": {
      "algorithm": "hybrid",
      "version": "1.0"
    }
  }
}
```

---

### Block User

Block a user (prevents all interactions).

**Endpoint:** `POST /v2/connections/block/:userId`

**Authentication:** Required

**Request Body:**
```json
{
  "reason": "Inappropriate behavior",
  "details": "Sent spam messages"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User blocked successfully",
  "data": {
    "blockedUserId": "cm456def789ghi123",
    "reason": "Inappropriate behavior",
    "blockedAt": "2025-10-17T10:20:00.000Z"
  }
}
```

**Effects:**
- Cannot send connection requests
- Existing connection is removed
- Cannot view each other's profiles
- Cannot send messages
- User is hidden from search results

---

### Unblock User

Unblock a previously blocked user.

**Endpoint:** `DELETE /v2/connections/block/:userId`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User unblocked successfully"
}
```

---

### Get Blocked Users

Get list of users you've blocked.

**Endpoint:** `GET /v2/connections/blocked`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "blockedUsers": [
      {
        "id": "clxblock123",
        "blockedUser": {
          "id": "cm456def789ghi123",
          "displayName": "Blocked User",
          "username": "blockeduser"
        },
        "reason": "Inappropriate behavior",
        "blockedAt": "2025-10-15T10:00:00.000Z"
      }
    ],
    "total": 1
  }
}
```

---

## Vouching System

### Request Vouch

Request a vouch from a connection.

**Endpoint:** `POST /v2/vouches/request`

**Authentication:** Required

**Request Body:**
```json
{
  "voucheeId": "cm456def789ghi123",
  "vouchType": "PRIMARY",
  "message": "We've known each other for 3 years and worked on multiple projects together.",
  "relationship": "Close colleague and friend",
  "sharedExperiences": [
    "Worked together at ABC Company",
    "Attended 5+ events together"
  ]
}
```

**Field Validations:**
- `voucheeId` (required): Must be an accepted connection
- `vouchType` (required): `PRIMARY`, `SECONDARY`, or `COMMUNITY`
- `message` (optional): Max 1000 characters
- `relationship` (optional): Max 200 characters
- `sharedExperiences` (optional): Array of strings

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Vouch request sent successfully",
  "data": {
    "id": "clxvouch123",
    "voucherId": "cm123abc456def789",
    "voucheeId": "cm456def789ghi123",
    "vouchType": "PRIMARY",
    "status": "PENDING",
    "message": "We've known each other...",
    "createdAt": "2025-10-17T10:25:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Not connected, already vouched, or limit reached
- `403 Forbidden` - Insufficient trust score to vouch

**Vouch Limits:**
- Primary: 1 max
- Secondary: 3 max
- Community: 2 max

---

### Respond to Vouch Request

Approve, decline, or downgrade a vouch request.

**Endpoint:** `PUT /v2/vouches/:vouchId/respond`

**Authentication:** Required

**Request Body:**
```json
{
  "action": "approve",
  "approvedType": "PRIMARY",
  "message": "Happy to vouch for you!"
}
```

**Field Validations:**
- `action` (required): `approve`, `decline`, or `downgrade`
- `approvedType` (required if approve/downgrade): `PRIMARY`, `SECONDARY`, or `COMMUNITY`
- `message` (optional): Response message

**Response (Approved):** `200 OK`
```json
{
  "success": true,
  "message": "Vouch approved successfully",
  "data": {
    "id": "clxvouch123",
    "status": "APPROVED",
    "approvedType": "PRIMARY",
    "approvedAt": "2025-10-17T10:30:00.000Z",
    "trustImpact": 30.0
  }
}
```

**Response (Declined):** `200 OK`
```json
{
  "success": true,
  "message": "Vouch request declined",
  "data": {
    "id": "clxvouch123",
    "status": "DECLINED",
    "approvedAt": "2025-10-17T10:30:00.000Z",
    "trustImpact": 0
  }
}
```

**Notes:**
- Declined vouches are preserved in the database (not deleted)
- Status becomes `DECLINED` for tracking and analytics
- No trust score impact when declined
- `approvedAt` timestamp records when the decline occurred

---

### Revoke Vouch

Revoke a previously given vouch.

**Endpoint:** `DELETE /v2/vouches/:vouchId/revoke`

**Authentication:** Required

**Request Body:**
```json
{
  "reason": "Trust relationship has changed",
  "details": "No longer maintain close contact"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Vouch revoked successfully",
  "data": {
    "revokedAt": "2025-10-17T10:35:00.000Z",
    "previousTrustImpact": 30.0,
    "newTrustScore": 65.5
  }
}
```

---

### Community Vouch

Issue a vouch on behalf of a community (admin only).

**Endpoint:** `POST /v2/vouches/community`

**Authentication:** Required (Community Admin)

**Request Body:**
```json
{
  "voucheeId": "cm456def789ghi123",
  "communityId": "cm789com123",
  "vouchType": "COMMUNITY",
  "message": "Active member for 6+ months, attended 10+ events",
  "criteria": {
    "eventsAttended": 12,
    "membershipDays": 180,
    "negativeIncidents": 0
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Community vouch issued successfully",
  "data": {
    "id": "clxvouch456",
    "vouchType": "COMMUNITY",
    "status": "ACTIVE",
    "communityId": "cm789com123",
    "trustImpact": 20.0
  }
}
```

---

### Check Auto-Vouch Eligibility

Check if a user is eligible for auto-vouch from a community.

**Endpoint:** `GET /v2/vouches/auto-vouch/eligibility/:userId`

**Authentication:** Required (Community Admin)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "eligible": true,
    "criteria": {
      "eventsAttended": 8,
      "membershipDays": 95,
      "negativeIncidents": 0
    },
    "requirements": {
      "minEvents": 5,
      "minDays": 90,
      "maxNegative": 0
    },
    "recommendation": "User meets all criteria for auto-vouch"
  }
}
```

---

### Get Received Vouches

Get vouches you've received.

**Endpoint:** `GET /v2/vouches/received`

**Authentication:** Required

**Query Parameters:**
- `vouchType` (optional): Filter by type - `PRIMARY`, `SECONDARY`, `COMMUNITY`
- `status` (optional): Filter by status - `PENDING`, `APPROVED`, `ACTIVE`, `DECLINED`, `REVOKED`
- `page`, `limit`: Pagination

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "vouches": [
      {
        "id": "clxvouch123",
        "voucher": {
          "id": "cm123abc456def789",
          "displayName": "John Doe",
          "profilePicture": "https://cdn.berse.com/avatars/john.jpg",
          "trustScore": 85.0
        },
        "vouchType": "PRIMARY",
        "status": "ACTIVE",
        "message": "We've known each other...",
        "trustImpact": 30.0,
        "approvedAt": "2025-10-17T10:30:00.000Z"
      },
      {
        "id": "clxvouch456",
        "voucher": {
          "id": "cm789xyz123abc456",
          "displayName": "Jane Smith",
          "profilePicture": "https://cdn.berse.com/avatars/jane.jpg",
          "trustScore": 78.0
        },
        "vouchType": "PRIMARY",
        "status": "DECLINED",
        "message": "Please vouch for me",
        "trustImpact": 0,
        "approvedAt": "2025-10-17T10:25:00.000Z"
      }
    ],
    "summary": {
      "total": 3,
      "byType": {
        "PRIMARY": 1,
        "SECONDARY": 2
      },
      "totalTrustImpact": 70.0
    }
  }
}
```

**Example - Filter Declined Vouches:**
```bash
GET /v2/vouches/received?status=DECLINED
```

---

### Get Given Vouches

Get vouches you've given to others.

**Endpoint:** `GET /v2/vouches/given`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "vouches": [
      {
        "id": "clxvouch456",
        "vouchee": {
          "id": "cm456def789ghi123",
          "displayName": "Jane Smith",
          "profilePicture": "https://cdn.berse.com/avatars/jane.jpg"
        },
        "vouchType": "SECONDARY",
        "status": "ACTIVE",
        "approvedAt": "2025-10-16T10:00:00.000Z"
      }
    ],
    "summary": {
      "total": 2,
      "available": {
        "PRIMARY": 0,
        "SECONDARY": 1,
        "COMMUNITY": 2
      }
    }
  }
}
```

---

### Get Vouch Limits

Get your vouch limits and current usage.

**Endpoint:** `GET /v2/vouches/limits`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "limits": {
      "PRIMARY": {
        "max": 1,
        "used": 1,
        "available": 0
      },
      "SECONDARY": {
        "max": 3,
        "used": 2,
        "available": 1
      },
      "COMMUNITY": {
        "max": 2,
        "used": 0,
        "available": 2
      }
    },
    "weights": {
      "PRIMARY": 30.0,
      "SECONDARY": 30.0,
      "COMMUNITY": 40.0
    }
  }
}
```

---

### Get Vouch Summary

Get a comprehensive summary of your vouches.

**Endpoint:** `GET /v2/vouches/summary`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalVouchesReceived": 3,
    "totalVouchesGiven": 2,
    "primaryVouches": 1,
    "secondaryVouches": 2,
    "communityVouches": 0,
    "pendingRequests": 1,
    "activeVouches": 3,
    "revokedVouches": 0,
    "declinedVouches": 1,
    "availableSlots": {
      "primary": 0,
      "secondary": 1,
      "community": 2
    },
    "trustScoreContribution": 28.0,
    "recommendations": [
      "You can give 1 more secondary vouch",
      "Request a primary vouch to boost your trust score"
    ]
  }
}
```

**Fields:**
- `declinedVouches`: Count of vouch requests that were declined (tracked for analytics)
- `activeVouches`: Currently active vouches contributing to trust score
- `availableSlots`: Remaining vouches you can give by type

---

## Trust Score System

### How Trust Score Works

Your trust score (0-100) is calculated from:

**40% from Vouches:**
- Primary vouch (1 max): 30% weight = 12 points
- Secondary vouches (3 max): 30% weight = 12 points total
- Community vouches (2 max): 40% weight = 16 points total

**30% from Activity:**
- Events attended (5+ events): 10 points
- Events hosted (3+ events): 9 points
- Communities joined (3+ communities): 6 points
- Services provided (5+ services): 5 points

**30% from Trust Moments:**
- Average rating from feedback: 27 points
- Quantity bonus (10+ trust moments): 3 points

### Trust Levels

- **New** (0-19): Just joined
- **Starter** (20-39): New with some activity
- **Growing** (40-59): Building trust
- **Established** (60-74): Good standing
- **Trusted** (75-89): Well-established
- **Elite** (90-100): Highly trusted

### Event-Driven Updates

Trust scores update automatically when:
- Vouch is approved or revoked
- Event attendance is logged
- Trust moment is created
- Community membership changes

---

## Enums & Types

### ConnectionStatus
- `PENDING` - Request sent, awaiting response
- `ACCEPTED` - Connection established
- `REJECTED` - Request declined
- `CANCELED` - Request withdrawn
- `REMOVED` - Connection ended (30-day cooldown)

### RelationshipType
- `friend` - Personal friendship
- `professional` - Work/business relationship
- `family` - Family member
- `mentor` - Mentor/mentee relationship
- `travel` - Travel companion
- `community` - Community connection

### VouchType
- `PRIMARY` - Closest relationship (1 max, 30% weight)
- `SECONDARY` - Regular connection (3 max, 30% weight)
- `COMMUNITY` - Community-issued (2 max, 40% weight)

### VouchStatus
- `PENDING` - Awaiting approval from voucher
- `APPROVED` - Approved and contributing to trust score
- `ACTIVE` - Currently active vouch
- `DECLINED` - Request declined by voucher (preserved for analytics, no trust impact)
- `REVOKED` - Previously approved vouch removed

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid auth token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists or state conflict |
| 429 | Too Many Requests | Rate limit exceeded |
| 501 | Not Implemented | Feature coming soon |

---

## Examples

### Complete Connection Flow

```bash
# 1. Send connection request
curl -X POST http://localhost:3000/v2/connections/request \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "targetUserId": "cm456def789ghi123",
    "message": "Let'\''s connect!",
    "relationshipType": "friend"
  }'

# 2. Recipient accepts (using their token)
curl -X PUT http://localhost:3000/v2/connections/clx123/respond \
  -H "Authorization: Bearer <RECIPIENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "accept"
  }'

# 3. Request vouch
curl -X POST http://localhost:3000/v2/vouches/request \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "voucheeId": "cm456def789ghi123",
    "vouchType": "SECONDARY",
    "message": "We'\''ve attended 3 events together"
  }'

# 4. Approve vouch
curl -X PUT http://localhost:3000/v2/vouches/clxvouch123/respond \
  -H "Authorization: Bearer <RECIPIENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve",
    "approvedType": "SECONDARY"
  }'

# Alternative: Decline vouch (status becomes DECLINED, preserved for history)
curl -X PUT http://localhost:3000/v2/vouches/clxvouch123/respond \
  -H "Authorization: Bearer <RECIPIENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "decline",
    "message": "Not comfortable vouching at this time"
  }'
```

### Get Connection Analytics

```bash
# Get connection stats
curl -X GET http://localhost:3000/v2/connections/stats \
  -H "Authorization: Bearer <TOKEN>"

# Get vouch summary
curl -X GET http://localhost:3000/v2/vouches/summary \
  -H "Authorization: Bearer <TOKEN>"

# Get connection suggestions
curl -X GET "http://localhost:3000/v2/connections/suggestions?limit=10" \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Quick Reference

### Connection Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/connections/request` | Send connection request |
| PUT | `/connections/:id/respond` | Accept/reject request |
| DELETE | `/connections/:id/withdraw` | Cancel sent request |
| DELETE | `/connections/:id/remove` | Remove connection |
| PATCH | `/connections/:id` | Update connection |
| GET | `/connections` | List connections |
| GET | `/connections/stats` | Get statistics |
| GET | `/connections/mutual/:userId` | Mutual connections |
| GET | `/connections/suggestions` | Get suggestions |
| POST | `/connections/block/:userId` | Block user |
| DELETE | `/connections/block/:userId` | Unblock user |
| GET | `/connections/blocked` | List blocked users |

### Vouch Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/vouches/request` | Request vouch |
| PUT | `/vouches/:id/respond` | Approve/decline vouch |
| DELETE | `/vouches/:id/revoke` | Revoke vouch |
| POST | `/vouches/community` | Community vouch |
| GET | `/vouches/auto-vouch/eligibility/:userId` | Check eligibility |
| GET | `/vouches/received` | Received vouches |
| GET | `/vouches/given` | Given vouches |
| GET | `/vouches/limits` | Vouch limits |
| GET | `/vouches/summary` | Vouch summary |

---

**Last Updated:** October 17, 2025  
**API Version:** v2.1.0  
**Module Status:** Core Complete ✅ | Vouching Complete ✅ (DECLINED status tracking implemented)  

For implementation details, see:
- [Connection Module README](../../src/modules/connections/README.md)
- [Connection Module Quick Reference](../../CONNECTION_MODULE_QUICKREF.md)
- [Trust Score Documentation](../../src/modules/connections/trust/README.md)
