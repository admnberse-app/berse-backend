# BerseMuka Technical Architecture & Database Connection

## Overview
BerseMuka is a full-stack web application with a React frontend and Node.js backend, using PostgreSQL as the primary database.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express (api.berse.app)
- **Database**: PostgreSQL (hosted on Railway)
- **Deployment**: 
  - Frontend: Netlify (berse.app) & Railway
  - Backend: Railway (api.berse.app)
- **Authentication**: JWT tokens

## Database Connection Architecture

### 1. Frontend → Backend API Connection
```javascript
// API Base URL Configuration (frontend)
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? '' // Proxy to localhost:5000 in development
  : 'https://api.berse.app'; // Production API
```

### 2. Authentication Flow
```javascript
// Login Request
POST /api/v1/auth/login
Body: { email, password }
Response: { 
  token: "JWT_TOKEN",
  user: { id, email, fullName, ... }
}

// Token Storage
localStorage.setItem('bersemuka_token', token);

// Authenticated Requests
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### 3. Key API Endpoints

#### User Management
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update profile
- `POST /api/v1/users/follow/:userId` - Send friend request

#### Events System
- `GET /api/v1/events` - Get all events
- `POST /api/v1/events` - Create new event
- `GET /api/v1/events/:eventId` - Get specific event
- `PUT /api/v1/events/:eventId` - Update event
- `DELETE /api/v1/events/:eventId` - Delete event
- `POST /api/v1/events/:eventId/register` - Register for event

#### Messaging System
- `GET /api/v1/messages/inbox` - Get user messages
- `POST /api/v1/messages/send` - Send message
- `PATCH /api/v1/messages/:messageId/read` - Mark as read
- `POST /api/v1/messages/accept-friend-request` - Accept friend request
- `POST /api/v1/messages/decline-friend-request` - Decline friend request

#### Communities
- `GET /api/v1/communities` - Get all communities
- `POST /api/v1/communities/join/:communityId` - Join community
- `POST /api/v1/communities/leave/:communityId` - Leave community

## Data Storage Strategy

### Hybrid Storage Approach
The app uses a hybrid storage strategy for optimal performance and offline capability:

```javascript
// 1. Backend-First Storage (Primary)
try {
  const response = await fetch(`${API_BASE_URL}/api/v1/events`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  
  // 2. Cache in localStorage (Fallback)
  localStorage.setItem('cached_events', JSON.stringify(data));
  
} catch (error) {
  // 3. Fallback to cached data if backend fails
  const cached = localStorage.getItem('cached_events');
  return cached ? JSON.parse(cached) : [];
}
```

### Key localStorage Keys
```javascript
// Authentication
'bersemuka_token' - JWT authentication token
'current_user' - User profile data

// Events
'userCreatedEvents' - Events created by user
'cached_events' - All events cache
'cached_backend_events' - Backend events cache
'pending_event_sync' - Events pending sync to backend

// Messaging
'friend_requests' - Friend request records
'user_messages' - Direct messages
'notifications' - User notifications

// Profile
'user_profile' - Complete user profile
'user_points' - BerseMuka points

// Communities
'user_communities' - Joined communities
'community_join_requests' - Pending requests
```

## Services Architecture

### 1. Profile Service (`profile.service.ts`)
```javascript
class ProfileService {
  async getProfile(): Promise<ProfileData>
  async saveProfile(profileData: ProfileData): Promise<any>
  async updateProfile(updates: Partial<ProfileData>): Promise<any>
  async deleteProfile(): Promise<void>
  async searchProfiles(query: string): Promise<ProfileData[]>
}
```

### 2. Events Service (`events.service.ts`)
```javascript
class EventsService {
  async getAllEvents(): Promise<Event[]> // Merges backend + local
  async createEvent(eventData: Partial<Event>): Promise<Event>
  async syncEvents(): Promise<void> // Syncs pending local events
  async getUserEvents(userId: string): Promise<Event[]>
}
```

### 3. Notification Service (`notification.service.ts`)
```javascript
class NotificationService {
  async requestPermission(): Promise<boolean>
  showNotification(title: string, options?: NotificationOptions)
  showFriendRequest(fromName: string, message?: string)
  showMessage(fromName: string, message: string)
  storeNotification(notification: any)
  getUnreadCount(): number
}
```

## Authentication Context (`AuthContext.tsx`)
```javascript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}
```

## Data Sync Strategy

### Event Synchronization
```javascript
// utils/eventSync.ts
export const syncLocalEventsToBackend = async (
  userEmail: string, 
  token: string
) => {
  const localEvents = JSON.parse(
    localStorage.getItem('userCreatedEvents') || '[]'
  );
  
  for (const event of localEvents) {
    if (!event.syncedToBackend) {
      await api.post('/events', event);
      event.syncedToBackend = true;
    }
  }
}
```

### Offline-First Pattern
1. User performs action (create event, send message)
2. Save immediately to localStorage
3. Attempt backend sync
4. If sync fails, mark for retry
5. Retry sync when connection restored

## CORS Configuration
Backend must include:
```javascript
// Required for production
CORS_ORIGIN=https://berse.app,https://www.berse.app,http://localhost:3000,http://localhost:5173
```

## Environment Variables

### Frontend (.env)
```bash
# Comment out in production to avoid double /api issue
# VITE_API_URL=https://api.berse.app

VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_ENABLE_PWA=true
```

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:pass@host/database
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=https://berse.app,https://www.berse.app
PORT=5000
NODE_ENV=production
```

## Common Issues & Solutions

### 1. Double `/api` Path Issue
**Problem**: Requests going to `/api/api/v1/...`
**Solution**: Comment out `VITE_API_URL` in frontend/.env

### 2. CORS Errors
**Problem**: Cross-origin requests blocked
**Solution**: Ensure `CORS_ORIGIN` env var is set on Railway backend

### 3. Events Not Syncing
**Problem**: Events created on one device not showing on another
**Solution**: Check `eventsService.syncEvents()` is called on app load

### 4. Authentication Token Expiry
**Problem**: 401 errors after some time
**Solution**: Implement token refresh mechanism or re-login flow

## Testing API Connection
```javascript
// Run in browser console
const testApiConfig = async () => {
  const token = localStorage.getItem('bersemuka_token');
  const API_BASE = window.location.hostname === 'localhost' 
    ? '' : 'https://api.berse.app';
    
  console.log('API Base:', API_BASE);
  console.log('Token exists:', !!token);
  
  try {
    const response = await fetch(`${API_BASE}/api/v1/events`, {
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    });
    console.log('API Response:', response.status);
    const data = await response.json();
    console.log('Data:', data);
  } catch (error) {
    console.error('API Error:', error);
  }
};

testApiConfig();
```

## Database Schema (PostgreSQL)

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  username VARCHAR(100) UNIQUE,
  phone_number VARCHAR(20),
  nationality VARCHAR(100),
  city VARCHAR(100),
  profile_picture TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Events Table
```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME,
  location VARCHAR(255),
  venue VARCHAR(255),
  category VARCHAR(50),
  price DECIMAL(10, 2) DEFAULT 0,
  max_attendees INTEGER DEFAULT 50,
  organizer_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id),
  recipient_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'direct',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Friend Requests Table
```sql
CREATE TABLE friend_requests (
  id SERIAL PRIMARY KEY,
  from_user_id INTEGER REFERENCES users(id),
  to_user_id INTEGER REFERENCES users(id),
  message TEXT,
  event_id INTEGER REFERENCES events(id),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Deployment Process

### Frontend (Netlify)
1. Push to GitHub (raihaan123/BerseMuka)
2. Netlify auto-deploys from main branch
3. Build command: `cd frontend && npm run build`
4. Publish directory: `frontend/dist`

### Backend (Railway)
1. Push to GitHub (zaydmahdaly00/BerseMuka)
2. Railway auto-deploys from main branch
3. Start command: `npm start`
4. Environment variables set in Railway dashboard

## Monitoring & Debugging

### Check Backend Health
```bash
curl https://api.berse.app/health
```

### View Logs
- Frontend: Netlify dashboard → Functions → Logs
- Backend: Railway dashboard → Deployments → Logs

### Database Queries
Access via Railway dashboard → Database → Query

## Security Considerations
1. JWT tokens expire after 7 days
2. Passwords hashed with bcrypt
3. SQL injection prevention via parameterized queries
4. XSS protection via React's built-in escaping
5. HTTPS enforced on production
6. Environment variables for sensitive data

## Contact for Database Access
- Railway Dashboard: railway.app
- Database credentials: Stored in Railway environment variables
- Backend logs: Available in Railway deployment logs
- API documentation: This file + inline code comments

---

**Last Updated**: December 2024
**Maintained by**: BerseMuka Development Team