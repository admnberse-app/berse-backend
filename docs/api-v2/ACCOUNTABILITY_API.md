# Accountability System API

The Accountability System implements a trust chain where vouchers are held accountable for their vouchees' behavior. This creates a powerful incentive structure for responsible vouching.

## Overview

### Accountability Formula

**Negative Behavior:**
- Voucher penalty = Vouchee penalty × 40%
- Example: If a vouchee loses 10 trust points, each voucher loses 4 points

**Positive Behavior:**
- Voucher reward = Vouchee reward × 20%
- Example: If a vouchee gains 10 trust points, each voucher gains 2 points

### Impact Types

- **POSITIVE** - Vouchee's good behavior benefits vouchers
- **NEGATIVE** - Vouchee's bad behavior penalizes vouchers
- **NEUTRAL** - Informational events with no impact

---

## Endpoints

### 1. Get Accountability History

Get accountability logs for the authenticated user as a vouchee (showing how your behavior affected your vouchers).

**Endpoint:** `GET /api/v2/accountability/history`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number for pagination |
| limit | integer | 20 | Number of logs per page |
| impactType | enum | - | Filter by impact type (POSITIVE, NEGATIVE, NEUTRAL) |

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log_123",
        "voucherName": "John Doe",
        "impactType": "NEGATIVE",
        "impactValue": -5.0,
        "description": "No-show at community event",
        "occurredAt": "2025-10-15T14:30:00Z",
        "isProcessed": true
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

**Use Cases:**
- User wants to see how their behavior affected others
- Transparency in accountability system
- Understanding trust score changes

---

### 2. Get Accountability Impact

Get summary of how vouchees' behavior has affected the authenticated user's trust score (as a voucher).

**Endpoint:** `GET /api/v2/accountability/impact`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "totalLogs": 25,
    "positiveCount": 18,
    "negativeCount": 5,
    "neutralCount": 2,
    "totalImpact": 4.8,
    "vouchees": [
      {
        "voucheeId": "user_456",
        "voucheeName": "Jane Smith",
        "logCount": 10,
        "totalImpact": 3.2,
        "lastOccurredAt": "2025-10-18T10:00:00Z"
      }
    ],
    "recentLogs": [
      {
        "id": "log_789",
        "voucheeName": "Jane Smith",
        "impactType": "POSITIVE",
        "impactValue": 8.0,
        "description": "Successfully organized community event",
        "occurredAt": "2025-10-18T10:00:00Z",
        "isProcessed": true
      }
    ]
  }
}
```

**Impact Calculation Example:**
```javascript
// Vouchee gains 10 trust points for positive behavior
voucheeImpact = +10.0

// Voucher gets 20% of the reward
voucherImpact = 10.0 × 0.2 = +2.0 points

// Vouchee loses 10 trust points for negative behavior
voucheeImpact = -10.0

// Voucher gets 40% of the penalty
voucherImpact = -10.0 × 0.4 = -4.0 points
```

**Use Cases:**
- Voucher monitoring vouchees' behavior
- Understanding trust score changes
- Risk assessment for future vouching

---

### 3. Process Accountability Log (Admin)

Manually process a specific accountability log to apply trust score impacts.

**Endpoint:** `POST /api/v2/accountability/process/:logId`

**Authentication:** Required (Admin only)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| logId | string | Accountability log ID |

**Response:**
```json
{
  "success": true,
  "message": "Accountability log processed successfully"
}
```

**Error Responses:**
- `404` - Log not found
- `400` - Log already processed
- `403` - Admin access required

---

### 4. Process All Unprocessed Logs (Admin)

Batch process all pending accountability logs.

**Endpoint:** `POST /api/v2/accountability/process-all`

**Authentication:** Required (Admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "processed": 47,
    "failed": 2,
    "message": "Processed 47 of 49 accountability logs"
  }
}
```

---

## Accountability Triggers

Accountability events are automatically created when:

### Negative Triggers (-4 to -10 points to vouchee)
1. **Trust Moment with Rating ≤ 2**
   - Penalty: -5 to -10 points depending on rating
   - Voucher impact: -2 to -4 points (40%)

2. **Event No-Show**
   - Penalty: -5 points
   - Voucher impact: -2 points (40%)

3. **Event Cancellation by Organizer** (late cancellation)
   - Penalty: -8 points
   - Voucher impact: -3.2 points (40%)

4. **Vouch Revocation**
   - Penalty: -10 points
   - Voucher impact: -4 points (40%)

5. **Marketplace Dispute**
   - Penalty: -7 points
   - Voucher impact: -2.8 points (40%)

### Positive Triggers (+3 to +10 points to vouchee)
1. **Trust Moment with Rating ≥ 4**
   - Reward: +5 to +10 points depending on rating
   - Voucher impact: +1 to +2 points (20%)

2. **Successfully Host Event**
   - Reward: +5 points
   - Voucher impact: +1 point (20%)

3. **Complete Service Transaction**
   - Reward: +3 points
   - Voucher impact: +0.6 points (20%)

4. **Receive Community Vouch**
   - Reward: +8 points
   - Voucher impact: +1.6 points (20%)

---

## Notification Flow

### Voucher Notifications

When a vouchee's action affects a voucher's trust score:

```json
{
  "type": "VOUCH",
  "title": "⚠️ Accountability Impact",
  "message": "Jane Smith's negative behavior affected your trust score by -2.0 points. No-show at community event",
  "actionUrl": "/connections/user_456",
  "metadata": {
    "type": "accountability_impact",
    "voucheeId": "user_456",
    "voucheeName": "Jane Smith",
    "impactType": "NEGATIVE",
    "impact": -2.0,
    "description": "No-show at community event"
  }
}
```

---

## Best Practices

### For Vouchers
1. **Monitor Regularly** - Check accountability impact weekly
2. **Vet Carefully** - Only vouch for people you trust
3. **Stay Engaged** - Keep track of your vouchees' activity
4. **Set Expectations** - Discuss accountability with vouchees upfront

### For Vouchees
1. **Understand Impact** - Your actions affect multiple people
2. **Be Reliable** - Show up to commitments
3. **Communicate** - If you can't attend, cancel early
4. **Build Trust** - Positive behavior benefits everyone

### For Platform
1. **Real-time Processing** - Logs are processed immediately by default
2. **Batch Processing** - Use `/process-all` for maintenance
3. **Transparency** - All impacts are logged and visible
4. **Reversibility** - Admin can manually adjust if needed

---

## Integration Examples

### Check Impact Before Vouching

```typescript
// Before vouching for someone, check their accountability history
const checkAccountabilityRisk = async (userId: string) => {
  const response = await fetch(`/api/v2/accountability/history?page=1&limit=10`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const { data } = await response.json();
  const negativeCount = data.logs.filter(l => l.impactType === 'NEGATIVE').length;
  
  if (negativeCount > 3) {
    console.warn('High-risk vouchee: Multiple negative accountability events');
  }
};
```

### Monitor Your Accountability as Voucher

```typescript
// Check how your vouchees are doing
const monitorVouchees = async () => {
  const response = await fetch('/api/v2/accountability/impact', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const { data } = await response.json();
  
  console.log(`Total impact from vouchees: ${data.totalImpact} points`);
  console.log(`Positive events: ${data.positiveCount}`);
  console.log(`Negative events: ${data.negativeCount}`);
  
  // Alert on high-risk vouchees
  data.vouchees.forEach(vouchee => {
    if (vouchee.totalImpact < -5) {
      console.warn(`${vouchee.voucheeName} has significantly impacted your trust score`);
    }
  });
};
```

---

## Error Handling

### Common Errors

**401 Unauthorized**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "error": "Admin access required"
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "Accountability log not found"
}
```

**500 Server Error**
```json
{
  "success": false,
  "error": "Failed to process accountability",
  "details": "Database connection error"
}
```

---

## Performance Considerations

1. **Real-time Processing** - Most logs are processed immediately
2. **Batch Processing** - Use for maintenance or recovery
3. **Pagination** - Use appropriate page sizes for history queries
4. **Caching** - Impact summaries are computed on-demand
5. **Indexes** - Database indexes on `voucherId`, `voucheeId`, `isProcessed`

---

## Platform Configuration

**Accountability percentages are dynamically configurable** through the platform configuration system. Platform administrators can adjust penalty and reward percentages via database without code changes.

### Configurable Rules

#### Accountability Percentages

The default 40% penalty / 20% reward split can be modified:

```sql
-- Example: Increase voucher penalty from 40% to 50%
UPDATE platform_configs 
SET value = jsonb_set(
  value, 
  '{voucherPenaltyPercentage}', 
  '0.50'
)
WHERE category = 'ACCOUNTABILITY_RULES' AND key = 'percentages';
```

Configurable values:
- `voucherPenaltyPercentage` - % of vouchee's negative impact applied to voucher (default: 0.40 = 40%)
- `voucherRewardPercentage` - % of vouchee's positive impact applied to voucher (default: 0.20 = 20%)
- `splitRewardEqually` - Whether to split reward among all vouchers (default: true)

**Validation Rules:**
- Percentages must be between 0 and 1 (0-100%)
- Penalty percentage typically higher than reward to discourage risky vouching

#### Impact Examples with Different Configurations

**Default (40% penalty / 20% reward):**
```javascript
// Vouchee loses 10 points → Voucher loses 4 points
// Vouchee gains 10 points → Voucher gains 2 points
```

**Stricter (50% penalty / 15% reward):**
```javascript
// Vouchee loses 10 points → Voucher loses 5 points  
// Vouchee gains 10 points → Voucher gains 1.5 points
```

**Balanced (30% penalty / 30% reward):**
```javascript
// Vouchee loses 10 points → Voucher loses 3 points
// Vouchee gains 10 points → Voucher gains 3 points  
```

### Configuration Best Practices

1. **Higher Penalty Than Reward** - Encourages careful vouching
2. **Test Impact** - Monitor trust score changes after adjustments
3. **Community Feedback** - Survey users before major changes
4. **Gradual Changes** - Adjust by 5-10% increments
5. **Document Rationale** - Explain why percentages were changed

### Configuration Documentation

For complete accountability configuration details:
- [Platform Configuration Guide](../PLATFORM_CONFIGURATION.md) - Full admin documentation
- SQL update examples and validation rules
- Configuration change history tracking

---

## Related Documentation

- [Trust Score API](./TRUST_SCORE_API.md) - Trust score calculation and management
- [Connections API](./CONNECTIONS_API.md) - Vouch management
- [Trust Moments API](./TRUST_MOMENTS_API.md) - Feedback that triggers accountability
- [Trust Level Gating](./TRUST_LEVEL_GATING.md) - Feature access based on trust score
- [Platform Configuration](../PLATFORM_CONFIGURATION.md) - Admin configuration guide
