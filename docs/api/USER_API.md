# User & Profile API Documentation

## Overview
The User API provides endpoints for managing user profiles, searching users, and handling social connections.

**Base URL:**
- **Production:** `https://api.berse-app.com/v2/users`
- **Development:** `http://localhost:3000/v2/users`

**Authentication:** All endpoints require a valid JWT access token.

> **Note:** v2 endpoints do not include the `/api/` prefix. Legacy v1 endpoints are still available at `/api/v1/users` for backward compatibility.

---

## Table of Contents
- [Profile Management](#profile-management)
  - [Get Profile](#get-profile)
  - [Update Profile](#update-profile)
  - [Upload Avatar](#upload-avatar)
- [User Discovery](#user-discovery)
  - [Get All Users](#get-all-users)
  - [Search Users](#search-users)
  - [Get User by ID](#get-user-by-id)
- [Social Connections](#social-connections)
  - [Follow User](#follow-user)
  - [Unfollow User](#unfollow-user)
- [Admin](#admin)
  - [Delete User](#delete-user)
- [Data Models](#data-models)

---

## Profile Management

### Get Profile
Get the current user's complete profile.

**Endpoint:** `GET /v2/users/profile`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "phone": "+60123456789",
    "fullName": "John Doe",
    "username": "johndoe",
    "role": "GENERAL_USER",
    "totalPoints": 150,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "profile": {
      "displayName": "Johnny",
      "profilePicture": "https://cdn.bersemuka.com/avatars/uuid.jpg",
      "bio": "Adventurous traveler exploring Southeast Asia...",
      "shortBio": "Traveler | Photographer | Coffee Enthusiast",
      "dateOfBirth": "1990-01-15T00:00:00.000Z",
      "gender": "male",
      "age": 34,
      "profession": "Software Engineer",
      "occupation": "Full Stack Developer",
      "website": "https://johndoe.com",
      "personalityType": "ENFP",
      "interests": ["travel", "photography", "coffee", "hiking"],
      "languages": ["English", "Bahasa Malaysia", "Spanish"],
      "instagramHandle": "johndoe",
      "linkedinHandle": "john-doe",
      "travelStyle": "backpacker",
      "bucketList": ["Japan", "Iceland", "New Zealand"],
      "travelBio": "Slow traveler seeking authentic experiences"
    },
    "location": {
      "currentCity": "Kuala Lumpur",
      "countryOfResidence": "Malaysia",
      "currentLocation": "KLCC Area",
      "nationality": "American",
      "originallyFrom": "San Francisco"
    },
    "metadata": {
      "membershipId": "BM-123456",
      "referralCode": "JOHNDOE2024"
    },
    "_count": {
      "hostedEvents": 5,
      "attendedEvents": 23,
      "referrals": 3,
      "badges": 7
    }
  }
}
```

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
  "nationality": "American",
  "originallyFrom": "San Francisco",
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
- `city` or `currentCity` - Current city
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
- `age`: 13-120
- `interests`: Max 20 items, each 1-50 characters
- `languages`: Max 10 items, each 2-50 characters
- `bucketList`: Max 50 items, each 1-100 characters
- `instagramHandle`: 1-30 characters, alphanumeric with dots/underscores
- `linkedinHandle`: 3-100 characters, alphanumeric with hyphens

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
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Example:**
```
GET /v2/users/all?page=1&limit=20
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
        "email": "jane@example.com",
        "role": "GENERAL_USER",
        "totalPoints": 250,
        "profile": {
          "profilePicture": "https://...",
          "bio": "Travel enthusiast...",
          "shortBio": "Traveler | Artist",
          "age": 28,
          "profession": "Graphic Designer",
          "interests": ["art", "travel", "food"],
          "languages": ["English", "French"],
          "personalityType": "INFP"
        },
        "location": {
          "currentCity": "Penang",
          "currentLocation": "Georgetown",
          "originallyFrom": "Paris"
        },
        "metadata": {
          "membershipId": "BM-789012"
        }
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

### Search Users
Search for users by various criteria.

**Endpoint:** `GET /v2/users/search`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `query` (optional): Search term (searches name, username, bio)
- `city` (optional): Filter by city
- `interest` (optional): Filter by specific interest
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Example:**
```
GET /v2/users/search?city=kuala%20lumpur&interest=travel&page=1
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
          "bio": "Travel enthusiast...",
          "shortBio": "Traveler | Artist",
          "interests": ["travel", "art", "food"]
        },
        "location": {
          "currentCity": "Kuala Lumpur"
        }
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

**Search Logic:**
- `query`: Case-insensitive search in fullName, username, and bio
- `city`: Case-insensitive search in currentCity and currentLocation
- `interest`: Exact match in interests array
- Multiple filters are combined with AND logic

---

### Get User by ID
Get public profile of a specific user.

**Endpoint:** `GET /v2/users/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `id`: User UUID

**Example:**
```
GET /v2/users/550e8400-e29b-41d4-a716-446655440000
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "Jane Smith",
    "username": "janesmith",
    "role": "GENERAL_USER",
    "totalPoints": 250,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "profile": {
      "profilePicture": "https://...",
      "bio": "Travel enthusiast...",
      "interests": ["travel", "art", "food"],
      "languages": ["English", "French"],
      "profession": "Graphic Designer"
    },
    "location": {
      "currentCity": "Penang",
      "originallyFrom": "Paris"
    },
    "_count": {
      "hostedEvents": 3,
      "attendedEvents": 15,
      "badges": 5
    }
  }
}
```

**Error Responses:**
- `404` - User not found

**Notes:**
- Returns limited public profile information
- Excludes sensitive data (email, phone, etc.)

---

## Social Connections

The connection system allows users to build trusted relationships with detailed context about their connections.

### Get Connections
Get user's connections with optional status filter.

**Endpoint:** `GET /v2/users/connections`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status` (optional): Filter by connection status (PENDING, ACCEPTED, REJECTED, CANCELED, REMOVED)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)

**Example:**
```
GET /v2/users/connections?status=ACCEPTED&page=1&limit=20
```

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
1. Creates a `UserConnection` with status "PENDING"
2. Sends a notification to the target user
3. Replaces any old REMOVED connections if cooldown period has passed

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
  };
  
  // Metadata
  metadata?: {
    membershipId?: string;
    referralCode: string;
  };
  
  // Stats
  _count?: {
    hostedEvents: number;
    attendedEvents: number;
    referrals: number;
    badges: number;
    connectionsInitiated: number;
    connectionsReceived: number;
  };
  
  // Connection Stats
  connectionStats?: {
    totalConnections: number;
    pendingRequests: number;
    averageRating?: number;
    connectionQuality: number;
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
  
  const response = await fetch('https://api.bersemuka.com/v2/users/profile', {
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
  
  const response = await fetch('https://api.bersemuka.com/v2/users/upload-avatar', {
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
    `https://api.bersemuka.com/v2/users/search?${params}`,
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
  city: 'kuala lumpur',
  interest: 'travel',
  page: 1,
  limit: 20,
});
```

**Send Friend Request:**
```javascript
const sendFriendRequest = async (userId) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(
    `https://api.bersemuka.com/v2/users/follow/${userId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  
  const data = await response.json();
  return data;
};
```

### cURL Examples

**Get Profile:**
```bash
curl -X GET https://api.bersemuka.com/v2/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Update Profile:**
```bash
curl -X PUT https://api.bersemuka.com/v2/users/profile \
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
curl -X GET "https://api.bersemuka.com/v2/users/search?city=kuala%20lumpur&interest=travel" \
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

---

## Changelog

### v1.0.0 (2024-01-15)
- Initial user profile API
- Profile management endpoints
- User discovery and search
- Social connections (follow/unfollow)
- Avatar upload
- Admin user management
