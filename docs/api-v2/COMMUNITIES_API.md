# Communities API Documentation

## Overview
The Communities API provides comprehensive endpoints for managing communities, membership systems with role-based permissions, and a community vouching system integrated with trust scores. Communities can host events, manage members with approval workflows, and grant vouches to trusted members.

**Base URL:**
- **Production:** `https://api.berse-app.com/v2/communities`
- **Development:** `http://localhost:3001/v2/communities`

**Authentication:** Bearer token required for most endpoints

---

## Table of Contents
1. [Community Management](#community-management)
   - [Create Community](#create-community)
   - [Get Communities (List)](#get-communities-list)
   - [Get My Communities](#get-my-communities)
   - [Get Community Details](#get-community-details)
   - [Update Community](#update-community)
   - [Delete Community](#delete-community)
2. [Community Discovery](#community-discovery)
   - [Get Trending Communities](#get-trending-communities)
   - [Get New Communities](#get-new-communities)
   - [Get Recommended Communities](#get-recommended-communities)
   - [Get Communities by Interest](#get-communities-by-interest)
   - [Get Suggested Communities](#get-suggested-communities)
   - [Get Communities from Connections](#get-communities-from-connections)
3. [Membership Management](#membership-management)
   - [Join Community](#join-community)
   - [Leave Community](#leave-community)
   - [Get Community Members](#get-community-members)
   - [Get Community Events](#get-community-events)
   - [Approve Member](#approve-member)
   - [Reject Member](#reject-member)
   - [Update Member Role](#update-member-role)
   - [Remove Member](#remove-member)
   - [Get Community Statistics](#get-community-statistics)
4. [Community Vouching](#community-vouching)
   - [Check Vouch Eligibility](#check-vouch-eligibility)
   - [Grant Community Vouch](#grant-community-vouch)
   - [Revoke Community Vouch](#revoke-community-vouch)
5. [Enums & Types](#enums--types)
6. [Error Codes](#error-codes)
7. [Examples](#examples)

---

## Community Management

### Create Community

Create a new community. The creator is automatically assigned as ADMIN.

**Endpoint:** `POST /v2/communities`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Tech Enthusiasts Malaysia",
  "description": "A vibrant community for technology lovers in Malaysia. Join us for meetups, workshops, and networking events.",
  "imageUrl": "https://cdn.berse.com/communities/tech-malaysia.jpg",
  "interests": ["technology", "startups", "innovation"],
  "category": "Technology",  // @deprecated - Use interests array instead
  
  "requiresApproval": true,
  "city": "Kuala Lumpur",
  "country": "Malaysia",
  "latitude": 3.139,
  "longitude": 101.6869,
  "socialLinks": {
    "instagram": "https://instagram.com/techmsia",
    "facebook": "https://facebook.com/TechMalaysia",
    "twitter": "https://twitter.com/techmsia",
    "linkedin": "https://linkedin.com/company/tech-malaysia",
    "youtube": null,
    "tiktok": null
  },
  "websiteUrl": "https://techmalaysia.com",
  "contactEmail": "hello@techmalaysia.com",
  "guidelines": "# Community Guidelines\n\n1. Be respectful\n2. No spam\n3. Stay on topic"
}
```

**Field Validations:**
- `name` (required): 3-100 characters, must be unique
- `description` (optional): 10-2000 characters
- `imageUrl` (optional): Valid URL
- `interests` (optional): Array of valid interest values from profile metadata
- `category` (optional, deprecated): Max 50 characters - use `interests` array instead
- `requiresApproval` (optional): Boolean, default true - whether members need approval to join
- `city` (optional): Max 100 characters
- `country` (optional): Max 100 characters
- `latitude` (optional): Float between -90 and 90
- `longitude` (optional): Float between -180 and 180
- `socialLinks` (optional): Object with platform URLs (instagram, facebook, twitter, linkedin, youtube, tiktok)
- `websiteUrl` (optional): Valid URL
- `contactEmail` (optional): Valid email address
- `guidelines` (optional): Max 10000 characters, markdown supported

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "cm123456789abcdef",
    "name": "Tech Enthusiasts Malaysia",
    "description": "A vibrant community for technology lovers in Malaysia...",
    "imageUrl": "https://cdn.berse.com/communities/tech-malaysia.jpg",
    "interests": ["technology", "startups", "innovation"],
    "category": "Technology",  // @deprecated
    "isVerified": false,
    "createdBy": "user123",
    "createdAt": "2025-10-17T10:00:00.000Z",
    "updatedAt": "2025-10-17T10:00:00.000Z",
    "memberCount": 1,
    "eventCount": 0,
    "creator": {
      "id": "user123",
      "displayName": "John Doe",
      "profilePicture": "https://cdn.berse.com/users/john.jpg"
    },
    "userRole": "ADMIN",
    "userMembership": {
      "role": "ADMIN",
      "isApproved": true,
      "joinedAt": "2025-10-17T10:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - No authentication token
- `409 Conflict` - Community name already exists

---

### Get Communities (List)

Get all communities with optional filtering, search, and pagination.

**Endpoint:** `GET /v2/communities`

**Authentication:** Optional (shows user role if authenticated)

**Query Parameters:**
- `page` (optional): Page number (default: 1, min: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `interests` (optional): Filter by interests (comma-separated, e.g., "technology,startups")
- `category` (optional, deprecated): Filter by category - use `interests` instead
- `search` (optional): Search in name or description (case-insensitive)
- `isVerified` (optional): Filter by verification status (true/false)
- `sortBy` (optional): Sort field - `name`, `createdAt`, `memberCount` (default: `createdAt`)
- `sortOrder` (optional): Sort order - `asc` or `desc` (default: `desc`)

**Example Request:**
```
GET /v2/communities?page=1&limit=20&interests=technology,startups&search=malaysia&isVerified=true&sortBy=memberCount&sortOrder=desc
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "cm123456789abcdef",
      "name": "Tech Enthusiasts Malaysia",
      "description": "A vibrant community for technology lovers...",
      "imageUrl": "https://cdn.berse.com/communities/tech-malaysia.jpg",
      "interests": ["technology", "startups", "innovation"],
      "category": "Technology",  // @deprecated
      "isVerified": true,
      "createdBy": "user123",
      "createdAt": "2025-10-17T10:00:00.000Z",
      "updatedAt": "2025-10-17T10:00:00.000Z",
      "memberCount": 250,
      "eventCount": 12,
      "creator": {
        "id": "user123",
        "displayName": "John Doe",
        "profilePicture": "https://cdn.berse.com/users/john.jpg"
      },
      "userRole": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "totalItems": 95
  }
}
```

---

### Get My Communities

Get all communities where the user is an approved member.

**Endpoint:** `GET /v2/communities/my`

**Authentication:** Required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "cm123456789abcdef",
      "name": "Tech Enthusiasts Malaysia",
      "description": "A vibrant community for technology lovers...",
      "imageUrl": "https://cdn.berse.com/communities/tech-malaysia.jpg",
      "interests": ["technology", "startups", "innovation"],
      "category": "Technology",  // @deprecated
      "isVerified": true,
      "memberCount": 250,
      "eventCount": 12,
      "creator": {
        "id": "user123",
        "displayName": "John Doe",
        "profilePicture": "https://cdn.berse.com/users/john.jpg"
      },
      "userRole": "MODERATOR",
      "userMembership": {
        "role": "MODERATOR",
        "isApproved": true,
        "joinedAt": "2025-09-15T08:00:00.000Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "totalItems": 3
  }
}
```

---

### Get Community Details

Get detailed information about a specific community.

**Endpoint:** `GET /v2/communities/:communityId`

**Authentication:** Optional (shows user role if authenticated)

**Path Parameters:**
- `communityId` (required): Community ID

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "cm123456789abcdef",
    "name": "Tech Enthusiasts Malaysia",
    "description": "A vibrant community for technology lovers in Malaysia. Join us for meetups, workshops, and networking events.",
    "logoUrl": "https://cdn.berse.com/communities/tech-malaysia.jpg",
    "coverImageUrl": "https://cdn.berse.com/communities/tech-cover.jpg",
    "interests": ["technology", "startups", "innovation"],
    "category": "Technology",  // @deprecated
    "isVerified": true,
    "createdBy": "user123",
    "createdAt": "2025-10-17T10:00:00.000Z",
    "updatedAt": "2025-10-17T10:00:00.000Z",
    "memberCount": 250,
    "eventCount": 12,
    
    "requiresApproval": true,
    "location": {
      "city": "Kuala Lumpur",
      "country": "Malaysia",
      "latitude": 3.139,
      "longitude": 101.6869
    },
    "socialLinks": {
      "instagram": "https://instagram.com/techmsia",
      "facebook": "https://facebook.com/TechMalaysia",
      "twitter": "https://twitter.com/techmsia",
      "linkedin": "https://linkedin.com/company/tech-malaysia",
      "youtube": null,
      "tiktok": null
    },
    "websiteUrl": "https://techmalaysia.com",
    "contactEmail": "hello@techmalaysia.com",
    "guidelines": "# Community Guidelines\n\n1. Be respectful\n2. No spam",
    
    "creator": {
      "id": "user123",
      "fullName": "John Doe",
      "username": "johndoe",
      "profilePicture": "https://cdn.berse.com/users/john.jpg",
      "trustLevel": "verified"
    },
    
    "membersPreview": [
      {
        "id": "user123",
        "fullName": "John Doe",
        "username": "johndoe",
        "profilePicture": "https://cdn.berse.com/users/john.jpg",
        "trustLevel": "verified",
        "role": "ADMIN",
        "joinedAt": "2025-10-17T10:00:00.000Z"
      }
    ],
    
    "upcomingEventsPreview": [
      {
        "id": "evt123",
        "title": "Tech Meetup October",
        "type": "NETWORKING",
        "date": "2025-11-05T18:00:00.000Z",
        "location": "KL Sentral",
        "images": ["https://cdn.berse.com/events/meetup.jpg"],
        "isFree": true,
        "rsvpCount": 45
      }
    ],
    
    "userStatus": {
      "isMember": true,
      "isAdmin": false,
      "isModerator": false,
      "isPending": false,
      "joinedAt": "2025-10-01T12:00:00.000Z"
    },
    
    "stats": {
      "totalEvents": 12,
      "upcomingEvents": 5,
      "pastEvents": 7,
      "adminCount": 2,
      "moderatorCount": 3,
      "totalVouchesGiven": 15,
      "lastEventDate": "2025-11-05T18:00:00.000Z",
      "lastMemberJoinDate": "2025-10-27T14:30:00.000Z",
      "memberGrowthLast30Days": 25,
      "averageEventAttendance": 38
    }
  }
}
```

**Additional Field for Admins/Moderators:**

If the authenticated user is an ADMIN or MODERATOR of the community, the response includes an `adminData` object:

```json
"adminData": {
  "pendingMemberCount": 8,
  "totalReportsCount": 2,
  "unresolvedReportsCount": 1,
  "pendingVouchRequestCount": 3
}
```

**Error Responses:**
- `404 Not Found` - Community not found

---

### Update Community

Update community details. Requires ADMIN or MODERATOR role.

**Endpoint:** `PUT /v2/communities/:communityId`

**Authentication:** Required (ADMIN or MODERATOR)

**Path Parameters:**
- `communityId` (required): Community ID

**Request Body:**
```json
{
  "name": "Tech Enthusiasts KL",
  "description": "Updated description for the community",
  "imageUrl": "https://cdn.berse.com/communities/tech-kl.jpg",
  "interests": ["technology", "innovation", "ai"],
  "category": "Technology & Innovation"  // @deprecated
}
```

**Field Validations:**
- `name` (optional): 3-100 characters, must be unique
- `description` (optional): 10-2000 characters
- `imageUrl` (optional): Valid URL
- `interests` (optional): Array of valid interest values from profile metadata
- `category` (optional, deprecated): Max 50 characters - use `interests` array instead

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "cm123456789abcdef",
    "name": "Tech Enthusiasts KL",
    "description": "Updated description for the community",
    "imageUrl": "https://cdn.berse.com/communities/tech-kl.jpg",
    "interests": ["technology", "innovation", "ai"],
    "category": "Technology & Innovation",  // @deprecated
    "isVerified": true,
    "memberCount": 250,
    "eventCount": 12,
    "creator": {
      "id": "user123",
      "displayName": "John Doe",
      "profilePicture": "https://cdn.berse.com/users/john.jpg"
    },
    "userRole": "ADMIN"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - No authentication token
- `403 Forbidden` - Insufficient permissions (not ADMIN or MODERATOR)
- `404 Not Found` - Community not found
- `409 Conflict` - Community name already exists

---

### Delete Community

Delete a community. Requires ADMIN role. Cascading deletes handle members, events, and vouches.

**Endpoint:** `DELETE /v2/communities/:communityId`

**Authentication:** Required (ADMIN only)

**Path Parameters:**
- `communityId` (required): Community ID

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Community deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized` - No authentication token
- `403 Forbidden` - Not an admin
- `404 Not Found` - Community not found

---

## Community Discovery

### Get Trending Communities

Get communities sorted by popularity (member count and verified status).

**Endpoint:** `GET /v2/communities/discovery/trending`

**Authentication:** Optional (shows user role if authenticated)

**Query Parameters:**
- `limit` (optional): Number of results (default: 20, max: 100)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "cm123456789abcdef",
      "name": "Tech Enthusiasts Malaysia",
      "description": "A vibrant community for technology lovers...",
      "imageUrl": "https://cdn.berse.com/communities/tech-malaysia.jpg",
      "category": "Technology",
      "isVerified": true,
      "memberCount": 1250,
      "eventCount": 42,
      "creator": {
        "id": "user123",
        "displayName": "John Doe",
        "profilePicture": "https://cdn.berse.com/users/john.jpg"
      },
      "userRole": null
    }
  ]
}
```

---

### Get New Communities

Get recently created communities (last 30 days).

**Endpoint:** `GET /v2/communities/discovery/new`

**Authentication:** Optional (shows user role if authenticated)

**Query Parameters:**
- `limit` (optional): Number of results (default: 20, max: 100)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "cm987654321zyxwvu",
      "name": "Startup Founders KL",
      "description": "Connect with fellow startup founders...",
      "imageUrl": "https://cdn.berse.com/communities/startup-kl.jpg",
      "interests": ["startups", "entrepreneurship", "business"],
      "category": "Business",  // @deprecated
      "isVerified": false,
      "memberCount": 45,
      "eventCount": 3,
      "createdAt": "2025-10-10T08:00:00.000Z",
      "creator": {
        "id": "user456",
        "displayName": "Jane Smith",
        "profilePicture": "https://cdn.berse.com/users/jane.jpg"
      },
      "userRole": null
    }
  ]
}
```

---

### Get Recommended Communities

Get personalized community recommendations based on user interests and connections.

**Endpoint:** `GET /v2/communities/discovery/recommended`

**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of results (default: 20, max: 100)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "cm456789012345abc",
      "name": "Photography Enthusiasts",
      "description": "Share your passion for photography...",
      "imageUrl": "https://cdn.berse.com/communities/photo.jpg",
      "interests": ["photography", "arts", "creative"],
      "category": "Arts & Photography",  // @deprecated
      "isVerified": true,
      "memberCount": 580,
      "eventCount": 18,
      "creator": {
        "id": "user789",
        "displayName": "Alex Chen",
        "profilePicture": "https://cdn.berse.com/users/alex.jpg"
      },
      "userRole": null,
      "matchReason": "Based on your interests"
    }
  ]
}
```

**Recommendation Criteria:**
- User's profile interests match community interests (array intersection)
- Communities that user's connections are members of
- Similar communities to ones user already joined (based on shared interests)

**Note:** Interest values must match valid interest values from the profile metadata system. Use the `/v2/profile/metadata/interests` endpoint to get available interest values.

---

### Get Communities by Interest

Get communities filtered by a specific interest value. Searches the `interests` array for exact matches.

**Endpoint:** `GET /v2/communities/discovery/by-interest`

**Authentication:** Optional (shows user role if authenticated)

**Query Parameters:**
- `interest` (required): Interest value to filter by (e.g., "technology", "sports", "photography"). Must match valid interest values from profile metadata.
- `limit` (optional): Number of results (default: 20, max: 100)

**Example Request:**
```
GET /v2/communities/discovery/by-interest?interest=technology&limit=10
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "cm123456789abcdef",
      "name": "Tech Enthusiasts Malaysia",
      "description": "A vibrant community for technology lovers...",
      "imageUrl": "https://cdn.berse.com/communities/tech-malaysia.jpg",
      "interests": ["technology", "startups", "innovation"],
      "category": "Technology",  // @deprecated
      "isVerified": true,
      "memberCount": 1250,
      "eventCount": 42,
      "creator": {
        "id": "user123",
        "displayName": "John Doe",
        "profilePicture": "https://cdn.berse.com/users/john.jpg"
      },
      "userRole": null
    }
  ]
}
```

**Note:** The endpoint searches for an exact match of the interest value within the community's `interests` array.

**Error Responses:**
- `400 Bad Request` - Interest parameter is required

---

### Get Suggested Communities

Get a curated mix of trending, new, and recommended communities.

**Endpoint:** `GET /v2/communities/discovery/suggested`

**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of results (default: 20, max: 100)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "cm123456789abcdef",
      "name": "Tech Enthusiasts Malaysia",
      "description": "A vibrant community for technology lovers...",
      "imageUrl": "https://cdn.berse.com/communities/tech-malaysia.jpg",
      "interests": ["technology", "startups", "innovation"],
      "category": "Technology",  // @deprecated
      "isVerified": true,
      "memberCount": 1250,
      "eventCount": 42,
      "creator": {
        "id": "user123",
        "displayName": "John Doe",
        "profilePicture": "https://cdn.berse.com/users/john.jpg"
      },
      "userRole": null,
      "suggestionType": "trending"
    },
    {
      "id": "cm987654321zyxwvu",
      "name": "Startup Founders KL",
      "description": "Connect with fellow startup founders...",
      "imageUrl": "https://cdn.berse.com/communities/startup-kl.jpg",
      "interests": ["startups", "entrepreneurship", "business"],
      "category": "Business",  // @deprecated
      "isVerified": false,
      "memberCount": 45,
      "eventCount": 3,
      "createdAt": "2025-10-10T08:00:00.000Z",
      "creator": {
        "id": "user456",
        "displayName": "Jane Smith",
        "profilePicture": "https://cdn.berse.com/users/jane.jpg"
      },
      "userRole": null,
      "suggestionType": "new"
    }
  ]
}
```

**Suggestion Mix:**
- 40% trending communities (by member count)
- 30% personalized recommendations (based on interests)
- 30% new communities (created in last 30 days)

---

### Get Communities from Connections

Get communities that your connections (friends) are members of.

**Endpoint:** `GET /v2/communities/discovery/from-connections`

**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of results (default: 20, max: 100)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "cm456789012345abc",
      "name": "Hiking Adventures KL",
      "description": "Join us for weekend hiking trips...",
      "imageUrl": "https://cdn.berse.com/communities/hiking-kl.jpg",
      "interests": ["hiking", "outdoors", "fitness"],
      "category": "Sports & Outdoors",  // @deprecated
      "isVerified": true,
      "memberCount": 320,
      "eventCount": 25,
      "creator": {
        "id": "user789",
        "displayName": "Alex Chen",
        "profilePicture": "https://cdn.berse.com/users/alex.jpg"
      },
      "userRole": null,
      "connectionMembers": [
        {
          "id": "user456",
          "displayName": "Jane Smith",
          "profilePicture": "https://cdn.berse.com/users/jane.jpg"
        },
        {
          "id": "user789",
          "displayName": "Bob Wilson",
          "profilePicture": "https://cdn.berse.com/users/bob.jpg"
        }
      ],
      "connectionCount": 2
    }
  ]
}
```

**Note:** Only shows communities where at least one of your accepted connections is an approved member.

---

## Membership Management

### Join Community

Request to join a community. Creates a pending membership that requires admin/moderator approval.

**Endpoint:** `POST /v2/communities/:communityId/join`

**Authentication:** Required

**Path Parameters:**
- `communityId` (required): Community ID

**Request Body:**
```json
{
  "message": "Hi! I'm passionate about technology and would love to join this community."
}
```

**Field Validations:**
- `message` (optional): Max 500 characters

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Join request sent successfully. Awaiting approval.",
  "data": {
    "id": "cmmem123456789",
    "communityId": "cm123456789abcdef",
    "userId": "user456",
    "role": "MEMBER",
    "isApproved": false,
    "joinedAt": "2025-10-17T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Already a member or pending approval
- `401 Unauthorized` - No authentication token
- `404 Not Found` - Community not found

---

### Leave Community

Leave a community. Last admin cannot leave without transferring role first.

**Endpoint:** `DELETE /v2/communities/:communityId/leave`

**Authentication:** Required

**Path Parameters:**
- `communityId` (required): Community ID

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "You have left the community successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Not a member or last admin cannot leave
- `401 Unauthorized` - No authentication token
- `404 Not Found` - Community not found

---

### Get Community Members

Get paginated list of community members with optional filtering.

**Endpoint:** `GET /v2/communities/:communityId/members`

**Authentication:** Optional

**Path Parameters:**
- `communityId` (required): Community ID

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `role` (optional): Filter by role - `ADMIN`, `MODERATOR`, `MEMBER`
- `isApproved` (optional): Filter by approval status (true/false)

**Example Request:**
```
GET /v2/communities/cm123/members?page=1&limit=20&role=ADMIN&isApproved=true
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "cmmem123456789",
      "communityId": "cm123456789abcdef",
      "userId": "user123",
      "role": "ADMIN",
      "isApproved": true,
      "joinedAt": "2025-10-17T10:00:00.000Z",
      "user": {
        "id": "user123",
        "displayName": "John Doe",
        "profilePicture": "https://cdn.berse.com/users/john.jpg",
        "trustScore": 85.5,
        "trustLevel": "VERIFIED"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 13,
    "totalItems": 250
  }
}
```

**Error Responses:**
- `404 Not Found` - Community not found

---

### Get Community Events

Get all events for a specific community with filtering and pagination.

**Endpoint:** `GET /v2/communities/:communityId/events`

**Authentication:** Optional

**Path Parameters:**
- `communityId` (required): Community ID

**Query Parameters:**
- `page` (optional): Page number (default: 1, min: 1)
- `limit` (optional): Items per page (default: 20, min: 1, max: 100)
- `type` (optional): Event type filter
  - Values: `SOCIAL`, `SPORTS`, `TRIP`, `ILM`, `CAFE_MEETUP`, `VOLUNTEER`, `MONTHLY_EVENT`, `LOCAL_TRIP`
- `upcoming` (optional): Filter for upcoming events only (default: false)
  - `true`: Only events with date >= now
  - `false`: All events
- `status` (optional): Event status filter (default: PUBLISHED for public access)
  - Values: `DRAFT`, `PUBLISHED`, `CANCELLED`
- `search` (optional): Search in event title or description (min: 1, max: 100 characters)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "evt_123abc",
        "title": "Morning Yoga in the Park",
        "description": "Start your day with energizing yoga in beautiful KLCC Park. All levels welcome!",
        "type": "SPORTS",
        "date": "2025-11-15T06:30:00.000Z",
        "location": "KLCC Park, Kuala Lumpur",
        "city": "Kuala Lumpur",
        "country": "Malaysia",
        "latitude": 3.1569,
        "longitude": 101.7123,
        "mapLink": "https://maps.google.com/?q=KLCC+Park",
        "maxAttendees": 25,
        "images": [
          "https://cdn.berse.com/events/yoga-park.jpg"
        ],
        "isFree": true,
        "status": "PUBLISHED",
        "currency": "MYR",
        "hostType": "COMMUNITY",
        "attendeeCount": 12,
        "host": {
          "id": "usr_456def",
          "fullName": "Sarah Ahmad",
          "username": "sarahyoga",
          "profilePicture": "https://cdn.berse.com/users/sarah.jpg"
        },
        "createdAt": "2025-10-20T10:00:00.000Z",
        "updatedAt": "2025-10-22T15:30:00.000Z"
      }
    ],
    "totalCount": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

**Response Fields:**
- `events`: Array of event objects
  - `id`: Event unique identifier
  - `title`: Event title
  - `description`: Event description (can be null)
  - `type`: Event type enum
  - `date`: ISO 8601 datetime of the event
  - `location`: Location address
  - `city`: City name (can be null)
  - `country`: Country name (can be null)
  - `latitude`: Location latitude (can be null)
  - `longitude`: Location longitude (can be null)
  - `mapLink`: Google Maps link (can be null)
  - `maxAttendees`: Maximum attendees (can be null for unlimited)
  - `images`: Array of image URLs
  - `isFree`: Whether the event is free
  - `status`: Event status (DRAFT, PUBLISHED, CANCELLED)
  - `currency`: Currency code for paid events
  - `hostType`: PERSONAL or COMMUNITY
  - `attendeeCount`: Number of participants
  - `host`: Event host information
    - `id`: Host user ID
    - `fullName`: Host full name
    - `username`: Host username
    - `profilePicture`: Host profile picture URL (can be null)
  - `createdAt`: ISO 8601 creation timestamp
  - `updatedAt`: ISO 8601 last update timestamp
- `totalCount`: Total number of events matching filters
- `page`: Current page number
- `limit`: Items per page
- `totalPages`: Total number of pages

**Example Usage:**
```bash
# Get all upcoming sports events
curl -X GET "https://api.berse-app.com/v2/communities/cmh4gz0zw0009cp5026p08ged/events?type=SPORTS&upcoming=true&limit=10"

# Search for yoga events
curl -X GET "https://api.berse-app.com/v2/communities/cmh4gz0zw0009cp5026p08ged/events?search=yoga"

# Get page 2 of all events
curl -X GET "https://api.berse-app.com/v2/communities/cmh4gz0zw0009cp5026p08ged/events?page=2&limit=20"
```

**Error Responses:**
- `404 Not Found` - Community not found
- `400 Bad Request` - Invalid query parameters

---

### Approve Member

Approve a pending membership request. Requires ADMIN or MODERATOR role.

**Endpoint:** `POST /v2/communities/:communityId/members/:userId/approve`

**Authentication:** Required (ADMIN or MODERATOR)

**Path Parameters:**
- `communityId` (required): Community ID
- `userId` (required): User ID to approve

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Member approved successfully",
  "data": {
    "id": "cmmem123456789",
    "communityId": "cm123456789abcdef",
    "userId": "user456",
    "role": "MEMBER",
    "isApproved": true,
    "joinedAt": "2025-10-17T10:00:00.000Z",
    "user": {
      "id": "user456",
      "displayName": "Jane Smith",
      "profilePicture": "https://cdn.berse.com/users/jane.jpg"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - User not found or already approved
- `401 Unauthorized` - No authentication token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Community or user not found

---

### Reject Member

Reject a pending membership request. Requires ADMIN or MODERATOR role.

**Endpoint:** `POST /v2/communities/:communityId/members/:userId/reject`

**Authentication:** Required (ADMIN or MODERATOR)

**Path Parameters:**
- `communityId` (required): Community ID
- `userId` (required): User ID to reject

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Member request rejected and removed"
}
```

**Error Responses:**
- `400 Bad Request` - User not found in pending members
- `401 Unauthorized` - No authentication token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Community or user not found

---

### Update Member Role

Update a member's role in the community. Requires ADMIN role. Cannot demote last admin.

**Endpoint:** `PUT /v2/communities/:communityId/members/:userId/role`

**Authentication:** Required (ADMIN only)

**Path Parameters:**
- `communityId` (required): Community ID
- `userId` (required): User ID

**Request Body:**
```json
{
  "role": "MODERATOR"
}
```

**Field Validations:**
- `role` (required): Must be `ADMIN`, `MODERATOR`, or `MEMBER`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Member role updated successfully",
  "data": {
    "id": "cmmem123456789",
    "communityId": "cm123456789abcdef",
    "userId": "user456",
    "role": "MODERATOR",
    "isApproved": true,
    "joinedAt": "2025-10-17T10:00:00.000Z",
    "user": {
      "id": "user456",
      "displayName": "Jane Smith",
      "profilePicture": "https://cdn.berse.com/users/jane.jpg"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid role or cannot demote last admin
- `401 Unauthorized` - No authentication token
- `403 Forbidden` - Not an admin
- `404 Not Found` - Community or member not found

---

### Remove Member

Remove a member from the community. Requires ADMIN or MODERATOR role. Cannot remove last admin.

**Endpoint:** `DELETE /v2/communities/:communityId/members/:userId`

**Authentication:** Required (ADMIN or MODERATOR)

**Path Parameters:**
- `communityId` (required): Community ID
- `userId` (required): User ID to remove

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Member removed successfully"
}
```

**Error Responses:**
- `400 Bad Request` - User not a member or cannot remove last admin
- `401 Unauthorized` - No authentication token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Community or user not found

---

### Get Community Statistics

Get comprehensive statistics about a community. Requires authentication.

**Endpoint:** `GET /v2/communities/:communityId/stats`

**Authentication:** Required

**Path Parameters:**
- `communityId` (required): Community ID

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalMembers": 250,
    "adminCount": 3,
    "moderatorCount": 8,
    "memberCount": 239,
    "pendingApprovals": 15,
    "totalEvents": 42,
    "activeEvents": 5,
    "totalVouches": 67
  }
}
```

**Error Responses:**
- `401 Unauthorized` - No authentication token
- `404 Not Found` - Community not found

---

## Community Vouching

### Check Vouch Eligibility

Check if a member is eligible for auto-vouch based on community criteria.

**Endpoint:** `GET /v2/communities/:communityId/members/:userId/vouch-eligibility`

**Authentication:** Required

**Path Parameters:**
- `communityId` (required): Community ID
- `userId` (required): User ID to check

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "eligible": true,
    "reason": "User meets all auto-vouch criteria",
    "criteria": {
      "eventsAttended": 12,
      "requiredEvents": 5,
      "membershipDays": 145,
      "requiredDays": 90,
      "currentVouches": 1,
      "maxVouches": 2,
      "hasNegativeFeedback": false
    }
  }
}
```

**Eligibility Criteria:**
- ✅ Attended 5+ community events
- ✅ Member for 90+ days
- ✅ Has < 2 existing community vouches
- ✅ No negative trust feedback

**Error Responses:**
- `401 Unauthorized` - No authentication token
- `404 Not Found` - Community or user not found

---

### Grant Community Vouch

Grant a community vouch to a member. Requires ADMIN role. Max 2 community vouches per user globally.

**Endpoint:** `POST /v2/communities/:communityId/members/:userId/vouch`

**Authentication:** Required (ADMIN only)

**Path Parameters:**
- `communityId` (required): Community ID
- `userId` (required): User ID to vouch for

**Request Body:**
```json
{
  "reason": "Outstanding contribution to community events and helping new members"
}
```

**Field Validations:**
- `reason` (optional): Max 500 characters

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Community vouch granted successfully",
  "data": {
    "vouchId": "vouch123456789",
    "communityId": "cm123456789abcdef",
    "voucherId": "cm123456789abcdef",
    "voucheeId": "user456",
    "type": "SECONDARY",
    "status": "ACTIVE",
    "isCommunityVouch": true,
    "trustScoreWeight": 20,
    "reason": "Outstanding contribution to community events and helping new members",
    "createdAt": "2025-10-17T10:00:00.000Z"
  }
}
```

**Vouch Details:**
- **Type:** SECONDARY (community vouches are always secondary)
- **Weight:** 20% of trust score per vouch
- **Limit:** Max 2 community vouches per user (across all communities)
- **Status:** ACTIVE upon creation

**Error Responses:**
- `400 Bad Request` - User already has max vouches or already vouched by this community
- `401 Unauthorized` - No authentication token
- `403 Forbidden` - Not an admin
- `404 Not Found` - Community or user not found

---

### Revoke Community Vouch

Revoke a previously granted community vouch. Requires ADMIN role.

**Endpoint:** `DELETE /v2/communities/:communityId/members/:userId/vouch`

**Authentication:** Required (ADMIN only)

**Path Parameters:**
- `communityId` (required): Community ID
- `userId` (required): User ID

**Request Body:**
```json
{
  "reason": "Community guidelines violation"
}
```

**Field Validations:**
- `reason` (required): 10-500 characters

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Community vouch revoked successfully",
  "data": {
    "vouchId": "vouch123456789",
    "status": "REVOKED",
    "revokedAt": "2025-10-17T10:00:00.000Z",
    "revokeReason": "Community guidelines violation"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors or no active vouch found
- `401 Unauthorized` - No authentication token
- `403 Forbidden` - Not an admin
- `404 Not Found` - Community, user, or vouch not found

---

## Enums & Types

### CommunityRole

Member roles in a community with hierarchical permissions:

```typescript
enum CommunityRole {
  ADMIN = 'ADMIN',       // Full permissions
  MODERATOR = 'MODERATOR', // Can approve/reject, manage members
  MEMBER = 'MEMBER'       // Basic member
}
```

**Permission Matrix:**

| Action | ADMIN | MODERATOR | MEMBER |
|--------|-------|-----------|--------|
| Create community | ✅ | ✅ | ✅ |
| Update community | ✅ | ✅ | ❌ |
| Delete community | ✅ | ❌ | ❌ |
| Approve members | ✅ | ✅ | ❌ |
| Reject members | ✅ | ✅ | ❌ |
| Update roles | ✅ | ❌ | ❌ |
| Remove members | ✅ | ✅ | ❌ |
| Grant vouches | ✅ | ❌ | ❌ |
| Revoke vouches | ✅ | ❌ | ❌ |
| Join community | ✅ | ✅ | ✅ |
| Leave community | ✅ | ✅ | ✅ |

### VouchStatus

Status of a vouch record:

```typescript
enum VouchStatus {
  PENDING = 'PENDING',   // Waiting for approval
  ACTIVE = 'ACTIVE',     // Active and contributing to trust score
  REVOKED = 'REVOKED'    // Revoked by admin
}
```

---

## Error Codes

### Common HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Validation error or invalid request |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists (e.g., duplicate community name) |
| 500 | Internal Server Error | Server error |

### Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error description",
  "statusCode": 400
}
```

### Common Error Scenarios

#### Community Name Already Exists
```json
{
  "success": false,
  "message": "A community with this name already exists",
  "statusCode": 409
}
```

#### Insufficient Permissions
```json
{
  "success": false,
  "message": "You don't have permission to perform this action",
  "statusCode": 403
}
```

#### Last Admin Cannot Leave
```json
{
  "success": false,
  "message": "Cannot leave community. You are the last admin. Please assign another admin first.",
  "statusCode": 400
}
```

#### Vouch Limit Reached
```json
{
  "success": false,
  "message": "User already has maximum community vouches (2)",
  "statusCode": 400
}
```

#### Already a Member
```json
{
  "success": false,
  "message": "You are already a member of this community",
  "statusCode": 400
}
```

---

## Examples

### Complete Workflow: Create Community → Join → Approve → Vouch

#### 1. Create Community (User A - Auto-Admin)
```bash
curl -X POST https://api.berse-app.com/v2/communities \
  -H "Authorization: Bearer <token_user_a>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Startup Founders KL",
    "description": "Community for startup founders in Kuala Lumpur",
    "interests": ["startups", "entrepreneurship", "business"],
    "category": "Business"  // @deprecated
  }'
```

#### 2. Join Community (User B)
```bash
curl -X POST https://api.berse-app.com/v2/communities/cm123/join \
  -H "Authorization: Bearer <token_user_b>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Excited to connect with fellow founders!"
  }'
```

#### 3. Admin Approves User B
```bash
curl -X POST https://api.berse-app.com/v2/communities/cm123/members/userB/approve \
  -H "Authorization: Bearer <token_user_a>"
```

#### 4. User B Attends 5+ Events & Active for 90+ Days

#### 5. Check Vouch Eligibility
```bash
curl -X GET https://api.berse-app.com/v2/communities/cm123/members/userB/vouch-eligibility \
  -H "Authorization: Bearer <token_user_a>"
```

#### 6. Admin Grants Vouch to User B
```bash
curl -X POST https://api.berse-app.com/v2/communities/cm123/members/userB/vouch \
  -H "Authorization: Bearer <token_user_a>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Active participant, helped organize 3 events"
  }'
```

### Search and Filter Communities

```bash
# Get verified tech communities by interests, sorted by member count
curl -X GET "https://api.berse-app.com/v2/communities?interests=technology,startups&isVerified=true&sortBy=memberCount&sortOrder=desc&limit=10"

# Get communities by single interest
curl -X GET "https://api.berse-app.com/v2/communities/discovery/by-interest?interest=photography&limit=10"

# Search for communities with "startup" in name/description
curl -X GET "https://api.berse-app.com/v2/communities?search=startup&page=1&limit=20"
```

### Manage Community Roles

```bash
# Promote user to moderator
curl -X PUT https://api.berse-app.com/v2/communities/cm123/members/userB/role \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "MODERATOR"
  }'

# Get all admins
curl -X GET "https://api.berse-app.com/v2/communities/cm123/members?role=ADMIN&isApproved=true"

# Get pending approvals
curl -X GET "https://api.berse-app.com/v2/communities/cm123/members?isApproved=false"
```

### Community Statistics

```bash
# Get comprehensive stats
curl -X GET https://api.berse-app.com/v2/communities/cm123/stats \
  -H "Authorization: Bearer <token>"
```

---

## Integration with Other Modules

### With Trust Score System
- Community vouches contribute **20% each** to user trust score
- Maximum 2 community vouches per user globally
- Vouch status affects trust score calculations
- Revoking a vouch reduces trust score

### With Events Module
- Communities can host events (`Event.communityId`)
- Event attendance counts toward auto-vouch eligibility
- Community members get access to community events
- Event participation tracked for vouch criteria

### With Notification System (Ready)
- Join request notifications to admins/moderators
- Approval/rejection notifications to applicants
- Role change notifications
- Community vouch granted/revoked notifications

### With Activity Logging (Ready)
- All admin actions logged for auditing
- Member management actions tracked
- Vouch grants/revocations logged
- Security events for permission violations

---

## Rate Limiting

All endpoints are subject to rate limiting:

- **Authenticated requests:** 100 requests per 15 minutes per user
- **Unauthenticated requests:** 20 requests per 15 minutes per IP

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634567890
```

---

## Changelog

### Version 2.3.0 (October 23, 2025)
- ✅ **Schema Update:** Changed from single `category` field to `interests` array
  - `category` field is now deprecated but maintained for backward compatibility
  - `interests` array accepts multiple interest values from profile metadata
  - Enhanced filtering with multi-interest support
- ✅ Updated `/v2/communities/discovery/by-interest` to search `interests` array
- ✅ All endpoints now return `interests` array in responses
- ✅ Query parameter `interests` added to main communities list endpoint

### Version 2.2.0 (October 17, 2025)
- ✅ Added 6 Community Discovery endpoints
  - Trending communities (by member count & verification)
  - New communities (last 30 days)
  - Recommended communities (personalized)
  - Communities by interest/category
  - Suggested communities (curated mix)
  - Communities from connections (friends)
- ✅ Personalized recommendations based on user interests
- ✅ Social discovery through connection networks
- ✅ Enhanced community filtering capabilities

### Version 2.1.0 (October 17, 2025)
- ✅ Initial release of Communities module
- ✅ 17 core endpoints for community management
- ✅ Role-based permission system (ADMIN, MODERATOR, MEMBER)
- ✅ Community vouching system with trust score integration
- ✅ Auto-vouch eligibility checking
- ✅ Last admin protection logic
- ✅ Comprehensive member management
- ✅ Search, filtering, and pagination support
- ✅ Full Swagger documentation

---

## Support

For API support, please contact:
- **Email:** support@berse-app.com
- **Documentation:** https://docs.berse-app.com
- **Status Page:** https://status.berse-app.com

---

**API Version:** 2.3.0  
**Last Updated:** October 23, 2025  
**Status:** ✅ Production Ready
