# BerseMuka App Frontend API Integration

This directory contains the complete API service layer for the BerseMuka App frontend. It provides a clean, type-safe interface for communicating with the backend API.

## Directory Structure

```
frontend-api/
├── config/
│   └── api.config.ts      # API configuration and endpoints
├── types/
│   └── index.ts          # TypeScript type definitions
├── utils/
│   ├── api-client.ts     # Base API client with interceptors
│   └── error-handler.ts  # Error handling utilities
├── services/
│   ├── auth.service.ts      # Authentication service
│   ├── user.service.ts      # User profile management
│   ├── event.service.ts     # Event management
│   ├── points.service.ts    # Points system
│   ├── rewards.service.ts   # Rewards management
│   ├── matching.service.ts  # User matching/connections
│   ├── badge.service.ts     # Badge system
│   ├── websocket.service.ts # Real-time features
│   └── index.ts            # Service exports
└── README.md              # This file
```

## Installation

1. **Install dependencies**:
```bash
npm install axios
```

2. **Copy the frontend-api directory** to your frontend project

3. **Configure environment variables**:
```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_WS_URL=ws://localhost:3000
```

Or for Next.js:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

## Usage Examples

### Authentication

```typescript
import { authService } from './frontend-api/services'

// Login
const loginResponse = await authService.login({
  email: 'user@example.com',
  password: 'password123'
})

if (loginResponse.success) {
  console.log('Logged in:', loginResponse.data.user)
}

// Register
const registerResponse = await authService.register({
  email: 'newuser@example.com',
  password: 'password123',
  fullName: 'John Doe',
  phone: '+1234567890',
  referralCode: 'REF123'
})

// Logout
await authService.logout()

// Check authentication
if (authService.isAuthenticated()) {
  const user = authService.getCurrentUser()
  console.log('Current user:', user)
}
```

### User Profile Management

```typescript
import { userService } from './frontend-api/services'

// Get profile
const profile = await userService.getProfile()

// Update profile
const updated = await userService.updateProfile({
  bio: 'Software developer interested in hiking',
  city: 'San Francisco',
  interests: ['coding', 'hiking', 'photography']
})

// Upload profile picture
const file = new File(['...'], 'profile.jpg', { type: 'image/jpeg' })
await userService.uploadProfilePicture(file)

// Search users
const users = await userService.searchUsers({
  city: 'San Francisco',
  interest: 'hiking'
})

// Follow/unfollow
await userService.followUser('user-id-123')
await userService.unfollowUser('user-id-123')
```

### Event Management

```typescript
import { eventService } from './frontend-api/services'

// Get upcoming events
const events = await eventService.getUpcomingEvents({
  city: 'San Francisco',
  type: 'SOCIAL'
})

// Get event details
const event = await eventService.getEventById('event-id-123')

// RSVP to event
await eventService.rsvpEvent('event-id-123')

// Check-in at event (QR code scanning)
const checkIn = await eventService.checkInEvent({
  eventId: 'event-id-123',
  userId: 'user-id-456'
})

if (checkIn.success) {
  console.log(`Earned ${checkIn.data.points} points!`)
}

// Create event (admin/moderator only)
const newEvent = await eventService.createEvent({
  title: 'Community Meetup',
  description: 'Monthly community gathering',
  type: 'SOCIAL',
  date: '2024-02-01T18:00:00Z',
  location: 'Community Center',
  maxAttendees: 50
})
```

### Points & Rewards

```typescript
import { pointsService, rewardsService } from './frontend-api/services'

// Get user points
const points = await pointsService.getUserPoints()
console.log(`Total points: ${points.data.totalPoints}`)

// Get available rewards
const rewards = await rewardsService.getAffordableRewards(points.data.totalPoints)

// Redeem reward
const redemption = await rewardsService.redeemReward('reward-id-123')

// Get redemption history
const history = await rewardsService.getUserRedemptions()
```

### User Matching & Connections

```typescript
import { matchingService } from './frontend-api/services'

// Get potential matches
const matches = await matchingService.getPotentialMatches({
  interests: ['hiking', 'photography'],
  city: 'San Francisco'
})

// Send connection request
await matchingService.sendConnectionRequest('user-id-123', 'Hi! Would love to connect.')

// Handle connection requests
const requests = await matchingService.getPendingRequests()
await matchingService.acceptConnectionRequest('request-id-123')
```

### Real-time Features

```typescript
import { websocketService } from './frontend-api/services'

// Connect to WebSocket
websocketService.connect()

// Listen for notifications
const unsubscribe = websocketService.on('notification', (data) => {
  console.log('New notification:', data)
})

// Listen for new matches
websocketService.on('match', (data) => {
  console.log('New match!', data)
})

// Join a chat room
websocketService.joinRoom('event-123-chat')

// Send chat message
websocketService.sendChatMessage('event-123-chat', 'Hello everyone!')

// Clean up
unsubscribe()
websocketService.disconnect()
```

## Error Handling

All service methods return an `ApiResponse<T>` object:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
```

Example error handling:

```typescript
const response = await userService.updateProfile({ bio: 'New bio' })

if (response.success) {
  console.log('Profile updated:', response.data)
} else {
  console.error('Update failed:', response.error)
  // Show error to user
}
```

## Authentication Flow

1. The API client automatically adds the auth token to all requests
2. If a 401 Unauthorized response is received, the user is logged out
3. Listen for the `auth:logout` event to redirect to login page:

```typescript
window.addEventListener('auth:logout', () => {
  // Redirect to login
  window.location.href = '/login'
})
```

## TypeScript Support

All services are fully typed. Import types as needed:

```typescript
import { 
  User, 
  Event, 
  EventType,
  Reward,
  ApiResponse 
} from './frontend-api/types'
```

## Integration with Frontend Frameworks

### React Example

```tsx
import React, { useState, useEffect } from 'react'
import { eventService } from './frontend-api/services'
import { Event } from './frontend-api/types'

function EventList() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    loadEvents()
  }, [])
  
  async function loadEvents() {
    setLoading(true)
    const response = await eventService.getUpcomingEvents()
    
    if (response.success) {
      setEvents(response.data || [])
      setError(null)
    } else {
      setError(response.error || 'Failed to load events')
    }
    
    setLoading(false)
  }
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <div>
      {events.map(event => (
        <div key={event.id}>
          <h3>{event.title}</h3>
          <p>{event.description}</p>
        </div>
      ))}
    </div>
  )
}
```

### Vue Example

```vue
<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else>
      <div v-for="event in events" :key="event.id">
        <h3>{{ event.title }}</h3>
        <p>{{ event.description }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { eventService } from './frontend-api/services'

export default {
  data() {
    return {
      events: [],
      loading: true,
      error: null
    }
  },
  
  async mounted() {
    await this.loadEvents()
  },
  
  methods: {
    async loadEvents() {
      this.loading = true
      const response = await eventService.getUpcomingEvents()
      
      if (response.success) {
        this.events = response.data || []
        this.error = null
      } else {
        this.error = response.error || 'Failed to load events'
      }
      
      this.loading = false
    }
  }
}
</script>
```

## Best Practices

1. **Always handle errors**: Check the `success` field before using `data`
2. **Use TypeScript**: Leverage the provided types for better IDE support
3. **Clean up subscriptions**: Unsubscribe from WebSocket events when components unmount
4. **Cache data appropriately**: Consider using state management (Redux, Vuex, etc.)
5. **Handle loading states**: Show appropriate UI feedback during API calls

## Testing

For testing, you can mock the services:

```typescript
// __mocks__/frontend-api/services/auth.service.ts
export default {
  login: jest.fn().mockResolvedValue({ 
    success: true, 
    data: { token: 'test-token', user: { id: '1', email: 'test@example.com' } }
  }),
  logout: jest.fn(),
  isAuthenticated: jest.fn().mockReturnValue(true)
}
```

## Support

For issues or questions about the API integration, please refer to the backend documentation or contact the development team.