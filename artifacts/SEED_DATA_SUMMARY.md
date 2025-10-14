# Seed Data Summary

## Overview
Successfully seeded comprehensive master data and sample data into the database to provide a fully functional development environment.

**Date:** October 14, 2024  
**Database:** bersemuka_db (PostgreSQL)  
**Schema Version:** 2.7.0

---

## Master Data Seeded

### 1. Badges (14 total)
System-wide achievement badges for user gamification:

| Badge | Description | Points |
|-------|-------------|--------|
| 🥇 First Connection | Made your first connection | 10 |
| 🌟 Event Organizer | Successfully organized your first event | 50 |
| 🤝 Trusted Member | Received 5+ primary vouches | 100 |
| 🎯 Community Leader | Created and managed a thriving community | 75 |
| ✈️ World Traveler | Logged travel to 10+ countries | 60 |
| 📸 Content Creator | Shared 20+ posts with photos | 40 |
| 🏆 Top Contributor | Most active community member this month | 150 |
| 💎 Premium Member | Upgraded to premium subscription | 0 |
| 🎉 Event Attendee | Attended 10+ events | 30 |
| 🌍 Global Connector | Connections in 5+ countries | 80 |
| 📚 Knowledge Sharer | Hosted 3+ Ilm events | 45 |
| ☕ Coffee Enthusiast | Attended 5+ cafe meetups | 25 |
| 🏃 Sports Active | Participated in 8+ sports events | 35 |
| 💼 Service Provider | Listed and completed 5+ services | 55 |

### 2. Rewards (5 total)
Redeemable rewards for accumulated points:

| Reward | Cost | Rarity | Stock |
|--------|------|--------|-------|
| Free Event Ticket | 100 points | COMMON | Unlimited |
| Premium Subscription (1 month) | 500 points | RARE | 100 |
| Exclusive Community Access | 300 points | UNCOMMON | 50 |
| Marketplace Voucher (RM50) | 1000 points | RARE | 25 |
| VIP Event Pass | 2000 points | LEGENDARY | 10 |

### 3. Vouch Configuration
Trust system configuration:
- **Max Primary Vouches:** 5 per user
- **Max Secondary Vouches:** 10 per user
- **Trust Threshold:** 50.0
- **Decay Enabled:** Yes
- **Decay Period:** 180 days

### 4. Subscription Tiers (3 total)

#### FREE Tier
- **Price:** RM 0/month
- **Features:** Basic event access, 1 community creation, 3 marketplace listings, standard support
- **Limits:** 50 connections, 3 active listings, 1 community

#### PREMIUM Tier ⭐
- **Price:** RM 29.90/month
- **Features:** All FREE features + Unlimited event creation, 5 communities, 20 marketplace listings, priority support, badge showcase, advanced analytics
- **Limits:** 500 connections, 20 active listings, 5 communities

#### BUSINESS Tier 💼
- **Price:** RM 99.90/month
- **Features:** All PREMIUM features + Custom branding, API access, dedicated account manager, bulk event management, team collaboration tools, white-label options
- **Limits:** Unlimited connections, unlimited listings, unlimited communities

### 5. Payment Provider
**Xendit** payment aggregator configured:
- **Supported Regions:** Malaysia (MY), Indonesia (ID), Philippines (PH), Singapore (SG), Thailand (TH), Vietnam (VN)
- **Features:** Instant payments, E-Wallet, Bank transfers, Credit/Debit cards, Recurring payments, Refunds
- **Status:** Active
- **Fee Structure:** 2.9% + RM 1.00 per transaction

### 6. Platform Fee Configurations (4 scenarios)

| Scenario | Event Fee | Service Fee | Marketplace Fee | Subscription Fee |
|----------|-----------|-------------|-----------------|------------------|
| Free Event | 0% | 15% | 10% | 0% |
| Paid Event | 10% | 15% | 10% | 0% |
| Service Transaction | 0% | 15% | 10% | 0% |
| Marketplace Transaction | 0% | 15% | 10% | 0% |

### 7. Referral Campaign
**"Launch Campaign 2024"**
- **Start:** October 14, 2024
- **End:** December 31, 2024
- **Referrer Reward:** 100 points
- **Referee Reward:** 50 points
- **Status:** Active

---

## Sample Data Seeded

### 1. Users (5 total)

| Email | Name | Role | Points | Trust Score | City | Host Status |
|-------|------|------|--------|-------------|------|-------------|
| admin@test.com | Admin User | ADMIN | 1000 | 95 | Kuala Lumpur | Yes |
| host@test.com | Sarah Host | GENERAL_USER | 250 | 75 | Kuala Lumpur | Yes |
| alice@test.com | Alice Johnson | GENERAL_USER | 120 | 60 | Petaling Jaya | No |
| bob@test.com | Bob Smith | GENERAL_USER | 85 | 55 | Shah Alam | No |
| demo@test.com | Demo User | GENERAL_USER | 50 | 30 | Subang Jaya | No |

**Login Credentials:**
```
admin@test.com / admin123
host@test.com / password123
alice@test.com / password123
bob@test.com / password123
demo@test.com / password123
```

**User Profiles Include:**
- ✅ Profile information (bio, occupation, interests)
- ✅ Location data (city, country, timezone)
- ✅ Security settings
- ✅ Privacy preferences
- ✅ User preferences
- ✅ Metadata (points, trust score, referral codes)
- ✅ Auth identities (email/password)
- ✅ Refresh tokens

### 2. Communities (6 total)

| Community | Type | Members | Description |
|-----------|------|---------|-------------|
| KL Sports & Fitness | SPORTS | 2 | Join us for sports activities and fitness meetups around KL |
| Tech Innovators MY | ILM | 2 | Community for tech enthusiasts and developers |
| KL Foodies | SOCIAL | 2 | Discover and share the best food spots in KL |
| Photography Lovers | SOCIAL | 2 | Share your photography journey with fellow enthusiasts |
| Travel Buddies Malaysia | SOCIAL | 1 | Find travel companions and share experiences |
| Malaysian Entrepreneurs | PROFESSIONAL | 1 | Network with entrepreneurs and business owners |

### 3. Events (5 total)

| Event | Type | Date | Location | Price | Attendees | Host |
|-------|------|------|----------|-------|-----------|------|
| Weekend Badminton Session | SPORTS | +7 days | KLCC Sports Complex | FREE | Max 20 | Sarah Host (Community) |
| Coffee Tasting Workshop | CAFE_MEETUP | +10 days | Artisan Coffee Lab, Bangsar | RM 45 | Max 15 | Sarah Host (Personal) |
| Tech Meetup: AI & Machine Learning | ILM | +14 days | WORQ Coworking, TTDI | FREE | Max 50 | Admin User (Personal) |
| Food Tour: Hidden Gems of Chinatown | SOCIAL | +5 days | Petaling Street, KL | RM 60 | Max 12 | Sarah Host (Community) |
| Beach Cleanup Volunteer Day | VOLUNTEER | +21 days | Port Dickson Beach | FREE | Max 30 | Admin User (Personal) |

### 4. User Connections (4 total)

| From | To | Status | Category | Trust Strength | Notes |
|------|-----|--------|----------|----------------|-------|
| Admin | Sarah Host | ACCEPTED | Professional | 85.0 | - |
| Sarah Host | Alice | ACCEPTED | Friend | 70.0 | Met at a food tour event |
| Alice | Bob | ACCEPTED | Social | 60.0 | - |
| Bob | Admin | PENDING | Professional | 0.0 | - |

### 5. Vouches (2 total)

| Voucher | Vouchee | Type | Status | Trust Impact | Message |
|---------|---------|------|--------|--------------|---------|
| Admin | Sarah Host | PRIMARY | ACTIVE | +30.0 | Excellent event host, highly trusted member |
| Sarah Host | Alice | SECONDARY | ACTIVE | +20.0 | Great person to connect with, very friendly |

### 6. Travel Trips (2 total)

| Traveler | Destination | Start Date | End Date | Type | Status |
|----------|-------------|------------|----------|------|--------|
| Sarah Host | Bangkok, Thailand | -30 days | -27 days | LEISURE | COMPLETED |
| Alice | Bali, Indonesia | -45 days | -38 days | LEISURE | COMPLETED |

### 7. Services (2 total)

| Provider | Service | Category | Type | Price | Status |
|----------|---------|----------|------|-------|--------|
| Sarah Host | Event Photography | Photography | ONE_TIME | RM 300/session | ACTIVE |
| Admin | Business Consultation | Consulting | HOURLY | RM 150/hour | ACTIVE |

### 8. Marketplace Listings (3 total)

| Seller | Item | Category | Price | Quantity | Location | Status |
|--------|------|----------|-------|----------|----------|--------|
| Sarah Host | Vintage Polaroid Camera | Photography | RM 280 | 1 | Petaling Jaya | ACTIVE |
| Bob | Badminton Racket - Yonex | Sports Equipment | RM 150 | 1 | Shah Alam | ACTIVE |
| Alice | Travel Backpack 40L | Travel Gear | RM 200 | 1 | Petaling Jaya | ACTIVE |

### 9. Referrals (1 total)
- **Referrer:** Sarah Host
- **Referee:** Alice
- **Status:** COMPLETED
- **Campaign:** Launch Campaign 2024
- **Signup Date:** Today
- **Rewards:** Distributed (100 points to Sarah, 50 points to Alice)

### 10. Point History (10 records)
Sample point transactions for users showing:
- Event participation (+30 points)
- Community creation (+50 points)
- Making connections (+10 points)
- Profile completion (+20 points)
- Referral bonuses (+100/50 points)

---

## Database Statistics

### Tables Populated
✅ **User Management:** Users, UserProfiles, UserLocations, UserSecurity, UserPrivacy, UserPreferences, UserMetadata, AuthIdentities, RefreshTokens  
✅ **Master Data:** Badges, Rewards, VouchConfiguration, SubscriptionTiers, PaymentProviders, PlatformFeeConfigs, ReferralCampaigns  
✅ **Communities:** Communities, CommunityMembers  
✅ **Events:** Events  
✅ **Connections:** UserConnections  
✅ **Trust System:** Vouches  
✅ **Travel:** TravelTrips  
✅ **Services:** Services  
✅ **Marketplace:** MarketplaceListings  
✅ **Referrals:** Referrals  
✅ **Gamification:** PointHistory  

### Totals
- **Master Records:** 46 (badges, rewards, configs, tiers, providers)
- **Users:** 5 fully profiled users with all normalized data
- **Communities:** 6 communities with 10 total memberships
- **Events:** 5 diverse events (sports, cafe, tech, food, volunteer)
- **Connections:** 4 user connections (3 accepted, 1 pending)
- **Vouches:** 2 active vouches
- **Travel Trips:** 2 completed trips
- **Services:** 2 active service offerings
- **Marketplace Listings:** 3 active listings
- **Referrals:** 1 completed referral
- **Point History:** 10 point transactions

---

## Testing Guide

### 1. Test User Login
```bash
# Login as admin
POST /api/auth/login
{
  "email": "admin@test.com",
  "password": "admin123"
}

# Login as regular user
POST /api/auth/login
{
  "email": "host@test.com",
  "password": "password123"
}
```

### 2. Test Event Fetching
```bash
# Get all published events
GET /api/events?status=PUBLISHED

# Get events by type
GET /api/events?type=SPORTS

# Get events by community
GET /api/events?communityId={communityId}
```

### 3. Test Community Access
```bash
# Get all communities
GET /api/communities

# Get user's communities
GET /api/communities/my-communities

# Get community members
GET /api/communities/{communityId}/members
```

### 4. Test User Connections
```bash
# Get user's connections
GET /api/connections

# Get pending connection requests
GET /api/connections?status=PENDING

# Get accepted connections
GET /api/connections?status=ACCEPTED
```

### 5. Test Marketplace
```bash
# Get all active listings
GET /api/marketplace?status=ACTIVE

# Get listings by category
GET /api/marketplace?category=Photography

# Get user's listings
GET /api/marketplace/my-listings
```

### 6. Test Services
```bash
# Get all active services
GET /api/services?status=ACTIVE

# Get services by provider
GET /api/services?providerId={userId}

# Get services by type
GET /api/services?serviceType=CONSULTATION
```

### 7. Test Trust System
```bash
# Get user's vouches received
GET /api/vouches/received

# Get user's vouches given
GET /api/vouches/given

# Get user's trust score
GET /api/users/{userId}/trust-score
```

### 8. Test Gamification
```bash
# Get user's points
GET /api/users/{userId}/points

# Get point history
GET /api/users/{userId}/point-history

# Get available rewards
GET /api/rewards

# Get user's badges
GET /api/users/{userId}/badges
```

### 9. Test Referral System
```bash
# Get user's referral code
GET /api/referrals/my-code

# Get referral stats
GET /api/referrals/stats

# Track referral signup
POST /api/auth/signup
{
  "referralCode": "SARAH-ABC123",
  ...
}
```

---

## Payment Testing (Xendit)

### Test Card Numbers (Sandbox)
```
Success: 4000 0000 0000 0002
3D Secure: 4000 0024 0000 4001
Declined: 4000 0000 0000 0069
```

### Test E-Wallets
- GrabPay
- TouchNGo
- ShopeePay
- GCash (PH)
- Dana (ID)

### Supported Currencies
- MYR (Malaysia Ringgit)
- IDR (Indonesian Rupiah)
- PHP (Philippine Peso)
- SGD (Singapore Dollar)
- THB (Thai Baht)
- VND (Vietnamese Dong)

---

## Database Verification

### Quick Queries
```sql
-- Check user count
SELECT COUNT(*) FROM users;

-- Check events with hosts
SELECT e.title, u.full_name as host, c.name as community 
FROM events e 
JOIN users u ON e."hostId" = u.id 
LEFT JOIN communities c ON e."communityId" = c.id;

-- Check connections
SELECT 
  u1.full_name as initiator,
  u2.full_name as receiver,
  uc.status,
  uc."trustStrength"
FROM user_connections uc
JOIN users u1 ON uc."initiatorId" = u1.id
JOIN users u2 ON uc."receiverId" = u2.id;

-- Check point balances
SELECT u.full_name, um.points_balance 
FROM users u 
JOIN user_metadata um ON u.id = um."userId"
ORDER BY um.points_balance DESC;

-- Check trust scores
SELECT u.full_name, um.trust_score 
FROM users u 
JOIN user_metadata um ON u.id = um."userId"
ORDER BY um.trust_score DESC;
```

---

## Next Steps

### 1. API Development
- Implement event RSVP endpoints
- Add event ticket purchasing with Xendit
- Create community invitation system
- Build connection request workflow
- Implement vouch creation and management

### 2. Frontend Integration
- Connect login page to seeded users
- Display events list with filters
- Show communities with member counts
- Implement connection requests UI
- Create marketplace listing pages

### 3. Payment Integration
- Set up Xendit webhook endpoints
- Test payment flows for paid events
- Implement refund handling
- Add subscription payment processing
- Create payment history views

### 4. Testing
- Write integration tests using seeded data
- Test authentication flows
- Verify payment processing
- Test trust score calculations
- Validate referral tracking

### 5. Additional Seeding (Optional)
- Add more diverse events (100+)
- Create event RSVPs and attendance records
- Add event tickets for paid events
- Create marketplace orders
- Add service bookings
- Generate more user interactions

---

## Maintenance

### Re-seeding Database
```bash
# Clear all data and re-seed
npx prisma migrate reset

# Or manually run seed
npx ts-node prisma/seed.ts
```

### Backup Current Data
```bash
# PostgreSQL backup
pg_dump bersemuka_db > backup_$(date +%Y%m%d).sql

# Prisma backup
npx prisma db pull
```

### Update Seed Data
1. Edit `prisma/seed.ts`
2. Backup existing: `cp prisma/seed.ts prisma/seed.ts.backup`
3. Make changes
4. Run seed: `npx ts-node prisma/seed.ts`

---

## Troubleshooting

### Seed Fails with Duplicate Keys
```bash
# Clear all data first
npx prisma migrate reset
# Then re-seed
npx ts-node prisma/seed.ts
```

### Authentication Issues
- Verify password hashing: bcrypt with salt rounds = 10
- Check refresh token expiry: 7 days default
- Ensure auth identities are created for all users

### Xendit Payments Not Working
- Verify API keys in environment variables
- Check webhook URL configuration
- Ensure test mode is enabled for development
- Validate currency codes (MYR, IDR, PHP, etc.)

---

## Resources

- **Prisma Documentation:** https://www.prisma.io/docs
- **Xendit API Docs:** https://developers.xendit.co/
- **Schema Migration Guide:** `artifacts/SCHEMA_MIGRATION_SUMMARY.md`
- **Migration Quick Reference:** `artifacts/MIGRATION_QUICK_REFERENCE.md`
- **Seed File:** `prisma/seed.ts`
- **Schema File:** `prisma/schema.prisma`

---

**Generated:** October 14, 2024  
**Version:** 1.0  
**Database:** PostgreSQL (bersemuka_db)  
**Schema Version:** 2.7.0
