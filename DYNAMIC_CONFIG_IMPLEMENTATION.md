# Dynamic Platform Configuration Implementation

**Status:** 🚧 In Progress  
**Started:** October 20, 2025  
**Version:** 1.0.0  
**Target:** Make trust system configurable via database

---

## Overview

Converting hardcoded trust system values (formulas, thresholds, rules) to dynamic database-driven configuration. This enables platform admins to adjust trust scoring, feature gating, and accountability rules without code deployments.

---

## Implementation Progress

### Phase 1: Database Foundation ✅ Complete

| Task | Status | Notes |
|------|--------|-------|
| Database schema | ✅ Complete | PlatformConfig & ConfigHistory models added to schema.prisma |
| Migration creation | ✅ Complete | Applied via `prisma db push` (dev environment) |
| Config service | ✅ Complete | src/modules/platform/config.service.ts with caching |
| TypeScript types | ✅ Complete | src/modules/platform/config.types.ts with all 8 categories |
| Seed script | ✅ Complete | 8 configs seeded to database successfully |

### Phase 2: Service Integration ⏳ In Progress

| Task | Status | Notes |
|------|--------|-------|
| Trust score service | ✅ Complete | Formula weights, activity weights now from config |
| Trust level service | ✅ Complete | Dynamic levels via middleware |
| Trust gating middleware | ✅ Complete | Feature requirements from database |
| Accountability service | ✅ Complete | Penalty/reward percentages from config |
| Badge service | ⬜ Pending | - |
| Trust decay job | ⬜ Pending | - |
| Vouch eligibility job | ⬜ Pending | - |

### Phase 3: Quality & Documentation ⬜ Not Started

| Task | Status | Notes |
|------|--------|-------|
| Config validation | ⬜ Pending | - |
| Change logging | ⬜ Pending | - |
| Testing | ⬜ Pending | - |
| Documentation | ⬜ Pending | - |
| Seed execution | ⬜ Pending | - |

---

## Configuration Categories

### 1. Trust Formula Weights
**Category:** `TRUST_FORMULA`

```json
{
  "vouchWeight": 0.40,
  "activityWeight": 0.30,
  "trustMomentWeight": 0.30,
  "vouchBreakdown": {
    "primaryWeight": 0.12,
    "secondaryWeight": 0.12,
    "communityWeight": 0.16
  }
}
```

**Status:** ✅ Configured in database

---

### 2. Trust Levels
**Category:** `TRUST_LEVELS`

```json
{
  "levels": [
    {
      "level": 0,
      "name": "Starter",
      "minScore": 0,
      "maxScore": 10,
      "description": "New to the platform",
      "color": "#gray"
    },
    // ... 5 more levels
  ]
}
```

**Status:** ✅ Configured in database

---

### 3. Feature Gating
**Category:** `FEATURE_GATING`

```json
{
  "features": {
    "createEvent": { "requiredScore": 26, "feature": "create events" },
    "publishEvent": { "requiredScore": 51, "feature": "publish events" },
    "createCommunity": { "requiredScore": 76, "feature": "create communities" },
    // ... 20+ more features
  }
}
```

**Status:** ✅ Configured in database

---

### 4. Accountability Rules
**Category:** `ACCOUNTABILITY_RULES`

```json
{
  "penaltyDistribution": 0.40,
  "rewardDistribution": 0.20,
  "impactMultipliers": {
    "TRUST_MOMENT_NEGATIVE": 1.0,
    "EVENT_NO_SHOW": 1.5,
    "DISPUTE_RESOLVED_AGAINST": 2.0,
    "TRUST_MOMENT_POSITIVE": 1.0,
    "COMMUNITY_CONTRIBUTION": 1.2
  }
}
```

**Status:** ✅ Configured in database

---

### 5. Badge Definitions
**Category:** `BADGE_DEFINITIONS`

```json
{
  "badges": [
    {
      "type": "VOUCHER",
      "name": "Trusted Voucher",
      "description": "Vouched for others",
      "icon": "shield",
      "tiers": {
        "bronze": 1,
        "silver": 5,
        "gold": 15,
        "platinum": 50
      }
    },
    // ... 7 more badges
  ]
}
```

**Status:** ✅ Configured in database

---

### 6. Trust Decay Rules
**Category:** `TRUST_DECAY`

```json
{
  "rules": [
    {
      "inactivityDays": 30,
      "decayRatePerWeek": 0.01,
      "description": "Light decay after 30 days"
    },
    {
      "inactivityDays": 90,
      "decayRatePerWeek": 0.02,
      "description": "Heavy decay after 90 days"
    }
  ],
  "minimumScore": 0,
  "warningThreshold": 7
}
```

**Status:** ✅ Configured in database

---

### 7. Vouch Offer Eligibility
**Category:** `VOUCH_ELIGIBILITY`

```json
{
  "minEventsAttended": 5,
  "minMembershipDays": 90,
  "maxNegativeFeedback": 0,
  "offerExpirationDays": 30,
  "checkFrequency": "daily"
}
```

**Status:** ✅ Configured in database

---

### 8. Activity Weights
**Category:** `ACTIVITY_WEIGHTS`

```json
{
  "eventAttended": 2,
  "communityJoined": 1,
  "serviceCreated": 3,
  "eventHosted": 5,
  "communityModerated": 4,
  "maxActivityScore": 100
}
```

**Status:** ✅ Configured in database

---

## Database Schema

### PlatformConfig Table
```prisma
model PlatformConfig {
  id          String   @id @default(cuid())
  category    String   // Config category (TRUST_FORMULA, etc.)
  key         String   // Specific config key
  value       Json     // Flexible JSON storage
  description String?  // Human-readable description
  updatedBy   String?  // Admin user ID who made change
  updatedAt   DateTime @updatedAt
  version     Int      @default(1)
  
  @@unique([category, key])
  @@index([category])
}
```

**Status:** ✅ Created and deployed

### ConfigHistory Table
```prisma
model ConfigHistory {
  id        String   @id @default(cuid())
  configId  String   // Reference to PlatformConfig
  oldValue  Json     // Previous value
  newValue  Json     // New value
  changedBy String   // Admin user ID
  changedAt DateTime @default(now())
  reason    String?  // Why the change was made
  
  @@index([configId])
  @@index([changedAt])
}
```

**Status:** ✅ Created and deployed

---

## File Changes

### New Files Created
- [x] `prisma/schema.prisma` - Added PlatformConfig & ConfigHistory models
- [x] `src/modules/platform/config.service.ts` - Config service with caching
- [x] `src/modules/platform/config.types.ts` - TypeScript interfaces
- [x] `src/modules/platform/config.defaults.ts` - Default config values
- [x] `prisma/seeds/platform-config.seed.ts` - Default config seed
- [ ] `src/modules/platform/config.validator.ts` - Validation utilities
- [ ] `test-platform-config.ts` - Integration tests
- [ ] `docs/PLATFORM_CONFIGURATION.md` - Admin documentation

### Files Modified
- [x] `src/modules/connections/trust/trust-score.service.ts` - Uses dynamic formula weights
- [x] `src/middleware/trust-level.middleware.ts` - Uses dynamic levels and feature gating
- [x] `src/modules/connections/accountability/accountability.service.ts` - Uses dynamic rules
- [ ] `src/modules/connections/trust-score/badge.service.ts` - Pending
- [ ] `src/jobs/trust-decay.job.ts` - Pending
- [ ] `src/jobs/community-vouch-eligibility.job.ts` - Pending
- [ ] `docs/api-v2/TRUST_SCORE_API.md` - Pending
- [ ] `docs/api-v2/ACCOUNTABILITY_API.md` - Pending
- [ ] `docs/api-v2/TRUST_LEVEL_GATING.md` - Pending

---

## Manual Admin Operations

### How to Update Configs via Database

**1. View Current Config:**
```sql
SELECT * FROM "PlatformConfig" WHERE category = 'TRUST_FORMULA';
```

**2. Update Config:**
```sql
UPDATE "PlatformConfig"
SET value = '{"vouchWeight": 0.45, "activityWeight": 0.30, "trustMomentWeight": 0.25}'::jsonb,
    version = version + 1,
    "updatedAt" = NOW()
WHERE category = 'TRUST_FORMULA' AND key = 'weights';
```

**3. View Change History:**
```sql
SELECT * FROM "ConfigHistory" 
WHERE "configId" = 'config-id-here'
ORDER BY "changedAt" DESC;
```

**Status:** ⬜ Documentation pending

---

## Testing Strategy

### Test Coverage
- [ ] Config loading from database
- [ ] Cache layer functionality
- [ ] Fallback to defaults on DB failure
- [ ] Service integration with configs
- [ ] Validation rules enforcement
- [ ] Config updates and history logging
- [ ] Cache invalidation on update

### Test Scenarios
1. Load trust formula weights and verify calculations
2. Modify trust level thresholds and test middleware
3. Change feature requirements and verify gating
4. Update accountability rules and test distribution
5. Modify badge thresholds and verify achievement
6. Change decay rules and test job execution
7. Update eligibility criteria and verify offers

**Status:** ⬜ Not started

---

## Migration Strategy

### Step 1: Seed Current Values ✅
All current hardcoded values will be seeded to database as defaults.

### Step 2: Add Config Service Layer ⏳
Create ConfigService to fetch from database with caching.

### Step 3: Update Services ⬜
Refactor all services to use ConfigService instead of hardcoded values.

### Step 4: Verify & Test ⬜
Comprehensive testing to ensure no regressions.

### Step 5: Deploy ⬜
Deploy with seeded configs, monitor for issues.

---

## Rollback Plan

If issues occur:
1. ConfigService has fallback to hardcoded defaults
2. Can revert service changes via Git
3. Can restore old config values via ConfigHistory
4. Cache invalidation available for quick fixes

---

## Performance Considerations

### Caching Strategy
- **Layer 1:** In-memory cache (5-minute TTL)
- **Layer 2:** Database (authoritative source)
- **Layer 3:** Hardcoded defaults (fallback)

### Cache Invalidation
- Automatic on config update
- Manual invalidation available
- Time-based expiration (5 minutes)

**Expected Performance:**
- Config reads: <1ms (cached)
- Config updates: <50ms (DB write + cache clear)
- No impact on existing endpoint performance

---

## Next Steps

1. ✅ Create implementation tracking document
2. ✅ Add database schema to Prisma
3. ✅ Generate and run migration
4. ✅ Build ConfigService with caching
5. ✅ Define TypeScript interfaces
6. ✅ Create seed script
7. ⏳ Update services to use configs (In Progress)
8. ⬜ Add validation utilities
9. ⬜ Create tests
10. ⬜ Update documentation

---

## Completion Criteria

- [x] Implementation tracking document created
- [x] All 8 config categories in database
- [x] ConfigService operational with caching
- [ ] All 7 services updated to use configs
- [ ] Validation utilities implemented
- [ ] Tests passing (100% coverage)
- [ ] Documentation complete
- [x] Seed script executed successfully
- [ ] Admin can manually update configs via SQL

---

**Last Updated:** October 20, 2025 - Phase 1 Complete  
**Updated By:** AI Assistant  
**Next Update:** After Phase 2 completion
