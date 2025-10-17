# Gamification Module

Complete gamification system with badges, points, rewards, and leaderboards.

## Features

### 🏅 Badges System
- 14 different badge types
- Auto-award on achievement
- Progress tracking
- Admin management (award/revoke)

### ⭐ Points System
- 43 different point actions
- Comprehensive point history
- Admin controls
- Real-time balance

### 🎁 Rewards System
- Point-based redemptions
- Category filtering
- Admin approval workflow
- Redemption history

### 🏆 Leaderboards
- Points leaderboard
- Trust score leaderboard
- Badges leaderboard
- Events attended leaderboard
- Connections leaderboard
- Referrals leaderboard

### 📊 Dashboard
- Unified gamification overview
- Personal stats
- Recent activities
- Leaderboard ranks

## Badge Types

1. **FIRST_FACE** - Attend first event
2. **CAFE_FRIEND** - Attend 3+ cafe meetups
3. **SUKAN_SQUAD_MVP** - Attend 5+ sports events
4. **SOUL_NOURISHER** - Attend 5+ spiritual events
5. **HELPERS_HAND** - Volunteer at 3+ events
6. **CONNECTOR** - Refer 3+ activated users
7. **TOP_FRIEND** - Make 10+ connections
8. **ICEBREAKER** - Make first connection
9. **CERTIFIED_HOST** - Host 1+ events
10. **STREAK_CHAMP** - Attend events 4 weeks in a row
11. **LOCAL_GUIDE** - Attend events in 5+ locations
12. **KIND_SOUL** - Give 10+ positive trust moments
13. **KNOWLEDGE_SHARER** - Submit 5+ helpful card game feedbacks
14. **ALL_ROUNDER** - Earn 5+ different badges

## Point Actions

### Profile (6 actions)
- REGISTER: 30 pts
- COMPLETE_PROFILE_BASIC: 50 pts
- COMPLETE_PROFILE_FULL: 100 pts
- VERIFY_EMAIL: 20 pts
- VERIFY_PHONE: 20 pts
- UPLOAD_PROFILE_PHOTO: 10 pts

### Events (9 actions)
- ATTEND_EVENT: 10 pts
- HOST_EVENT: 15 pts
- RSVP_EVENT: 2 pts
- CANCEL_RSVP: -2 pts
- JOIN_TRIP: 5 pts
- CAFE_MEETUP: 2 pts
- ILM_EVENT: 3 pts
- VOLUNTEER: 6 pts
- DONATE: 4 pts

### Social (7 actions)
- FIRST_CONNECTION: 15 pts
- MAKE_CONNECTION: 5 pts
- RECEIVE_CONNECTION: 3 pts
- VOUCH_SOMEONE: 10 pts
- RECEIVE_VOUCH: 20 pts
- GIVE_TRUST_MOMENT: 5 pts
- RECEIVE_POSITIVE_TRUST_MOMENT: 10 pts

### Community (3 actions)
- JOIN_COMMUNITY: 5 pts
- COMMUNITY_PARTICIPATION: 3 pts
- BECOME_MODERATOR: 50 pts

### Referrals (2 actions)
- REFERRAL: 10 pts
- REFEREE_SIGNUP: 5 pts

### Card Game (3 actions)
- SUBMIT_CARD_GAME_FEEDBACK: 5 pts
- RECEIVE_HELPFUL_VOTE: 2 pts
- REPLY_TO_FEEDBACK: 3 pts

### Marketplace (3 actions)
- FIRST_LISTING: 10 pts
- COMPLETE_TRANSACTION: 5 pts
- RECEIVE_POSITIVE_REVIEW: 10 pts

### Achievements (4 actions)
- EARN_BADGE: 25 pts
- REACH_TRUST_MILESTONE: 30 pts
- MAINTAIN_STREAK_WEEK: 10 pts
- MAINTAIN_STREAK_MONTH: 50 pts

### Penalties (3 actions)
- RECEIVE_NEGATIVE_TRUST_MOMENT: -10 pts
- REPORT_VALIDATED: -20 pts
- SPAM_DETECTED: -50 pts

## API Endpoints

See `/docs/api-v2/GAMIFICATION_API.md` for complete API documentation with examples.

### Quick Reference

```
Dashboard
GET    /api/v2/gamification/dashboard
GET    /api/v2/gamification/dashboard/user/:userId (Admin)

Badges
GET    /api/v2/gamification/badges
GET    /api/v2/gamification/badges/my
GET    /api/v2/gamification/badges/progress
GET    /api/v2/gamification/badges/:id
GET    /api/v2/gamification/badges/user/:userId
POST   /api/v2/gamification/badges/award (Admin)
DELETE /api/v2/gamification/badges/:badgeId/revoke/:userId (Admin)

Points
GET    /api/v2/gamification/points
GET    /api/v2/gamification/points/history
GET    /api/v2/gamification/points/actions
GET    /api/v2/gamification/points/user/:userId (Admin)
POST   /api/v2/gamification/points/award (Admin)
POST   /api/v2/gamification/points/deduct (Admin)

Rewards
GET    /api/v2/gamification/rewards
GET    /api/v2/gamification/rewards/categories
GET    /api/v2/gamification/rewards/redemptions
GET    /api/v2/gamification/rewards/:id
POST   /api/v2/gamification/rewards (Admin)
PUT    /api/v2/gamification/rewards/:id (Admin)
DELETE /api/v2/gamification/rewards/:id (Admin)
POST   /api/v2/gamification/rewards/redeem
GET    /api/v2/gamification/rewards/redemptions/:id
PUT    /api/v2/gamification/rewards/redemptions/:id (Admin)

Leaderboards
GET    /api/v2/gamification/leaderboard/points
GET    /api/v2/gamification/leaderboard/trust
GET    /api/v2/gamification/leaderboard/badges
GET    /api/v2/gamification/leaderboard/events
GET    /api/v2/gamification/leaderboard/connections
GET    /api/v2/gamification/leaderboard/referrals

Platform Stats
GET    /api/v2/gamification/stats (Admin)
```

## Integration

### Trigger Badge Check
```typescript
import { BadgeService } from './services/badge.service';

// After any user action that might earn a badge
await BadgeService.checkAndAwardBadges(userId);
```

### Award Points
```typescript
import { PointsService } from './services/points.service';

// Award points for an action
await PointsService.awardPoints(userId, 'ATTEND_EVENT', 'Attended Tech Meetup');
```

### Check User Dashboard
```typescript
import { GamificationService } from './modules/gamification';

const dashboard = await GamificationService.getDashboard(userId);
// Returns: points, badges, rewards, leaderboard ranks, stats
```

## Database Models

- **Badge** - Badge definitions
- **UserBadge** - User earned badges
- **PointHistory** - Point transaction log
- **Reward** - Reward catalog
- **Redemption** - Redemption records

## Services

- **BadgeService** - Badge management and auto-awarding
- **PointsService** - Points transactions
- **GamificationService** - Comprehensive gamification features

## Module Structure

```
src/modules/gamification/
├── gamification.types.ts       # TypeScript interfaces
├── gamification.service.ts     # Core business logic
├── gamification.controller.ts  # HTTP handlers
├── gamification.routes.ts      # Express routes + Swagger
├── gamification.validators.ts  # Input validation
├── index.ts                    # Module exports
└── README.md                   # This file
```

## Notes

- Badge checking happens automatically after eligible actions
- Points are awarded immediately upon actions
- Redemptions require admin approval (status: PENDING → APPROVED/REJECTED)
- Leaderboards update in real-time
- All endpoints require authentication

## Testing

Run test script:
```bash
bash test-gamification-endpoints.sh
```

## Future Enhancements

- [ ] Point expiry system
- [ ] Seasonal badges
- [ ] Team/group achievements
- [ ] Custom badge creation
- [ ] Point multipliers during events
- [ ] Reward suggestions based on interests
