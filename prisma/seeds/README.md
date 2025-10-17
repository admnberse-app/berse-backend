# Database Seeding Guide

This directory contains all database seed files organized by category.

## 📁 Folder Structure

```
seeds/
├── core/                              # Core application data (modular)
│   ├── badges.seed.ts                # 14 achievement badges
│   ├── rewards.seed.ts               # 5 redeemable rewards
│   ├── subscription-tiers.seed.ts    # FREE, BASIC, PREMIUM
│   ├── vouch-config.seed.ts          # Trust system configuration
│   ├── platform-fees.seed.ts         # Transaction fee configs
│   ├── referral-campaign.seed.ts     # LAUNCH2025 campaign
│   ├── users.seed.ts                 # 5 test users with profiles
│   ├── communities.seed.ts           # 6 sample communities
│   ├── events.seed.ts                # 5 sample events
│   └── sample-data.seed.ts           # Connections, vouches, services, etc.
├── features/                          # Feature-specific seeds
│   └── onboarding-v2.seed.ts         # Onboarding screens
├── config/                            # Configuration seeds
│   ├── seed-app-config.ts            # App settings, legal docs, FAQs
│   └── seed-payment-providers.ts     # Payment gateway setup
├── index.ts                           # Master seed orchestrator
└── README.md                          # This file
```

## 🚀 Quick Start

### Run All Seeds (Recommended for Fresh Database)

```bash
npm run seed
# or
npx prisma db seed
```

### Run Specific Seed Categories

```bash
# Individual core seeds
npm run prisma:seed:badges             # Badges only
npm run prisma:seed:rewards            # Rewards only  
npm run prisma:seed:users              # Test users only
npm run prisma:seed:communities        # Communities only
npm run prisma:seed:events             # Events only

# Core seeds (legacy monolithic file - backward compatibility)
npm run prisma:seed:core

# Configuration seeds (app config + payment providers)
npm run prisma:seed:config

# Onboarding screens only
npm run prisma:seed:onboarding

# All seeds with orchestrator (best option)
npm run prisma:seed:all
```

### Run Master Seed Orchestrator

```bash
npx ts-node prisma/seeds/index.ts
```

## 📦 Seed Categories

### 1. **Core Seeds** (`seed.ts` in root prisma/)
Main database seeding for fundamental data:

- ✅ **Badges** - 14 achievement badges (FIRST_FACE, CONNECTOR, etc.)
- ✅ **Rewards** - 5 sample rewards (Tealive, Kopikku, Shopee, etc.)
- ✅ **Vouch Configuration** - Trust system settings
- ✅ **Subscription Tiers** - FREE, BASIC, PREMIUM plans
- ✅ **Payment Provider** - Xendit configuration
- ✅ **Platform Fee Configs** - Transaction fees for events, marketplace, services
- ✅ **Referral Campaign** - LAUNCH2025 campaign
- ✅ **Test Users** - 5 users (admin, host, alice, bob, demo)
- ✅ **Communities** - 6 sample communities (KL Foodies, Sports & Fitness, etc.)
- ✅ **Events** - 5 sample events (badminton, coffee tasting, tech meetup, etc.)
- ✅ **User Connections** - Sample connections between users
- ✅ **Vouches** - Sample trust vouches
- ✅ **Travel Trips** - Sample travel history
- ✅ **Services** - Sample services (city tours, event planning)
- ✅ **Marketplace Listings** - 3 sample items for sale
- ✅ **Referrals** - Sample referral data
- ✅ **Point History** - Sample point transactions

**Login Credentials:**
- Admin: `admin@test.com` / `admin123`
- Host: `host@test.com` / `password123`
- Alice: `alice@test.com` / `password123`
- Bob: `bob@test.com` / `password123`
- Demo: `demo@test.com` / `password123`

### 2. **Feature Seeds** (`seeds/features/`)

#### Onboarding V2 (`onboarding-v2.seed.ts`)
Two-phase onboarding screens:

**Phase 1: App Preview (Pre-Auth) - 4 screens**
1. Welcome screen
2. Connect screen
3. Events screen
4. Trust & Safety screen

**Phase 2: User Setup (Post-Auth) - 7 screens**
1. Complete Profile (required)
2. Set Up Networks (required)
3. Join Communities (optional)
4. Set Preferences (required)
5. Tutorial & Tips (optional)
6. Email Verification (required)
7. Setup Complete (required)

**Features:**
- Anonymous tracking with sessionId
- Screen ordering and required/optional flags
- Pixabay stock images
- Screen types: PROFILE, NETWORK, COMMUNITY, PREFERENCES, TUTORIAL, VERIFICATION

### 3. **Configuration Seeds** (`seeds/config/`)

#### App Configuration (`seed-app-config.ts`)
Application-wide configuration and content management:

- **App Settings** - Version requirements, maintenance mode, force updates
- **Feature Flags** - Enable/disable features per platform
- **Legal Documents** - Terms of Service, Privacy Policy, Community Guidelines
- **Announcements** - System-wide announcements and notices
- **App Versions** - Version history tracking
- **Maintenance Schedules** - Planned maintenance windows
- **FAQ Categories & Items** - Help center content
- **Support Categories & Articles** - Knowledge base
- **App Notices** - In-app banners and alerts
- **Push Notification Templates** - Standard notification messages

#### Payment Providers (`seed-payment-providers.ts`)
Payment gateway configuration:

- **Xendit** (Primary) - Southeast Asia payment gateway
- **Stripe** (Optional) - Global payment gateway
- **Payment Routing Rules** - Country/currency-based routing logic

**Supported Countries:** MY, SG, ID, PH, TH, VN  
**Supported Currencies:** MYR, SGD, IDR, PHP, THB, VND, USD

## 🎯 Seed Order & Dependencies

When running seeds manually, follow this order:

1. **Core Seeds** (required first)
   ```bash
   npx ts-node prisma/seed.ts
   ```

2. **App Configuration** (optional, can run anytime)
   ```bash
   npx ts-node prisma/seeds/config/seed-app-config.ts
   ```

3. **Payment Providers** (optional, needed for transactions)
   ```bash
   npx ts-node prisma/seeds/config/seed-payment-providers.ts
   ```

4. **Feature Seeds** (optional, run as needed)
   ```bash
   npx ts-node prisma/seeds/features/onboarding-v2.seed.ts
   ```

## 🔄 Master Seed Orchestrator

The master seed file (`seeds/index.ts`) runs all seeds in the correct order:

```bash
npx ts-node prisma/seeds/index.ts
```

This will:
1. Check if database is empty or needs seeding
2. Run core seeds
3. Run configuration seeds
4. Run feature seeds
5. Display comprehensive summary

## 🧪 Development Workflow

### Fresh Database Setup
```bash
# Reset database and run all seeds
npx prisma migrate reset --skip-seed
npm run seed
```

### Add New Seed File

1. Create seed file in appropriate folder:
   - `seeds/core/` - Core business logic data
   - `seeds/features/` - Feature-specific data
   - `seeds/config/` - Configuration data

2. Name convention: `{feature-name}.seed.ts`

3. Add to master orchestrator (`seeds/index.ts`)

### Seed File Template

```typescript
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed{FeatureName}() {
  console.log('\n🌱 Seeding {Feature Name}...');
  
  // Your seeding logic here
  
  console.log('✅ {Feature Name} seeded successfully');
}

async function main() {
  await seed{FeatureName}();
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export { seed{FeatureName} };
```

## 📊 Seed Data Summary

| Category | Count | Description |
|----------|-------|-------------|
| Users | 5 | Test users (admin, host, members) |
| Badges | 14 | Achievement badges |
| Rewards | 5 | Redeemable rewards |
| Subscription Tiers | 3 | FREE, BASIC, PREMIUM |
| Communities | 6 | Sample communities |
| Events | 5 | Upcoming sample events |
| Services | 2 | Service offerings |
| Marketplace Listings | 3 | Items for sale |
| App Preview Screens | 4 | Pre-auth onboarding |
| User Setup Screens | 7 | Post-auth onboarding |
| Legal Documents | 3+ | Terms, Privacy, Guidelines |
| FAQ Items | 20+ | Help center articles |
| Payment Providers | 2 | Xendit, Stripe |

## 🚨 Important Notes

1. **Environment Variables Required:**
   - Payment gateway credentials (Xendit, Stripe)
   - Email service credentials (if needed)
   - API keys for external services

2. **Idempotent Seeds:**
   - Most seeds use `upsert` or `deleteMany` + `create`
   - Safe to run multiple times
   - Will not duplicate data

3. **Production Warning:**
   - **NEVER** run test seeds on production database
   - Use production-specific seed files for initial data
   - Remove test credentials before deployment

4. **Data Cleanup:**
   ```bash
   # Reset database completely
   npx prisma migrate reset
   
   # Drop all data but keep schema
   npx prisma db push --force-reset
   ```

## 📝 Maintenance

### Adding New Badges
Edit `prisma/seed.ts` and add to the `badges` array.

### Adding New Onboarding Screens
Edit `prisma/seeds/features/onboarding-v2.seed.ts`.

### Updating App Configuration
Edit `prisma/seeds/config/seed-app-config.ts`.

### Updating Payment Providers
Edit `prisma/seeds/config/seed-payment-providers.ts`.

## 🔗 Related Documentation

- [Database Setup Guide](../DATABASE_SETUP.md)
- [Seeding Guide](../SEEDING_GUIDE.md)
- [Onboarding V2 API](../../docs/api-v2/ONBOARDING_V2_API.md)
- [Payment Gateway Documentation](../../docs/PAYMENT_GATEWAY_QUICKREF.md)

---

**Last Updated:** October 17, 2025  
**Version:** 2.1.0
