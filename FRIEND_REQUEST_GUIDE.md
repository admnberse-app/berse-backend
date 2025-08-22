# 🤝 Friend Request System - Complete Guide

## 📤 Where You Can Send Friend Requests

### 1. **BerseMatch Screen** (/match)
- **Profile Cards**: Click "🤝 Friend Request" button on any profile card
- **Profile Detail Modal**: View full profile and click "🤝 Friend Request" button
- **Location**: Main matching interface where you discover new people

### 2. **BerseConnect Screen** (/connect)
- **Event Attendees**: When viewing event details, click on attendee profiles
- **Profile Modal**: Click "🤝 Add Friend" button in the profile detail view
- **Location**: Events and community connections interface

### 3. **Public Profile Pages** (/profile/:userId)
- **Share Links**: When someone shares their profile link
- **QR Codes**: Scan someone's profile QR code
- **Connect Button**: Click "🤝 Connect with [Name]" button

### 4. **Forum/Community Screens** (Future)
- Community member lists
- Forum post authors
- Event organizers

## 📬 Where You Receive Friend Requests

### 1. **Messages Screen** (/messages) - PRIMARY LOCATION
When someone sends you a friend request, you'll see:

```
┌─────────────────────────────────┐
│ 🔴 Private Messages (2)         │
├─────────────────────────────────┤
│ [Avatar] John Doe               │
│ "John Doe sent you a friend     │
│ request! You can accept or      │
│ decline this request."          │
│                                 │
│ [✓ Accept] [✗ Decline]         │
└─────────────────────────────────┘
```

**Features:**
- Red notification badge with unread count
- Friend request appears as a message
- Accept/Decline buttons directly in the message
- Message highlighted with green border when unread

### 2. **Notifications Panel**
- Bell icon shows notification count
- "New Friend Request" notification
- Click to navigate to Messages

### 3. **Profile Screen Indicators**
- Message count badge on "Private Messages" menu item
- Total unread count visible

## 🔄 Friend Request Flow

### Sending a Request:
1. **User A** finds **User B** in Match/Connect/Profile screen
2. **User A** clicks "Send Friend Request" button
3. System sends API call to `/api/v1/users/follow/:userId`
4. Backend creates:
   - Follow relationship (pending)
   - Message notification
   - Push notification

### Receiving a Request:
1. **User B** sees notification badge
2. Opens Messages screen
3. Sees friend request message with action buttons
4. Can either:
   - **Accept**: Creates mutual follow relationship
   - **Decline**: Removes the follow request

### After Accepting:
1. Both users become "friends" (mutual follow)
2. Sender receives acceptance notification
3. Both can now:
   - Message each other freely
   - See each other in friends list
   - Have enhanced profile visibility

## 💡 Quick Access Tips

### Fastest Way to Send:
- **From Match Screen**: Browse profiles → Click "🤝 Friend Request"
- **From Events**: View attendees → Click profile → "🤝 Add Friend"

### Fastest Way to Receive:
- **Profile** → **"💬 Private Messages"** → See all requests with action buttons

## 🎯 API Endpoints Used

### Send Friend Request:
```
POST /api/v1/users/follow/:userId
Authorization: Bearer [token]
```

### Accept Friend Request:
```
POST /api/v1/messages/accept-friend-request
Body: { followerId: "user-id" }
```

### Decline Friend Request:
```
POST /api/v1/messages/decline-friend-request
Body: { followerId: "user-id" }
```

## 🔔 Notification Types

1. **Message Notification**: Main notification in inbox
2. **Push Notification**: If enabled, phone notification
3. **In-App Badge**: Red badge on Messages icon
4. **Profile Badge**: Count on Private Messages menu

## ⚠️ Important Notes

- You cannot send friend requests to yourself
- You cannot send duplicate requests (system prevents it)
- Friend requests expire after 30 days (future feature)
- Blocked users cannot send you requests (future feature)

## 🚀 Recent Updates

- ✅ Friend requests now create message notifications
- ✅ Accept/Decline buttons in message view
- ✅ API integration for Match and Connect screens
- ✅ Public profile friend request functionality
- ✅ Reusable SendFriendRequestButton component

## 📱 User Experience

The system is designed to be intuitive:
1. **Discovery**: Find people through Match, Events, or shared profiles
2. **Connection**: One-click friend request from any profile view
3. **Notification**: Clear, actionable notifications in Messages
4. **Action**: Simple Accept/Decline directly in the message
5. **Confirmation**: Both parties notified of the outcome

---

**Last Updated**: August 22, 2025
**Version**: 1.0