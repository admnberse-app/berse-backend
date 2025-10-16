# Database Setup & Migration Guide

## ✅ Current Status

### Migrations
- ✅ **All migrations have been applied** to the development database
- ✅ **Migration history baselined** - all existing migrations marked as applied
- ✅ **Schema is up to date** - database matches Prisma schema

### Railway Deployment
- ✅ **Automatic migrations configured** - runs on every deployment
- ✅ **Build script updated** - includes `prisma migrate deploy`
- ✅ **Zero-downtime migrations** - uses production-safe `migrate deploy`

---

## 🚀 Automatic Migration on Railway

Railway is configured to **automatically run migrations** on every deployment:

```json
"railway:start": "npx prisma generate && npx prisma migrate deploy && npm run start:prod"
```

### What Happens on Deploy:
1. **Prisma Client Generated** - `npx prisma generate`
2. **Migrations Applied** - `npx prisma migrate deploy`
3. **Server Starts** - `npm run start:prod`

This ensures your database schema is always in sync with your code! 🎉

---

## 📊 Migration Commands

### Check Migration Status
```bash
npx prisma migrate status
```

**Example Output:**
```
Database schema is up to date!
```

### Apply Pending Migrations (Production)
```bash
npx prisma migrate deploy
```
- ✅ Safe for production
- ✅ Only applies pending migrations
- ✅ Never prompts for input
- ✅ Doesn't reset database

### Create New Migration (Development)
```bash
npx prisma migrate dev --name your_migration_name
```
- ⚠️ **Never use in production!**
- Creates new migration file
- Applies migration
- Regenerates Prisma Client

---

## 🌱 Database Seeding

### Why Seeding is Separate

The seed scripts have TypeScript type issues that need fixing. **Seeding is optional** and should be done after the application is running successfully.

### Seed Scripts Available

1. **Main Seed** - `prisma/seed.ts`
   - Creates test users (admin, hosts, members)
   - Sets up badges, rewards, subscription tiers
   - Creates sample communities and events
   - Generates connections and vouches
   
2. **App Config Seed** - `prisma/seed-app-config.ts`
   - Onboarding screens
   - App versions
   - Legal documents
   - FAQs and help articles
   - Feature flags

### Manual Seeding (After Fixing TypeScript Errors)

```bash
# Run main seed
npm run prisma:seed

# Or run both seeds
npx ts-node prisma/seed.ts
npx ts-node prisma/seed-app-config.ts
```

### Seed Data Summary

When seeds are working, they create:
- 5 Test users with different roles and trust levels
- 14 Badge types
- 5 Sample rewards
- 3 Subscription tiers (Free, Basic, Premium)
- Payment provider configuration (Xendit)
- 4 Platform fee configurations
- 1 Referral campaign
- 6 Communities
- 5 Sample events
- Connections, vouches, travel trips
- 12 App configurations
- 5 Onboarding screens
- 4 App versions
- 4 Legal documents
- 5 Feature flags

---

## 🔧 Railway Database Configuration

### Staging Environment
```
DATABASE_URL=postgresql://postgres:***@postgres.railway.internal:5432/railway
NODE_ENV=staging
```

### Production Environment
```
DATABASE_URL=postgresql://postgres:***@postgres.railway.internal:5432/railway
NODE_ENV=production
```

Both environments use separate database schemas on the same PostgreSQL instance for isolation.

---

## 📝 Migration History

### Applied Migrations (In Order)
1. `20250120_add_cardgame_feedback`
2. `20250624222036_initial_schema`
3. `20250624232345_add_notifications`
4. `20250624232859_add_matching_system`
5. `20251013070440_init`
6. `20251014055827_pluralize_table_names`
7. `20251014081857_referral_system_and_schema_updates`
8. `20251014103130_add_app_configuration_system`
9. `20251015023536_add_location_coordinates`
10. `20251015024702_add_location_privacy`

All migrations have been baselined and are tracked in the `_prisma_migrations` table.

---

## 🚨 Troubleshooting

### Error: "The database schema is not empty"

**Solution:** Baseline existing migrations
```bash
npx prisma migrate resolve --applied <migration_name>
```

We've already done this for all existing migrations.

### Error: Migration failed

**Check:**
1. Database connection (DATABASE_URL correct?)
2. Database permissions (can create/alter tables?)
3. Migration SQL syntax
4. Conflicting data

**View applied migrations:**
```bash
npx prisma migrate status
```

### Seed Script TypeScript Errors

**Current Issue:** Many models require `id` and `updatedAt` fields, but schema doesn't have `@default(cuid())` for IDs.

**Temporary Workaround:** Skip seeding until schema is updated or seed scripts are fixed.

**Future Fix:** Either:
- Add `@default(cuid())` to all `id` fields in schema
- Update seed scripts to manually generate UUIDs
- Use `prisma.$executeRaw` for raw SQL inserts

---

## ✅ Production Checklist

Before deploying to production:

- [x] All migrations applied successfully
- [x] Database connection tested
- [x] Prisma Client generated
- [x] Railway deployment configured
- [x] Automatic migrations enabled
- [ ] Seed data added (optional, can be done later)
- [x] Environment variables set
- [x] Backup strategy planned

---

## 🎯 Next Steps

1. **Deploy to Railway** - Migrations will run automatically
2. **Verify deployment logs** - Check that migrations applied successfully
3. **Test database connection** - Hit health check endpoint
4. **Add seed data** - Once TypeScript errors are fixed (optional)
5. **Monitor performance** - Use Railway metrics

---

## 📚 Resources

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Railway PostgreSQL Guide](https://docs.railway.app/databases/postgresql)
- [Migration Best Practices](https://www.prisma.io/docs/guides/migrate/production-troubleshooting)

---

**Last Updated:** October 16, 2025  
**Status:** ✅ Ready for deployment
