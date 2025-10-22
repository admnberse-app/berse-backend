# User & Profile API Documentation

## Overview
The User API provides endpoints for managing user profiles, searching users, and handling social connections.

**Base URL:**
- **Production:** `https://api.berse-app.com/v2/users`
- **Development:** `http://localhost:3001/v2/users`

**Authentication:** All endpoints require a valid JWT access token.

**Version:** v2.2.0 (Updated: October 22, 2025)

> **Note:** v2 endpoints do not include the `/api/` prefix. Legacy v1 endpoints are still available at `/api/v1/users` for backward compatibility.

## 🚀 Quick Start

**1. Get Your Own Profile:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/v2/users/me
```

**2. View Another User's Profile:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/v2/users/USER_ID
```

**3. Find Users:**
```bash
# Get all users (discovery)
curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:3001/v2/users/all?limit=10"

# Search by interest
curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:3001/v2/users/search?interest=travel"

# Search by city  
curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:3001/v2/users/search?city=kuala%20lumpur"
```

**4. Send Connection Request:**
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hi! Lets connect!", "relationshipType": "Travel Buddy"}' \
  "http://localhost:3001/v2/users/connections/USER_ID/request"
```

**5. Nearby Users (Geospatial Search):**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/v2/users/nearby?latitude=3.1390&longitude=101.6869&radius=10"
```

> 💡 **Tip:** Replace `localhost:3001` with your production API URL and get your access token from the auth endpoints.

---

## ⚠️ Important Updates (v2.2.0)

**Latest Features (October 22, 2025):**
- ✅ **Endpoint Separation**: New `/users/me` for own profile, `/users/:id` for viewing others with relationship context
- ✅ **Relationship-Aware Profiles**: `/users/:id` now shows connection status, vouch status, trust match, and mutual connections
- ✅ **Shared Activities**: View shared communities, events, travel trips, and marketplace interactions with other users
- ✅ **Privacy Controls**: Enhanced privacy settings control what data is visible based on connection status
- ✅ **Trust Compatibility**: Automatic trust level compatibility calculation when viewing other users

**Previous Features (v2.1.0 - October 17, 2025):**
- ✅ **Trust Score System**: `trustScore` and `trustLevel` now included in user profile (calculated from vouches, activity, trust moments)
- ✅ **Security Fields**: New `security` object with `emailVerifiedAt`, `phoneVerifiedAt`, `mfaEnabled`, `lastLoginAt`
- ✅ **Notification System**: Complete in-app notification system for user actions
- ✅ **Email Verification**: Enhanced email verification flow with notifications

**Trust Levels:**
- `NEW` (0-20): Just joined, no vouches yet
- `BUILDING` (20-40): Building trust, minimal vouches
- `ESTABLISHED` (40-60): Good standing, active participant
- `TRUSTED` (60-80): Well-established, strong vouches
- `VERIFIED` (80+): Highly trusted, verified by community

**Previous Fixes & Improvements (v2.0.1):**
- ✅ **Database Operations**: Fixed Prisma upsert operations for UserProfile and UserLocation
- ✅ **Connection IDs**: Properly generating unique IDs for all connections using cuid2
- ✅ **Route Ordering**: Fixed route precedence to prevent path conflicts
- ✅ **Pagination**: Added validation for negative/invalid page numbers
- ✅ **URL Validation**: Website fields now require protocol (http:// or https://)
- ✅ **Authorization**: Fixed connection removal to allow users to remove their own connections
- ✅ **Test Coverage**: All 35+ endpoints fully tested and operational

**Stability:** All endpoints have been thoroughly tested and verified working correctly.

---

## Table of Contents
- [Profile Management](#profile-management)
  - [Get Own Profile (NEW)](#get-own-profile)
  - [Get User Profile by ID (ENHANCED)](#get-user-profile-by-id)
  - [Update Profile](#update-profile)
  - [Upload Avatar](#upload-avatar)
- [User Discovery](#user-discovery)
  - [Get All Users](#get-all-users)
  - [User Recommendations (AI-Powered)](#user-recommendations-ai-powered)
  - [Trending Interests](#trending-interests)
  - [Search Users](#search-users)
  - [Find Nearby Users (Geospatial)](#find-nearby-users-geospatial)
  - [Get User by ID](#get-user-by-id)
- [Metadata Endpoints](#metadata-endpoints)
  - [Get Trust Levels](#get-trust-levels)
  - [Get Gender Options](#get-gender-options)
  - [Get Interest Categories](#get-interest-categories)
- [Location & Privacy](#location--privacy)
  - [Location Privacy Settings](#location-privacy-settings)
  - [Update Location with Coordinates](#update-location-with-coordinates)
- [Social Connections](#social-connections)
  - [Follow User](#follow-user)
  - [Unfollow User](#unfollow-user)
- [Activity & Security](#activity--security)
  - [Get User Activity History](#get-user-activity-history)
  - [Get Security Events](#get-security-events)
  - [Get Active Sessions](#get-active-sessions)
  - [Get Login History](#get-login-history)
  - [Terminate Session](#terminate-session)
- [Admin](#admin)
  - [Delete User](#delete-user)
- [Data Models](#data-models)

---

## Profile Management

### Endpoint Comparison: `/users/me` vs `/users/:id`

| Feature | `/users/me` | `/users/:id` |
|---------|-------------|--------------|
| **Purpose** | View your own profile | View another user's profile |
| **Use Case** | Profile settings, edit screens | Profile discovery, community browsing |
| **Relationship Section** | ❌ No | ✅ Yes (connection, vouch, trust match) |
| **Shared Activities** | ❌ No | ✅ Yes (communities, events, travel, marketplace) |
| **Privacy Controls** | ✅ Full visibility | ⚠️ Privacy-controlled (based on connection) |
| **Email/Phone** | ✅ Always shown | ⚠️ Only if connected or public |
| **Birth Date** | ✅ Always shown | ❌ Never shown (privacy) |
| **Statistics** | ✅ Yes | ✅ Yes |
| **Action Permissions** | ✅ Basic privacy settings | ✅ Full (canMessage, canVouch, canConnect) |
| **Self-Viewing** | ✅ Allowed | ❌ Returns error → use `/users/me` |

---

### Get Own Profile
Get your own complete profile with full visibility and statistics. Use this endpoint for profile settings and edit screens.

**Endpoint:** `GET /v2/users/me`

**🆕 NEW (v2.2.0):** Replaces `/users/profile` for viewing your own profile. Attempting to view your own profile via `/users/:id` will return an error directing you here.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "cmh09ovv70004cp7n6qtne205",
      "fullName": "David Lim",
      "displayName": "David L",
      "username": "davidtech",
      "email": "david.tech@berseapp.com",
      "phone": "+60123456793",
      "profilePicture": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      "bio": "Software engineer at a fintech startup. Love attending tech meetups...",
      "shortBio": "Software engineer & tech enthusiast",
      "location": {
        "city": "Alor Setar",
        "country": "Malaysia",
        "coordinates": null
      },
      "birthDate": "1995-09-18T00:00:00.000Z",
      "age": null,
      "gender": "male",
      "interests": ["technology", "coding", "ai", "blockchain", "gaming"],
      "languages": ["en", "zh", "ms"],
      "profession": "Software Engineer",
      "occupation": "mobile",
      "personalityType": null,
      "travelStyle": "Adventure Seeker",
      "bucketList": ["indonesia"],
      "travelBio": "Love exploring new places",
      "website": null,
      "socialLinks": {
        "instagram": "myig",
        "linkedin": null
      },
      "joinedAt": "2025-10-21T07:53:07.411Z",
      "lastActiveAt": null
    },
    "trust": {
      "score": 68,
      "level": "trusted",
      "badges": [],
      "vouches": {
        "received": 0,
        "given": 1,
        "activePrimary": 0,
        "activeSecondary": 0
      },
      "verifications": {
        "email": true,
        "phone": true,
        "identity": false,
        "background": false
      }
    },
    "statistics": {
      "connections": {
        "total": 4,
        "thisMonth": 1
      },
      "communities": {
        "member": 2,
        "moderator": 1,
        "owner": 0
      },
      "events": {
        "attended": 0,
        "hosting": 2,
        "upcoming": 0
      },
      "marketplace": {
        "activeListings": 2,
        "soldItems": 0,
        "rating": 0,
        "transactions": 2
      },
      "travel": {
        "tripsCompleted": 0,
        "upcomingTrips": 0
      },
      "cardGame": {
        "played": 0,
        "won": 0,
        "currentStreak": 0
      }
    },
    "privacy": {
      "profileVisibility": "public",
      "allowDirectMessages": true
    }
  }
}
```

**Notes:**
- ❌ No `relationship` section (not applicable for own profile)
- ❌ No `sharedActivities` section (not applicable for own profile)
- ✅ Full visibility of all fields including email, phone, birthDate
- ✅ Complete statistics with detailed breakdowns
- ✅ Use this endpoint for profile editing and settings screens

---

### Update Profile
Update user profile information.

**Endpoint:** `PUT /v2/users/profile`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "John Michael Doe",
  "displayName": "Johnny",
  "bio": "Updated bio...",
  "shortBio": "Traveler | Photographer",
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "age": 34,
  "profession": "Software Engineer",
  "occupation": "Full Stack Developer",
  "website": "https://johndoe.com",
  "personalityType": "ENFP",
  "interests": ["travel", "photography", "coffee"],
  "languages": ["English", "Spanish"],
  "currentCity": "Kuala Lumpur",
  "countryOfResidence": "Malaysia",
  "currentLocation": "KLCC Area",
  "nationality": "American",
  "originallyFrom": "San Francisco",
  "latitude": 3.1390,
  "longitude": 101.6869,
  "instagramHandle": "johndoe",
  "linkedinHandle": "john-doe",
  "travelStyle": "backpacker",
  "bucketList": ["Japan", "Iceland"],
  "travelBio": "Slow traveler..."
}
```

**Field Aliases:**
The API supports multiple field names for convenience:
- `bio` or `fullBio` - Full biography
- `interests` or `topInterests` - Array of interests
- `instagram` or `instagramHandle` - Instagram handle
- `linkedin` or `linkedinHandle` - LinkedIn handle

**All fields are optional.** Only send the fields you want to update.

**Field Validations:**
- `fullName`: 2-100 characters, letters only
- `username`: 2-30 characters, alphanumeric with underscores/hyphens
- `email`: Valid email address
- `phone`: Valid phone number
- `displayName`: 2-50 characters
- `bio`: Max 1000 characters
- `shortBio`: Max 160 characters
- `website`: Valid URL with protocol (http:// or https://) *(Updated v2.0.1)*
- `age`: 13-120
- `interests`: Max 20 items, each 1-50 characters
- `languages`: Max 10 items, each 2-50 characters
- `bucketList`: Max 50 items, each 1-100 characters
- `instagramHandle`: 1-30 characters, alphanumeric with dots/underscores
- `linkedinHandle`: 3-100 characters, alphanumeric with hyphons
- `latitude`: -90 to 90 (GPS latitude) *(Validated v2.0.1)*
- `longitude`: -180 to 180 (GPS longitude) *(Validated v2.0.1)*
- `currentLocation`: 1-100 characters (specific location description)
- `originallyFrom`: 1-100 characters (city/country of origin)
- `locationPrivacy`: "public" | "friends" | "private" (default: "friends")

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Michael Doe",
    "profile": { ... },
    "location": { ... },
    "metadata": { ... }
  }
}
```

**Error Responses:**
- `400` - Validation errors
- `401` - Unauthorized

---

### Upload Avatar
Upload or update profile picture.

**Endpoint:** `POST /v2/users/upload-avatar`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body (Multipart Form):**
```
avatar: <file>
```

**OR Base64 JSON:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Supported Formats:**
- JPEG, PNG, WebP
- Max file size: 5MB
- Recommended: 500x500px square

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "data": {
    "profilePicture": "https://cdn.bersemuka.com/avatars/uuid.jpg"
  }
}
```

**Error Responses:**
- `400` - No image provided / Invalid format
- `413` - File too large

---

## User Discovery

### Get All Users
Get a paginated list of all users for discovery/matching.

**Endpoint:** `GET /v2/users/all`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1, min: 1) *(Validated v2.0.1)*
- `limit` (optional): Items per page (default: 20, max: 100) *(Validated v2.0.1)*

**Example:**
```
GET /v2/users/all?page=1&limit=20
```

**Notes:**
- Negative page numbers are automatically corrected to 1
- Limit values exceeding 100 are capped at 100
- Excludes the current user from results

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "fullName": "Jane Smith",
        "email": "jane@example.com",
        "role": "GENERAL_USER",
        "totalPoints": 250,
        "profilePicture": "https://...",
        "bio": "Travel enthusiast and creative soul exploring the world",
        "interests": ["art", "travel", "food"],
        "profession": "Graphic Designer",
        "age": 28,
        "personalityType": "INFP",
        "languages": ["English", "French"],
        "location": {
          "city": "Penang",
          "currentLocation": "Georgetown",
          "originallyFrom": "Paris"
        },
        "membershipId": "BM-789012"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "pages": 8
    }
  }
}
```

**Notes:**
- Excludes the current user from results
- Only returns active users
- Ordered by creation date (newest first)

---

### Get Friend Recommendations
Get personalized user recommendations based on common interests, location proximity, and mutual connections.

**Endpoint:** `GET /v2/users/all?page=1&limit=20`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Algorithm:**
The recommendation system considers:
1. **Common Interests**: Users with shared interests are prioritized
2. **Location Proximity**: Users in the same city get higher scores
3. **Mutual Connections**: Users connected to your connections
4. **Activity Level**: Active users with complete profiles
5. **Diversity**: Mix of different backgrounds and experiences

**Usage Tips:**
- Use the `GET /v2/users/all` endpoint to get a general list
- Filter by `city` using search to find local connections
- Filter by `interest` using search to find hobby matches
- Send connection requests to build your network

---

### User Recommendations (AI-Powered)
Get intelligent user recommendations based on interests, location, and social patterns.

**Endpoint:** `GET /v2/users/recommendations`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `limit` (optional): Number of recommendations (default: 10, max: 50)

**Example:**
```
GET /v2/users/recommendations?limit=5
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "user_uuid",
        "fullName": "Sarah Host",
        "username": "host1",
        "role": "GENERAL_USER",
        "trustScore": 65,
        "trustLevel": "established",
        "score": 53,
        "reasons": [
          "1 shared interest: food",
          "Both in Kuala Lumpur",
          "Complete profile",
          "Getting started in community"
        ],
        "profilePicture": null,
        "bio": "Certified event host in KL. Love bringing people together!",
        "interests": ["events", "networking", "social", "food"],
        "profession": "Event Coordinator",
        "gender": "FEMALE",
        "location": {
          "city": "Kuala Lumpur",
          "country": "Malaysia"
        },
        "isVerified": true,
        "stats": {
          "totalConnections": 12,
          "connectionQuality": 78
        },
        "mutualConnectionsCount": 2,
        "mutualConnections": [
          {
            "id": "mutual_user_1",
            "fullName": "John Doe",
            "profilePicture": "https://..."
          },
          {
            "id": "mutual_user_2",
            "fullName": "Jane Smith",
            "profilePicture": "https://..."
          }
        ]
      }
    ],
    "total": 5
  }
}
```

**Response Structure:**
- **Recommendation Score** (`score`): 0-100 points based on algorithm
- **Reasons** (`reasons`): Array of explanations for recommendation
- **Flat Structure**: Same format as search endpoint for consistency
- **Mutual Connections**: Optional field (when `includeMutualConnections=true`)

**Recommendation Algorithm:**
The AI recommendation system considers:
- **Common Interests** (0-40 points): Shared hobbies and interests
- **Location Proximity** (0-25 points): Same city/country for meetup potential  
- **Professional Similarity** (0-15 points): Same or related professions
- **Profile Completeness** (0-10 points): Well-filled profiles indicate engagement
- **Activity Level** (0-10 points): Active community members
- **Diversity Bonus** (0-5 points): Different personality types for variety
- **New User Bonus** (0-5 points): Help newcomers get connected

**Use Cases:**
- Onboarding: Show new users potential connections
- Home screen: Display "People you might know" 
- Connection suggestions after profile updates
- Re-engagement: Suggest new connections to existing users

---

### Trending Interests
Get the most popular interests in the community for discovery and profile suggestions.

**Endpoint:** `GET /v2/users/trending-interests`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `limit` (optional): Number of interests to return (default: 10, max: 50)

**Example:**
```
GET /v2/users/trending-interests?limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "interests": [
      {
        "interest": "food",
        "count": 3
      },
      {
        "interest": "travel", 
        "count": 2
      },
      {
        "interest": "photography",
        "count": 2
      }
    ],
    "total": 10
  }
}
```

**Use Cases:**
- Profile setup: Suggest popular interests to new users
- Interest discovery: Help users find new hobbies
- Community insights: Understand what brings people together
- Search suggestions: Provide autocomplete for interest-based search

---

### Search Users
Search for users with comprehensive filtering including location-based search, trust scoring, activity filters, and connection management.

**Endpoint:** `GET /v2/users/search`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**

#### Basic Search & Profile Filters
- `query` (optional, string): Search term for name, username, or bio (case-insensitive)
- `city` (optional, string): Filter by current city (case-insensitive)
- `interest` (optional, string): Filter by specific interest (exact match)
- `gender` (optional, enum): Filter by gender (`MALE`, `FEMALE`, `NON_BINARY`, `OTHER`, `PREFER_NOT_TO_SAY`)
- `isVerified` (optional, boolean): Filter verified users only

#### Location-Based Filters
- `latitude` (optional, number): Latitude for distance calculations (-90 to 90)
- `longitude` (optional, number): Longitude for distance calculations (-180 to 180)
- `radius` (optional, number): Search radius in kilometers (1-500, requires latitude/longitude)
- `nearby` (optional, boolean): Find users within 50km (requires latitude/longitude)

#### Trust & Reputation Filters
- `minTrustScore` (optional, number): Minimum trust score (0-100)
- `maxTrustScore` (optional, number): Maximum trust score (0-100)
- `trustLevel` (optional, enum): Filter by trust level (`NEW`, `BUILDING`, `ESTABLISHED`, `TRUSTED`, `VERIFIED`)

#### Activity & Engagement Filters
- `minEventsAttended` (optional, number): Minimum number of events attended
- `hasHostedEvents` (optional, boolean): Filter users who have hosted events

#### Connection & Relationship Filters
- `connectionType` (optional, enum): Filter by connection status (`all`, `connected`, `not_connected`)
- `hasMutualFriends` (optional, boolean): Filter users with mutual connections (requires authentication)
- `excludeConnected` (optional, boolean): Exclude already connected users
- `includeMutualConnections` (optional, boolean): Include mutual connections data in response (default: false, opt-in for performance)

#### Sorting & Pagination
- `sortBy` (optional, enum): Sort field (`relevance`, `trustScore`, `distance`, `eventsAttended`)
- `sortOrder` (optional, enum): Sort direction (`asc`, `desc`, default: `desc`)
- `page` (optional, number): Page number (default: 1, min: 1)
- `limit` (optional, number): Items per page (default: 20, max: 100)

**Common Use Cases:**

1. **Nearby Verified Users:**
```
GET /v2/users/search?latitude=3.1390&longitude=101.6869&radius=10&isVerified=true&sortBy=distance
```

2. **High Trust Score Matches:**
```
GET /v2/users/search?minTrustScore=70&trustLevel=TRUSTED&interest=travel&sortBy=trustScore
```

3. **Active Community Members:**
```
GET /v2/users/search?hasHostedEvents=true&minEventsAttended=5&excludeConnected=true
```

4. **Location-Based with Interest:**
```
GET /v2/users/search?nearby=true&latitude=1.3521&longitude=103.8198&interest=food&city=singapore
```

5. **Include Mutual Connections (Social Discovery):**
```
GET /v2/users/search?interest=travel&includeMutualConnections=true&minTrustScore=50
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "fullName": "Jane Smith",
        "username": "janesmith",
        "role": "GENERAL_USER",
        "profile": {
          "profilePicture": "https://...",
          "bio": "Travel enthusiast and food lover",
          "shortBio": "Traveler | Artist",
          "interests": ["travel", "art", "food"],
          "gender": "FEMALE",
          "isVerified": true
        },
        "location": {
          "currentCity": "Kuala Lumpur",
          "latitude": 3.1390,
          "longitude": 101.6869
        },
        "stats": {
          "eventsHosted": 5,
          "eventsAttended": 23,
          "trustScore": 85
        },
        "distance": 2.5,
        "connectionStatus": "not_connected",
        "mutualConnectionsCount": 3,
        "mutualConnections": [
          {
            "id": "mutual_user_id_1",
            "fullName": "Sarah Johnson",
            "profilePicture": "https://..."
          },
          {
            "id": "mutual_user_id_2",
            "fullName": "Mike Chen",
            "profilePicture": "https://..."
          },
          {
            "id": "mutual_user_id_3",
            "fullName": "Emma Wilson",
            "profilePicture": "https://..."
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "pages": 1
    }
  }
}
```

**Response Fields:**
- `distance` (number, optional): Distance in kilometers (only when latitude/longitude provided)
- `connectionStatus` (string): User's connection relationship (`connected`, `pending`, `not_connected`)
- `mutualConnectionsCount` (number, optional): Total count of mutual connections (only when `includeMutualConnections=true`)
- `mutualConnections` (array, optional): Top 3 mutual connections with id, fullName, profilePicture (only when `includeMutualConnections=true`)
- `stats`: Activity statistics including events hosted/attended and trust score

**Performance Optimization:**
- Mutual connections are **opt-in** via `includeMutualConnections=true` parameter
- Uses batch fetching to avoid N+1 queries (only 3 DB queries regardless of result count)
- Default behavior (without parameter): No mutual connections data, zero overhead
- With parameter: ~50-100ms overhead for 20 users vs ~500-1000ms+ with naive implementation

**Search Logic:**
- All text filters are case-insensitive
- Multiple filters are combined with AND logic
- Automatically excludes blocked users and users who blocked you
- Distance calculations use Haversine formula for accuracy
- Trust score ranges validate min ≤ max
- Location-based searches require both latitude and longitude
- Results sorted by relevance by default, or by specified `sortBy` parameter

---

### Find Nearby Users (Geospatial)

**Endpoint:** `GET /v2/users/nearby`

**Description:** Find other users within a specified radius based on their location coordinates. Results are privacy-aware and only include users whose location privacy settings allow visibility to the requesting user. Uses the Haversine formula for accurate distance calculations and bounding box optimization for efficient queries.

**Authentication:** Required (Bearer Token)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| latitude | number | Yes | - | Latitude of search center point (-90 to 90) |
| longitude | number | Yes | - | Longitude of search center point (-180 to 180) |
| radius | number | No | 10 | Search radius in kilometers (1-500) |
| page | number | No | 1 | Page number for pagination |
| limit | number | No | 20 | Results per page (max 100) |

**Request Example:**

```bash
curl -X GET "https://api.berse.app/v2/users/nearby?latitude=3.1390&longitude=101.6869&radius=5&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "fullName": "Sarah Chen",
        "username": "sarahchen",
        "distance": 0.38,
        "distanceFormatted": "0.38 km",
        "profilePicture": "https://storage.berse.app/photos/user_123.jpg",
        "bio": "Digital nomad exploring Southeast Asia",
        "interests": ["food", "culture", "hiking"],
        "profession": "Software Developer",
        "location": {
          "city": "Kuala Lumpur",
          "currentLocation": "KLCC Area",
          "lastLocationUpdate": "2024-01-15T09:45:00.000Z"
        },
        "stats": {
          "totalConnections": 42,
          "connectionQuality": 85
        },
        "isConnected": true,
        "mutualConnectionsCount": 3,
        "mutualConnections": [
          {
            "id": "mutual_user_1",
            "fullName": "John Doe",
            "profilePicture": "https://..."
          },
          {
            "id": "mutual_user_2",
            "fullName": "Jane Smith",
            "profilePicture": "https://..."
          },
          {
            "id": "mutual_user_3",
            "fullName": "Mike Wilson",
            "profilePicture": "https://..."
          }
        ]
      },
      {
        "id": "user_456",
        "fullName": "Mike Johnson",
        "username": "mikej",
        "distance": 1.02,
        "distanceFormatted": "1.0 km",
        "profilePicture": "https://storage.berse.app/photos/user_456.jpg",
        "bio": "Adventure seeker and foodie",
        "interests": ["adventure", "food"],
        "profession": "Photographer",
        "location": {
          "city": "Kuala Lumpur",
          "currentLocation": "Bukit Bintang",
          "lastLocationUpdate": "2024-01-15T08:30:00.000Z"
        },
        "stats": {
          "totalConnections": 18,
          "connectionQuality": 72
        },
        "isConnected": false
      }
    ],
    "center": {
      "latitude": 3.1390,
      "longitude": 101.6869
    },
    "radius": 5,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 54,
      "pages": 3
    }
  }
}
```

**Response Structure:**
- **Flat Format**: Consistent with search and recommendations endpoints
- **Distance Fields**: Both numeric (km) and formatted string
- **Mutual Connections**: Optional (only when `includeMutualConnections=true`)
- **Location Privacy**: Respects user privacy settings

**Privacy Filtering Logic:**

The endpoint respects location privacy settings and only returns users based on these rules:

1. **Public (`locationPrivacy: "public"`)**: Visible to all users
2. **Friends (`locationPrivacy: "friends"`, default)**: Visible only to connected users
3. **Private (`locationPrivacy: "private"`)**: Hidden from all users

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique user identifier |
| fullName | string | User's full name |
| username | string | User's username |
| distance | number | Distance from search center in km |
| distanceFormatted | string | Formatted distance string (e.g., "1.5 km") |
| profilePicture | string | URL to profile photo |
| bio | string | User's bio |
| interests | string[] | Array of interests |
| profession | string | User's profession |
| location.city | string | Current city location |
| location.currentLocation | string | Specific location description |
| location.lastLocationUpdate | string | ISO 8601 timestamp of last location update |
| stats.totalConnections | number | Total number of connections |
| stats.connectionQuality | number | Connection quality score (0-100) |
| isConnected | boolean | Whether user is connected to requester |
| mutualConnectionsCount | number | Count of mutual connections (optional) |
| mutualConnections | array | Top 3 mutual connections (optional) |

**Error Responses:**

```json
// 400 Bad Request - Invalid coordinates
{
  "success": false,
  "error": "Invalid coordinates provided. Latitude must be between -90 and 90, longitude must be between -180 and 180"
}

// 400 Bad Request - Invalid radius
{
  "success": false,
  "error": "Radius must be between 1 and 500 km"
}

// 401 Unauthorized
{
  "success": false,
  "error": "Unauthorized - Authentication required"
}
```

**Performance Characteristics:**

- **Response Time**: 50-150ms average
- **Algorithm**: Haversine formula for distance calculation
- **Optimization**: Bounding box pre-filtering before distance calculation
- **Accuracy**: ±0.01 km (10 meters)
- **Scaling**: Handles up to 500 km radius efficiently

**Mobile Integration Example (React Native):**

```javascript
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export function useNearbyUsers(radius = 5) {
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const findNearbyUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      const { latitude, longitude } = location.coords;

      // Fetch nearby users
      const response = await fetch(
        `https://api.berse.app/v2/users/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch nearby users');
      }

      const data = await response.json();
      setNearbyUsers(data.data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { nearbyUsers, loading, error, findNearbyUsers };
}

// Usage in component
function NearbyUsersScreen() {
  const { nearbyUsers, loading, error, findNearbyUsers } = useNearbyUsers(10);

  useEffect(() => {
    findNearbyUsers();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <FlatList
      data={nearbyUsers}
      keyExtractor={(item) => item.userId}
      renderItem={({ item }) => (
        <UserCard
          user={item}
          distance={item.distance.formatted}
          onPress={() => navigation.navigate('Profile', { userId: item.userId })}
        />
      )}
    />
  );
}
```

**JavaScript (Web) Example:**

```javascript
async function findNearbyUsers(latitude, longitude, radius = 5) {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radius: radius.toString(),
      page: '1',
      limit: '20'
    });

    const response = await fetch(
      `https://api.berse.app/v2/users/nearby?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data.users;
  } catch (error) {
    console.error('Error fetching nearby users:', error);
    throw error;
  }
}

// Get user's current location and find nearby users
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      const nearbyUsers = await findNearbyUsers(latitude, longitude, 5);
      console.log('Found nearby users:', nearbyUsers);
    },
    (error) => {
      console.error('Error getting location:', error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  );
}
```

**Use Cases:**

- **Travel Buddy Finder**: Discover other travelers in your current city
- **Meetup Coordination**: Find nearby users for spontaneous meetups
- **Local Recommendations**: Connect with users who know the area
- **Safety Features**: Show nearby connected friends
- **Event Discovery**: Find users attending nearby events

**Best Practices:**

1. **Update Location Regularly**: Update user location periodically (every 5-10 minutes when app is active)
2. **Request Location Permissions**: Always request permissions before accessing device location
3. **Handle Permission Denial**: Provide fallback UI when location permission is denied
4. **Show Distance**: Always display distance to help users understand proximity
5. **Respect Privacy**: Explain location privacy settings to users
6. **Battery Optimization**: Use appropriate location accuracy settings to conserve battery
7. **Pagination**: Use pagination for large result sets to improve performance
8. **Cache Results**: Cache nearby users for 1-2 minutes to reduce API calls
9. **Error Handling**: Handle network errors and invalid coordinates gracefully
10. **Loading States**: Show loading indicators while fetching location and users

---

### Get User Profile by ID
View another user's profile with comprehensive relationship context, shared activities, and privacy-controlled data exposure. Use this for profile discovery, viewing community members, and connection management.

**Endpoint:** `GET /v2/users/:id`

**🔥 ENHANCED (v2.2.0):** Now includes relationship status, vouch information, trust compatibility, mutual connections, and shared activities.

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `id`: User UUID or CUID (the user you want to view)

**Example:**
```bash
GET /v2/users/cmh09ov6n0001cp7npzl1ahe2
```

**Important Notes:**
- ⚠️ **Cannot view your own profile** - Returns error directing you to `/users/me`
- Route defined after specific routes to prevent path conflicts
- Privacy settings control what data is visible based on your relationship

**Success Response (200) - Not Connected:**
```json
{
  "success": true,
  "data": {
    "relationship": {
      "connection": {
        "status": "NONE",
        "details": null
      },
      "vouch": {
        "status": "NONE",
        "details": null
      },
      "trustMatch": {
        "compatible": false,
        "currentUserLevel": "Established",
        "profileUserLevel": "Trusted",
        "difference": 2,
        "canVouch": true
      },
      "mutualConnections": {
        "count": 0,
        "topConnections": []
      }
    },
    "profile": {
      "id": "cmh09ov6n0001cp7npzl1ahe2",
      "fullName": "Sarah Ahmad",
      "displayName": "Sarah",
      "username": "sarahhost",
      "email": null,
      "phone": null,
      "profilePicture": "https://...",
      "bio": "Certified event host in KL...",
      "shortBio": "Event host & community builder",
      "location": {
        "city": "Kuala Lumpur",
        "country": "Malaysia",
        "coordinates": null
      },
      "birthDate": null,
      "age": null,
      "gender": "Female",
      "interests": ["events", "networking", "food"],
      "languages": ["en", "ms", "ar"],
      "profession": "Event Coordinator",
      "occupation": null,
      "personalityType": null,
      "travelStyle": null,
      "bucketList": [],
      "travelBio": null,
      "website": null,
      "socialLinks": {
        "instagram": "@sarah.events.kl",
        "linkedin": "sarahahmad"
      },
      "joinedAt": "2025-10-21T07:53:06.527Z",
      "lastActiveAt": null
    },
    "trust": {
      "score": 88,
      "level": "scout",
      "badges": [],
      "vouches": {
        "received": 1,
        "given": 3,
        "activePrimary": 1,
        "activeSecondary": 0
      },
      "verifications": {
        "email": true,
        "phone": true,
        "identity": false,
        "background": false
      }
    },
    "statistics": {
      "connections": {
        "total": 5,
        "thisMonth": 0
      },
      "communities": {
        "member": 0,
        "moderator": 0,
        "owner": 0
      },
      "events": {
        "attended": 0,
        "hosting": 3,
        "upcoming": 0
      },
      "marketplace": {
        "activeListings": 0,
        "soldItems": 0,
        "rating": 0,
        "transactions": 0
      },
      "travel": {
        "tripsCompleted": 0,
        "upcomingTrips": 0
      },
      "cardGame": {
        "played": 0,
        "won": 0,
        "currentStreak": 0
      }
    },
    "sharedActivities": {
      "communities": {
        "count": 1,
        "list": [
          {
            "id": "cmh09ozez0009cpb2v5p79f0u",
            "name": "Fitness & Wellness Warriors",
            "logo": "https://...",
            "memberSince": "2025-10-21T07:53:12.037Z",
            "roles": {
              "currentUser": "MEMBER",
              "profileUser": "OWNER"
            }
          }
        ]
      },
      "events": {
        "count": 0,
        "recent": []
      },
      "travelTrips": {
        "count": 0,
        "trips": []
      },
      "marketplaceInteractions": {
        "transactionCount": 0,
        "hasOpenConversations": false
      }
    },
    "recentActivity": {
      "highlights": [],
      "trustMoments": []
    },
    "privacy": {
      "profileVisibility": "public",
      "canMessage": true,
      "canVouch": false,
      "canConnect": true,
      "showEmail": false,
      "showPhone": false,
      "showBirthDate": false,
      "showLocation": true
    }
  }
}
```

**Success Response (200) - Pending Connection:**
```json
{
  "relationship": {
    "connection": {
      "status": "PENDING",
      "details": {
        "id": "conn_xyz123",
        "status": "PENDING",
        "isInitiator": true,
        "relationshipType": null,
        "connectedAt": null,
        "requestedAt": "2025-10-21T17:35:11.829Z"
      }
    },
    "vouch": {
      "status": "NONE",
      "details": null
    },
    "trustMatch": {
      "compatible": true,
      "currentUserLevel": "Established",
      "profileUserLevel": "Starter",
      "difference": 1,
      "canVouch": true
    },
    "mutualConnections": {
      "count": 2,
      "topConnections": [
        {
          "id": "user123",
          "fullName": "John Doe",
          "username": "johndoe",
          "profilePicture": "https://...",
          "trustScore": 72
        }
      ]
    }
  },
  "privacy": {
    "canMessage": true,
    "canVouch": false,
    "canConnect": false
  }
}
```

**Response Sections:**

1. **relationship** (always present when viewing others)
   - `connection.status`: NONE | PENDING | CONNECTED | BLOCKED
   - `vouch.status`: NONE | GIVEN | RECEIVED | MUTUAL | PENDING_OFFER
   - `trustMatch`: Compatibility between your trust levels
   - `mutualConnections`: Connections you have in common

2. **profile** (privacy-controlled)
   - `email`, `phone`, `birthDate`: Only shown if connected or privacy allows
   - All other profile fields follow user's privacy settings

3. **trust**
   - Trust score, level, badges
   - Vouch statistics (received, given, active)
   - Verification status

4. **statistics**
   - Comprehensive activity breakdown
   - 6 categories: connections, communities, events, marketplace, travel, cardGame

5. **sharedActivities** (always present, may be empty)
   - `communities`: Communities you both belong to
   - `events`: Events attended together
   - `travelTrips`: Shared travel experiences
   - `marketplaceInteractions`: Transaction history

6. **recentActivity**
   - Public activity highlights
   - Recent trust moments

7. **privacy**
   - Action permissions (canMessage, canVouch, canConnect)
   - Visibility flags (showEmail, showPhone, showBirthDate, showLocation)

**Error Responses:**
- `400` - "Use /users/me to view your own profile" (if viewing self)
- `404` - User not found

**Connection Status Values:**
- `NONE`: No relationship
- `PENDING`: Connection request sent/received
- `CONNECTED`: Active connection (note: stored as ACCEPTED in database)
- `BLOCKED`: One user has blocked the other

**Vouch Status Values:**
- `NONE`: No vouch relationship
- `GIVEN`: You vouched for this user
- `RECEIVED`: This user vouched for you
- `MUTUAL`: Both users vouched for each other
- `PENDING_OFFER`: Community vouch offer pending

**Use Cases:**
- Profile discovery and browsing
- Viewing community member profiles
- Checking connection status before sending request
- Seeing shared activities and communities
- Evaluating trust compatibility
- Finding mutual connections

**Privacy Behavior:**
- **Not Connected**: Only public profile data visible
- **Connected**: Email, phone visible (if privacy allows)
- **Blocked**: Minimal information, no shared activities
- **Birth Date**: Never shown when viewing others (privacy)

---

## Metadata Endpoints

These public endpoints provide configuration data for building filter UIs and forms. No authentication required.

### Get Trust Levels

Get all available trust levels with their configurations, score ranges, colors, and benefits.

**Endpoint:** `GET /v2/users/metadata/trust-levels`

**Authentication:** Not required (public endpoint)

**Example:**
```bash
curl http://localhost:3001/v2/users/metadata/trust-levels
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "trustLevels": [
      {
        "level": "new",
        "label": "New",
        "minScore": 0,
        "maxScore": 19,
        "color": "#9CA3AF",
        "description": "Just getting started",
        "icon": "🌱",
        "benefits": [
          "Create profile",
          "Join events",
          "Connect with others"
        ]
      },
      {
        "level": "starter",
        "label": "Starter",
        "minScore": 20,
        "maxScore": 39,
        "color": "#60A5FA",
        "description": "Building connections",
        "icon": "🌿",
        "benefits": [
          "All New benefits",
          "Host small events",
          "Request vouches"
        ]
      },
      {
        "level": "growing",
        "label": "Growing",
        "minScore": 40,
        "maxScore": 59,
        "color": "#34D399",
        "description": "Active community member",
        "icon": "🌳",
        "benefits": [
          "All Starter benefits",
          "Host medium events",
          "Vouch for others",
          "Access to premium events"
        ]
      },
      {
        "level": "established",
        "label": "Established",
        "minScore": 60,
        "maxScore": 74,
        "color": "#FBBF24",
        "description": "Trusted community member",
        "icon": "⭐",
        "benefits": [
          "All Growing benefits",
          "Host large events",
          "Priority support",
          "Special badges"
        ]
      },
      {
        "level": "trusted",
        "label": "Trusted",
        "minScore": 75,
        "maxScore": 89,
        "color": "#F59E0B",
        "description": "Highly trusted member",
        "icon": "🏆",
        "benefits": [
          "All Established benefits",
          "Featured profile",
          "Verification fast-track",
          "Community moderator eligibility"
        ]
      },
      {
        "level": "elite",
        "label": "Elite",
        "minScore": 90,
        "maxScore": 100,
        "color": "#8B5CF6",
        "description": "Top tier community leader",
        "icon": "👑",
        "benefits": [
          "All Trusted benefits",
          "VIP event access",
          "Leadership opportunities",
          "Exclusive community features",
          "Revenue sharing eligibility"
        ]
      }
    ]
  }
}
```

**Use Cases:**
- Filter modal dropdowns for trust level selection
- Display trust level badges in UI
- Show trust level benefits on profile pages
- Calculate progress to next level

---

### Get Gender Options

Get all available gender options for user profiles.

**Endpoint:** `GET /v2/users/metadata/gender-options`

**Authentication:** Not required (public endpoint)

**Example:**
```bash
curl http://localhost:3001/v2/users/metadata/gender-options
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "genderOptions": [
      { "value": "MALE", "label": "Male" },
      { "value": "FEMALE", "label": "Female" },
      { "value": "NON_BINARY", "label": "Non-binary" },
      { "value": "PREFER_NOT_TO_SAY", "label": "Prefer not to say" },
      { "value": "OTHER", "label": "Other" }
    ]
  }
}
```

**Use Cases:**
- Profile setup forms
- Gender filter dropdowns
- User preferences

---

### Get Interest Categories

Get all available interest categories with their specific interests.

**Endpoint:** `GET /v2/users/metadata/interest-categories`

**Authentication:** Not required (public endpoint)

**Example:**
```bash
curl http://localhost:3001/v2/users/metadata/interest-categories
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "interestCategories": [
      {
        "category": "Adventure",
        "interests": ["Hiking", "Camping", "Rock Climbing", "Surfing", "Skiing", "Scuba Diving"]
      },
      {
        "category": "Arts & Culture",
        "interests": ["Museums", "Art Galleries", "Theater", "Music Concerts", "Photography", "Dance"]
      },
      {
        "category": "Food & Drink",
        "interests": ["Cooking", "Fine Dining", "Street Food", "Wine Tasting", "Coffee", "Craft Beer"]
      },
      {
        "category": "Sports & Fitness",
        "interests": ["Running", "Yoga", "Gym", "Cycling", "Swimming", "Martial Arts", "Team Sports"]
      },
      {
        "category": "Technology",
        "interests": ["Coding", "Gaming", "AI/ML", "Startups", "Cryptocurrency", "Web3"]
      },
      {
        "category": "Social Impact",
        "interests": ["Volunteering", "Environment", "Education", "Community Service", "Sustainability"]
      },
      {
        "category": "Learning",
        "interests": ["Languages", "Reading", "Writing", "History", "Science", "Philosophy"]
      },
      {
        "category": "Entertainment",
        "interests": ["Movies", "TV Shows", "Anime", "Board Games", "Comedy", "Podcasts"]
      },
      {
        "category": "Lifestyle",
        "interests": ["Fashion", "Beauty", "Wellness", "Meditation", "Personal Development", "Travel"]
      },
      {
        "category": "Business",
        "interests": ["Entrepreneurship", "Investing", "Marketing", "Networking", "Real Estate"]
      }
    ]
  }
}
```

**Use Cases:**
- Interest picker UI with categories
- Filter modal interest dropdowns
- Profile setup with grouped interests
- Search autocomplete suggestions
- Recommendation algorithm inputs

---

## Social Connections

The connection system allows users to build trusted relationships with detailed context about their connections. The system supports sending connection requests, accepting/rejecting requests, and managing existing connections.

### Get Connections
Get user's connections with optional status filter.

**Endpoint:** `GET /v2/users/connections`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status` (optional): Filter by connection status (PENDING, ACCEPTED, REJECTED, CANCELED, REMOVED)
- `page` (optional): Page number (default: 1, min: 1) *(Validated v2.0.1)*
- `limit` (optional): Results per page (default: 20, max: 100) *(Validated v2.0.1)*

**Example:**
```
GET /v2/users/connections?status=ACCEPTED&page=1&limit=20
```

**Notes:** *(v2.0.1)*
- Returns connections where user is either initiator or receiver
- Pagination parameters are validated and sanitized
- Invalid negative page numbers are corrected to 1

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "connections": [
      {
        "id": "connection_uuid",
        "initiatorId": "uuid1",
        "receiverId": "uuid2",
        "status": "ACCEPTED",
        "message": "Met at the architecture conference",
        "relationshipType": "Architecture Colleague",
        "relationshipCategory": "professional",
        "trustStrength": 75.5,
        "interactionCount": 12,
        "mutualFriendsCount": 5,
        "badges": ["Most Trusted", "Frequent Collaborator"],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "connectedAt": "2024-01-01T00:15:00.000Z",
        "initiator": {
          "id": "uuid1",
          "fullName": "John Doe",
          "username": "johndoe",
          "profile": {
            "profilePicture": "https://...",
            "bio": "Architect..."
          }
        },
        "receiver": {
          "id": "uuid2",
          "fullName": "Jane Smith",
          "username": "janesmith",
          "profile": {
            "profilePicture": "https://...",
            "bio": "Designer..."
          }
        }
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

### Send Connection Request
Send a connection request to another user.

**Endpoint:** `POST /v2/users/connections/:id/request`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**URL Parameters:**
- `id`: Target user UUID

**Request Body (optional):**
```json
{
  "message": "Hi! I'd love to connect. Met you at the photography workshop!",
  "relationshipType": "Photography Mentor",
  "relationshipCategory": "professional"
}
```

**Fields:**
- `message` (optional): Personal message with the request
- `relationshipType` (optional): Custom label (e.g., "Travel Buddy", "Colleague")
- `relationshipCategory` (optional): Category (professional, friend, family, mentor, travel, community)

**Example:**
```
POST /v2/users/connections/550e8400-e29b-41d4-a716-446655440000/request
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Connection request sent successfully",
  "data": {
    "id": "connection_uuid",
    "initiatorId": "your_uuid",
    "receiverId": "their_uuid",
    "status": "PENDING",
    "message": "Hi! I'd love to connect...",
    "relationshipType": "Photography Mentor",
    "relationshipCategory": "professional",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "initiator": {
      "id": "your_uuid",
      "fullName": "Your Name",
      "username": "yourname",
      "profile": {
        "profilePicture": "https://..."
      }
    },
    "receiver": {
      "id": "their_uuid",
      "fullName": "Their Name"
    }
  }
}
```

**Error Responses:**
- `400` - Cannot send connection request to yourself
- `400` - Connection request already pending
- `400` - Already connected with this user
- `400` - Cannot reconnect until [date] (if previously removed with cooldown)
- `404` - User not found
- `400` - Cannot send request to inactive user

**What Happens:**
1. Creates a `UserConnection` with unique ID (using cuid2) *(Fixed v2.0.1)*
2. Sets status to "PENDING"
3. Sends a notification to the target user
4. Replaces any old REMOVED connections if cooldown period has passed

**Technical Notes:** *(v2.0.1)*
- Connection IDs are now properly generated using cuid2 for uniqueness
- All connection operations are wrapped in database transactions
- Proper validation ensures only active users can receive requests

---

### Accept Connection Request
Accept a pending connection request.

**Endpoint:** `POST /v2/users/connections/:id/accept`

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `id`: Connection UUID (not user UUID)

**Example:**
```
POST /v2/users/connections/connection-uuid-here/accept
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Connection request accepted",
  "data": {
    "id": "connection_uuid",
    "initiatorId": "their_uuid",
    "receiverId": "your_uuid",
    "status": "ACCEPTED",
    "respondedAt": "2024-01-15T10:35:00.000Z",
    "connectedAt": "2024-01-15T10:35:00.000Z",
    "initiator": {
      "id": "their_uuid",
      "fullName": "Their Name",
      "profile": {
        "profilePicture": "https://..."
      }
    },
    "receiver": {
      "id": "your_uuid",
      "fullName": "Your Name",
      "profile": {
        "profilePicture": "https://..."
      }
    }
  }
}
```

**Error Responses:**
- `403` - You can only accept requests sent to you
- `404` - Connection request not found
- `400` - Connection request is not pending

**What Happens:**
1. Updates connection status to "ACCEPTED"
2. Sets `respondedAt` and `connectedAt` timestamps
3. Sends notification to the initiator

---

### Reject Connection Request
Reject a pending connection request.

**Endpoint:** `POST /v2/users/connections/:id/reject`

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `id`: Connection UUID

**Example:**
```
POST /v2/users/connections/connection-uuid-here/reject
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Connection request rejected",
  "data": null
}
```

**Error Responses:**
- `403` - You can only reject requests sent to you
- `404` - Connection request not found
- `400` - Connection request is not pending

---

### Cancel Connection Request
Cancel a connection request you sent (before it's accepted).

**Endpoint:** `POST /v2/users/connections/:id/cancel`

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `id`: Connection UUID

**Example:**
```
POST /v2/users/connections/connection-uuid-here/cancel
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Connection request canceled",
  "data": null
}
```

**Error Responses:**
- `403` - You can only cancel requests you sent
- `404` - Connection request not found
- `400` - Can only cancel pending requests

---

### Remove Connection
Disconnect from a user (removes an accepted connection).

**Endpoint:** `DELETE /v2/users/connections/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `id`: Connection UUID

**Example:**
```
DELETE /v2/users/connections/connection-uuid-here
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Connection removed successfully",
  "data": {
    "canReconnectAt": "2024-02-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `403` - You can only remove your own connections
- `404` - Connection not found
- `400` - Can only remove accepted connections

**Notes:**
- Sets status to "REMOVED" (soft delete, preserves history)
- Enforces 30-day cooldown before reconnecting
- Either party can remove the connection

**Authorization:** *(Fixed v2.0.1)*
- Users can now properly remove their own connections
- Authorization check validates user is either initiator or receiver
- Does not require admin access (previous bug fixed)

---

## Activity & Security

The Activity & Security endpoints allow users to monitor their account activity, review security events, manage active sessions, and view login history. These features help users maintain account security and track their interactions with the platform.

### Get User Activity History

Get the authenticated user's activity history with pagination.

**Endpoint:** `GET /v2/users/activity`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `limit` (optional): Number of activities to return (default: 50, max: 100)
- `offset` (optional): Number of activities to skip (default: 0)

**Example:**
```
GET /v2/users/activity?limit=20&offset=0
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "activity_uuid",
        "userId": "user_uuid",
        "activityType": "AUTH_LOGIN",
        "entityType": "user",
        "entityId": "user_uuid",
        "visibility": "private",
        "createdAt": "2025-10-15T14:20:19.000Z"
      },
      {
        "id": "activity_uuid_2",
        "userId": "user_uuid",
        "activityType": "PROFILE_UPDATE",
        "entityType": "user",
        "entityId": "user_uuid",
        "visibility": "private",
        "createdAt": "2025-10-15T10:15:30.000Z"
      },
      {
        "id": "activity_uuid_3",
        "userId": "user_uuid",
        "activityType": "CONNECTION_REQUEST_SEND",
        "entityType": "connection",
        "entityId": "connection_uuid",
        "visibility": "friends",
        "createdAt": "2025-10-14T16:45:00.000Z"
      }
    ],
    "pagination": {
      "limit": 20,
      "offset": 0,
      "total": 150,
      "pages": 8
    }
  },
  "message": "User activity retrieved successfully"
}
```

**Activity Types:**

Authentication:
- `AUTH_REGISTER` - User registration
- `AUTH_LOGIN` - User login
- `AUTH_LOGOUT` - User logout
- `AUTH_LOGOUT_ALL` - Logout from all devices
- `AUTH_TOKEN_REFRESH` - Token refresh
- `AUTH_PASSWORD_CHANGE` - Password change
- `AUTH_PASSWORD_RESET_REQUEST` - Password reset request
- `AUTH_PASSWORD_RESET_COMPLETE` - Password reset complete
- `AUTH_EMAIL_VERIFY_REQUEST` - Email verification request
- `AUTH_EMAIL_VERIFY_COMPLETE` - Email verification complete
- `AUTH_MFA_ENABLE` - MFA enabled
- `AUTH_MFA_DISABLE` - MFA disabled

Profile:
- `PROFILE_UPDATE` - Profile updated
- `PROFILE_PICTURE_UPDATE` - Profile picture updated
- `PROFILE_VIEW` - Profile viewed
- `PROFILE_DELETE` - Profile deleted

Connections:
- `CONNECTION_REQUEST_SEND` - Connection request sent
- `CONNECTION_REQUEST_ACCEPT` - Connection request accepted
- `CONNECTION_REQUEST_REJECT` - Connection request rejected
- `CONNECTION_REMOVE` - Connection removed

Events:
- `EVENT_CREATE` - Event created
- `EVENT_UPDATE` - Event updated
- `EVENT_DELETE` - Event deleted
- `EVENT_VIEW` - Event viewed
- `EVENT_RSVP` - Event RSVP
- `EVENT_CANCEL_RSVP` - Event RSVP cancelled
- `EVENT_CHECKIN` - Event check-in

And many more activity types for marketplace, points, notifications, and admin actions.

**Visibility Levels:**
- `public` - Visible to all users
- `friends` - Visible to connections only
- `private` - Visible only to the user

**Error Responses:**
- `401` - Unauthorized (invalid or missing token)

---

### Get Security Events

Get the authenticated user's security event history with pagination.

**Endpoint:** `GET /v2/users/security-events`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `limit` (optional): Number of events to return (default: 50, max: 100)
- `offset` (optional): Number of events to skip (default: 0)

**Example:**
```
GET /v2/users/security-events?limit=20&offset=0
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "event_uuid",
        "userId": "user_uuid",
        "eventType": "LOGIN_SUCCESS",
        "severity": "low",
        "description": "Successful login",
        "metadata": {
          "identifier": "user@example.com"
        },
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2025-10-15T14:20:19.000Z"
      },
      {
        "id": "event_uuid_2",
        "userId": "user_uuid",
        "eventType": "PASSWORD_CHANGE",
        "severity": "medium",
        "description": "Password changed successfully",
        "metadata": {},
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2025-10-14T09:30:00.000Z"
      },
      {
        "id": "event_uuid_3",
        "userId": "user_uuid",
        "eventType": "BRUTE_FORCE_ATTEMPT",
        "severity": "high",
        "description": "Multiple failed login attempts detected (5 attempts in 15 minutes)",
        "metadata": {
          "identifier": "user@example.com",
          "ipAddress": "123.45.67.89",
          "failedAttempts": 5
        },
        "ipAddress": "123.45.67.89",
        "userAgent": "curl/7.68.0",
        "createdAt": "2025-10-13T22:15:00.000Z"
      }
    ],
    "pagination": {
      "limit": 20,
      "offset": 0,
      "total": 45,
      "pages": 3
    }
  },
  "message": "Security events retrieved successfully"
}
```

**Event Types:**
- `LOGIN_SUCCESS` - Successful login
- `LOGIN_FAILED` - Failed login attempt
- `BRUTE_FORCE_ATTEMPT` - Multiple failed login attempts detected
- `PASSWORD_CHANGE` - Password changed
- `SESSION_TERMINATE` - Session terminated
- `SUSPICIOUS_LOGIN` - Suspicious login activity
- `ACCOUNT_LOCK` - Account locked
- `ACCOUNT_UNLOCK` - Account unlocked
- `DEVICE_REGISTER` - New device registered
- `DEVICE_REMOVE` - Device removed

**Severity Levels:**
- `low` - Normal operations (successful login, etc.)
- `medium` - Notable events (password change, new device, etc.)
- `high` - Suspicious activity (brute force attempts, unusual location, etc.)
- `critical` - Security breaches or critical events

**Error Responses:**
- `401` - Unauthorized (invalid or missing token)

---

### Get Active Sessions

Get all active sessions for the authenticated user.

**Endpoint:** `GET /v2/users/sessions`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Example:**
```
GET /v2/users/sessions
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session_uuid",
        "userId": "user_uuid",
        "sessionToken": "abc123def456...",
        "deviceInfo": {
          "platform": "iOS",
          "appVersion": "1.2.3",
          "os": "iOS 17.0",
          "deviceId": "device_123"
        },
        "ipAddress": "192.168.1.1",
        "userAgent": "BerseApp/1.2.3 (iPhone; iOS 17.0)",
        "locationData": {
          "city": "Kuala Lumpur",
          "country": "Malaysia"
        },
        "isActive": true,
        "lastActivityAt": "2025-10-15T14:20:19.000Z",
        "expiresAt": "2025-11-14T14:20:19.000Z",
        "createdAt": "2025-10-15T10:30:00.000Z"
      },
      {
        "id": "session_uuid_2",
        "userId": "user_uuid",
        "sessionToken": "xyz789uvw012...",
        "deviceInfo": {
          "platform": "web",
          "appVersion": "unknown",
          "os": "macOS",
          "deviceId": "unknown"
        },
        "ipAddress": "192.168.1.5",
        "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
        "locationData": null,
        "isActive": true,
        "lastActivityAt": "2025-10-15T12:45:30.000Z",
        "expiresAt": "2025-11-14T10:00:00.000Z",
        "createdAt": "2025-10-14T10:00:00.000Z"
      }
    ]
  },
  "message": "Active sessions retrieved successfully"
}
```

**Session Fields:**
- `id` - Unique session identifier
- `sessionToken` - Session token (used for authentication)
- `deviceInfo` - Information about the device
  - `platform` - Device platform (iOS, Android, web)
  - `appVersion` - Application version
  - `os` - Operating system
  - `deviceId` - Unique device identifier
- `ipAddress` - IP address of the session
- `userAgent` - Browser/app user agent string
- `locationData` - Geographic location data (if available)
- `isActive` - Whether the session is currently active
- `lastActivityAt` - Last activity timestamp
- `expiresAt` - Session expiration timestamp (30 days from creation)
- `createdAt` - Session creation timestamp

**Use Cases:**
- View all active sessions across devices
- Identify unfamiliar devices or locations
- Manage and terminate suspicious sessions
- Track login activity across platforms

**Error Responses:**
- `401` - Unauthorized (invalid or missing token)

---

### Get Login History

Get the authenticated user's login attempt history with pagination.

**Endpoint:** `GET /v2/users/login-history`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `limit` (optional): Number of login attempts to return (default: 50, max: 100)
- `offset` (optional): Number of login attempts to skip (default: 0)

**Example:**
```
GET /v2/users/login-history?limit=20&offset=0
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "loginHistory": [
      {
        "id": "attempt_uuid",
        "userId": "user_uuid",
        "identifier": "user@example.com",
        "ipAddress": "192.168.1.1",
        "userAgent": "BerseApp/1.2.3 (iPhone; iOS 17.0)",
        "success": true,
        "failureReason": null,
        "attemptedAt": "2025-10-15T14:20:19.000Z"
      },
      {
        "id": "attempt_uuid_2",
        "userId": "user_uuid",
        "identifier": "user@example.com",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0 (Macintosh...)...",
        "success": true,
        "failureReason": null,
        "attemptedAt": "2025-10-14T10:00:00.000Z"
      },
      {
        "id": "attempt_uuid_3",
        "userId": "user_uuid",
        "identifier": "user@example.com",
        "ipAddress": "123.45.67.89",
        "userAgent": "curl/7.68.0",
        "success": false,
        "failureReason": "Invalid password",
        "attemptedAt": "2025-10-13T22:15:30.000Z"
      }
    ],
    "pagination": {
      "limit": 20,
      "offset": 0,
      "total": 250,
      "pages": 13
    }
  },
  "message": "Login history retrieved successfully"
}
```

**Login Attempt Fields:**
- `id` - Unique attempt identifier
- `userId` - User ID (null for failed attempts with invalid identifier)
- `identifier` - Email, username, or phone used for login
- `ipAddress` - IP address of the attempt
- `userAgent` - Browser/app user agent string
- `success` - Whether the login was successful
- `failureReason` - Reason for failure (if applicable)
  - "Invalid password"
  - "User not found"
  - "Account locked"
  - "Email not verified"
  - etc.
- `attemptedAt` - Timestamp of the login attempt

**Security Features:**
- Tracks both successful and failed login attempts
- Logs IP addresses and user agents
- Helps identify suspicious activity
- After 3 failed attempts in 15 minutes, logs a high-severity security event
- Supports account lockout after multiple failed attempts

**Use Cases:**
- Review recent login activity
- Identify unfamiliar IP addresses or locations
- Investigate failed login attempts
- Monitor for brute force attacks
- Track login patterns across devices

**Error Responses:**
- `401` - Unauthorized (invalid or missing token)

---

### Terminate Session

Terminate a specific active session by session token.

**Endpoint:** `DELETE /v2/users/sessions/:sessionToken`

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `sessionToken` (required): The session token to terminate

**Example:**
```
DELETE /v2/users/sessions/abc123def456ghi789jkl012
```

**Success Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Session terminated successfully"
}
```

**What Happens:**
1. The specified session is marked as inactive (`isActive: false`)
2. The user associated with that session will be logged out on their next API request
3. A security event is logged for session termination

**Use Cases:**
- Log out from a specific device remotely
- Terminate suspicious sessions
- Force logout when device is lost or stolen
- Clean up old/unused sessions

**Security Notes:**
- Only the session owner can terminate their own sessions
- The current session (the one making the request) can also be terminated
- Terminating your current session will log you out immediately

**Error Responses:**
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (trying to terminate another user's session)
- `404` - Session not found

**Example Use Case:**
```javascript
// Terminate an unfamiliar session
const sessions = await getUserSessions();
const suspiciousSession = sessions.find(s => 
  s.ipAddress === '123.45.67.89' && s.deviceInfo.platform === 'web'
);

if (suspiciousSession) {
  await terminateSession(suspiciousSession.sessionToken);
  console.log('Suspicious session terminated');
}
```

---

## Admin

### Delete User
Soft delete a user account (Admin only).

**Endpoint:** `DELETE /v2/users/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `id`: User UUID to delete

**Example:**
```
DELETE /v2/users/550e8400-e29b-41d4-a716-446655440000
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

**Error Responses:**
- `403` - Unauthorized (Admin access required)
- `404` - User not found

**Admin Access:**
- Users with role "ADMIN"
- Hardcoded admin email: zaydmahdaly@ahlumran.org

**Notes:**
- This is a soft delete (status changed to "DEACTIVATED")
- User data is preserved but account is deactivated
- User cannot log in after deletion

---

## Location & Privacy

### Location Privacy Settings

The Berse App provides a three-tier location privacy system that gives users control over who can see their location coordinates through the geospatial search feature.

**Privacy Levels:**

| Level | Value | Description | Visibility |
|-------|-------|-------------|------------|
| Public | `"public"` | Location visible to all users | Anyone can see you in nearby search |
| Friends | `"friends"` | Location visible only to connections | Only accepted connections can see you (default) |
| Private | `"private"` | Location hidden from everyone | You won't appear in nearby search |

**Default Setting:** `"friends"` - balances discoverability with privacy

**Privacy Field:** `locationPrivacy` (string field in user profile)

---

### Update Location Privacy

**Endpoint:** `PATCH /v2/users/profile`

**Description:** Update your location privacy setting to control who can see your coordinates in the nearby users search.

**Request Body:**

```json
{
  "locationPrivacy": "friends"
}
```

**Example Request:**

```bash
curl -X PATCH "https://api.berse.app/v2/users/profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"locationPrivacy": "public"}'
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "userId": "user_123",
    "profile": {
      "locationPrivacy": "public"
    }
  }
}
```

**Valid Values:**
- `"public"` - Visible to all users
- `"friends"` - Visible only to connections (default)
- `"private"` - Hidden from everyone

---

### Update Location with Coordinates

**Endpoint:** `PATCH /v2/users/profile`

**Description:** Update your current location coordinates. These coordinates are used for the geospatial nearby search feature and are subject to your `locationPrivacy` settings.

**Request Body:**

```json
{
  "latitude": 3.1390,
  "longitude": 101.6869,
  "currentCity": "Kuala Lumpur",
  "countryOfResidence": "Malaysia"
}
```

**Example Request:**

```bash
curl -X PATCH "https://api.berse.app/v2/users/profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 3.1390,
    "longitude": 101.6869,
    "currentCity": "Kuala Lumpur",
    "countryOfResidence": "Malaysia"
  }'
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "userId": "user_123",
    "location": {
      "latitude": 3.1390,
      "longitude": 101.6869,
      "currentCity": "Kuala Lumpur",
      "countryOfResidence": "Malaysia",
      "lastLocationUpdate": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Coordinate Validation:**
- **Latitude**: -90 to 90
- **Longitude**: -180 to 180
- Invalid coordinates will return a 400 error

**Mobile Location Update Example (React Native):**

```javascript
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export function useLocationUpdate() {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const updateUserLocation = async () => {
    try {
      setUpdating(true);
      setError(null);

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      const { latitude, longitude } = location.coords;

      // Reverse geocode to get city name (optional)
      const [geocode] = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      // Update user profile with new coordinates
      const response = await fetch('https://api.berse.app/v2/users/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          latitude,
          longitude,
          currentCity: geocode?.city || undefined,
          countryOfResidence: geocode?.country || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update location');
      }

      const data = await response.json();
      console.log('Location updated successfully:', data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Location update error:', err);
    } finally {
      setUpdating(false);
    }
  };

  return { updateUserLocation, updating, error };
}

// Usage in component
function LocationTracker() {
  const { updateUserLocation, updating, error } = useLocationUpdate();

  // Update location every 5 minutes while app is active
  useEffect(() => {
    updateUserLocation();
    const interval = setInterval(updateUserLocation, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return null; // Background component
}
```

**JavaScript (Web) Example:**

```javascript
async function updateLocation() {
  if (!navigator.geolocation) {
    throw new Error('Geolocation not supported');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch('https://api.berse.app/v2/users/profile', {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ latitude, longitude })
          });

          if (!response.ok) {
            throw new Error('Failed to update location');
          }

          const data = await response.json();
          resolve(data);
        } catch (error) {
          reject(error);
        }
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
}

// Update location on app start and every 5 minutes
updateLocation();
setInterval(updateLocation, 5 * 60 * 1000);
```

---

### Privacy & Location Best Practices

**For Developers:**

1. **Always Request Permissions**
   - Request location permissions before accessing device GPS
   - Explain why location is needed (e.g., "Find nearby travelers")
   - Provide a way to skip or deny permission

2. **Respect User Privacy**
   - Honor the `locationPrivacy` setting in all features
   - Don't store or cache location data longer than necessary
   - Never share location with third parties without consent

3. **Update Frequency**
   - Update location every 5-10 minutes when app is active
   - Use background updates sparingly to save battery
   - Don't update location when user is stationary

4. **Battery Optimization**
   - Use appropriate accuracy levels (High accuracy for nearby search, Low accuracy for city-level)
   - Cache location for 1-2 minutes before fetching new coordinates
   - Disable location updates when app is in background (unless required)

5. **Error Handling**
   - Handle permission denial gracefully
   - Provide fallback UI when location is unavailable
   - Show clear error messages for invalid coordinates

**For Users:**

1. **Privacy Controls**
   - Set `locationPrivacy` to `"friends"` for balanced privacy (default)
   - Use `"public"` to maximize discoverability
   - Use `"private"` when you don't want to be found

2. **Location Accuracy**
   - Keep location updated for accurate nearby search results
   - Update location when you arrive in a new city
   - Consider disabling precise location when not needed

3. **Security Tips**
   - Review your location privacy settings regularly
   - Be aware that connected friends can see your location (if set to "friends")
   - Set location to "private" in sensitive situations

---

### Location Privacy FAQ

**Q: Who can see my location coordinates?**

A: It depends on your `locationPrivacy` setting:
- `"public"`: All users can see your location in nearby search
- `"friends"` (default): Only your accepted connections can see your location
- `"private"`: No one can see your location

**Q: Can I see who viewed my location?**

A: No, location views are not tracked for privacy reasons.

**Q: How accurate is the location data?**

A: Location accuracy depends on your device's GPS. The nearby search uses the Haversine formula for accurate distance calculations (±10 meters).

**Q: Will updating my location drain my battery?**

A: Location updates use minimal battery when done periodically (every 5-10 minutes). Avoid continuous tracking for best battery life.

**Q: Can I use the nearby search without sharing my location?**

A: Yes! Set your `locationPrivacy` to `"private"` to search for nearby users without appearing in their results.

**Q: What happens if I don't provide location coordinates?**

A: You can still use all other features of the app. However, you won't appear in nearby search results and won't be able to use the nearby users feature.

**Q: Is my exact address visible to other users?**

A: No, only your approximate coordinates are visible (rounded to 4 decimal places, ~11 meters accuracy). City names are shown but not street addresses.

---

## Data Models

### User Profile Structure
```typescript
interface UserProfile {
  // Core Identity
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  username?: string;
  role: 'GENERAL_USER' | 'ADMIN' | 'MODERATOR';
  status: 'ACTIVE' | 'DEACTIVATED' | 'BANNED' | 'PENDING';
  totalPoints: number;
  trustScore: number;       // 0-100 trust score (40% vouches + 30% activity + 30% trust moments)
  trustLevel: string;       // NEW, BUILDING, ESTABLISHED, TRUSTED, VERIFIED
  
  // Profile
  profile?: {
    displayName?: string;
    profilePicture?: string;
    bio?: string;
    shortBio?: string;
    dateOfBirth?: Date;
    gender?: string;
    age?: number;
    profession?: string;
    occupation?: string;
    website?: string;
    personalityType?: string;
    interests: string[];
    languages: string[];
    instagramHandle?: string;
    linkedinHandle?: string;
    travelStyle?: string;
    bucketList: string[];
    travelBio?: string;
  };
  
  // Location
  location?: {
    currentCity?: string;
    countryOfResidence?: string;
    currentLocation?: string;
    nationality?: string;
    originallyFrom?: string;
    latitude?: number;
    longitude?: number;
    lastLocationUpdate?: Date;
    timezone?: string;
    preferredLanguage?: string;
    currency?: string;
  };
  
  // Location Privacy
  locationPrivacy: 'public' | 'friends' | 'private'; // Default: 'friends'
  
  // Security
  security?: {
    emailVerifiedAt?: Date;     // Null if email not verified
    phoneVerifiedAt?: Date;     // Null if phone not verified
    mfaEnabled: boolean;        // Multi-factor authentication status
    lastLoginAt?: Date;         // Last successful login timestamp
  };
  
  // Metadata
  metadata?: {
    membershipId?: string;
    referralCode: string;
  };
  
  // Connection Stats
  connectionStats?: {
    totalConnections: number;    // Total accepted connections
    pendingRequests: number;     // Pending connection requests
    averageRating?: number;      // Average rating from connections (1-5)
  };
  
  // Stats
  _count?: {
    events: number;
    eventRsvps: number;
    userBadges: number;
    connectionsInitiated: number;  // Connection requests sent by this user
    connectionsReceived: number;   // Connection requests received by this user
    referralsMade: number;         // Number of users referred by this user
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### UserConnection Model
```typescript
interface UserConnection {
  id: string;
  initiatorId: string;      // User who sent the request
  receiverId: string;       // User who received the request
  status: ConnectionStatus;
  message?: string;         // Optional message with request
  
  // Relationship Context
  relationshipType?: string;        // "Architecture Colleague", "Travel Buddy"
  relationshipCategory?: string;    // professional, friend, family, mentor, travel, community
  howWeMet?: string;                // "Met at conference"
  
  // Trust & Quality Metrics
  trustStrength: number;            // 0-100 calculated trust
  interactionCount: number;         // Number of interactions
  lastInteraction?: Date;
  
  // Badges & Tags
  badges: string[];                 // ["Most Trusted", "Close Friend"]
  tags: string[];                   // Custom tags
  
  // Mutual Connections
  mutualFriendsCount: number;
  mutualCommunitiesCount: number;
  
  // Timestamps
  createdAt: Date;                  // Request sent
  respondedAt?: Date;               // Request accepted/rejected
  connectedAt?: Date;               // Connection established
  removedAt?: Date;                 // Connection removed
  removedBy?: string;               // User ID who removed
  canReconnectAt?: Date;            // Reconnection cooldown (30 days)
}

type ConnectionStatus = 
  | 'PENDING'      // Request sent, awaiting response
  | 'ACCEPTED'     // Connected (mutual relationship)
  | 'REJECTED'     // Request rejected by receiver
  | 'CANCELED'     // Request canceled by initiator
  | 'REMOVED';     // Connection was removed by either party
```

### ConnectionStats Model
```typescript
interface ConnectionStats {
  userId: string;
  
  // Connection Counts
  totalConnections: number;
  pendingRequests: number;
  sentRequests: number;
  
  // Relationship Breakdown
  professionalConnections: number;
  friendConnections: number;
  familyConnections: number;
  mentorConnections: number;
  travelConnections: number;
  communityConnections: number;
  
  // Trust Metrics
  averageRating?: number;          // Average rating received
  highestRating?: number;
  totalReviewsReceived: number;
  totalReviewsGiven: number;
  
  // Trust Network
  totalMutualFriends: number;
  trustChainDepth: number;         // Degrees of connection
  connectionQuality: number;       // 0-100 score
  
  lastCalculatedAt: Date;
}
```

---

## Examples

### JavaScript/Fetch

**Get Profile:**
```javascript
const getProfile = async () => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('https://api.berse-app.com/v2/users/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  return data.data;
};
```

**Update Profile:**
```javascript
const updateProfile = async (updates) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('https://api.bersemuka.com/v2/users/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  const data = await response.json();
  return data.data;
};

// Usage
await updateProfile({
  bio: 'Updated bio...',
  interests: ['travel', 'photography'],
  currentCity: 'Kuala Lumpur',
});
```

**Upload Avatar:**
```javascript
const uploadAvatar = async (file) => {
  const token = localStorage.getItem('accessToken');
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await fetch('https://api.berse-app.com/v2/users/upload-avatar', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  const data = await response.json();
  return data.data.profilePicture;
};
```

**Search Users:**
```javascript
const searchUsers = async (filters) => {
  const token = localStorage.getItem('accessToken');
  const params = new URLSearchParams(filters);
  
  const response = await fetch(
    `https://api.berse-app.com/v2/users/search?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  
  const data = await response.json();
  return data.data;
};

// Usage
const results = await searchUsers({
  currentCity: 'kuala lumpur',
  interest: 'travel',
  page: 1,
  limit: 20,
});
```

**Send Connection Request:**
```javascript
const sendConnectionRequest = async (userId, message = '', relationshipType = '', relationshipCategory = 'friend') => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(
    `https://api.berse-app.com/v2/users/connections/${userId}/request`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        relationshipType,
        relationshipCategory
      }),
    }
  );
  
  const data = await response.json();
  return data;
};
```

**Get Activity History:**
```javascript
const getUserActivity = async (limit = 50, offset = 0) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(
    `https://api.berse-app.com/v2/users/activity?limit=${limit}&offset=${offset}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  
  const data = await response.json();
  return data.data;
};
```

**Get Security Events:**
```javascript
const getSecurityEvents = async (limit = 50, offset = 0) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(
    `https://api.berse-app.com/v2/users/security-events?limit=${limit}&offset=${offset}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  
  const data = await response.json();
  return data.data;
};
```

**Get Active Sessions:**
```javascript
const getActiveSessions = async () => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(
    'https://api.berse-app.com/v2/users/sessions',
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  
  const data = await response.json();
  return data.data.sessions;
};
```

**Get Login History:**
```javascript
const getLoginHistory = async (limit = 50, offset = 0) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(
    `https://api.berse-app.com/v2/users/login-history?limit=${limit}&offset=${offset}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  
  const data = await response.json();
  return data.data;
};
```

**Terminate Session:**
```javascript
const terminateSession = async (sessionToken) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(
    `https://api.berse-app.com/v2/users/sessions/${sessionToken}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  
  const data = await response.json();
  return data;
};

// Usage: Terminate all sessions except current one
const terminateOtherSessions = async () => {
  const sessions = await getActiveSessions();
  const currentToken = localStorage.getItem('sessionToken');
  
  for (const session of sessions) {
    if (session.sessionToken !== currentToken) {
      await terminateSession(session.sessionToken);
    }
  }
};
```

### cURL Examples

**Get Your Own Profile:**
```bash
curl -X GET https://api.berse-app.com/v2/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**View Another User's Profile:**
```bash
curl -X GET https://api.berse-app.com/v2/users/USER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Update Profile:**
```bash
curl -X PUT https://api.berse-app.com/v2/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Updated bio...",
    "interests": ["travel", "photography"],
    "currentCity": "Kuala Lumpur"
  }'
```

**Search Users:**
```bash
curl -X GET "https://api.berse-app.com/v2/users/search?city=kuala%20lumpur&interest=travel" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Get Activity History:**
```bash
curl -X GET "https://api.berse-app.com/v2/users/activity?limit=20&offset=0" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Get Security Events:**
```bash
curl -X GET "https://api.berse-app.com/v2/users/security-events?limit=20&offset=0" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Get Active Sessions:**
```bash
curl -X GET https://api.berse-app.com/v2/users/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Get Login History:**
```bash
curl -X GET "https://api.berse-app.com/v2/users/login-history?limit=20&offset=0" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Terminate Session:**
```bash
curl -X DELETE https://api.berse-app.com/v2/users/sessions/SESSION_TOKEN_HERE \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Best Practices

1. **Profile Completion:**
   - Encourage users to fill out all profile fields
   - More complete profiles = better matching and discovery

2. **Image Optimization:**
   - Resize images before upload (500x500px recommended)
   - Use WebP format for better compression
   - Compress images to < 1MB

3. **Search Performance:**
   - Use pagination for large result sets
   - Be specific with search filters
   - Cache search results when appropriate

4. **Privacy:**
   - Respect user privacy settings
   - Don't expose sensitive data in public profiles
   - Handle friend requests gracefully
   - Honor `locationPrivacy` settings in all location-based features
   - Never share location data with third parties without consent

5. **Location Features:**
   - Update user location periodically (every 5-10 minutes when active)
   - Request location permissions before accessing device GPS
   - Use appropriate accuracy levels to optimize battery life
   - Cache nearby search results for 1-2 minutes to reduce API calls
   - Show clear error messages when location is unavailable
   - Provide fallback UI when location permission is denied

---

## 📝 Migration Guide (v2.2.0)

### Breaking Changes

**Profile Endpoint Separation**

The `GET /v2/users/profile` endpoint has been split into two distinct endpoints:

| Old Endpoint | New Endpoint | Purpose |
|--------------|--------------|---------|
| `GET /v2/users/profile` | `GET /v2/users/me` | View your own profile |
| `GET /v2/users/:id` (limited) | `GET /v2/users/:id` (enhanced) | View another user's profile |

### Migration Steps

**1. Update "View Own Profile" calls:**

```javascript
// Before (v2.1.0)
const response = await fetch('https://api.berse-app.com/v2/users/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// After (v2.2.0)
const response = await fetch('https://api.berse-app.com/v2/users/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**2. Handle Self-Viewing Prevention:**

```javascript
async function getUserProfile(userId, currentUserId) {
  if (userId === currentUserId) {
    return await fetch('https://api.berse-app.com/v2/users/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } else {
    return await fetch(`https://api.berse-app.com/v2/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
}
```

**3. Handle New Response Structure for `/users/:id`:**

The response now includes:
- `relationship` section (connection, vouch, trust match, mutual connections)
- `sharedActivities` section (communities, events, travel, marketplace)
- Enhanced `privacy` section with action permissions

See [Get User Profile by ID](#get-user-profile-by-id) for complete response examples.

---

## Changelog

### v2.2.0 (2025-10-22)
**Major Profile System Overhaul:**
- ✅ **Endpoint Separation**: New `GET /v2/users/me` for own profile, `GET /v2/users/:id` enhanced for viewing others
- ✅ **Relationship Context**: `/users/:id` now includes connection status, vouch status, trust compatibility, mutual connections
- ✅ **Shared Activities**: Shows shared communities, events, travel trips, marketplace interactions
- ✅ **Privacy Enhancements**: Enhanced privacy controls based on connection status (email/phone/birthDate visibility)
- ✅ **Trust Compatibility**: Automatic trust level compatibility calculation when viewing other users
- ✅ **Self-Viewing Prevention**: Attempting to view own profile via `/users/:id` returns error directing to `/users/me`
- ✅ **Statistics Enhancement**: Detailed breakdowns for all 6 categories (connections, communities, events, marketplace, travel, cardGame)

**Breaking Changes:**
- `GET /users/profile` deprecated → use `GET /users/me` for own profile
- `/users/:id` no longer works for viewing your own profile (returns 400 error)
- Response structure for `/users/:id` significantly enhanced with new sections

**New Response Sections:**
- `relationship`: Connection/vouch status, trust match, mutual connections
- `sharedActivities`: Communities, events, travel, marketplace (always present, may be empty)
- Enhanced `privacy`: Action permissions (canMessage, canVouch, canConnect) + visibility flags
- `recentActivity`: Public activity highlights and trust moments

### v2.0.3 (2025-10-15)
**New Features - Activity & Security Endpoints:**
- ✅ **Activity Monitoring**: Added `GET /v2/users/activity` - Get user activity history with pagination
- ✅ **Security Events**: Added `GET /v2/users/security-events` - Monitor security events and suspicious activity
- ✅ **Session Management**: Added `GET /v2/users/sessions` - View all active sessions across devices
- ✅ **Login History**: Added `GET /v2/users/login-history` - Track login attempts with success/failure details
- ✅ **Session Control**: Added `DELETE /v2/users/sessions/:sessionToken` - Remotely terminate specific sessions
- ✅ **Comprehensive Documentation**: Full API documentation for all activity and security features
- ✅ **Activity Types**: Support for 80+ activity types across authentication, profile, connections, events, and more
- ✅ **Severity Levels**: Security events categorized as low, medium, high, or critical
- ✅ **Brute Force Detection**: Automatic detection and logging of multiple failed login attempts
- ✅ **Route Fix**: Fixed route ordering to ensure activity/security endpoints work correctly

**Developer Experience:**
- Added complete request/response examples for all new endpoints
- Documented all activity types and security event types
- Added use cases and security best practices
- Updated server startup logs to display all endpoints

### v2.0.2 (2025-10-15)
**API Response Improvements:**
- **Connection Count Names**: Simplified ugly Prisma-generated relation names in `_count` object
  - `user_connections_user_connections_initiatorIdTousers` → `connectionsInitiated`
  - `user_connections_user_connections_receiverIdTousers` → `connectionsReceived`
  - `referrals_referrals_referrerIdTousers` → `referralsMade`
- **Better Developer Experience**: More readable and self-documenting field names
- **Backward Compatibility**: Transformation applied at response layer, no database changes required

### v2.0.1 (2025-10-15)
**Bug Fixes & Improvements:**
- **Profile Updates**: Fixed UserProfile and UserLocation upsert operations to include required `updatedAt` field
- **Connection System**: Fixed UserConnection creation to properly generate unique IDs using cuid2
- **Route Ordering**: Reorganized routes to prevent `/connections` from being incorrectly matched by `/:id` route
- **Pagination**: Added validation to prevent negative page numbers and limit maximum results per page to 100
- **URL Validation**: Enhanced website field validation to require protocol (http:// or https://)
- **Error Handling**: Improved error responses for invalid pagination parameters
- **Connection Management**: Fixed authorization check for removing connections (users can now remove their own connections)
- **API Stability**: All 35+ endpoint tests now passing with proper error handling

**Documentation:**
- Added comprehensive test coverage documentation
- Updated all examples to reflect fixes
- Clarified route precedence and ordering requirements

### v2.0.0 (2024-01-15)
- **Geospatial Search**: Added `/v2/users/nearby` endpoint for finding users within a radius
- **Location Privacy**: Added three-tier privacy system (public/friends/private)
- **Privacy-Aware Filtering**: Nearby search respects user privacy settings and connection status
- **Distance Calculation**: Implemented Haversine formula with bounding box optimization
- **Location Updates**: Added coordinate update capability with validation
- **Mobile Integration**: Added React Native and web examples for location features
- **Performance**: 50-150ms average response time with bounding box optimization

### v1.0.0 (2024-01-15)
- Initial user profile API
- Profile management endpoints
- User discovery and search
- Social connections (follow/unfollow)
- Avatar upload
- Admin user management
