# Database Seeding Guide

This guide explains how to seed your Berse database with sample data.

## Available Seed Files

### 1. **Main Seed** (`prisma/seed.ts`)
Seeds core application data including:
- ✅ Badges (14 badge types)
- ✅ Rewards (5 sample rewards)
- ✅ Vouch configuration
- ✅ Subscription tiers (Free, Basic, Premium)
- ✅ Payment provider (Xendit)
- ✅ Platform fee configurations
- ✅ Referral campaign
- ✅ Test users (5 users with different roles)
- ✅ Sample communities (6 communities)
- ✅ Sample events (5 events)
- ✅ User connections
- ✅ Sample vouches
- ✅ Travel trips
- ✅ Services
- ✅ Marketplace listings
- ✅ Referrals
- ✅ Point history

### 2. **App Configuration Seed** (`prisma/seed-app-config.ts`)
Seeds mobile app configuration and content management data:
- ⚙️ App configs (12 configurations)
- 📱 Onboarding screens (5 screens)
- 📦 App versions (iOS & Android v1.0, v1.1)
- 📜 Legal documents (TOS, Privacy Policy, Guidelines, Refund)
- 📢 Announcements (4 active announcements)
- ❓ FAQs (5 categories, 10 FAQs)
- 📚 Help articles (5 categories, 2 comprehensive guides)
- 🔧 Maintenance schedule (1 scheduled maintenance)
- 🚩 Feature flags (5 flags for different features)
- 📌 App notices (4 in-app notices)

---

## Running Seeds

### Prerequisites
```bash
# Make sure your database is running
# Make sure DATABASE_URL is set in .env
```

### Option 1: Run Main Seed Only
```bash
npx ts-node prisma/seed.ts
```

**Use this when:**
- Setting up development environment
- Need core application data
- Testing user flows and features

### Option 2: Run App Config Seed Only
```bash
npx ts-node prisma/seed-app-config.ts
```

**Use this when:**
- Testing mobile app content management
- Working on onboarding flows
- Testing FAQ/Help systems
- Configuring app settings

### Option 3: Run Both Seeds
```bash
# Run main seed first
npx ts-node prisma/seed.ts

# Then run app config seed
npx ts-node prisma/seed-app-config.ts
```

**Use this when:**
- Complete fresh start
- Full testing environment
- Demonstrating all features

### Option 4: Run via Prisma (Main Seed Only)
```bash
npx prisma db seed
```

This runs the main seed file as configured in `package.json`.

---

## Test Users

After running the main seed, you'll have these test accounts:

| Email              | Password     | Role          | Trust Score | Notes                    |
|--------------------|--------------|---------------|-------------|--------------------------|
| admin@test.com     | admin123     | ADMIN         | 95.0        | Full admin access        |
| host@test.com      | password123  | GENERAL_USER  | 75.0        | Certified host & guide   |
| alice@test.com     | password123  | GENERAL_USER  | 60.0        | Foodie & traveler        |
| bob@test.com       | password123  | GENERAL_USER  | 55.0        | Sports enthusiast        |
| demo@test.com      | password123  | GENERAL_USER  | 30.0        | New member               |

---

## Verifying Seed Data

### Check Main Seed Data
```bash
# Count records in key tables
psql $DATABASE_URL -c "
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM badges) as badges,
  (SELECT COUNT(*) FROM rewards) as rewards,
  (SELECT COUNT(*) FROM events) as events,
  (SELECT COUNT(*) FROM communities) as communities,
  (SELECT COUNT(*) FROM subscription_tiers) as tiers;
"
```

Expected output:
- users: 5
- badges: 14
- rewards: 5
- events: 5
- communities: 6
- tiers: 3

### Check App Config Data
```bash
# Count app configuration records
psql $DATABASE_URL -c "
SELECT 
  (SELECT COUNT(*) FROM app_configs) as configs,
  (SELECT COUNT(*) FROM onboarding_screens) as onboarding,
  (SELECT COUNT(*) FROM app_versions) as versions,
  (SELECT COUNT(*) FROM legal_documents) as legal_docs,
  (SELECT COUNT(*) FROM announcements) as announcements,
  (SELECT COUNT(*) FROM faqs) as faqs,
  (SELECT COUNT(*) FROM feature_flags) as flags;
"
```

Expected output:
- configs: 12
- onboarding: 5
- versions: 4
- legal_docs: 4
- announcements: 4
- faqs: 10
- flags: 5

---

## Resetting Database

### Complete Reset
```bash
# Drop and recreate database
npx prisma migrate reset

# This will:
# 1. Drop the database
# 2. Create new database
# 3. Run all migrations
# 4. Run main seed automatically
```

### Selective Reset

#### Reset App Config Data Only
```bash
# Delete app config data
psql $DATABASE_URL -c "
TRUNCATE TABLE 
  app_configs,
  onboarding_screens, onboarding_analytics,
  app_versions,
  legal_documents, legal_document_acceptances,
  announcements, announcement_analytics,
  faq_categories, faqs, faq_analytics,
  help_article_categories, help_articles, help_article_analytics,
  maintenance_schedules,
  feature_flags, feature_flag_analytics,
  app_notices, app_notice_dismissals
CASCADE;
"

# Re-run app config seed
npx ts-node prisma/seed-app-config.ts
```

#### Reset Main Data Only
```bash
# Reset main tables (preserves app config)
npx prisma migrate reset --skip-seed

# Manually run main seed
npx ts-node prisma/seed.ts
```

---

## Customizing Seed Data

### Modifying Test Users
Edit `prisma/seed.ts`, section `// 8. CREATE TEST USERS`:

```typescript
const usersData = [
  {
    email: 'your-email@test.com',
    username: 'your-username',
    fullName: 'Your Name',
    // ... other fields
  },
  // Add more users
];
```

### Adding More Content
Edit `prisma/seed-app-config.ts`:

- **Add onboarding screens**: Modify `onboardingScreens` array
- **Add FAQs**: Modify `faqs` array
- **Add help articles**: Modify `helpArticles` array
- **Add announcements**: Modify `announcements` array
- **Add feature flags**: Modify `featureFlags` array

### Changing Default Settings
Edit app configs in `prisma/seed-app-config.ts`:

```typescript
const appConfigs = [
  {
    configKey: 'maintenance_mode',
    configValue: 'true', // Change this
    // ...
  },
];
```

---

## Production Considerations

### ⚠️ Never Run Seeds in Production!

Seeds are for **development and testing only**.

### For Production:
1. ✅ Run migrations only: `npx prisma migrate deploy`
2. ✅ Manually create admin users
3. ✅ Configure app settings via admin panel
4. ✅ Import real content, not sample data

### Safe Production Data:
You may want to seed these in production:
- Badges (standardized across all environments)
- Subscription tiers (if consistent)
- Platform fee configurations

To seed specific data safely:
```typescript
// Create a production-safe seed file
// prisma/seed-production.ts

async function seedProduction() {
  // Only seed static, non-test data
  await seedBadges();
  await seedSubscriptionTiers();
  await seedPlatformFees();
}
```

---

## Troubleshooting

### Error: Unique constraint violation
**Cause:** Seed data already exists  
**Solution:** Reset database or delete specific records first

```bash
# Full reset
npx prisma migrate reset

# Or delete manually
psql $DATABASE_URL -c "DELETE FROM users;"
```

### Error: Foreign key constraint violation
**Cause:** Trying to seed data that references non-existent records  
**Solution:** Run main seed before app config seed

```bash
# Correct order
npx ts-node prisma/seed.ts
npx ts-node prisma/seed-app-config.ts
```

### Error: Database connection failed
**Cause:** Database not running or wrong DATABASE_URL  
**Solution:** 
1. Check `.env` file for correct DATABASE_URL
2. Ensure PostgreSQL is running
3. Test connection: `psql $DATABASE_URL -c "SELECT 1;"`

### Error: Module not found
**Cause:** Prisma client not generated  
**Solution:**
```bash
npx prisma generate
```

---

## Best Practices

### Development Workflow

1. **Fresh Start:**
   ```bash
   npx prisma migrate reset
   # Runs migrations + main seed automatically
   npx ts-node prisma/seed-app-config.ts
   ```

2. **Update Schema:**
   ```bash
   npx prisma migrate dev --name your_migration_name
   # Re-run seeds if needed
   ```

3. **Test New Features:**
   - Add test data to seed files
   - Run seeds
   - Test feature
   - Adjust seed data as needed

### Team Collaboration

- **Commit seed files** to version control
- **Document custom seed data** in this README
- **Keep seeds updated** when schema changes
- **Share test credentials** securely (use environment variables in production)

---

## Quick Reference

```bash
# Common Commands
npx prisma generate                      # Regenerate Prisma Client
npx prisma migrate dev                   # Create & run migration
npx prisma migrate reset                 # Reset database + main seed
npx ts-node prisma/seed.ts               # Main seed
npx ts-node prisma/seed-app-config.ts    # App config seed
npx prisma studio                        # View database in browser

# Database queries
psql $DATABASE_URL -c "SELECT * FROM users;"
psql $DATABASE_URL -c "\dt"              # List all tables
```

---

## Support

For issues or questions:
- Check Prisma docs: https://www.prisma.io/docs
- Project documentation: `/artifacts/`
- Contact: support@berse.app

Happy seeding! 🌱
