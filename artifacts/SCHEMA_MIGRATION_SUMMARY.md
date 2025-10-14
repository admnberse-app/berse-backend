# Schema Migration Summary
**Migration**: `20251014081857_referral_system_and_schema_updates`  
**Date**: October 14, 2025  
**Status**: ✅ Successfully Applied

## Overview
This migration updates the database schema from version 2.6.0 to 2.7.0, implementing a comprehensive referral system and normalizing user data into separate tables for better maintainability.

---

## Major Changes

### 1. **User Profile Normalization** 
Extracted user profile fields from the monolithic `users` table into dedicated tables:

#### New Tables Created:
- **`user_profiles`** - Display names, bios, demographics, interests, social handles
- **`user_locations`** - Geographic data, timezone, currency, language preferences  
- **`user_security`** - Verification status, MFA settings, login tracking, account locks
- **`user_privacy`** - Privacy settings, GDPR consent, data deletion requests
- **`user_preferences`** - App settings, dark mode, calendar integrations
- **`user_metadata`** - Referral codes, marketing attribution, admin notes, LTV
- **`profile_completion_status`** - Profile completion tracking with gamification
- **`user_service_profiles`** - Service provider information (host/guide availability)

#### New Authentication Tables:
- **`auth_identities`** - Multi-provider authentication (Google, Apple, Facebook, etc.)
- **`user_sessions`** - Active sessions with device tracking
- **`login_attempts`** - Login attempt history for security monitoring
- **`device_registrations`** - Trusted device management
- **`password_reset_tokens`** - Password reset token management
- **`email_verification_tokens`** - Email verification workflow
- **`security_events`** - Security event logging (password changes, suspicious activity)
- **`notification_preferences`** - Granular notification settings per channel

---

### 2. **Comprehensive Referral System** 🎁
A complete referral tracking and rewards system with campaign support.

#### New Tables:
- **`referrals`** - Individual referral tracking with activation criteria
  - Tracks: clicks, signups, activations, rewards given
  - Fields: `referralCode`, `referrerRewardGiven`, `refereeRewardGiven`
  - Activation criteria: profile completion, first event, minimum active days

- **`referral_campaigns`** - Promotional campaigns with bonus rewards
  - Campaign-specific rewards for referrer and referee
  - Bonus rewards for milestones (5, 10, 25 referrals)
  - Target user segments and countries
  - Start/end dates and usage limits

- **`referral_rewards`** - Reward tracking and fulfillment
  - Types: points, credits, subscription discounts, free events
  - Status: PENDING → APPROVED → AWARDED → CLAIMED
  - Milestone rewards (500 points for 5 referrals, premium discount for 10)

- **`referral_stats`** - Analytics and leaderboards
  - Conversion funnel: clicks → signups → activations
  - Conversion rates calculated automatically
  - Referral streaks and best performer tracking
  - Leaderboard ranking system

#### Enums Added:
- **`ReferralRewardStatus`**: PENDING, APPROVED, AWARDED, CLAIMED, EXPIRED, CANCELED

---

### 3. **Enhanced Trust & Vouch System**
- **`vouches`** table enhanced with:
  - Community vouch support (`isCommunityVouch`, `communityId`)
  - Auto-vouch criteria tracking (`isAutoVouched`, `autoVouchCriteria`)
  - Trust impact calculation (`trustImpact`)
  
- **`vouch_configs`** table for dynamic configuration:
  - Vouch limits per type (primary: 1, secondary: 3, community: 2)
  - Trust score weights (primary: 30%, secondary: 30%, community: 40%)
  - Cooldown periods and reconnection rules

---

### 4. **Enhanced Connection System** 👥
- **`user_connections`** upgraded with:
  - Relationship categorization (professional, mentor, travel, family)
  - Trust strength calculation (0-100 scale)
  - Badges system ("Most Trusted", "Close Friend", "Travel Buddy")
  - Mutual friends/communities tracking
  - Interaction history and last interaction date

- **`connection_reviews`** - 5-star ratings with testimonials
  - Review types: general, professional, travel, event
  - Verification from events/services
  - Featured reviews and helpful count

- **`connection_stats`** - Analytics per user
  - Total connections by category
  - Average rating and review counts
  - Trust chain depth calculation
  - Connection quality score

---

### 5. **Event System Enhancements** 🎫
- **`events`** table enhanced with:
  - Ticket pricing (`price`, `isFree`, `currency`)
  - Revenue tracking (`totalRevenue`, `platformFee`, `organizerPayout`)
  - Community hosting support (`communityId`, `hostType`)
  - Status management (`status`: DRAFT, PUBLISHED, CANCELED, COMPLETED)

- **`event_ticket_tiers`** - Multiple ticket pricing tiers
  - Early bird, VIP, general admission
  - Quantity limits and availability windows

- **`event_tickets`** - Individual ticket purchases
  - Payment integration via `paymentTransactionId`
  - Ticket status tracking (PENDING → CONFIRMED → CHECKED_IN)
  - QR code support via `ticketNumber`

---

### 6. **Payment & Subscription System** 💳

#### Payment Infrastructure:
- **`payment_providers`** - Multi-gateway support (Stripe, PayPal, etc.)
- **`payment_provider_routing`** - Smart routing based on conditions
- **`platform_fee_configs`** - Flexible fee configuration per transaction type
- **`transaction_fees`** - Fee breakdown tracking
- **`payment_transactions`** - Unified payment tracking
- **`payout_distributions`** - Revenue distribution to recipients

#### Subscription Management:
- **`subscription_tiers`** - Free/Premium tier definitions
- **`user_subscriptions`** - User subscription tracking with trial support
- **`subscription_payments`** - Recurring billing management
- **`feature_usage`** - Usage tracking for limits/quotas

#### Enums Added:
- **`TransactionType`**: EVENT_TICKET, MARKETPLACE_ORDER, SERVICE_BOOKING, SUBSCRIPTION, DONATION, REFUND
- **`PaymentStatus`**: PENDING, PROCESSING, SUCCEEDED, FAILED, CANCELED, REFUNDED, PARTIALLY_REFUNDED
- **`PayoutStatus`**: PENDING, PROCESSING, RELEASED, HELD, FAILED, CANCELED
- **`SubscriptionStatus`**: ACTIVE, TRIALING, PAST_DUE, CANCELED, EXPIRED, PAUSED, INCOMPLETE

---

### 7. **Services & Marketplace** 🛍️

#### Services:
- **`services`** - Service listings (guiding, homestay, tutoring)
- **`service_bookings`** - Booking management with payment integration

#### Marketplace:
- **`marketplace_listings`** - Product listings
- **`listing_price_history`** - Price change tracking
- **`marketplace_orders`** - Order management with shipping
- **`marketplace_cart_items`** - Shopping cart
- **`marketplace_disputes`** - Dispute resolution
- **`marketplace_reviews`** - Product/seller reviews

#### Enums Added:
- **`ServiceType`**: GUIDING, HOMESTAY, TUTORING, CONSULTATION, TRANSPORT, OTHER
- **`PricingType`**: PER_HOUR, PER_DAY, PER_PERSON, PER_NIGHT, FIXED
- **`BookingStatus`**: PENDING, CONFIRMED, ACTIVE, COMPLETED, CANCELED, REFUNDED
- **`OrderStatus`**: CART, PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELED, REFUNDED, DISPUTED

---

### 8. **Travel Logbook System** ✈️
- **`travel_trips`** - Trip entries with countries, cities, dates
- **`travel_companions`** - Travel companions with "Request Intro" feature
- **`travel_locations`** - Detailed place tracking with ratings
- **`travel_highlights`** - Memorable moments from trips
- **`travel_stats`** - Travel analytics (countries visited, total days)
- **`travel_bucket_list`** - Future travel planning with companion seeking

---

### 9. **Social Features**
- **`user_blocks`** - User blocking system
- **`user_activities`** - Activity feed tracking
- **`user_stats`** - User statistics aggregation
- **`user_payment_methods`** - Saved payment methods

---

## Removed Tables
- **`follows`** - Replaced by `user_connections` system

---

## Schema Statistics

### Tables Created: 55+ new tables
### Enums Created: 20+ enums
### Indexes Created: 150+ optimized indexes
### Foreign Keys: 100+ relationship constraints

---

## Data Migration Notes

### ⚠️ Data Loss Warning
The following fields were **dropped from users table** (data migration required if needed):
- Profile data → moved to `user_profiles`
- Location data → moved to `user_locations`  
- Security data → moved to `user_security`
- Privacy settings → moved to `user_privacy`
- Preferences → moved to `user_preferences`
- Metadata → moved to `user_metadata`

### 🔄 Automatic Migrations
- `email` and `password` columns now nullable (supports OAuth-only users)
- Added `status` enum field (default: ACTIVE)
- Added `trustScore` and `trustLevel` fields (defaults: 0.0 and "starter")
- Added `deletedAt` for soft deletes

---

## Breaking Changes

### User Model Changes:
```typescript
// Before (v2.6.0)
user.profilePicture
user.bio
user.city
user.mfaEnabled

// After (v2.7.0)
user.profile.profilePicture
user.profile.bio
user.location.currentCity
user.security.mfaEnabled
```

### Required Code Updates:
1. Update all user profile queries to include relations
2. Update authentication flows to handle `auth_identities`
3. Update notification system to use `notification_preferences`
4. Implement referral tracking in signup flow
5. Update event creation to support paid tickets

---

## Performance Optimizations

### Indexes Added:
- **Users**: email, phone, username, role, status, trustScore, trustLevel
- **Referrals**: referralCode, referrerId, isActivated, campaignId
- **Connections**: status, trustStrength, relationshipCategory
- **Events**: status, hostType, date, communityId
- **Payments**: status, transactionType, providerId, createdAt

### Query Optimization:
- Composite indexes for frequently joined tables
- Status-based filtering indexes
- Date range query indexes
- Full-text search preparation (GIN indexes can be added)

---

## Next Steps

### Immediate Actions Required:
1. ✅ **Migration Applied** - Database schema updated
2. ✅ **Prisma Client Generated** - TypeScript types updated
3. 🔄 **Update API Routes** - Modify existing endpoints to use new relations
4. 🔄 **Data Backfill** - Migrate existing user data to new tables (if needed)
5. 🔄 **Update Frontend** - Adjust API calls to match new structure
6. 🔄 **Test Thoroughly** - Verify all existing features work with new schema

### Optional Enhancements:
- Implement referral campaign UI
- Add connection review features
- Enable paid event ticketing
- Set up subscription tier management
- Configure payment provider routing

---

## Rollback Instructions

If issues arise, you can rollback using:

```bash
# View migration history
npx prisma migrate status

# Rollback to previous migration
npx prisma migrate resolve --rolled-back 20251014081857_referral_system_and_schema_updates

# Restore from backup
psql $DATABASE_URL < backup_before_migration.sql
```

**⚠️ Important**: The backup schema is saved at:
`prisma/schema.prisma.backup`

---

## Testing Checklist

- [ ] User registration still works
- [ ] User login/authentication functional
- [ ] Profile updates save correctly
- [ ] Events can be created and joined
- [ ] Connections can be created
- [ ] Vouches can be given
- [ ] Referral system tracks new signups
- [ ] Payment transactions process correctly
- [ ] Notifications are delivered
- [ ] Existing users can access their data

---

## Support & Documentation

- **Schema Version**: 2.7.0
- **Migration File**: `prisma/migrations/20251014081857_referral_system_and_schema_updates/migration.sql`
- **Backup Schema**: `prisma/schema.prisma.backup`
- **Changelog**: See schema.prisma header comments

For questions or issues, refer to the comprehensive schema documentation in `schema.prisma`.
