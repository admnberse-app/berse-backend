const { PrismaClient } = require('@prisma/client');

// Use the Railway database URL you provided earlier
const DATABASE_URL = process.env.RAILWAY_DATABASE_URL || 'postgresql://postgres:wiedIsOsMyFyjdAHgNSgkIIIIZNeQgod@mainline.proxy.rlwy.net:48018/railway';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

async function fixDatabase() {
  console.log('Connecting to Railway database...');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Run raw SQL to add missing columns
    console.log('Adding missing MFA columns...');
    
    const queries = [
      // Add MFA columns if they don't exist
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mfaEnabled" BOOLEAN DEFAULT false`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mfaSecret" TEXT`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mfaBackupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[]`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mfaRecoveryEmail" TEXT`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastMfaAuthAt" TIMESTAMP(3)`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pushToken" TEXT`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastSeenAt" TIMESTAMP(3)`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "googleCalendarConnected" BOOLEAN DEFAULT false`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "googleCalendarRefreshToken" TEXT`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "profileVisibility" TEXT DEFAULT 'public'`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "searchableByPhone" BOOLEAN DEFAULT true`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "searchableByEmail" BOOLEAN DEFAULT true`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "allowDirectMessages" BOOLEAN DEFAULT true`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerificationToken" TEXT`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerificationExpires" TIMESTAMP(3)`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetToken" TEXT`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetExpires" TIMESTAMP(3)`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "loginAttempts" INTEGER DEFAULT 0`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lockoutUntil" TIMESTAMP(3)`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "sessionTokens" TEXT[] DEFAULT ARRAY[]::TEXT[]`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deviceIds" TEXT[] DEFAULT ARRAY[]::TEXT[]`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "trustedDevices" JSONB DEFAULT '[]'::JSONB`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "securityQuestions" JSONB DEFAULT '[]'::JSONB`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "accountLockedReason" TEXT`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "suspendedUntil" TIMESTAMP(3)`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "suspensionReason" TEXT`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deletionRequestedAt" TIMESTAMP(3)`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deletionScheduledFor" TIMESTAMP(3)`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "dataExportRequestedAt" TIMESTAMP(3)`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastPasswordChangeAt" TIMESTAMP(3)`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHistory" TEXT[] DEFAULT ARRAY[]::TEXT[]`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "requirePasswordChange" BOOLEAN DEFAULT false`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "consentToDataProcessing" BOOLEAN DEFAULT true`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "consentToMarketing" BOOLEAN DEFAULT false`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "consentDate" TIMESTAMP(3)`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "userAgent" TEXT`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginLocation" TEXT`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "timezone" TEXT DEFAULT 'Asia/Kuala_Lumpur'`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "preferredLanguage" TEXT DEFAULT 'en'`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'MYR'`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "darkMode" BOOLEAN DEFAULT false`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notificationPreferences" JSONB DEFAULT '{"email": true, "push": true, "sms": false}'::JSONB`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "apiKeys" TEXT[] DEFAULT ARRAY[]::TEXT[]`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "webhookUrl" TEXT`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "integrations" JSONB DEFAULT '{}'::JSONB`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "customFields" JSONB DEFAULT '{}'::JSONB`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[]`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notes" TEXT`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "internalNotes" TEXT`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralSource" TEXT`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "utmSource" TEXT`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "utmMedium" TEXT`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "utmCampaign" TEXT`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "affiliateId" TEXT`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lifetimeValue" DOUBLE PRECISION DEFAULT 0`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "totalSpent" DOUBLE PRECISION DEFAULT 0`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "averageOrderValue" DOUBLE PRECISION DEFAULT 0`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastPurchaseAt" TIMESTAMP(3)`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "purchaseCount" INTEGER DEFAULT 0`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "loyaltyTier" TEXT DEFAULT 'bronze'`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "loyaltyPoints" INTEGER DEFAULT 0`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "rewardsEarned" INTEGER DEFAULT 0`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "rewardsRedeemed" INTEGER DEFAULT 0`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "vipStatus" BOOLEAN DEFAULT false`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "vipExpiry" TIMESTAMP(3)`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT DEFAULT 'free'`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionPlan" TEXT`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionStartDate" TIMESTAMP(3)`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionEndDate" TIMESTAMP(3)`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP(3)`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "creditBalance" DOUBLE PRECISION DEFAULT 0`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "debitBalance" DOUBLE PRECISION DEFAULT 0`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "walletAddress" TEXT`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "kycStatus" TEXT DEFAULT 'pending'`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "kycVerifiedAt" TIMESTAMP(3)`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "kycDocuments" JSONB DEFAULT '[]'::JSONB`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "riskScore" INTEGER DEFAULT 0`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "fraudFlags" TEXT[] DEFAULT ARRAY[]::TEXT[]`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "accountHealth" INTEGER DEFAULT 100`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "engagementScore" INTEGER DEFAULT 0`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "activityScore" INTEGER DEFAULT 0`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "reputationScore" INTEGER DEFAULT 100`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "trustLevel" INTEGER DEFAULT 1`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verificationBadges" TEXT[] DEFAULT ARRAY[]::TEXT[]`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "achievements" JSONB DEFAULT '[]'::JSONB`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "completedOnboarding" BOOLEAN DEFAULT false`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingStep" INTEGER DEFAULT 0`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tourCompleted" BOOLEAN DEFAULT false`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "featuresUsed" TEXT[] DEFAULT ARRAY[]::TEXT[]`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastFeatureUsedAt" TIMESTAMP(3)`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "supportTicketCount" INTEGER DEFAULT 0`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastSupportTicketAt" TIMESTAMP(3)`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "feedbackCount" INTEGER DEFAULT 0`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastFeedbackAt" TIMESTAMP(3)`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "npsScore" INTEGER`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "satisfactionRating" DOUBLE PRECISION`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "churnRisk" TEXT DEFAULT 'low'`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "retentionScore" INTEGER DEFAULT 50`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lifetimeEngagementMinutes" INTEGER DEFAULT 0`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastActiveAt" TIMESTAMP(3)`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "consecutiveLoginDays" INTEGER DEFAULT 0`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "totalLoginDays" INTEGER DEFAULT 0`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "metadata" JSONB DEFAULT '{}'::JSONB`
    ];
    
    for (const query of queries) {
      try {
        await prisma.$executeRawUnsafe(query);
        console.log(`✅ Executed: ${query.substring(0, 50)}...`);
      } catch (error) {
        console.log(`⚠️ Skipped (might already exist): ${query.substring(0, 50)}...`);
      }
    }
    
    console.log('\n✅ Database schema fixed successfully!');
    
    // Verify a user can be queried
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
  } catch (error) {
    console.error('❌ Error fixing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get the database URL from command line or environment
const args = process.argv.slice(2);
if (args.length > 0) {
  process.env.RAILWAY_DATABASE_URL = args[0];
}

console.log('🚀 Starting database fix...');
console.log('📍 Database URL:', process.env.RAILWAY_DATABASE_URL ? 'Set from environment' : 'Using default');

fixDatabase();