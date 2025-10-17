# Connection Module Setup & Integration Guide

## 🚀 Quick Setup

### 1. Database Migration

The TrustMoment model has been added to the Prisma schema. Run migration:

```bash
# Generate Prisma Client (already done)
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add_trust_moment_model

# Or push changes directly (development only)
npx prisma db push
```

### 2. Integrate Routes

Add connection and vouch routes to your main application:

**File: `src/routes/index.ts` or `src/app.ts`**

```typescript
import { connectionRoutes, vouchRoutes } from './modules/connections';

// Add to your Express app
app.use('/v2/connections', connectionRoutes);
app.use('/v2/vouches', vouchRoutes);
```

### 3. Event-Driven Trust Score Updates

Integrate trust score updates with relevant events:

**After Vouch Approval:**

```typescript
import { TrustScoreService } from './modules/connections/trust';

// In vouch service after approval
await TrustScoreService.triggerTrustScoreUpdate(
  voucheeId, 
  'Vouch approved'
);
```

**After Event Attendance:**

```typescript
// In event service after check-in
await TrustScoreService.triggerTrustScoreUpdate(
  userId, 
  'Event attended'
);
```

**After Trust Moment Creation:**

```typescript
// In trust moment service after creation
await TrustScoreService.triggerTrustScoreUpdate(
  receiverId, 
  'Trust moment added'
);
```

### 4. Background Job Setup (Optional but Recommended)

Set up a cron job for auto-vouch processing:

```typescript
import { VouchService } from './modules/connections/vouching';

// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  await VouchService.processAutoVouches();
});
```

### 5. Notification Integration (TODO)

When notification module is ready, integrate these events:

- Connection request received
- Connection request accepted/rejected
- Vouch request received
- Vouch approved/revoked
- Trust score milestone reached
- Auto-vouch eligible

## 📝 Implementation Checklist

### Core Connections ✅
- [x] Module structure created
- [x] Types and validators defined
- [x] Service layer implemented
- [x] Controller handlers created
- [x] Routes configured
- [ ] Integrated with main app
- [ ] Tests written

### Vouching System 🚧
- [x] Module structure created
- [x] Types and validators defined
- [x] Service layer skeleton
- [x] Controller handlers skeleton
- [x] Routes configured
- [ ] Service implementation
- [ ] Integrated with main app
- [ ] Tests written

### Trust Score ✅
- [x] Calculation service implemented
- [x] Event-driven updates supported
- [ ] Integrated with other modules
- [ ] Background recalculation job
- [ ] Tests written

### Travel Logbook 🚧
- [x] Module structure created
- [x] Types defined
- [x] Service skeleton
- [ ] Full implementation
- [ ] Routes and controller
- [ ] Tests written

### Trust Moments 🚧
- [x] Database model added
- [x] Module structure created
- [x] Types defined
- [x] Service skeleton
- [ ] Full implementation
- [ ] Routes and controller
- [ ] Tests written

## 🔧 Configuration

### Environment Variables

No additional environment variables needed. The module uses existing:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - For authentication

### Vouch Configuration

Vouch limits and weights are stored in the `vouch_configs` table. Create default config:

```sql
INSERT INTO vouch_configs (
  "maxPrimaryVouches",
  "maxSecondaryVouches", 
  "maxCommunityVouches",
  "primaryVouchWeight",
  "secondaryVouchWeight",
  "communityVouchWeight",
  "trustMomentsWeight",
  "activityWeight",
  "cooldownDays",
  "minTrustRequired",
  "autoVouchMinEvents",
  "autoVouchMinMemberDays",
  "autoVouchRequireZeroNegativity",
  "reconnectionCooldownDays"
) VALUES (
  1,    -- Max 1 primary vouch
  3,    -- Max 3 secondary vouches
  2,    -- Max 2 community vouches
  30.0, -- Primary vouch weight (30% of vouch score)
  30.0, -- Secondary vouch weight (30% of vouch score)
  40.0, -- Community vouch weight (40% of vouch score)
  30.0, -- Trust moments weight (30% of total)
  30.0, -- Activity weight (30% of total)
  30,   -- Cooldown days for vouch changes
  50.0, -- Min trust score required
  5,    -- Min 5 events for auto-vouch
  90,   -- Min 90 days membership for auto-vouch
  true, -- Require zero negative feedback
  30    -- 30 days before reconnection allowed
);
```

## 🧪 Testing

### Manual Testing

Use the provided test endpoints:

```bash
# Send connection request
curl -X POST http://localhost:3000/v2/connections/request \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "user_id_here",
    "message": "Let'\''s connect!",
    "relationshipCategory": "friend"
  }'

# Get connections
curl http://localhost:3000/v2/connections \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get connection stats
curl http://localhost:3000/v2/connections/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Automated Testing

Create test files:

```
tests/
├── connections/
│   ├── core/
│   │   ├── connection.service.test.ts
│   │   └── connection.controller.test.ts
│   ├── vouching/
│   │   └── vouch.service.test.ts
│   └── trust/
│       └── trust-score.test.ts
```

## 🔨 Next Implementation Steps

### Priority 1: Implement Vouching System

1. Open `src/modules/connections/vouching/vouch.service.ts`
2. Replace all `throw new AppError('Feature coming soon', 501)` with actual implementations
3. Follow patterns from `connection.service.ts`
4. Test each endpoint as you implement

### Priority 2: Implement Travel Module

1. Review existing `TravelTrip` and `TravelCompanion` models
2. Implement CRUD operations in `travel.service.ts`
3. Add routes and controllers
4. Link travel entries to connections

### Priority 3: Implement Trust Moments

1. Implement trust moment CRUD in `trust-moment.service.ts`
2. Ensure trust score updates are triggered
3. Add routes and controllers
4. Test integration with events

## 📦 Dependencies

All required dependencies are already installed:

- `@prisma/client` - Database ORM
- `express` - Web framework
- `express-validator` - Input validation
- `jsonwebtoken` - Authentication

## 🐛 Troubleshooting

### Prisma Client Errors

If you see "Property 'trustMoment' does not exist":

```bash
npx prisma generate
```

### Migration Errors

If migration fails:

```bash
# Reset database (DEVELOPMENT ONLY)
npx prisma migrate reset

# Or push schema changes directly
npx prisma db push
```

### TypeScript Errors

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

## 📞 Support

For issues or questions:

1. Check the README.md in `/src/modules/connections/`
2. Review existing implementation in `/src/modules/events/` for patterns
3. Check Prisma schema for model relationships
4. Review business logic in `/app logic business.md`

---

**Setup Complete!** 🎉

The core connection module is ready to use. Vouching, Travel, and Trust Moments are skeleton implementations waiting to be completed.
