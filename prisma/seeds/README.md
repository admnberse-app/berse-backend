# Database Seeding Guide

This directory contains all database seed files organized by category.

## 📁 Folder Structure

```
prisma/
├── seed.ts                            # Main seed orchestrator (barrel file)
└── seeds/
    ├── index.ts                       # Alternative orchestrator (same as seed.ts)
    ├── README.md                      # This file
    ├── core/                          # Core application data (modular)
    │   ├── badges.seed.ts             # 14 achievement badges
    │   ├── rewards.seed.ts            # 5 redeemable rewards
    │   ├── subscription-tiers.seed.ts # FREE, BASIC, PREMIUM
    │   ├── vouch-config.seed.ts       # Trust system configuration
    │   ├── platform-fees.seed.ts      # Transaction fee configs
    │   ├── payment-providers.seed.ts  # Payment gateway setup
    │   ├── referral-campaign.seed.ts  # LAUNCH2025 campaign
    │   ├── users-enhanced.seed.ts     # 15 test users with complete profiles
    │   ├── users.seed.ts              # Legacy 5 test users (use users-enhanced instead)
    │   ├── communities.seed.ts        # 6 sample communities
    │   ├── events.seed.ts             # 5 sample events
    │   ├── events-30days.seed.ts      # Additional 30-day event samples
    │   └── sample-data.seed.ts        # Connections, vouches, services, etc.
    ├── config/                        # Configuration seeds
    │   ├── seed-app-config.ts         # App settings, legal docs, FAQs
    │   └── seed-payment-providers.ts  # Payment gateway setup
    ├── features/                      # Feature-specific seeds
    │   └── onboarding-v2.seed.ts      # Onboarding screens
    ├── cardgame.seed.ts               # Card game topics & questions
    ├── platform-config.seed.ts        # Platform configuration
    └── seed-homesurf-berseguide.ts    # HomeSurf & BerseGuide seeds
```

## 🚀 Quick Start

### Run All Seeds (Recommended for Fresh Database)

```bash
npm run seed
# or
npx prisma db seed
# or
npx ts-node prisma/seed.ts
```

All three commands do the same thing - run the master seed orchestrator that executes all modular seeds in the correct order.

### Run Specific Seed Categories

```bash
# Individual core seeds
npm run prisma:seed:badges             # Badges only
npm run prisma:seed:rewards            # Rewards only  
npm run prisma:seed:users              # Test users only
npm run prisma:seed:communities        # Communities only
npm run prisma:seed:events             # Events only

# Configuration seeds (app config + payment providers)
npm run prisma:seed:config

# Onboarding screens only
npm run prisma:seed:onboarding

# Card game data only
npm run prisma:seed:cardgame

# All seeds with orchestrator (same as npm run seed)
npm run prisma:seed:all
```

### Run Master Seed Orchestrator Directly

```bash
# Using the main seed.ts barrel file
npx ts-node prisma/seed.ts

# Using the seeds/index.ts orchestrator (same result)
npx ts-node prisma/seeds/index.ts
```

## 📦 Seed Architecture

### Barrel File Pattern

The project uses a **barrel file pattern** for seeds:

1. **`prisma/seed.ts`** - Main entry point (barrel file)
   - Orchestrates all modular seeds
   - Used by `npx prisma db seed` and `npm run seed`
   - Runs seeds in dependency order

2. **`prisma/seeds/index.ts`** - Alternative orchestrator
   - Functionally identical to seed.ts
   - Alternative entry point for the same system

3. **`prisma/seeds/`** - Modular seed files
   - Organized by category (core, config, features)
   - Can be run individually
   - Each file is self-contained and idempotent

## 📊 What Gets Seeded

### Core Application Data (`seeds/core/`)

- ✅ **Badges** - 14 achievement badges (FIRST_FACE, CONNECTOR, etc.)
- ✅ **Rewards** - 5 sample rewards (Tealive, Kopikku, Shopee, etc.)
- ✅ **Vouch Configuration** - Trust system settings
- ✅ **Subscription Tiers** - FREE, BASIC, PREMIUM plans
- ✅ **Payment Providers** - Xendit configuration
- ✅ **Platform Fee Configs** - Transaction fees for events, marketplace, services
- ✅ **Referral Campaign** - LAUNCH2025 campaign
- ✅ **Test Users** - 15 users with diverse profiles (admin, hosts, members)
- ✅ **Communities** - 6 sample communities (KL Foodies, Sports & Fitness, etc.)
- ✅ **Events** - 5 sample events (badminton, coffee tasting, tech meetup, etc.)
- ✅ **User Connections** - Sample connections between users
- ✅ **Vouches** - Sample trust vouches
- ✅ **Travel Trips** - Sample travel history
- ✅ **Marketplace Listings** - Products and services for sale
- ✅ **Referrals** - Sample referral data
- ✅ **Point History** - Sample point transactions

**Login Credentials:**
- Admin: `admin@berseapp.com` / `admin123`
- Host: `sarah.host@berseapp.com` / `password123`
- Alice: `alice@test.com` / `password123`
- Bob: `bob@test.com` / `password123`
- Demo: `demo@test.com` / `password123`

### Feature Seeds (`seeds/features/`)

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
### Configuration Seeds (`seeds/config/`)
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

**Important:** The seed orchestrator (`prisma/seed.ts` or `prisma/seeds/index.ts`) automatically runs all seeds in the correct order. You typically don't need to run them individually.

However, if running manually, follow this order:

1. **Core Seeds** (in order - required first)
   ```bash
   npx ts-node prisma/seeds/core/badges.seed.ts
   npx ts-node prisma/seeds/core/rewards.seed.ts
   npx ts-node prisma/seeds/core/vouch-config.seed.ts
   npx ts-node prisma/seeds/core/subscription-tiers.seed.ts
   npx ts-node prisma/seeds/core/payment-providers.seed.ts
   npx ts-node prisma/seeds/core/platform-fees.seed.ts
   npx ts-node prisma/seeds/core/referral-campaign.seed.ts
   npx ts-node prisma/seeds/core/users-enhanced.seed.ts
   npx ts-node prisma/seeds/core/communities.seed.ts
   npx ts-node prisma/seeds/core/events.seed.ts
   npx ts-node prisma/seeds/core/sample-data.seed.ts
   ```

2. **Configuration Seeds** (optional, can run anytime after core)
   ```bash
   npx ts-node prisma/seeds/config/seed-app-config.ts
   npx ts-node prisma/seeds/config/seed-payment-providers.ts
   ```

3. **Feature Seeds** (optional, run as needed)
   ```bash
   npx ts-node prisma/seeds/features/onboarding-v2.seed.ts
   npx ts-node prisma/seeds/cardgame.seed.ts
   ```

## 🔄 Master Seed Orchestrators

The project has **two entry points** that do the same thing:

### Option 1: Main Seed File (Recommended)
```bash
npx ts-node prisma/seed.ts
# or
npm run seed
# or
npx prisma db seed
```

### Option 2: Seeds Index File
```bash
npx ts-node prisma/seeds/index.ts
# or
npm run prisma:seed:all
```

Both orchestrators:
- Run all seeds in the correct dependency order
- Display progress and timing for each seed
- Show a comprehensive summary at the end
- Handle errors gracefully
- Are idempotent (safe to run multiple times)

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

3. Follow the template pattern (see below)

4. Add to both orchestrators:
   - `prisma/seed.ts`
   - `prisma/seeds/index.ts`

5. (Optional) Add npm script to `package.json` for individual execution

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
| Users | 15 | Enhanced test users (admin, hosts, members) |
| Badges | 14 | Achievement badges |
| Rewards | 5 | Redeemable rewards |
| Subscription Tiers | 3 | FREE, BASIC, PREMIUM |
| Communities | 6 | Sample communities |
| Events | 5+ | Upcoming sample events |
| Marketplace Listings | 6+ | Products and services |
| App Preview Screens | 4 | Pre-auth onboarding |
| User Setup Screens | 7 | Post-auth onboarding |
| Legal Documents | 3+ | Terms, Privacy, Guidelines |
| FAQ Items | 20+ | Help center articles |
| Payment Providers | 2 | Xendit, Stripe |
| Card Game Topics | Multiple | Conversation starters |
| Card Game Questions | Multiple | Icebreaker questions |

## 🚨 Important Notes

1. **Environment Variables Required:**
   - Payment gateway credentials (Xendit, Stripe)
   - Email service credentials (if needed)
   - API keys for external services
   - All configured in `.env` file

2. **Idempotent Seeds:**
   - All seeds use `upsert` or check for existing records
   - Safe to run multiple times
   - Will not duplicate data
   - Preserves existing data where appropriate

3. **Production Warning:**
   - **NEVER** run test seeds on production database
   - Use production-specific seed files for initial data
   - Remove test credentials before deployment
   - Ensure proper environment separation

4. **Database Cleanup:**
   ```bash
   # Reset database completely (deletes all data and reseeds)
   npx prisma migrate reset
   
   # Drop all data but keep schema
   npx prisma db push --force-reset
   
   # Just run seeds without resetting
   npm run seed
   ```

5. **Seed Architecture:**
   - **Barrel Pattern**: Main entry point (`seed.ts`) orchestrates modular seeds
   - **Modular Design**: Each seed file is self-contained
   - **Dependency Order**: Orchestrators handle correct execution order
   - **Multiple Entry Points**: Both `seed.ts` and `seeds/index.ts` work identically

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

## 🎓 Quick Reference

### Most Common Commands

```bash
# Run all seeds (recommended)
npm run seed

# Reset database and reseed
npx prisma migrate reset

# Run specific seed
npx ts-node prisma/seeds/core/users-enhanced.seed.ts

# Check what will be seeded
cat prisma/seed.ts
```

### File Locations

- **Main orchestrator**: `prisma/seed.ts`
- **Alternative orchestrator**: `prisma/seeds/index.ts`
- **Core seeds**: `prisma/seeds/core/*.seed.ts`
- **Config seeds**: `prisma/seeds/config/*.ts`
- **Feature seeds**: `prisma/seeds/features/*.seed.ts`

### Key Concepts

- **Barrel File**: Main entry point that orchestrates all seeds
- **Modular Seeds**: Individual seed files organized by category
- **Idempotent**: Can be run multiple times safely
- **Dependency Order**: Seeds run in sequence to respect relationships

---

**Last Updated:** October 23, 2025  
**Version:** 2.2.0
