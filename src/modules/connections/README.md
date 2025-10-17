# Connection & Network Module

## 📋 Overview

The Connection & Network module is a comprehensive system for managing user connections, vouching, trust scores, travel experiences, and trust moments in the Berse app. It enables users to build meaningful relationships while establishing trust through a sophisticated trust chain system.

## ✅ Implemented Features

### Core Connection Management ✅ COMPLETE
- ✅ Send connection requests with optional message
- ✅ Accept/reject connection requests
- ✅ Withdraw pending requests
- ✅ Remove existing connections
- ✅ Update connection details (relationship type, tags, etc.)
- ✅ Block/unblock users
- ✅ Get connections with filters and pagination
- ✅ Get mutual connections between users
- ✅ Connection statistics and analytics
- ✅ Connection suggestions (basic implementation)

### Vouching System ✅ COMPLETE
- ✅ Request vouches from connections (PRIMARY, SECONDARY)
- ✅ Approve/decline/downgrade vouch requests (DECLINED status tracked)
- ✅ Revoke existing vouches
- ✅ Community vouches (admin-initiated)
- ✅ Auto-vouch eligibility checking
- ✅ Vouch limits enforcement (1 primary, 3 secondary, 2 community)
- ✅ Vouch statistics and summary (includes declined count)
- 🚧 Background job for auto-vouch processing (non-critical)

### Trust Score System ✅ COMPLETE
- ✅ Trust score calculation (40% vouches, 30% activity, 30% trust moments)
- ✅ Trust level determination (new → starter → growing → established → trusted → elite)
- ✅ Event-driven trust score updates
- ✅ Batch trust score recalculation

### Travel Logbook 🚧 SKELETON
- 🚧 Create travel entries
- 🚧 Link connections to travels
- 🚧 Travel history and statistics
- 🚧 Get travels where users met

### Trust Moments 🚧 SKELETON
- 🚧 Create event-specific feedback
- 🚧 Rate connections after shared experiences
- 🚧 Trust moment statistics
- 🚧 Contribution to trust score

## 📁 Module Structure

```
src/modules/connections/
├── core/                          # Core connection management
│   ├── connection.types.ts       # TypeScript interfaces
│   ├── connection.validators.ts  # Express validators
│   ├── connection.service.ts     # Business logic (COMPLETE)
│   ├── connection.controller.ts  # HTTP handlers (COMPLETE)
│   ├── connection.routes.ts      # Express routes (COMPLETE)
│   └── index.ts                  # Module exports
├── vouching/                      # Vouching system
│   ├── vouch.types.ts            # TypeScript interfaces
│   ├── vouch.validators.ts       # Express validators
│   ├── vouch.service.ts          # Business logic (SKELETON)
│   ├── vouch.controller.ts       # HTTP handlers (SKELETON)
│   ├── vouch.routes.ts           # Express routes (SKELETON)
│   └── index.ts                  # Module exports
├── trust/                         # Trust score calculation
│   ├── trust-score.service.ts    # Trust score logic (COMPLETE)
│   └── index.ts                  # Module exports
├── travel/                        # Travel logbook
│   ├── travel.types.ts           # TypeScript interfaces
│   ├── travel.service.ts         # Business logic (SKELETON)
│   └── index.ts                  # Module exports
├── trust-moments/                 # Event-specific feedback
│   ├── trust-moment.types.ts     # TypeScript interfaces
│   ├── trust-moment.service.ts   # Business logic (SKELETON)
│   └── index.ts                  # Module exports
├── services/                      # Shared services (empty for now)
├── index.ts                       # Main module exports
└── README.md                      # This file
```

## 🔌 API Endpoints

### Core Connections (✅ COMPLETE)

#### Connection Management
- `POST /v2/connections/request` - Send connection request
- `POST /v2/connections/:connectionId/respond` - Accept/reject request
- `DELETE /v2/connections/:connectionId/withdraw` - Withdraw pending request
- `DELETE /v2/connections/:connectionId` - Remove connection
- `PUT /v2/connections/:connectionId` - Update connection details

#### Connection Retrieval
- `GET /v2/connections` - Get connections with filters
- `GET /v2/connections/:connectionId` - Get single connection
- `GET /v2/connections/stats` - Get connection statistics
- `GET /v2/connections/mutual/:userId` - Get mutual connections
- `GET /v2/connections/suggestions` - Get connection suggestions

#### Block Management
- `POST /v2/connections/block` - Block a user
- `DELETE /v2/connections/block/:userId` - Unblock a user
- `GET /v2/connections/blocked` - Get blocked users list

### Vouching (✅ COMPLETE)
- `POST /v2/vouches/request` - Request vouch from connection
- `POST /v2/vouches/:vouchId/respond` - Approve/decline/downgrade (DECLINED status tracked)
- `POST /v2/vouches/:vouchId/revoke` - Revoke vouch
- `POST /v2/vouches/community` - Community admin vouch
- `GET /v2/vouches/auto-vouch/eligibility` - Check auto-vouch eligibility
- `GET /v2/vouches/received` - Get vouches received (filter by DECLINED)
- `GET /v2/vouches/given` - Get vouches given
- `GET /v2/vouches/limits` - Get vouch limits (1/3/2)
- `GET /v2/vouches/summary` - Get vouch summary (includes declinedVouches)

### Travel (🚧 TODO)
- `POST /v2/travel` - Create travel entry
- `PUT /v2/travel/:tripId` - Update travel entry
- `DELETE /v2/travel/:tripId` - Delete travel entry
- `POST /v2/travel/:tripId/connections` - Link connection to travel
- `GET /v2/travel` - Get travel history
- `GET /v2/travel/with/:connectionId` - Get travels with connection

### Trust Moments (🚧 TODO)
- `POST /v2/trust-moments` - Create trust moment
- `PUT /v2/trust-moments/:momentId` - Update trust moment
- `DELETE /v2/trust-moments/:momentId` - Delete trust moment
- `GET /v2/trust-moments/received` - Get trust moments received
- `GET /v2/trust-moments/given` - Get trust moments given
- `GET /v2/trust-moments/event/:eventId` - Get trust moments for event
- `GET /v2/trust-moments/stats` - Get trust moment statistics

## 🎯 Usage Examples

### Send Connection Request

```typescript
POST /v2/connections/request
Authorization: Bearer <token>

{
  "receiverId": "user_456",
  "message": "Hi! We met at the badminton event last week. Would love to connect!",
  "relationshipCategory": "friend",
  "howWeMet": "Badminton Tournament 2024"
}
```

### Accept Connection Request

```typescript
POST /v2/connections/conn_123/respond
Authorization: Bearer <token>

{
  "action": "accept"
}
```

### Get Connections with Filters

```typescript
GET /v2/connections?status=ACCEPTED&relationshipCategory=friend&page=1&limit=20
Authorization: Bearer <token>
```

### Request a Vouch

```typescript
POST /v2/vouches/request
Authorization: Bearer <token>

{
  "voucheeId": "user_789",
  "vouchType": "PRIMARY",
  "message": "We've been friends for years and attended many events together"
}
```

### Respond to Vouch Request

```typescript
POST /v2/vouches/:vouchId/respond
Authorization: Bearer <token>

{
  "action": "approve",  // or "decline" or "downgrade"
  "downgradeTo": "SECONDARY"  // if action is "downgrade"
}

// Response includes:
// - status: "APPROVED" or "DECLINED"
// - trustImpact: points awarded (0 if declined)
// - Declined vouches tracked with DECLINED status
```

## 🔐 Database Schema

### Core Models

#### UserConnection
- Symmetric connection model (both users are connected)
- Status: PENDING, ACCEPTED, REJECTED, CANCELED, REMOVED
- Tracks relationship type, trust strength, mutual connections
- Cooldown period before reconnection (30 days default)

#### ConnectionStat
- Aggregated connection statistics per user
- Connection counts by category
- Average ratings and connection quality metrics

#### UserBlock
- Block relationships between users
- Prevents connections and interactions

#### Vouch
- Vouch requests and approvals
- Types: PRIMARY (max 1), SECONDARY (max 3), COMMUNITY (max 2)
- Status: PENDING, APPROVED, ACTIVE, DECLINED, REVOKED
- DECLINED status tracks rejected requests (preserved for analytics)
- Tracks trust impact and approval timeline

#### VouchConfig
- System-wide vouch configuration
- Weights for trust score calculation
- Limits and cooldown periods
- Auto-vouch criteria

#### TrustMoment
- Event-specific feedback between connections
- Ratings (1-5) and detailed feedback
- Linked to events and connections
- Contributes to trust score (30%)

## 📊 Trust Score System

### Trust Score Composition (Out of 100)

**40% from Vouches:**
- 30% from Primary vouch (1 max) = 12 points
- 30% from Secondary vouches (3 max) = 12 points
- 40% from Community vouches (2 max) = 16 points

**30% from Activity Participation:**
- Events attended (max 10 points)
- Events hosted (max 9 points)
- Communities joined (max 6 points)
- Services provided (max 5 points)

**30% from Trust Moments:**
- Average rating from feedback (max 27 points)
- Quantity bonus (max 3 points for 10+ trust moments)

### Trust Levels
- **Elite** (90-100): Highly trusted, verified by community
- **Trusted** (75-89): Well-established, strong vouches
- **Established** (60-74): Good standing, active participant
- **Growing** (40-59): Building trust, some vouches
- **Starter** (20-39): New with minimal vouches
- **New** (0-19): Just joined, no vouches yet

### Trust Score Updates

Trust scores are **automatically recalculated** when:
- ✅ **Vouch is approved/revoked** - VouchService triggers update, adds/removes 12-16 points
- ✅ **Event check-in** - EventService triggers update after attendance logged
- 🚧 **Trust moment created/updated** - Will trigger update when implemented
- 🚧 **User joins a community** - Will trigger update when community module implemented

**Implementation Details:**
- Trust score updates are non-blocking (logged if they fail, but don't break main operation)
- Uses `TrustScoreService.triggerTrustScoreUpdate(userId, reason)` method
- Calculates all three components (vouches, activity, trust moments) each time
- Updates both `trustScore` and `trustLevel` fields on User model

**Event-Driven Triggers Implemented:**
1. `EventService.checkInAttendee()` - After successful event check-in
2. `VouchService.respondToVouchRequest()` - After vouch approval
3. `VouchService.revokeVouch()` - After vouch revocation
4. `TrustMomentService.createTrustMoment()` - Placeholder added for future implementation

For detailed trust score documentation, see [Trust Score API](../../docs/api-v2/TRUST_SCORE_API.md).

## 🚀 Next Steps / Future Enhancements

### Phase 1: Complete Skeleton Implementations
1. ✅ **Vouching System** - Implemented all vouch request/approval/decline/revoke logic
2. ✅ **Event-Driven Triggers** - Trust score auto-updates on vouch approval and event check-in
3. 🚧 **Travel Logbook** - Full CRUD for travel entries and connection linking
4. 🚧 **Trust Moments** - Complete event-specific feedback system
5. 🚧 **Auto-vouch Background Job** - processAutoVouches() cron job (non-critical)

### Phase 2: Advanced Features 🔮
4. **Connection Suggestions Algorithm** - ML-based recommendations:
   - Mutual friends analysis
   - Shared interests matching
   - Event attendance overlap
   - Location-based suggestions
   - Community membership overlap

5. **Trust Chain Visualization** - Visual representation:
   - Connection network graph
   - Trust chain depth visualization
   - Vouch relationship mapping

6. **Connection Quality Scoring** - Enhanced metrics:
   - Interaction frequency
   - Response time to messages
   - Event attendance together
   - Trust moment quality

7. **Connection Milestones** - Achievement system:
   - "First Connection" badge
   - "Trust Builder" (10 connections)
   - "Community Connector" (5+ mutual communities)
   - "Global Traveler" (met connections in 5+ countries)

### Phase 3: Integration & Optimization 🔧
8. **Notification System** - Real-time alerts:
   - Connection request received
   - Vouch request received
   - Vouch approved/revoked
   - Trust score updated

9. **Caching Layer** - Performance optimization:
   - Cache connection lists
   - Cache trust scores
   - Cache vouch statistics

10. **Background Jobs** - Scheduled tasks:
    - Auto-vouch processing (daily)
    - Trust score batch updates
    - Connection quality recalculation
    - Stale connection cleanup

11. **Analytics Dashboard** - Insights:
    - Connection growth over time
    - Trust score trends
    - Popular relationship categories
    - Vouch conversion rates

## 🧪 Testing Checklist

### Core Connections
- [x] Test connection request creation
- [x] Test accept/reject/withdraw flows
- [x] Test connection removal with cooldown
- [x] Test block/unblock functionality
- [ ] Test mutual connections calculation
- [ ] Test connection suggestions
- [ ] Test connection stats accuracy

### Vouching
- [ ] Test vouch request creation
- [ ] Test vouch limits enforcement
- [ ] Test approve/decline/downgrade flows
- [ ] Test vouch revocation
- [ ] Test community vouch creation
- [ ] Test auto-vouch eligibility
- [ ] Test trust score impact

### Trust Score
- [x] Test vouch score calculation
- [x] Test activity score calculation
- [x] Test trust moments score calculation
- [x] Test trust level determination
- [ ] Test event-driven updates

### Travel & Trust Moments
- [ ] Test travel entry CRUD
- [ ] Test connection linking to travels
- [ ] Test trust moment creation
- [ ] Test trust moment statistics

## 💡 Implementation Notes

### Design Decisions

1. **Symmetric Connections**: Connections are mutual - both users see each other as connected
2. **Vouch Requests**: Users request vouches rather than giving them unsolicited
3. **Status-Based Workflow**: Using status fields instead of separate tables for requests
4. **Trust Score Automation**: Trust scores update automatically on relevant events
5. **Cooldown Periods**: 30-day cooldown prevents rapid connection/disconnection cycles

### Performance Considerations

- Connection stats are cached and updated incrementally
- Trust scores are recalculated only when needed (event-driven)
- Pagination is enforced on all list endpoints
- Database indexes on frequently queried fields (status, userId, createdAt)

### Security Considerations

- Users cannot vouch for themselves
- Connection requests require mutual consent
- Blocked users cannot interact
- Vouch limits prevent gaming the system
- Community vouches require admin permissions

## 📚 Related Modules

- **Auth Module** - JWT authentication for all endpoints
- **User Module** - User profiles and basic information
- **Event Module** - Events where connections meet
- **Community Module** - Community memberships for vouching
- **Notification Module** (Future) - Real-time connection notifications

## 🐛 Known Limitations

1. Vouching system is skeleton only - needs full implementation
2. Travel logbook is skeleton only - needs full implementation
3. Trust moments system is skeleton only - needs full implementation
4. Connection suggestions use basic algorithm - needs ML enhancement
5. No caching layer yet - will add Redis integration
6. No background job processing yet - will add Bull queue
7. Trust score calculation requires Prisma client regeneration for TrustMoment model

## 📖 Development Guide

### Adding a New Feature

1. Define types in `*.types.ts`
2. Add validators in `*.validators.ts`
3. Implement service logic in `*.service.ts`
4. Create controller handlers in `*.controller.ts`
5. Define routes in `*.routes.ts`
6. Export from `index.ts`
7. Update this README
8. Write tests

### Implementing Skeleton Features

To implement a skeleton feature (vouching, travel, trust moments):

1. Replace `throw new AppError('Feature coming soon', 501)` with actual logic
2. Follow the patterns established in the core connection module
3. Use Prisma for database operations
4. Log important events
5. Handle errors appropriately
6. Call TrustScoreService when trust score should update
7. Add proper validation
8. Update API documentation

### Testing Locally

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev

# Test endpoints
# Use the test scripts or Postman/Thunder Client
```

---

**Status**: 🚧 Core Complete, Vouching/Travel/TrustMoments are Skeletons
**Last Updated**: October 17, 2025
**Next Priority**: Implement Vouching System
