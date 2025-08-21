# BerseMuka User Flow & Database Documentation

## 🔴 PERFORMANCE ISSUES IDENTIFIED

### Connect Screen (Events) - 20+ seconds load time
**Root Causes:**
1. **Cold Start**: Railway.app free tier puts the server to sleep after inactivity
2. **Database Wake-up**: PostgreSQL on Railway takes time to wake from sleep
3. **No Loading State**: UI doesn't show loading indicator, appears frozen
4. **Refresh Interval**: Events refresh every 10 seconds (causing additional delays)

### Match Screen (Profiles) - Slow load time
**Root Causes:**
1. Same cold start issue as above
2. Loading all user data without pagination
3. No caching mechanism

### SOLUTIONS TO IMPLEMENT:
```javascript
// 1. Add loading states
const [isLoading, setIsLoading] = useState(true);

// 2. Show skeleton loaders while fetching
{isLoading ? <SkeletonLoader /> : <EventsList />}

// 3. Implement caching
const cachedEvents = localStorage.getItem('cached_events');
if (cachedEvents) {
  setEvents(JSON.parse(cachedEvents));
}

// 4. Add retry logic with exponential backoff
// 5. Consider upgrading to Railway paid tier ($5/month) for always-on server
```

---

## 📊 COMPLETE USER FLOW & DATABASE ARCHITECTURE

### 1️⃣ USER REGISTRATION FLOW

```mermaid
User Registration → Database Storage → Session Creation
```

**Frontend (RegisterScreen.tsx)**
```javascript
// User fills form with:
- email (required)
- password (required)
- fullName (required)
- username (required)
- phone (optional)
- nationality
- countryOfResidence
- city
- gender
- dateOfBirth
```

**Backend (auth.controller.ts)**
```javascript
// Creates user in PostgreSQL with:
const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    fullName,
    username,
    nationality,
    countryOfResidence,
    city,
    gender,
    dateOfBirth,
    membershipId: 'BSE123456', // Auto-generated
    totalPoints: 30, // Welcome bonus
    role: 'GENERAL_USER'
  }
});
```

**Database Schema (User table)**
```prisma
model User {
  id                String    @id @default(uuid())
  email             String    @unique
  phone             String?   @unique
  password          String
  fullName          String?
  username          String?   @unique
  membershipId      String?   @unique
  
  // Profile Information
  bio               String?
  profilePicture    String?
  city              String?
  nationality       String?
  gender            String?
  dateOfBirth       DateTime?
  
  // Additional Fields
  interests         String[]
  currentLocation   String?
  originallyFrom    String?
  personalityType   String?
  languages         String?
  age               Int?
  profession        String?
  website           String?
  servicesOffered   String[]
  
  // Social Media
  instagramHandle   String?
  linkedinHandle    String?
  
  // System Fields
  role              UserRole  @default(GENERAL_USER)
  totalPoints       Int       @default(0)
  createdAt         DateTime  @default(now())
  
  // Relationships
  hostedEvents      Event[]   @relation("EventHost")
  attendedEvents    EventAttendance[]
  rsvpEvents        EventRSVP[]
  badges            UserBadge[]
  pointsHistory     PointHistory[]
}
```

---

### 2️⃣ LOGIN FLOW

**Frontend (AuthContext.tsx)**
```javascript
// Login process:
1. User enters email + password
2. Sends to /api/v1/auth/login
3. Receives JWT token + user data
4. Stores in localStorage:
   - bersemuka_token (JWT)
   - bersemuka_user (user object)
   - rememberMe (true)
```

**Persistent Login Implementation**
```javascript
// On app start, AuthContext:
1. Checks localStorage for token
2. Immediately restores session (no blocking)
3. Validates token in background
4. Only logs out on 401 (expired token)
```

---

### 3️⃣ PROFILE DISPLAY & EDIT FLOW

**Profile Screen Shows:**
```javascript
// Data from User object:
- fullName (from registration)
- username (from registration)
- city (from registration)
- nationality (from registration)
- gender (from registration)
- membershipId (auto-generated)
- bio (editable)
- interests (editable)
- profession (editable)
- age (editable)
- personalityType (editable)
```

**Edit Profile Updates:**
```javascript
// PUT /api/v1/users/profile
await prisma.user.update({
  where: { id: userId },
  data: {
    fullName,
    bio,
    interests,
    profession,
    currentLocation,
    // ... other fields
  }
});
```

---

### 4️⃣ EVENT CREATION & JOINING FLOW

**Event Creation (CreateEventScreen.tsx)**
```javascript
// User creates event with:
{
  title,
  description,
  date,
  time,
  location,
  venue,
  category,
  price,
  maxAttendees,
  hosts: [],
  tags: []
}

// Saved to Event table:
await prisma.event.create({
  data: {
    title,
    description,
    date,
    location,
    hostId: userId, // Links to User
    maxAttendees,
    type: category
  }
});
```

**Event Joining (BerseConnectScreen.tsx)**
```javascript
// User joins event:
1. Creates RSVP record
await prisma.eventRSVP.create({
  data: {
    userId,
    eventId,
    status: 'CONFIRMED'
  }
});

2. Awards points
await prisma.pointHistory.create({
  data: {
    userId,
    amount: 5,
    type: 'EVENT_RSVP'
  }
});
```

---

### 5️⃣ MATCH SCREEN FLOW

**Loading Other Users**
```javascript
// GET /api/v1/users/all
const users = await prisma.user.findMany({
  where: {
    id: { not: currentUserId } // Excludes self
  },
  select: {
    id: true,
    fullName: true,
    profilePicture: true,
    bio: true,
    city: true,
    interests: true,
    profession: true,
    age: true
  }
});
```

---

## 🗄️ DATABASE RELATIONSHIPS

```
User (1) ──→ (Many) Event [as host]
User (1) ──→ (Many) EventRSVP [as attendee]
User (1) ──→ (Many) PointHistory
User (1) ──→ (Many) UserBadge
User (1) ──→ (Many) Follow [as follower/following]
User (1) ──→ (Many) Message [as sender/receiver]

Event (1) ──→ (Many) EventRSVP
Event (1) ──→ (Many) EventAttendance
Event (1) ──→ (1) User [host]
```

---

## 🔄 DATA FLOW VISUALIZATION

```
REGISTRATION
├── Frontend Form
├── POST /api/v1/auth/register
├── Create User in DB
├── Generate membershipId
├── Award 30 points
├── Return JWT token
└── Store in localStorage

LOGIN
├── Frontend Form
├── POST /api/v1/auth/login
├── Verify credentials
├── Generate JWT token
├── Return user data
└── Store in localStorage

PROFILE UPDATE
├── Edit Profile Form
├── PUT /api/v1/users/profile
├── Update User in DB
├── Return updated user
└── Update localStorage

EVENT CREATION
├── Create Event Form
├── POST /api/v1/events
├── Create Event in DB
├── Link to User (hostId)
└── Display in Connect screen

EVENT JOIN
├── Click Join Button
├── POST /api/v1/events/:id/rsvp
├── Create RSVP record
├── Award points
└── Update attendee count
```

---

## 🐛 FIXES NEEDED FOR PERFORMANCE

1. **Add Loading States**
   - Show skeleton loaders
   - Display "Connecting to server..." message

2. **Implement Caching**
   - Cache events/users in localStorage
   - Show cached data immediately
   - Update in background

3. **Optimize API Calls**
   - Add pagination (load 10 at a time)
   - Implement lazy loading
   - Remove 10-second refresh interval

4. **Server Optimization**
   - Keep-alive endpoint to prevent sleep
   - Or upgrade to Railway paid tier
   - Add database connection pooling

5. **Error Handling**
   - Add retry logic
   - Show offline mode
   - Better error messages