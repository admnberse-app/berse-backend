# Dynamic Configuration - Quick Start Guide

## 🎯 What You Can Now Do

As a platform admin, you can now modify **all trust system values** directly in the database without deploying code:

- Trust formula weights (40/30/30 split)
- Trust level thresholds (6 tiers)
- Feature access requirements (23 features)
- Accountability percentages (40% penalty, 20% reward)
- Badge definitions (8 badges × 4 tiers)
- Decay rules (30/90 day thresholds)
- Vouch eligibility criteria
- Activity point values

---

## 🚀 Common Admin Tasks

### 1. View Current Configuration

```sql
-- See all configurations
SELECT category, key, description, version, updated_at 
FROM platform_configs 
ORDER BY category;

-- See specific config (e.g., trust formula)
SELECT value FROM platform_configs 
WHERE category = 'TRUST_FORMULA' AND key = 'weights';
```

### 2. Change Trust Formula Weights

**Scenario:** Make vouches more important (40% → 50%)

```sql
UPDATE platform_configs 
SET value = jsonb_set(
    jsonb_set(
        jsonb_set(value, '{vouchWeight}', '0.50'),
        '{activityWeight}', '0.25'
    ),
    '{trustMomentWeight}', '0.25'
),
updated_by = 'admin_user_id',
version = version + 1
WHERE category = 'TRUST_FORMULA' AND key = 'weights';
```

### 3. Lower Feature Requirement

**Scenario:** Allow event creation at 20% instead of 26%

```sql
UPDATE platform_configs 
SET value = jsonb_set(value, '{CREATE_EVENTS}', '20'),
    description = 'Lowered to encourage more events',
    updated_by = 'admin_user_id',
    version = version + 1
WHERE category = 'FEATURE_GATING' AND key = 'requirements';
```

### 4. Adjust Accountability Penalty

**Scenario:** Increase voucher penalty (40% → 50%)

```sql
UPDATE platform_configs 
SET value = jsonb_set(value, '{voucherPenaltyPercentage}', '0.50'),
    updated_by = 'admin_user_id',
    version = version + 1
WHERE category = 'ACCOUNTABILITY_RULES' AND key = 'percentages';
```

### 5. Modify Badge Threshold

**Scenario:** Change "Trusted Member" silver tier from 51% to 55%

```sql
UPDATE platform_configs 
SET value = jsonb_set(value, '{TRUSTED_MEMBER,tiers,silver}', '55'),
    updated_by = 'admin_user_id',
    version = version + 1
WHERE category = 'BADGE_DEFINITIONS' AND key = 'badges';
```

### 6. View Change History

```sql
-- See recent config changes
SELECT 
    category, 
    key, 
    changed_by, 
    changed_at, 
    reason,
    old_value,
    new_value
FROM config_history 
ORDER BY changed_at DESC 
LIMIT 10;
```

### 7. Rollback a Change

```sql
-- Find the previous value
SELECT old_value FROM config_history 
WHERE category = 'TRUST_FORMULA' AND key = 'weights'
ORDER BY changed_at DESC LIMIT 1;

-- Apply the rollback
UPDATE platform_configs 
SET value = (
    SELECT old_value FROM config_history 
    WHERE category = 'TRUST_FORMULA' AND key = 'weights'
    ORDER BY changed_at DESC LIMIT 1
),
updated_by = 'admin_user_id',
version = version + 1
WHERE category = 'TRUST_FORMULA' AND key = 'weights';
```

---

## 📋 Configuration Categories

### 1. TRUST_FORMULA
**Purpose:** Control how trust scores are calculated

**Current Values:**
- Vouch: 40% (0.40)
- Activity: 30% (0.30)
- Trust Moments: 30% (0.30)

**Vouch Breakdown:**
- Primary: 12% (0.12)
- Secondary: 12% (0.12)
- Community: 16% (0.16)

### 2. TRUST_LEVELS
**Purpose:** Define trust tier ranges

**6 Levels:**
- New: 0-19%
- Starter: 20-39%
- Growing: 40-59%
- Established: 60-74%
- Trusted: 75-89%
- Elite: 90-100%

### 3. FEATURE_GATING
**Purpose:** Control feature access by trust score

**Key Requirements:**
- Attend events: 11%
- Create events: 26%
- Publish events: 51%
- Create communities: 76%
- Platform governance: 91%

### 4. ACCOUNTABILITY_RULES
**Purpose:** Voucher impact percentages

**Current Values:**
- Voucher penalty: 40% (0.40)
- Voucher reward: 20% (0.20)

### 5. BADGE_DEFINITIONS
**Purpose:** Achievement badge thresholds

**8 Badge Types:**
- First Vouch, Service Provider, Trusted Member, Event Enthusiast, Community Builder, Community Leader, Accountability Hero, Perfect Record

### 6. TRUST_DECAY
**Purpose:** Inactivity penalties

**Rules:**
- 30 days inactive: -1% per week
- 90 days inactive: -2% per week

### 7. VOUCH_ELIGIBILITY
**Purpose:** Community vouch offer criteria

**Requirements:**
- Events attended: 5
- Membership days: 90
- Max negative feedback: 0

### 8. ACTIVITY_WEIGHTS
**Purpose:** Point values for activities

**Examples:**
- Event attended: 10 max (5 events)
- Event hosted: 9 max (3 events)
- Community joined: 6 max (3 communities)

---

## ⚠️ Important Rules

### Validation Requirements

**Trust Formula:**
- ✅ Main weights must sum to 1.0 (100%)
- ✅ Vouch breakdown must sum to vouchWeight
- ✅ All weights between 0 and 1

**Trust Levels:**
- ✅ Must cover 0-100% without gaps
- ✅ No overlapping ranges
- ✅ 6 levels required

**Feature Gating:**
- ✅ All scores between 0-100
- ✅ All 23 features must be present

**Accountability:**
- ✅ Percentages between 0 and 1
- ⚠️ Penalty should be > reward

---

## 🔄 How Changes Apply

### Automatic Cache Invalidation

Changes take effect within **5 minutes** (cache TTL):

1. Admin updates config in database
2. ConfigService cache expires (5 min)
3. Next request fetches new value
4. All services use new config

### Force Immediate Update

Restart the application server to clear cache immediately:

```bash
# If using PM2
pm2 restart berse-backend

# Or restart your deployment
```

---

## 🧪 Testing Changes

### Before Production

1. **Test in Staging:**
   ```sql
   -- Make change in staging database first
   UPDATE platform_configs SET ...
   ```

2. **Run Validation:**
   ```bash
   npx ts-node test-platform-config.ts
   ```

3. **Monitor Impact:**
   ```sql
   -- Check how many users affected
   SELECT COUNT(*) FROM users 
   WHERE trust_score >= OLD_VALUE AND trust_score < NEW_VALUE;
   ```

4. **Apply to Production:**
   ```sql
   -- Same SQL in production database
   ```

---

## 📊 Impact Analysis Queries

### Check Feature Access Impact

```sql
-- How many users can create events?
SELECT COUNT(*) FROM users WHERE trust_score >= 26;

-- How many would lose access if raised to 30?
SELECT COUNT(*) FROM users WHERE trust_score >= 26 AND trust_score < 30;
```

### Trust Score Distribution

```sql
SELECT 
  CASE 
    WHEN trust_score >= 90 THEN 'Elite'
    WHEN trust_score >= 75 THEN 'Trusted'
    WHEN trust_score >= 60 THEN 'Established'
    WHEN trust_score >= 40 THEN 'Growing'
    WHEN trust_score >= 20 THEN 'Starter'
    ELSE 'New'
  END as level,
  COUNT(*) as user_count,
  ROUND(AVG(trust_score), 2) as avg_score
FROM users
WHERE status = 'ACTIVE'
GROUP BY level
ORDER BY avg_score DESC;
```

---

## 🆘 Troubleshooting

### Changes Not Taking Effect?

1. **Wait 5 minutes** - Cache TTL
2. **Check database** - Was UPDATE successful?
3. **Restart server** - Force cache clear
4. **Check logs** - Any validation errors?

### Invalid Configuration?

```sql
-- Check current value
SELECT value FROM platform_configs 
WHERE category = 'TRUST_FORMULA' AND key = 'weights';

-- If invalid, rollback
UPDATE platform_configs 
SET value = (SELECT old_value FROM config_history 
             WHERE category = 'TRUST_FORMULA' 
             ORDER BY changed_at DESC LIMIT 1);
```

### Service Not Using New Config?

1. Check service calls `ConfigService.getXXX()`
2. Verify cache is cleared: Restart server
3. Check fallback isn't being used: Remove default value temporarily

---

## 📚 Full Documentation

For comprehensive details:

- **[PLATFORM_CONFIGURATION.md](./docs/PLATFORM_CONFIGURATION.md)** - Complete admin guide with all SQL examples
- **[DYNAMIC_CONFIG_COMPLETE.md](./DYNAMIC_CONFIG_COMPLETE.md)** - Full implementation details
- **[TRUST_SCORE_API.md](./docs/api-v2/TRUST_SCORE_API.md)** - API documentation with config notes
- **[ACCOUNTABILITY_API.md](./docs/api-v2/ACCOUNTABILITY_API.md)** - Accountability config examples
- **[TRUST_LEVEL_GATING.md](./docs/api-v2/TRUST_LEVEL_GATING.md)** - Feature gating config guide

---

## ✅ Best Practices

1. **Test First** - Always test in staging
2. **Small Changes** - Adjust by 5-10% increments
3. **Document Why** - Use the `reason` field
4. **Monitor Impact** - Check metrics after changes
5. **Gradual Rollout** - Make changes during low-traffic periods
6. **Have Rollback Ready** - Know how to revert
7. **Communicate** - Notify team of major changes
8. **Backup** - Config history provides backup, but be safe

---

**Quick Support:**
- Run tests: `npx ts-node test-platform-config.ts`
- View configs: `SELECT * FROM platform_configs;`
- View history: `SELECT * FROM config_history ORDER BY changed_at DESC;`
- Full docs: `docs/PLATFORM_CONFIGURATION.md`

🎉 **You now have full control over the trust system!**
