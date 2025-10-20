# Trust Level Gating API

Trust Level Gating prevents low-trust users from accessing sensitive features that could be abused. This creates a safer, higher-quality platform by ensuring users earn trust before unlocking powerful capabilities.

---

## Overview

### Trust Level Tiers

| Level | Score Range | Name | Description |
|-------|-------------|------|-------------|
| 0-10% | Starter | Read-Only | Can only view content |
| 11-25% | Newcomer | Basic Participation | Can attend events, message |
| 26-50% | Growing | Active Participation | Can create events, join communities |
| 51-75% | Established | Leadership & Services | Can publish events, create services |
| 76-90% | Trusted | Advanced Features | Can create communities, fundraise |
| 91-100% | Leader | Platform Leadership | Unlimited vouches, governance |

---

## Feature Requirements

### Read-Only Features (0-10%)
✅ No authentication required for some endpoints:
- View public profiles
- Browse events
- View communities
- Browse marketplace

### Basic Participation (11-25%)
📝 Requires authentication + 11% trust:
- Attend events (RSVP)
- Message connections
- Request connections
- Add items to cart

### Active Participation (26-50%)
🎯 Requires 26% trust:
- **Create events**
- Join communities
- Host travelers
- Create marketplace listings
- Purchase items

### Leadership & Services (51-75%)
⭐ Requires 51% trust:
- **Publish events** (make them visible)
- Create service listings
- Organize group activities
- Become community moderator

### Advanced Features (76-90%)
👑 Requires 76% trust:
- **Create communities**
- Create fundraisers
- Become community admin
- Mentor new users

### Platform Leadership (91-100%)
🏆 Requires 91% trust:
- Unlimited vouches
- Platform governance participation
- Verify other users
- Special badges and privileges

---

## API Integration

### Using the Middleware

The `requireTrustLevel` middleware is applied to protected routes:

```typescript
import { requireTrustLevel, requireFeature } from '../middleware/trust-level.middleware';

// Option 1: Manual score requirement
router.post('/events', 
  authenticate, 
  requireTrustLevel(26, 'create events'),
  createEvent
);

// Option 2: Predefined feature requirement
router.post('/events/:id/publish',
  authenticate,
  requireFeature('PUBLISH_EVENTS'), // Automatically requires 51%
  publishEvent
);
```

### Predefined Features

```typescript
const FEATURE_REQUIREMENTS = {
  // Read-only (0-10%)
  VIEW_PROFILES: 0,
  VIEW_EVENTS: 0,
  VIEW_COMMUNITIES: 0,
  VIEW_MARKETPLACE: 0,

  // Basic participation (11-25%)
  ATTEND_EVENTS: 11,
  MESSAGE_CONNECTIONS: 11,
  REQUEST_CONNECTIONS: 11,
  ADD_TO_CART: 11,

  // Active participation (26-50%)
  CREATE_EVENTS: 26,
  JOIN_COMMUNITIES: 26,
  HOST_TRAVELERS: 26,
  CREATE_LISTINGS: 26,
  PURCHASE_ITEMS: 26,

  // Leadership & services (51-75%)
  PUBLISH_EVENTS: 51,
  CREATE_SERVICES: 51,
  ORGANIZE_ACTIVITIES: 51,
  BECOME_MODERATOR: 51,

  // Advanced features (76-90%)
  CREATE_COMMUNITIES: 76,
  CREATE_FUNDRAISERS: 76,
  BECOME_ADMIN: 76,
  MENTOR_USERS: 76,

  // Platform leadership (91-100%)
  UNLIMITED_VOUCHES: 91,
  PLATFORM_GOVERNANCE: 91,
  VERIFY_OTHERS: 91,
};
```

---

## Error Responses

### 403 Insufficient Trust Level

When a user tries to access a feature they don't have trust for:

```json
{
  "success": false,
  "error": "Insufficient trust level",
  "message": "You need a higher trust score to create events",
  "requirements": {
    "feature": "create events",
    "minimumScore": 26,
    "minimumLevel": "Growing"
  },
  "current": {
    "score": 18.5,
    "level": "Starter",
    "levelName": "starter"
  },
  "progress": {
    "pointsNeeded": 7.5,
    "percentage": 71
  },
  "suggestions": [
    "Request vouches from trusted connections you've met in person",
    "Attend community events and build your reputation",
    "Complete your profile to show authenticity"
  ],
  "helpUrl": "/help/trust-score"
}
```

### Understanding the Response

**requirements** - What's needed:
- `feature`: Human-readable feature name
- `minimumScore`: Required trust score (0-100)
- `minimumLevel`: Required trust level name

**current** - User's current status:
- `score`: Current trust score (0-100)
- `level`: Current trust level name
- `levelName`: Database trust level value

**progress** - How close they are:
- `pointsNeeded`: Points to reach requirement
- `percentage`: Progress toward requirement (current/required * 100)

**suggestions** - Actionable advice:
- Personalized based on current score
- Prioritized by impact

---

## Client-Side Integration

### Check Feature Access Before Action

```typescript
const checkFeatureAccess = async (feature: string) => {
  try {
    // Attempt to access the feature
    await fetch('/api/v2/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });
    return { allowed: true };
  } catch (error) {
    if (error.status === 403) {
      const data = await error.json();
      return {
        allowed: false,
        error: data,
        suggestions: data.suggestions
      };
    }
    throw error;
  }
};
```

### Display Requirements to User

```typescript
const showFeatureRequirements = (errorData) => {
  const { requirements, current, progress, suggestions } = errorData;
  
  return `
    <div class="trust-level-warning">
      <h3>Trust Level Required</h3>
      <p>${errorData.message}</p>
      
      <div class="requirements">
        <strong>Required:</strong> ${requirements.minimumScore}% (${requirements.minimumLevel})
      </div>
      
      <div class="current">
        <strong>Your Score:</strong> ${current.score}% (${current.level})
      </div>
      
      <div class="progress-bar">
        <div style="width: ${progress.percentage}%"></div>
        <span>${progress.pointsNeeded} points needed</span>
      </div>
      
      <div class="suggestions">
        <h4>How to Increase Your Trust Score:</h4>
        <ul>
          ${suggestions.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>
      
      <a href="${errorData.helpUrl}">Learn more about trust scores</a>
    </div>
  `;
};
```

### Pre-Flight Checks

For better UX, check trust level before showing UI:

```typescript
const getUserTrustLevel = async () => {
  const response = await fetch('/api/v2/users/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { data } = await response.json();
  return {
    score: data.trustScore,
    level: data.trustLevel
  };
};

const canCreateEvents = async () => {
  const { score } = await getUserTrustLevel();
  return score >= 26;
};

// In your component
if (await canCreateEvents()) {
  showCreateEventButton();
} else {
  showTrustRequirementMessage(26, 'create events');
}
```

---

## Service-Level Checks

For backend services that need to check trust programmatically:

```typescript
import { checkTrustLevel } from '../middleware/trust-level.middleware';

const processAction = async (userId: string, action: string) => {
  const check = await checkTrustLevel(userId, 51);
  
  if (!check.hasAccess) {
    throw new Error(check.message);
  }
  
  // Proceed with action
  await performAction();
};
```

**Response:**
```typescript
{
  hasAccess: boolean;
  trustScore: number;
  trustLevel: string;
  message?: string; // Only present if hasAccess is false
}
```

---

## Trust Score Suggestions

Suggestions are dynamically generated based on user's current score:

### For Users Below 26% (Starter/Newcomer)
- Request vouches from trusted connections you've met in person
- Attend community events and build your reputation
- Complete your profile to show authenticity

### For Users 26-50% (Growing)
- Host or organize events to demonstrate leadership
- Receive positive trust moments from connections
- Join and actively participate in communities

### For Users 51-75% (Established)
- Create valuable services for the community
- Maintain consistent positive interactions
- Help new members and give trust moments

### For Users 76%+ (Trusted/Leader)
- Continue mentoring others
- Organize large community initiatives
- Maintain accountability for your vouchees

---

## Best Practices

### For Frontend Developers

1. **Show Requirements Early**: Display trust requirements before user attempts action
2. **Progressive Disclosure**: Hide features user can't access yet
3. **Clear Messaging**: Explain why feature is locked and how to unlock
4. **Progress Indicators**: Show how close user is to next level
5. **Positive Reinforcement**: Celebrate when users unlock new features

### For Backend Developers

1. **Apply Consistently**: Use middleware on all sensitive routes
2. **Log Attempts**: Track when users hit trust level barriers
3. **Helpful Errors**: Always include suggestions in error responses
4. **Service Checks**: Use `checkTrustLevel()` for programmatic checks
5. **Admin Override**: Provide admin tools to adjust trust if needed

### For Product Teams

1. **Monitor Friction**: Track how many users hit trust barriers
2. **Adjust Thresholds**: Based on data, adjust requirements
3. **Communication**: Clearly explain trust system to users
4. **Onboarding**: Help new users understand how to build trust
5. **Support**: Provide help resources for stuck users

---

## Monitoring & Analytics

### Key Metrics to Track

1. **Barrier Hit Rate**: % of requests blocked by trust level
2. **Feature Distribution**: % of users at each trust level
3. **Conversion Rate**: Users who increase trust after hitting barrier
4. **Time to Level**: Average time to reach each trust tier
5. **Drop-off Points**: Where users get stuck most often

### Example Queries

```sql
-- Users hitting trust barriers
SELECT COUNT(*) 
FROM api_logs 
WHERE status_code = 403 
  AND error_message LIKE '%Insufficient trust level%';

-- Distribution of users by trust level
SELECT 
  CASE 
    WHEN trust_score >= 91 THEN 'Leader'
    WHEN trust_score >= 76 THEN 'Trusted'
    WHEN trust_score >= 51 THEN 'Established'
    WHEN trust_score >= 26 THEN 'Growing'
    WHEN trust_score >= 11 THEN 'Newcomer'
    ELSE 'Starter'
  END as trust_level,
  COUNT(*) as user_count
FROM users
WHERE status = 'ACTIVE'
GROUP BY trust_level;
```

---

## Testing

### Unit Tests

```typescript
describe('Trust Level Middleware', () => {
  it('should allow access when trust score is sufficient', async () => {
    const req = { user: { id: 'user_123', trustScore: 30 } };
    const middleware = requireTrustLevel(26, 'create events');
    
    await middleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should block access when trust score is insufficient', async () => {
    const req = { user: { id: 'user_123', trustScore: 20 } };
    const middleware = requireTrustLevel(26, 'create events');
    
    await middleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
```

### Integration Tests

```typescript
describe('Event Creation with Trust Level', () => {
  it('should allow user with 26%+ trust to create event', async () => {
    const user = await createTestUser({ trustScore: 30 });
    const token = generateToken(user);
    
    const response = await request(app)
      .post('/api/v2/events')
      .set('Authorization', `Bearer ${token}`)
      .send(eventData);
    
    expect(response.status).toBe(201);
  });

  it('should block user with <26% trust from creating event', async () => {
    const user = await createTestUser({ trustScore: 20 });
    const token = generateToken(user);
    
    const response = await request(app)
      .post('/api/v2/events')
      .set('Authorization', `Bearer ${token}`)
      .send(eventData);
    
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Insufficient trust level');
    expect(response.body.suggestions).toBeDefined();
  });
});
```

---

## Platform Configuration

**All feature requirements are dynamically configurable** through the platform configuration system. Platform administrators can adjust minimum trust scores for any feature via database without requiring code deployment.

### Configurable Feature Requirements

Each feature's minimum trust score can be modified:

```sql
-- Example: Lower "create events" requirement from 26% to 20%
UPDATE platform_configs 
SET value = jsonb_set(
  value, 
  '{CREATE_EVENTS}', 
  '20'
)
WHERE category = 'FEATURE_GATING' AND key = 'requirements';
```

#### All Configurable Features

**Read-Only Features (default: 0%)**
- `VIEW_PROFILES`, `VIEW_EVENTS`, `VIEW_COMMUNITIES`, `VIEW_MARKETPLACE`

**Basic Participation (default: 11%)**  
- `ATTEND_EVENTS`, `MESSAGE_CONNECTIONS`, `REQUEST_CONNECTIONS`, `ADD_TO_CART`

**Active Participation (default: 26%)**
- `CREATE_EVENTS`, `JOIN_COMMUNITIES`, `HOST_TRAVELERS`, `CREATE_LISTINGS`, `PURCHASE_ITEMS`

**Leadership & Services (default: 51%)**
- `PUBLISH_EVENTS`, `CREATE_SERVICES`, `ORGANIZE_ACTIVITIES`, `BECOME_MODERATOR`

**Advanced Features (default: 76%)**
- `CREATE_COMMUNITIES`, `CREATE_FUNDRAISERS`, `BECOME_ADMIN`, `MENTOR_USERS`

**Platform Leadership (default: 91%)**
- `UNLIMITED_VOUCHES`, `PLATFORM_GOVERNANCE`, `VERIFY_OTHERS`

### Configuration Strategy

#### When to Lower Requirements
- Early platform growth phase (need more activity)
- Feature is low-risk for abuse
- Community feedback indicates barrier is too high
- Want to encourage specific behaviors

#### When to Raise Requirements  
- Abuse is occurring at current level
- Feature is high-risk (e.g., money, personal data)
- Platform maturity allows stricter controls
- Quality concerns with user-generated content

### Example: Adjusting Event Creation

**Scenario:** Too many low-quality events being created

```sql
-- Increase event creation requirement from 26% to 35%
UPDATE platform_configs 
SET value = jsonb_set(
  value, 
  '{CREATE_EVENTS}', 
  '35'
),
description = 'Increased to reduce low-quality event spam',
updated_by = 'admin_user_id',
version = version + 1
WHERE category = 'FEATURE_GATING' AND key = 'requirements';

-- Log the change
INSERT INTO config_history (config_id, category, key, old_value, new_value, changed_by, reason)
SELECT id, category, key, 
  jsonb_build_object('CREATE_EVENTS', 26),
  jsonb_build_object('CREATE_EVENTS', 35),
  'admin_user_id',
  'Reduce low-quality event spam based on user feedback'
FROM platform_configs 
WHERE category = 'FEATURE_GATING' AND key = 'requirements';
```

**Impact Analysis:**
```sql
-- Check how many users would be affected
SELECT 
  COUNT(*) as affected_users,
  AVG(trust_score) as avg_score
FROM users 
WHERE trust_score >= 26 AND trust_score < 35;
```

### Monitoring Configuration Changes

After adjusting feature requirements:

1. **Track Barrier Hits** - Monitor 403 errors for that feature
2. **User Distribution** - Watch how many users are at each level
3. **Feature Usage** - Check if usage dropped significantly
4. **User Feedback** - Survey affected users
5. **Trust Score Trends** - See if users are working to increase scores

### Rollback Procedure

If a configuration change causes issues:

```sql
-- View change history
SELECT * FROM config_history 
WHERE category = 'FEATURE_GATING' AND key = 'requirements'
ORDER BY changed_at DESC;

-- Rollback to previous value
UPDATE platform_configs 
SET value = (SELECT old_value FROM config_history 
             WHERE config_id = platform_configs.id 
             ORDER BY changed_at DESC LIMIT 1),
    version = version + 1,
    updated_by = 'admin_user_id'
WHERE category = 'FEATURE_GATING' AND key = 'requirements';
```

### Configuration Best Practices

1. **Test in Staging** - Validate changes before production
2. **Communicate Changes** - Notify users of requirement adjustments  
3. **Gradual Changes** - Adjust by 5-10 points at a time
4. **Monitor Impact** - Watch metrics for 1-2 weeks after changes
5. **Document Rationale** - Explain why each change was made
6. **User Support** - Help affected users understand changes

### Configuration Documentation

For complete feature gating configuration:
- [Platform Configuration Guide](../PLATFORM_CONFIGURATION.md) - Full admin documentation
- SQL update examples and validation rules
- Configuration history and rollback procedures

---

## Related Documentation

- [Trust Score API](./TRUST_SCORE_API.md) - Trust score calculation
- [Accountability API](./ACCOUNTABILITY_API.md) - Accountability chain system
- [Connections API](./CONNECTIONS_API.md) - Vouching system
- [Trust Moments API](./TRUST_MOMENTS_API.md) - Feedback system
- [Platform Configuration](../PLATFORM_CONFIGURATION.md) - Admin configuration guide

---

**Last Updated:** October 20, 2025  
**API Version:** v2.2.0  
**Status:** ✅ Production Ready
