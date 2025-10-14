# Quick Migration Reference Guide
**For Developers Working with Schema v2.7.0**

## 🚨 Important Changes

### User Data Access Pattern Changed

#### ❌ OLD WAY (v2.6.0)
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId }
});

console.log(user.bio); // Direct access
console.log(user.city); // Direct access
console.log(user.mfaEnabled); // Direct access
```

#### ✅ NEW WAY (v2.7.0)
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    profile: true,
    location: true,
    security: true,
    privacy: true,
    preferences: true,
    metadata: true,
  }
});

console.log(user.profile?.bio); // Via relation
console.log(user.location?.currentCity); // Via relation
console.log(user.security?.mfaEnabled); // Via relation
```

---

## 📋 Common Query Patterns

### 1. Get User with Profile
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    profile: true,
    location: true,
    security: true,
  }
});
```

### 2. Update User Profile
```typescript
await prisma.userProfile.upsert({
  where: { userId },
  create: {
    userId,
    displayName: "John Doe",
    bio: "Software engineer",
  },
  update: {
    displayName: "John Doe",
    bio: "Software engineer",
  }
});
```

### 3. Create Referral
```typescript
const referral = await prisma.referral.create({
  data: {
    referrerId: currentUserId,
    referralCode: generateUniqueCode(),
    referralMethod: "link",
    isActivated: false,
  }
});
```

### 4. Track Referral Activation
```typescript
await prisma.referral.update({
  where: { id: referralId },
  data: {
    isActivated: true,
    activatedAt: new Date(),
    refereeId: newUserId,
  }
});

// Update stats
await prisma.referralStats.upsert({
  where: { userId: referrerId },
  create: {
    userId: referrerId,
    totalReferrals: 1,
    totalActivated: 1,
  },
  update: {
    totalReferrals: { increment: 1 },
    totalActivated: { increment: 1 },
  }
});
```

### 5. Create Connection Review
```typescript
await prisma.connectionReview.create({
  data: {
    connectionId,
    reviewerId: currentUserId,
    revieweeId: otherUserId,
    rating: 5,
    review: "Great travel companion!",
    reviewType: "travel",
    isPublic: true,
  }
});
```

### 6. Create Paid Event Ticket
```typescript
const ticket = await prisma.eventTicket.create({
  data: {
    eventId,
    userId,
    ticketTierId, // Optional tier
    ticketType: "GENERAL",
    price: 25.00,
    currency: "MYR",
    status: "PENDING",
    ticketNumber: generateTicketNumber(),
    quantity: 1,
  }
});
```

---

## 🔍 Field Mapping Reference

### User Core → Profile Tables

| OLD Location | NEW Location | Table |
|-------------|--------------|-------|
| `user.bio` | `user.profile.bio` | `user_profiles` |
| `user.profilePicture` | `user.profile.profilePicture` | `user_profiles` |
| `user.dateOfBirth` | `user.profile.dateOfBirth` | `user_profiles` |
| `user.interests` | `user.profile.interests` | `user_profiles` |
| `user.languages` | `user.profile.languages` | `user_profiles` |
| `user.profession` | `user.profile.profession` | `user_profiles` |
| `user.city` | `user.location.currentCity` | `user_locations` |
| `user.countryOfResidence` | `user.location.countryOfResidence` | `user_locations` |
| `user.nationality` | `user.location.nationality` | `user_locations` |
| `user.timezone` | `user.location.timezone` | `user_locations` |
| `user.mfaEnabled` | `user.security.mfaEnabled` | `user_security` |
| `user.emailVerifiedAt` | `user.security.emailVerifiedAt` | `user_security` |
| `user.lastLoginAt` | `user.security.lastLoginAt` | `user_security` |
| `user.profileVisibility` | `user.privacy.profileVisibility` | `user_privacy` |
| `user.consentToMarketing` | `user.privacy.consentToMarketing` | `user_privacy` |
| `user.darkMode` | `user.preferences.darkMode` | `user_preferences` |
| `user.googleCalendarConnected` | `user.preferences.googleCalendarConnected` | `user_preferences` |
| `user.referralCode` | `user.metadata.referralCode` | `user_metadata` |
| `user.lifetimeValue` | `user.metadata.lifetimeValue` | `user_metadata` |

---

## 🎯 Migration Checklist for Existing Code

### Authentication Routes
- [ ] Update login to create `auth_identities` entry
- [ ] Update registration to create user + profile records
- [ ] Update password reset to use `password_reset_tokens` table
- [ ] Update email verification to use `email_verification_tokens` table

### User Profile Routes
- [ ] Update profile fetch to include relations
- [ ] Update profile update to target correct tables
- [ ] Add profile completion calculation
- [ ] Update avatar upload to `user_profiles.profilePicture`

### Event Routes
- [ ] Add support for paid tickets
- [ ] Implement ticket tier selection
- [ ] Integrate with payment system
- [ ] Update revenue tracking

### Connection/Friend Routes
- [ ] Migrate from `follows` to `user_connections`
- [ ] Implement connection reviews
- [ ] Add trust strength calculation
- [ ] Update connection stats

### Referral System (NEW)
- [ ] Implement referral code generation
- [ ] Track referral clicks
- [ ] Track referral signups
- [ ] Trigger activation criteria
- [ ] Award referral rewards
- [ ] Display referral stats

---

## 🐛 Common Issues & Solutions

### Issue 1: Cannot read property 'bio' of undefined
**Cause**: Profile relation not included in query  
**Solution**: Add `include: { profile: true }` to query

### Issue 2: Unique constraint violation on referralCode
**Cause**: Referral code already exists  
**Solution**: Generate unique codes using UUID or nanoid

### Issue 3: Trust score not updating
**Cause**: Manual calculation required after vouch changes  
**Solution**: Implement trust score recalculation service

### Issue 4: Payment transaction not linking to ticket
**Cause**: Missing `paymentTransactionId` in ticket creation  
**Solution**: Create payment transaction first, then link to ticket

---

## 🧪 Testing Queries

### Test User Creation with Relations
```typescript
const user = await prisma.user.create({
  data: {
    email: "test@example.com",
    fullName: "Test User",
    profile: {
      create: {
        displayName: "Tester",
        bio: "Test bio",
      }
    },
    location: {
      create: {
        currentCity: "Kuala Lumpur",
        countryOfResidence: "Malaysia",
      }
    },
    security: {
      create: {
        emailVerifiedAt: new Date(),
      }
    },
    metadata: {
      create: {
        referralCode: generateCode(),
      }
    }
  },
  include: {
    profile: true,
    location: true,
    security: true,
    metadata: true,
  }
});
```

### Test Referral Flow
```typescript
// 1. Generate referral link
const referral = await prisma.referral.create({
  data: {
    referrerId: currentUserId,
    referralCode: "ABC123",
    clickedAt: new Date(),
  }
});

// 2. Track signup
await prisma.referral.update({
  where: { id: referral.id },
  data: {
    signedUpAt: new Date(),
    refereeId: newUserId,
  }
});

// 3. Activate referral
await prisma.referral.update({
  where: { id: referral.id },
  data: {
    isActivated: true,
    activatedAt: new Date(),
  }
});

// 4. Award rewards
await prisma.referralReward.create({
  data: {
    referralId: referral.id,
    userId: referrerId,
    rewardType: "points",
    rewardAmount: 100,
    description: "Referral bonus",
    status: "APPROVED",
    awardedAt: new Date(),
  }
});
```

---

## 📚 Additional Resources

- **Schema File**: `prisma/schema.prisma`
- **Migration File**: `prisma/migrations/20251014081857_referral_system_and_schema_updates/migration.sql`
- **Full Summary**: `artifacts/SCHEMA_MIGRATION_SUMMARY.md`
- **Backup Schema**: `prisma/schema.prisma.backup`

---

## 🆘 Need Help?

If you encounter issues:
1. Check the comprehensive schema comments in `schema.prisma`
2. Review the migration summary in `SCHEMA_MIGRATION_SUMMARY.md`
3. Verify database structure with: `npx prisma studio`
4. Check Prisma Client types: Look at `node_modules/@prisma/client/index.d.ts`

**Remember**: Always test queries in development before deploying to production!
