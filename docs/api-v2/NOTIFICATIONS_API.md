# Notifications API Documentation

## Overview
Complete in-app notification system for the Berse platform. Provides real-time notifications for user actions including connections, vouches, events, authentication events, and security alerts.

**Base URL:** `/v2/notifications`

**Authentication:** All endpoints require Bearer token authentication

---

## Table of Contents
- [Notification Object](#notification-object)
- [Notification Types](#notification-types)
- [Priority Levels](#priority-levels)
- [Endpoints](#endpoints)
  - [Get Notifications](#get-notifications)
  - [Get Unread Count](#get-unread-count)
  - [Mark as Read](#mark-as-read)
  - [Mark All as Read](#mark-all-as-read)
  - [Delete Notification](#delete-notification)
  - [Delete All Read](#delete-all-read)
- [Use Cases](#use-cases)
- [Mobile Implementation](#mobile-implementation)

---

## Notification Object

```json
{
  "id": "clx1234567890",
  "userId": "usr_abc123",
  "type": "EVENT",
  "title": "New Event RSVP",
  "message": "John Doe RSVP'd to your event: Summer BBQ Party",
  "actionUrl": "/events/evt_123/attendees",
  "metadata": {
    "eventId": "evt_123",
    "userId": "usr_xyz789",
    "eventTitle": "Summer BBQ Party"
  },
  "priority": "normal",
  "relatedEntityId": "evt_123",
  "relatedEntityType": "event_rsvp",
  "readAt": null,
  "createdAt": "2025-01-15T10:30:00.000Z",
  "expiresAt": null,
  "channels": ["in_app"]
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique notification identifier |
| `userId` | string | Recipient user ID |
| `type` | enum | Type of notification (see [Notification Types](#notification-types)) |
| `title` | string | Notification title/headline |
| `message` | string | Full notification message |
| `actionUrl` | string | Deep link to relevant screen/page (optional) |
| `metadata` | object | Additional context data (optional) |
| `priority` | enum | Priority level: `low`, `normal`, `high`, `urgent` |
| `relatedEntityId` | string | ID of related entity (optional) |
| `relatedEntityType` | string | Type of related entity (optional) |
| `readAt` | datetime | Timestamp when read (null = unread) |
| `createdAt` | datetime | When notification was created |
| `expiresAt` | datetime | Optional expiration date |
| `channels` | array | Delivery channels (currently `["in_app"]`) |

---

## Notification Types

| Type | Description | Use Cases |
|------|-------------|-----------||
| `SYSTEM` | System-wide announcements | App updates, maintenance, important announcements |
| `EVENT` | Event-related notifications | RSVPs, new events, event updates, reminders |
| `POINTS` | Points/rewards earned | Points awarded, achievements unlocked |
| `VOUCH` | Vouch requests and approvals | Vouch requested, vouch approved, vouch received |
| `MATCH` | Matching/discovery | New connection suggestions, mutual interests |
| `MESSAGE` | Direct messages | New messages, message replies |
| `SERVICE` | Service updates | Service bookings, service reviews |
| `MARKETPLACE` | Marketplace activities | Item listings, purchases, reviews |
| `PAYMENT` | Payment-related | Payment confirmations, payment failures |
| `SOCIAL` | Social interactions | Referrals used, profile views, birthdays, social milestones |
| `CONNECTION` | Connection activities | Connection requests, acceptances, suggestions |
| `ACHIEVEMENT` | Badges and milestones | Badges unlocked, level-ups, achievement progress |
| `REMINDER` | Action reminders | Upcoming events, incomplete profiles, pending actions |
| `COMMUNITY` | Community updates | New posts, member joins, community events, announcements |
| `TRAVEL` | Travel features | Trip companions, travel matches, bucket list updates |

---

## Priority Levels

| Priority | Badge Color | Use Cases |
|----------|-------------|-----------|
| `low` | Gray | Informational (new event published, profile view) |
| `normal` | Blue | Standard actions (connection accepted, RSVP received) |
| `high` | Orange | Important (vouch received, password changed) |
| `urgent` | Red | Critical security alerts |

---

## Endpoints

### Get Notifications

Retrieve user's notifications with pagination and optional filtering.

```http
GET /v2/notifications
```

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Notifications per page (max 100) |
| `unreadOnly` | boolean | false | Filter to show only unread |

#### Example Request

```bash
curl -X GET "https://api.berse-app.com/v2/notifications?page=1&limit=20&unreadOnly=false" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "id": "clx1234567890",
        "userId": "usr_abc123",
        "type": "EVENT",
        "title": "New Event RSVP",
        "message": "John Doe RSVP'd to your event: Summer BBQ Party",
        "actionUrl": "/events/evt_123/attendees",
        "metadata": {
          "eventId": "evt_123",
          "userId": "usr_xyz789"
        },
        "priority": "normal",
        "readAt": null,
        "createdAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "total": 45,
    "unreadCount": 12,
    "hasMore": true,
    "page": 1,
    "pages": 3
  }
}
```

---

### Get Unread Count

Get count of unread notifications (useful for badge display).

```http
GET /v2/notifications/unread-count
```

#### Example Request

```bash
curl -X GET "https://api.berse-app.com/v2/notifications/unread-count" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "Unread count retrieved successfully",
  "data": {
    "count": 12
  }
}
```

---

### Mark as Read

Mark a specific notification as read.

```http
PUT /v2/notifications/:notificationId/read
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notificationId` | string | Yes | The notification ID |

#### Example Request

```bash
curl -X PUT "https://api.berse-app.com/v2/notifications/clx1234567890/read" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### Mark All as Read

Mark all user's notifications as read at once.

```http
PUT /v2/notifications/read-all
```

#### Example Request

```bash
curl -X PUT "https://api.berse-app.com/v2/notifications/read-all" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "count": 15
  }
}
```

---

### Delete Notification

Delete a specific notification.

```http
DELETE /v2/notifications/:notificationId
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notificationId` | string | Yes | The notification ID |

#### Example Request

```bash
curl -X DELETE "https://api.berse-app.com/v2/notifications/clx1234567890" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

### Delete All Read

Delete all notifications that have been marked as read (cleanup old notifications).

```http
DELETE /v2/notifications/read
```

#### Example Request

```bash
curl -X DELETE "https://api.berse-app.com/v2/notifications/read" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "15 read notifications deleted",
  "data": {
    "deletedCount": 15
  }
}
```

---

## Use Cases

### 1. Display Notification Badge

```typescript
// Poll for unread count every 30 seconds
const getUnreadCount = async () => {
  const response = await fetch('/v2/notifications/unread-count', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  updateBadge(data.data.count);
};

setInterval(getUnreadCount, 30000);
```

### 2. Show Notification List

```typescript
const getNotifications = async (page = 1) => {
  const response = await fetch(`/v2/notifications?page=${page}&limit=20`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  
  displayNotifications(data.data.notifications);
  updatePagination(data.data.page, data.data.pages);
};
```

### 3. Mark Notification as Read on Tap

```typescript
const handleNotificationTap = async (notification) => {
  // Mark as read
  await fetch(`/v2/notifications/${notification.id}/read`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  // Navigate to action URL
  if (notification.actionUrl) {
    navigate(notification.actionUrl);
  }
};
```

### 4. Clear All Read Notifications

```typescript
const clearReadNotifications = async () => {
  const response = await fetch('/v2/notifications/read', {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  
  showToast(`${data.data.deletedCount} notifications cleared`);
  refreshNotifications();
};
```

---

## Mobile Implementation

### Notification Center UI

```typescript
import { useState, useEffect } from 'react';

function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [page]);

  const fetchNotifications = async () => {
    const response = await api.get(`/v2/notifications?page=${page}&limit=20`);
    setNotifications(response.data.notifications);
  };

  const fetchUnreadCount = async () => {
    const response = await api.get('/v2/notifications/unread-count');
    setUnreadCount(response.data.count);
  };

  const markAsRead = async (notificationId) => {
    await api.put(`/v2/notifications/${notificationId}/read`);
    fetchNotifications();
    fetchUnreadCount();
  };

  const markAllAsRead = async () => {
    await api.put('/v2/notifications/read-all');
    fetchNotifications();
    setUnreadCount(0);
  };

  return (
    <View>
      <Header>
        <Title>Notifications ({unreadCount})</Title>
        <Button onPress={markAllAsRead}>Mark All Read</Button>
      </Header>
      
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => {
              markAsRead(item.id);
              navigate(item.actionUrl);
            }}
          />
        )}
      />
    </View>
  );
}
```

### Email Verification Banner

```typescript
import { useAuth } from './hooks/useAuth';

function EmailVerificationBanner() {
  const { user } = useAuth();
  
  if (user?.security?.emailVerifiedAt) {
    return null; // Email is verified, don't show banner
  }

  return (
    <Banner type="warning">
      Please verify your email address to unlock all features.
      <Button onPress={() => navigate('/verify-email')}>
        Verify Now
      </Button>
    </Banner>
  );
}
```

### Priority-Based Notification Styling

```typescript
function NotificationItem({ notification }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'normal': return 'blue';
      case 'low': return 'gray';
      default: return 'gray';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.notification,
        !notification.readAt && styles.unread
      ]}
      onPress={() => handleNotificationTap(notification)}
    >
      <View style={[
        styles.priorityIndicator,
        { backgroundColor: getPriorityColor(notification.priority) }
      ]} />
      
      <View style={styles.content}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message}>{notification.message}</Text>
        <Text style={styles.time}>
          {formatTimeAgo(notification.createdAt)}
        </Text>
      </View>
      
      {!notification.readAt && (
        <View style={styles.unreadDot} />
      )}
    </TouchableOpacity>
  );
}
```

---

## Notification Triggers

### Authentication
- ✅ User registration (if email verification disabled)
- ✅ Email verification required
- ✅ Email verified
- ✅ Password changed

### Social
- ✅ Someone used your referral code
- Profile views (planned)
- Birthday reminders (planned)

### Connections
- ✅ Connection request received
- ✅ Connection request accepted

### Vouching
- ✅ Vouch requested from you
- ✅ Vouch approved

### Events
- ✅ User RSVPs to your event
- ✅ New event published (to connections/community)

### Achievements
- Badge unlocked (planned)
- Milestone reached (planned)
- Level up (planned)

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid notification ID"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Notification not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limits

- **General**: 100 requests per 15 minutes
- **Authentication**: Required for all endpoints

---

## Best Practices

1. **Poll Smartly**: Poll unread count every 30-60 seconds, not notifications list
2. **Mark as Read**: Mark notifications as read when user taps them
3. **Deep Links**: Use `actionUrl` to navigate to relevant screens
4. **Pagination**: Load notifications in batches (20-50 per page)
5. **Cleanup**: Periodically delete read notifications to improve performance
6. **Error Handling**: Handle failed notification fetches gracefully
7. **Offline Support**: Cache notifications for offline viewing
8. **Badge Update**: Update badge immediately after marking as read

---

## Future Enhancements

- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Email notifications for critical alerts
- [ ] WebSocket support for real-time delivery
- [ ] Notification preferences/settings
- [ ] Notification categories/grouping
- [ ] Bulk mark as read by type
- [ ] Notification sound customization
- [ ] Smart notification batching

---

## Support

For issues or questions:
- **Email**: support@berse-app.com
- **Documentation**: https://docs.berse-app.com
- **Status**: https://status.berse-app.com

---

**Version**: 1.1.0  
**Last Updated**: October 18, 2025
