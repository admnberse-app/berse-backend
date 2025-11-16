# Database Seeds Quick Reference

## 🚀 Quick Commands

```bash
# Run all seeds (most common)
npm run seed

# Reset database and reseed everything
npx prisma migrate reset

# Run individual seeds
npm run prisma:seed:badges
npm run prisma:seed:users
npm run prisma:seed:communities
npm run prisma:seed:events
```

## 📁 Seed Structure

```
prisma/
├── seed.ts                        # 🎯 Main orchestrator (run this)
└── seeds/
    ├── index.ts                   # Alternative orchestrator (same as seed.ts)
    ├── core/                      # Core data (users, badges, etc.)
    ├── config/                    # App configuration
    └── features/                  # Feature-specific seeds
```

## 🎯 Two Ways to Seed

### Method 1: Main Seed File (Recommended)
```bash
npm run seed
# or
npx ts-node prisma/seed.ts
# or
npx prisma db seed
```

### Method 2: Seeds Index
```bash
npm run prisma:seed:all
# or
npx ts-node prisma/seeds/index.ts
```

Both do exactly the same thing!

## 📦 What Gets Seeded

| Category | Items | Location |
|----------|-------|----------|
| Users | 15 test users | `core/users-enhanced.seed.ts` |
| Badges | 14 badges | `core/badges.seed.ts` |
| Rewards | 5 rewards | `core/rewards.seed.ts` |
| Communities | 6 communities | `core/communities.seed.ts` |
| Events | 5+ events | `core/events.seed.ts` |
| Subscription Tiers | 3 tiers | `core/subscription-tiers.seed.ts` |
| Payment Providers | 2 providers | `core/payment-providers.seed.ts` |
| Marketplace | 6+ listings | `core/sample-data.seed.ts` |
| Onboarding | 11 screens | `features/onboarding-v2.seed.ts` |
| Card Game | Topics & Q's | `cardgame.seed.ts` |
| App Config | Settings & docs | `config/seed-app-config.ts` |

## 🔐 Test Credentials

| User | Email | Password |
|------|-------|----------|
| Admin | `admin@berseapp.com` | `admin123` |
| Host | `sarah.host@berseapp.com` | `password123` |
| Alice | `alice@test.com` | `password123` |
| Bob | `bob@test.com` | `password123` |
| Demo | `demo@test.com` | `password123` |

## 🎨 Architecture

### Barrel File Pattern
- **Main Entry**: `prisma/seed.ts` orchestrates all seeds
- **Modular Seeds**: Individual files in `/seeds` folder
- **Dependency Order**: Automatically handled by orchestrator
- **Idempotent**: Safe to run multiple times

### File Organization
```
core/        → Essential data (users, badges, events)
config/      → App settings & configuration
features/    → Feature-specific data (onboarding, games)
```

## 🔄 Common Workflows

### Fresh Setup
```bash
# 1. Create database
npx prisma migrate dev

# 2. Run all seeds
npm run seed
```

### Reset Everything
```bash
# Drops all data, runs migrations, and reseeds
npx prisma migrate reset
```

### Add New Seed
```bash
# 1. Create file in appropriate folder
touch prisma/seeds/core/my-feature.seed.ts

# 2. Add to orchestrator (prisma/seed.ts)
{
  path: 'prisma/seeds/core/my-feature.seed.ts',
  name: 'My Feature',
}

# 3. (Optional) Add npm script to package.json
"prisma:seed:my-feature": "ts-node prisma/seeds/core/my-feature.seed.ts"
```

## 🛠 Seed Template

```typescript
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedMyFeature() {
  console.log('\n🌱 Seeding My Feature...');
  
  // Your seeding logic here
  await prisma.myModel.upsert({
    where: { id: 'unique-id' },
    update: {},
    create: {
      // data
    },
  });
  
  console.log('✅ My Feature seeded successfully');
}

async function main() {
  await seedMyFeature();
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
```

## 💡 Tips

1. **Always use the main orchestrator** (`npm run seed`) unless you need a specific seed
2. **Seeds are idempotent** - safe to run multiple times
3. **Environment variables required** - ensure `.env` is configured
4. **Check execution order** - core → config → features
5. **Both orchestrators work** - `seed.ts` and `seeds/index.ts` are identical

## 📚 More Info

- Full documentation: `prisma/seeds/README.md`
- Individual seed files: `prisma/seeds/core/`, `config/`, `features/`
- Package scripts: Check `package.json` for all available commands

---

**Quick Start**: Just run `npm run seed` and you're good to go! 🚀
