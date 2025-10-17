# Card Game Module

## Overview
The Card Game module manages feedback, ratings, and interactions for card game sessions. Users can submit feedback on questions, rate their experience, upvote helpful feedback, and engage in discussions through replies.

## Features
- ✅ Submit feedback with ratings (1-5) for card game questions
- ✅ Update and delete own feedback
- ✅ Upvote/downvote system for helpful feedback
- ✅ Reply system for community discussions
- ✅ Topic-level statistics and analytics
- ✅ User statistics tracking
- ✅ Advanced filtering and sorting

## API Endpoints

### Feedback Management
- `POST /v2/cardgame/feedback` - Submit feedback
- `GET /v2/cardgame/feedback` - Get all feedback (with filters)
- `GET /v2/cardgame/feedback/:id` - Get feedback by ID
- `PATCH /v2/cardgame/feedback/:id` - Update feedback
- `DELETE /v2/cardgame/feedback/:id` - Delete feedback

### Upvote System
- `POST /v2/cardgame/feedback/:id/upvote` - Toggle upvote

### Reply System
- `POST /v2/cardgame/feedback/:id/replies` - Add reply
- `DELETE /v2/cardgame/replies/:id` - Delete reply

### Statistics & Analytics
- `GET /v2/cardgame/stats/topics/:topicId` - Get topic stats
- `GET /v2/cardgame/stats/topics` - Get all topics stats
- `GET /v2/cardgame/analytics/topics/:topicId` - Get detailed analytics
- `GET /v2/cardgame/stats/me` - Get current user stats
- `GET /v2/cardgame/stats/users/:userId` - Get user stats

## Database Models

### CardGameFeedback
- User feedback on specific questions
- Includes rating (1-5) and optional comment
- Tracks topic, session, and question IDs

### CardGameReply
- Comments on feedback entries
- Enables community discussion

### CardGameUpvote
- Tracks user upvotes on feedback
- One upvote per user per feedback

### CardGameStat
- Aggregated statistics per topic
- Auto-updated when feedback changes
- Includes average rating, total sessions, total feedback

## Usage Examples

### Submit Feedback
```typescript
POST /v2/cardgame/feedback
{
  "topicId": "topic-123",
  "sessionNumber": 1,
  "questionId": "q-456",
  "rating": 5,
  "comment": "Great question, really made me think!"
}
```

### Get Filtered Feedback
```typescript
GET /v2/cardgame/feedback?topicId=topic-123&minRating=4&sortBy=upvotes&sortOrder=desc
```

### Toggle Upvote
```typescript
POST /v2/cardgame/feedback/feedback-789/upvote
```

### Add Reply
```typescript
POST /v2/cardgame/feedback/feedback-789/replies
{
  "text": "I completely agree with this perspective!"
}
```

## Business Logic

### Rating System
- Ratings are 1-5 stars
- Average ratings calculated per topic
- Rating distribution available in analytics

### Statistics Auto-Update
- Topic statistics automatically recalculated on:
  - New feedback submission
  - Feedback update
  - Feedback deletion
- Unique sessions counted by userId + sessionNumber

### Permissions
- Users can only update/delete their own feedback
- Users can only delete their own replies
- All authenticated users can view feedback and stats
- All authenticated users can upvote and reply

## Frontend Integration

### Display Feedback
```typescript
// Show user's profile picture
feedback.user?.profile?.profilePicture

// Show upvote count and user's upvote status
feedback.upvoteCount
feedback.hasUpvoted

// Show replies
feedback.replies?.map(reply => ...)
```

### Filter Options
- By topic, user, session, question
- By rating range (min/max)
- By date range
- Has comments filter
- Sort by: createdAt, rating, upvotes

## Performance Considerations
- Statistics cached and updated asynchronously
- Pagination for large result sets (max 100 per page)
- Indexes on common query fields
- Efficient counting queries

## Future Enhancements
- [ ] Notification system for replies
- [ ] Report/flag inappropriate feedback
- [ ] Admin moderation tools
- [ ] Export feedback data
- [ ] Badge system for helpful contributors
- [ ] Trending topics algorithm
