# Card Game API Documentation

## Overview
The Card Game API enables users to submit feedback, ratings, and engage in discussions about card game questions and topics. It includes social features like upvotes and replies, plus comprehensive analytics.

**Base URL**: `/v2/cardgame`  
**Authentication**: Required for all endpoints  
**Version**: 2.1.0

---

## Table of Contents
- [Feedback Management](#feedback-management)
- [Upvote System](#upvote-system)
- [Reply System](#reply-system)
- [Statistics & Analytics](#statistics--analytics)
- [Data Models](#data-models)
- [Error Responses](#error-responses)

---

## Feedback Management

### Submit Feedback
Submit feedback and rating for a card game question.

**Endpoint**: `POST /v2/cardgame/feedback`  
**Authentication**: Required

#### Request Body
```json
{
  "topicId": "string (required)",
  "topicTitle": "string (required)",
  "sessionNumber": "integer (required, min: 1)",
  "questionId": "string (required)",
  "questionText": "string (required)",
  "rating": "integer (required, 1-5)",
  "comment": "string (optional, max: 1000 chars)",
  "isHelpful": "boolean (optional)"
}
```

#### Example Request
```bash
curl -X POST http://localhost:3001/v2/cardgame/feedback \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topicId": "communication-skills",
    "topicTitle": "Communication Skills",
    "questionId": "q-001",
    "questionText": "How do you handle difficult conversations?",
    "sessionNumber": 1,
    "rating": 5,
    "comment": "This question really made me think!",
    "isHelpful": true
  }'
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "id": "cmguk1djh0001cpld16tfxfz7",
    "userId": "e3e95246-af18-4835-b383-e50938ee5720",
    "topicId": "communication-skills",
    "sessionNumber": 1,
    "questionId": "q-001",
    "rating": 5,
    "comment": "This question really made me think!",
    "createdAt": "2025-10-17T07:56:09.293Z",
    "updatedAt": "2025-10-17T07:56:09.293Z",
    "user": {
      "id": "e3e95246-af18-4835-b383-e50938ee5720",
      "fullName": "hendra",
      "profile": {
        "profilePicture": null
      }
    },
    "upvoteCount": 0,
    "hasUpvoted": false,
    "_count": {
      "cardGameUpvotes": 0,
      "cardGameReplies": 0
    }
  }
}
```

---

### Get All Feedback
Retrieve feedback with advanced filtering, sorting, and pagination.

**Endpoint**: `GET /v2/cardgame/feedback`  
**Authentication**: Required

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 20, max: 100) |
| `sortBy` | string | No | Sort field: `createdAt`, `rating`, `upvotes` |
| `sortOrder` | string | No | Sort order: `asc`, `desc` |
| `topicId` | string | No | Filter by topic |
| `userId` | string | No | Filter by user |
| `sessionNumber` | integer | No | Filter by session |
| `questionId` | string | No | Filter by question |
| `minRating` | integer | No | Minimum rating (1-5) |
| `maxRating` | integer | No | Maximum rating (1-5) |
| `hasComments` | boolean | No | Filter by comment presence |
| `startDate` | string | No | Start date (ISO 8601) |
| `endDate` | string | No | End date (ISO 8601) |

#### Example Request
```bash
# Get all feedback with filters
curl -X GET "http://localhost:3001/v2/cardgame/feedback?minRating=4&sortBy=rating&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Feedback retrieved successfully",
  "data": {
    "data": [
      {
        "id": "cmguk1djh0001cpld16tfxfz7",
        "userId": "e3e95246-af18-4835-b383-e50938ee5720",
        "topicId": "communication-skills",
        "sessionNumber": 1,
        "questionId": "q-001",
        "rating": 5,
        "comment": "Updated: This question is absolutely brilliant for reflection! Best one so far.",
        "createdAt": "2025-10-17T07:56:09.293Z",
        "updatedAt": "2025-10-17T07:59:09.278Z",
        "user": {
          "id": "e3e95246-af18-4835-b383-e50938ee5720",
          "fullName": "hendra",
          "profile": {
            "profilePicture": null
          }
        },
        "upvoteCount": 0,
        "hasUpvoted": false,
        "replies": [],
        "_count": {
          "cardGameUpvotes": 0,
          "cardGameReplies": 0
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

### Get Feedback by ID
Retrieve a specific feedback entry with full details.

**Endpoint**: `GET /v2/cardgame/feedback/:id`  
**Authentication**: Required

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Feedback retrieved successfully",
  "data": {
    "id": "feedback-1",
    "userId": "user-123",
    "topicId": "topic-456",
    "sessionNumber": 1,
    "questionId": "q-789",
    "rating": 5,
    "comment": "Great question!",
    "user": {
      "id": "user-123",
      "fullName": "John Doe",
      "profile": {
        "profilePicture": "https://example.com/avatar.jpg"
      }
    },
    "upvoteCount": 42,
    "hasUpvoted": true,
    "replies": [...],
    "createdAt": "2025-10-17T10:00:00.000Z",
    "updatedAt": "2025-10-17T10:00:00.000Z"
  }
}
```

---

### Update Feedback
Update your own feedback rating or comment.

**Endpoint**: `PATCH /v2/cardgame/feedback/:id`  
**Authentication**: Required

#### Request Body
```json
{
  "rating": 5,
  "comment": "Updated: This question is absolutely brilliant for reflection!",
  "isHelpful": true
}
```

#### Example Request
```bash
curl -X PATCH http://localhost:3001/v2/cardgame/feedback/cmguk1djh0001cpld16tfxfz7 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Updated: This question is absolutely brilliant!",
    "isHelpful": true
  }'
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Feedback updated successfully",
  "data": {
    "id": "cmguk1djh0001cpld16tfxfz7",
    "userId": "e3e95246-af18-4835-b383-e50938ee5720",
    "topicId": "communication-skills",
    "sessionNumber": 1,
    "questionId": "q-001",
    "rating": 5,
    "comment": "Updated: This question is absolutely brilliant!",
    "createdAt": "2025-10-17T07:56:09.293Z",
    "updatedAt": "2025-10-17T07:59:09.278Z",
    "user": {
      "id": "e3e95246-af18-4835-b383-e50938ee5720",
      "fullName": "hendra",
      "profile": {
        "profilePicture": null
      }
    },
    "upvoteCount": 0,
    "hasUpvoted": false,
    "_count": {
      "cardGameUpvotes": 0,
      "cardGameReplies": 0
    }
  }
}
```

---

### Delete Feedback
Delete your own feedback.

**Endpoint**: `DELETE /v2/cardgame/feedback/:id`  
**Authentication**: Required

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Feedback deleted successfully",
  "data": null
}
```

---

## Upvote System

### Toggle Upvote
Upvote or remove upvote from feedback.

**Endpoint**: `POST /v2/cardgame/feedback/:id/upvote`  
**Authentication**: Required

#### Example Request
```bash
curl -X POST http://localhost:3001/v2/cardgame/feedback/cmguk1m0b0004cpld5jgmul43/upvote \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Response (200 OK) - Upvote Added
```json
{
  "success": true,
  "message": "Upvote added",
  "data": {
    "hasUpvoted": true,
    "upvoteCount": 1
  }
}
```

#### Response (200 OK) - Upvote Removed
**Note**: Calling this endpoint again will toggle the upvote off:
```json
{
  "success": true,
  "message": "Upvote removed",
  "data": {
    "hasUpvoted": false,
    "upvoteCount": 0
  }
}
```

---

## Reply System

### Add Reply
Add a reply to a feedback entry.

**Endpoint**: `POST /v2/cardgame/feedback/:id/replies`  
**Authentication**: Required

#### Request Body
```json
{
  "text": "I completely agree with this!"
}
```

**Note**: The field name is `text`, not `content`.

#### Example Request
```bash
curl -X POST http://localhost:3001/v2/cardgame/feedback/cmguk1m0b0004cpld5jgmul43/replies \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "I totally agree! This question helped me identify my communication strengths too."}'
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Reply added successfully",
  "data": {
    "id": "cmguk5ucx000acpldvm6946x4",
    "userId": "e3e95246-af18-4835-b383-e50938ee5720",
    "feedbackId": "cmguk1m0b0004cpld5jgmul43",
    "text": "I totally agree! This question helped me identify my communication strengths too.",
    "createdAt": "2025-10-17T07:59:37.714Z",
    "updatedAt": "2025-10-17T07:59:37.714Z",
    "user": {
      "id": "e3e95246-af18-4835-b383-e50938ee5720",
      "fullName": "hendra",
      "profile": {
        "profilePicture": null
      }
    }
  }
}
```

---

### Delete Reply
Delete your own reply.

**Endpoint**: `DELETE /v2/cardgame/replies/:id`  
**Authentication**: Required

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Reply deleted successfully",
  "data": null
}
```

---

## Statistics & Analytics

### Get Topic Statistics
Get aggregated statistics for a specific topic.

**Endpoint**: `GET /v2/cardgame/stats/topics/:topicId`  
**Authentication**: Required

#### Example Request
```bash
curl -X GET http://localhost:3001/v2/cardgame/stats/topics/communication-skills \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Topic statistics retrieved successfully",
  "data": {
    "id": "cmguk1djy0002cpld2b2bh109",
    "topicId": "communication-skills",
    "totalSessions": 1,
    "averageRating": 4.5,
    "totalFeedback": 2,
    "createdAt": "2025-10-17T07:56:09.310Z",
    "updatedAt": "2025-10-17T07:59:09.286Z",
    "ratingDistribution": [
      { "rating": 4, "count": 1 },
      { "rating": 5, "count": 1 }
    ]
  }
}
```

**Note**: Statistics are automatically updated when feedback is created, updated, or deleted.

---

### Get All Topics Statistics
Get statistics for all topics.

**Endpoint**: `GET /v2/cardgame/stats/topics`  
**Authentication**: Required

#### Response (200 OK)
```json
{
  "success": true,
  "message": "All topics statistics retrieved successfully",
  "data": [
    {
      "id": "stat-123",
      "topicId": "topic-456",
      "totalSessions": 150,
      "averageRating": 4.5,
      "totalFeedback": 450
    },
    {
      "id": "stat-124",
      "topicId": "topic-789",
      "totalSessions": 200,
      "averageRating": 4.7,
      "totalFeedback": 600
    }
  ]
}
```

---

### Get Topic Analytics
Get detailed analytics for a topic including top questions and trends.

**Endpoint**: `GET /v2/cardgame/analytics/topics/:topicId`  
**Authentication**: Required

#### Example Request
```bash
curl -X GET http://localhost:3001/v2/cardgame/analytics/topics/communication-skills \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Topic analytics retrieved successfully",
  "data": {
    "topicId": "communication-skills",
    "totalSessions": 1,
    "uniqueUsers": 1,
    "totalFeedback": 2,
    "averageRating": 4.5,
    "completionRate": 0,
    "topQuestions": [
      {
        "questionId": "q-001",
        "averageRating": 5,
        "feedbackCount": 1
      },
      {
        "questionId": "q-002",
        "averageRating": 4,
        "feedbackCount": 1
      }
    ],
    "ratingTrend": []
  }
}
```

---

### Get User Statistics
Get statistics for current user or specific user.

**Endpoint**: `GET /v2/cardgame/stats/me` (current user)  
**Endpoint**: `GET /v2/cardgame/stats/users/:userId` (specific user)  
**Authentication**: Required

#### Example Request
```bash
curl -X GET http://localhost:3001/v2/cardgame/stats/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "User statistics retrieved successfully",
  "data": {
    "userId": "e3e95246-af18-4835-b383-e50938ee5720",
    "totalSessions": 1,
    "totalFeedback": 2,
    "averageRating": 4.5,
    "topicsCompleted": 1,
    "repliesGiven": 1,
    "upvotesReceived": 1,
    "topTopics": [
      {
        "topicId": "communication-skills",
        "feedbackCount": 2,
        "averageRating": 4.5
      }
    ]
  }
}
```

---

## Data Models

### FeedbackResponse
```typescript
{
  id: string
  userId: string
  topicId: string
  sessionNumber: number
  questionId: string
  rating: number (1-5)
  comment?: string
  createdAt: Date
  updatedAt: Date
  user?: {
    id: string
    fullName: string
    profile?: {
      profilePicture?: string
    }
  }
  upvoteCount?: number
  hasUpvoted?: boolean
  replies?: ReplyResponse[]
}
```

### ReplyResponse
```typescript
{
  id: string
  userId: string
  feedbackId: string
  text: string
  createdAt: Date
  updatedAt: Date
  user?: {
    id: string
    fullName: string
    profile?: {
      profilePicture?: string
    }
  }
}
```

### StatsResponse
```typescript
{
  id: string
  topicId: string
  totalSessions: number
  averageRating: number
  totalFeedback: number
  createdAt: Date
  updatedAt: Date
  ratingDistribution?: Array<{
    rating: number
    count: number
  }>
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "rating",
      "message": "Rating must be between 1 and 5"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden",
  "error": "You can only update your own feedback"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Not Found",
  "error": "Feedback not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error",
  "error": "An unexpected error occurred"
}
```

---

## Usage Examples

### Example 1: Submit Feedback and Get Stats

```bash
# 1. Submit feedback
curl -X POST http://localhost:3000/v2/cardgame/feedback \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topicId": "topic-123",
    "sessionNumber": 1,
    "questionId": "q-456",
    "rating": 5,
    "comment": "This was an excellent question!"
  }'

# 2. Get topic statistics
curl -X GET http://localhost:3000/v2/cardgame/stats/topics/topic-123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example 2: Browse Feedback and Upvote

```bash
# 1. Get all feedback for a topic
curl -X GET "http://localhost:3000/v2/cardgame/feedback?topicId=topic-123&sortBy=upvotes&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Upvote helpful feedback
curl -X POST http://localhost:3000/v2/cardgame/feedback/feedback-456/upvote \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Add a reply
curl -X POST http://localhost:3000/v2/cardgame/feedback/feedback-456/replies \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I completely agree with this assessment!"
  }'
```

### Example 3: Track User Progress

```bash
# Get your personal statistics
curl -X GET http://localhost:3000/v2/cardgame/stats/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get all your feedback
curl -X GET "http://localhost:3000/v2/cardgame/feedback?userId=YOUR_USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Rate Limiting
- General endpoints: 100 requests per 15 minutes
- Per user per topic: 50 feedback submissions per day

## Caching
- Topic statistics cached for 5 minutes
- Analytics data cached for 15 minutes

## Best Practices

1. **Pagination**: Always use pagination for list endpoints
2. **Filtering**: Use filters to reduce payload size
3. **Caching**: Cache frequently accessed statistics client-side
4. **Error Handling**: Always check the `success` field in responses
5. **Rate Limits**: Implement exponential backoff for 429 responses

---

## Related Documentation
- [Main API Documentation](./README.md)
- [Authentication API](./AUTH_API.md)
- [Events API](./EVENTS_API.md)
- [Connections API](./CONNECTIONS_API.md)

---

**Last Updated**: October 17, 2025  
**Version**: 2.1.0  
**Status**: ✅ Production Ready
