# Database Seeds Quick Reference

Quick reference for running database seeds in the BerseMuka backend.

## 📦 Folder Structure

```
prisma/
├── seed.ts                              # Legacy monolithic seed (backward compatibility)
├── seeds/
│   ├── README.md                        # Comprehensive seeding guide
│   ├── index.ts                         # Master seed orchestrator
│   ├── core/                            # Core application data (modular)
│   │   ├── badges.seed.ts              # 14 achievement badges
│   │   ├── rewards.seed.ts             # 5 redeemable rewards
│   │   ├── subscription-tiers.seed.ts  # FREE, BASIC, PREMIUM
│   │   ├── vouch-config.seed.ts        # Trust system configuration
│   │   ├── platform-fees.seed.ts       # Transaction fee configs
│   │   ├── referral-campaign.seed.ts   # LAUNCH2025 campaign
│   │   ├── users.seed.ts               # 5 test users with profiles
│   │   ├── communities.seed.ts         # 6 sample communities
│   │   ├── events.seed.ts              # 5 sample events
│   │   └── sample-data.seed.ts         # Connections, vouches, services, etc.
│   ├── features/                        # Feature-specific seeds
│   │   └── onboarding-v2.seed.ts       # Onboarding screens
│   └── config/                          # Configuration seeds
│       ├── seed-app-config.ts          # App settings, legal docs, FAQs
│       └── seed-payment-providers.ts   # Payment gateway configuration
```

## 🚀 Quick Commands

### Most Common

```bash
# Run ALL seeds (recommended for fresh database)
npm run seed
# or
npx prisma db seed

# Reset database and seed
npx prisma migrate reset
```

### Specific Seeds

```bash
# Individual core seeds (NEW - granular control)
npm run prisma:seed:badges             # Badges only
npm run prisma:seed:rewards            # Rewards only
npm run prisma:seed:users              # Test users only
npm run prisma:seed:communities        # Communities only
npm run prisma:seed:events             # Events only

# Core seeds (legacy monolithic - backward compatibility)
npm run prisma:seed:core

# Configuration seeds (app config + payment providers)
npm run prisma:seed:config

# Onboarding screens only
npm run prisma:seed:onboarding

# All seeds with orchestrator (best option)
npm run prisma:seed:all
```

### Development Workflow

```bash
# Fresh start (drop DB, run migrations, seed everything)
npx prisma migrate reset --force

# Just run seeds without dropping DB
npm run seed
```

## 📋 What Gets Seeded

### Core Seeds (`seed.ts`)
- ✅ 14 Badges (FIRST_FACE, CONNECTOR, etc.)
- ✅ 5 Rewards (Tealive, Kopikku, Shopee, etc.)
- ✅ Vouch Configuration (trust system)
- ✅ 3 Subscription Tiers (FREE, BASIC, PREMIUM)
- ✅ Payment Provider (Xendit)
- ✅ Platform Fee Configs
- ✅ Referral Campaign (LAUNCH2025)
- ✅ 5 Test Users (admin, host, alice, bob, demo)
- ✅ 6 Sample Communities
- ✅ 5 Sample Events
- ✅ User Connections & Vouches
- ✅ Travel Trips, Services, Marketplace Listings
- ✅ Point History

### App Configuration (`seed-app-config.ts`)
- ✅ App Settings (version requirements, maintenance mode)
- ✅ Feature Flags per platform
- ✅ Legal Documents (Terms, Privacy, Guidelines)
- ✅ System Announcements
- ✅ App Version History
- ✅ Maintenance Schedules
- ✅ FAQ Categories & Items
- ✅ Support Articles
- ✅ App Notices
- ✅ Push Notification Templates

### Payment Providers (`seed-payment-providers.ts`)
- ✅ Xendit Configuration (MY, SG, ID, PH, TH, VN)
- ✅ Stripe Configuration (optional)
- ✅ Payment Routing Rules

### Onboarding V2 (`onboarding-v2.seed.ts`)
- ✅ 4 App Preview Screens (pre-auth)
- ✅ 7 User Setup Screens (post-auth)
- ✅ Screen types, ordering, required flags

## 🔐 Test Credentials

After seeding, you can login with:

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | `admin@test.com` | `admin123` | ADMIN |
| Host | `host@test.com` | `password123` | GENERAL_USER |
| Alice | `alice@test.com` | `password123` | GENERAL_USER |
| Bob | `bob@test.com` | `password123` | GENERAL_USER |
| Demo | `demo@test.com` | `password123` | GENERAL_USER |

## 🛠️ Troubleshooting

### Issue: "Unique constraint failed"
**Solution:** Database already has data. Run reset:
```bash
npx prisma migrate reset
```

### Issue: Seed script not found
**Solution:** Make sure you're in the project root:
```bash
cd /Users/mit06/Desktop/personal-projects/berse-app-backend
npm run seed
```

### Issue: Environment variables missing
**Solution:** Check your `.env` file has required variables:
- `DATABASE_URL`
- `XENDIT_PUBLIC_KEY` (optional)
- `XENDIT_SECRET_KEY` (optional)
- `STRIPE_SECRET_KEY` (optional)

### Issue: TypeScript compilation errors
**Solution:** Generate Prisma client first:
```bash
npx prisma generate
npm run seed
```

## 📊 Verify Seeds

```bash
# Open Prisma Studio to browse data
npm run prisma:studio

# Or check via SQL
npx prisma db execute --stdin <<< "SELECT COUNT(*) as user_count FROM User;"
```

## 🔄 Update Seeds

### Add New Seed File

1. Create file in appropriate folder:
   - `seeds/core/` - Core business data
   - `seeds/features/` - Feature-specific data
   - `seeds/config/` - Configuration data

2. Export seed function from the file

3. Add to `seeds/index.ts` orchestrator

4. Add npm script to `package.json`:
   ```json
   "prisma:seed:myfeature": "ts-node prisma/seeds/features/myfeature.seed.ts"
   ```

### Modify Existing Seeds

1. Edit the seed file directly
2. Run specific seed:
   ```bash
   npm run prisma:seed:onboarding
   ```
3. Or run all seeds:
   ```bash
   npm run seed
   ```

## 🚨 Production Notes

**⚠️ IMPORTANT:**
- Never run test seeds on production
- Remove test credentials before deployment
- Use environment-specific seed data
- Consider separate seed files for production

### Production Seed Example

```bash
# Production should seed only essential data
NODE_ENV=production npm run seed
```

## 📚 Learn More

- [Full Seeding Guide](./seeds/README.md) - Comprehensive documentation
- [Database Setup](./DATABASE_SETUP.md) - Database configuration
- [Onboarding V2 Docs](../docs/api-v2/ONBOARDING_V2_API.md) - Onboarding API

---

**Last Updated:** October 17, 2025  
**Version:** 2.1.0
