/*
  Warnings:

  - You are about to drop the column `isRead` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `accountLockedReason` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `affiliateId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `age` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `allowDirectMessages` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `apiKeys` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `communityRole` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `consentDate` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `consentToDataProcessing` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `consentToMarketing` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `countryOfResidence` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `currentLocation` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `customFields` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `darkMode` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `dataExportRequestedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `deletionRequestedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `deletionScheduledFor` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `deviceIds` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationExpires` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `eventsAttended` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `googleCalendarConnected` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `googleCalendarRefreshToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `instagramHandle` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `integrations` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `interests` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `internalNotes` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isHostCertified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `languages` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginLocation` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastMfaAuthAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastPasswordChangeAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastSeenAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lifetimeValue` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `linkedinHandle` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lockoutUntil` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `loginAttempts` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `membershipId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mfaBackupCodes` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mfaEnabled` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mfaRecoveryEmail` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mfaSecret` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `nationality` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `notificationPreferences` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `originallyFrom` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHistory` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetExpires` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `personalityType` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `preferredLanguage` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `profession` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `profilePicture` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `profileVisibility` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `pushToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `referralCode` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `referralSource` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `requirePasswordChange` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `searchableByEmail` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `searchableByPhone` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `securityQuestions` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `servicesOffered` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `sessionTokens` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `shortBio` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `suspendedUntil` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `suspensionReason` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `travelHistory` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `trustedDevices` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `utmCampaign` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `utmMedium` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `utmSource` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `webhookUrl` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `follows` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'DEACTIVATED', 'BANNED', 'PENDING');

-- CreateEnum
CREATE TYPE "public"."VouchType" AS ENUM ('PRIMARY', 'SECONDARY', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "public"."VouchStatus" AS ENUM ('PENDING', 'APPROVED', 'ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "public"."EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."EventHostType" AS ENUM ('PERSONAL', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "public"."EventTicketStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CANCELED', 'REFUNDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."ServiceType" AS ENUM ('GUIDING', 'HOMESTAY', 'TUTORING', 'CONSULTATION', 'TRANSPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PricingType" AS ENUM ('PER_HOUR', 'PER_DAY', 'PER_PERSON', 'PER_NIGHT', 'FIXED');

-- CreateEnum
CREATE TYPE "public"."ServiceStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."ListingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SOLD', 'EXPIRED', 'REMOVED');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('CART', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELED', 'REFUNDED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "public"."DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'RELEASED', 'HELD', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."ReferralRewardStatus" AS ENUM ('PENDING', 'APPROVED', 'AWARDED', 'CLAIMED', 'EXPIRED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."ConnectionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED', 'REMOVED');

-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('EVENT_TICKET', 'MARKETPLACE_ORDER', 'SERVICE_BOOKING', 'SUBSCRIPTION', 'DONATION', 'REFUND');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'EXPIRED', 'PAUSED', 'INCOMPLETE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."NotificationType" ADD VALUE 'VOUCH';
ALTER TYPE "public"."NotificationType" ADD VALUE 'SERVICE';
ALTER TYPE "public"."NotificationType" ADD VALUE 'MARKETPLACE';
ALTER TYPE "public"."NotificationType" ADD VALUE 'PAYMENT';

-- DropForeignKey
ALTER TABLE "public"."communities" DROP CONSTRAINT "communities_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."community_members" DROP CONSTRAINT "community_members_communityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."community_members" DROP CONSTRAINT "community_members_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."event_attendances" DROP CONSTRAINT "event_attendances_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."event_attendances" DROP CONSTRAINT "event_attendances_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."event_rsvps" DROP CONSTRAINT "event_rsvps_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."event_rsvps" DROP CONSTRAINT "event_rsvps_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."events" DROP CONSTRAINT "events_hostId_fkey";

-- DropForeignKey
ALTER TABLE "public"."follows" DROP CONSTRAINT "follows_followerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."follows" DROP CONSTRAINT "follows_followingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."matches" DROP CONSTRAINT "matches_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."matches" DROP CONSTRAINT "matches_senderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_senderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."point_histories" DROP CONSTRAINT "point_histories_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."redemptions" DROP CONSTRAINT "redemptions_rewardId_fkey";

-- DropForeignKey
ALTER TABLE "public"."redemptions" DROP CONSTRAINT "redemptions_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_badges" DROP CONSTRAINT "user_badges_badgeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_badges" DROP CONSTRAINT "user_badges_userId_fkey";

-- DropIndex
DROP INDEX "public"."notifications_isRead_idx";

-- DropIndex
DROP INDEX "public"."notifications_userId_isRead_idx";

-- DropIndex
DROP INDEX "public"."users_city_idx";

-- DropIndex
DROP INDEX "public"."users_isHostCertified_idx";

-- DropIndex
DROP INDEX "public"."users_membershipId_key";

-- DropIndex
DROP INDEX "public"."users_mfaEnabled_idx";

-- DropIndex
DROP INDEX "public"."users_referralCode_key";

-- AlterTable
ALTER TABLE "public"."events" ADD COLUMN     "communityId" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'MYR',
ADD COLUMN     "hostType" "public"."EventHostType" NOT NULL DEFAULT 'PERSONAL',
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isFree" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "organizerPayout" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "platformFee" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "status" "public"."EventStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "ticketsSold" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalRevenue" DOUBLE PRECISION DEFAULT 0.0;

-- AlterTable
ALTER TABLE "public"."notifications" DROP COLUMN "isRead",
ADD COLUMN     "channels" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'normal',
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "relatedEntityId" TEXT,
ADD COLUMN     "relatedEntityType" TEXT,
ADD COLUMN     "scheduledFor" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "accountLockedReason",
DROP COLUMN "affiliateId",
DROP COLUMN "age",
DROP COLUMN "allowDirectMessages",
DROP COLUMN "apiKeys",
DROP COLUMN "bio",
DROP COLUMN "city",
DROP COLUMN "communityRole",
DROP COLUMN "consentDate",
DROP COLUMN "consentToDataProcessing",
DROP COLUMN "consentToMarketing",
DROP COLUMN "countryOfResidence",
DROP COLUMN "currency",
DROP COLUMN "currentLocation",
DROP COLUMN "customFields",
DROP COLUMN "darkMode",
DROP COLUMN "dataExportRequestedAt",
DROP COLUMN "dateOfBirth",
DROP COLUMN "deletionRequestedAt",
DROP COLUMN "deletionScheduledFor",
DROP COLUMN "deviceIds",
DROP COLUMN "emailVerificationExpires",
DROP COLUMN "emailVerificationToken",
DROP COLUMN "eventsAttended",
DROP COLUMN "gender",
DROP COLUMN "googleCalendarConnected",
DROP COLUMN "googleCalendarRefreshToken",
DROP COLUMN "instagramHandle",
DROP COLUMN "integrations",
DROP COLUMN "interests",
DROP COLUMN "internalNotes",
DROP COLUMN "ipAddress",
DROP COLUMN "isHostCertified",
DROP COLUMN "languages",
DROP COLUMN "lastLoginLocation",
DROP COLUMN "lastMfaAuthAt",
DROP COLUMN "lastPasswordChangeAt",
DROP COLUMN "lastSeenAt",
DROP COLUMN "lifetimeValue",
DROP COLUMN "linkedinHandle",
DROP COLUMN "lockoutUntil",
DROP COLUMN "loginAttempts",
DROP COLUMN "membershipId",
DROP COLUMN "mfaBackupCodes",
DROP COLUMN "mfaEnabled",
DROP COLUMN "mfaRecoveryEmail",
DROP COLUMN "mfaSecret",
DROP COLUMN "nationality",
DROP COLUMN "notes",
DROP COLUMN "notificationPreferences",
DROP COLUMN "originallyFrom",
DROP COLUMN "passwordHistory",
DROP COLUMN "passwordResetExpires",
DROP COLUMN "passwordResetToken",
DROP COLUMN "personalityType",
DROP COLUMN "preferredLanguage",
DROP COLUMN "profession",
DROP COLUMN "profilePicture",
DROP COLUMN "profileVisibility",
DROP COLUMN "pushToken",
DROP COLUMN "referralCode",
DROP COLUMN "referralSource",
DROP COLUMN "requirePasswordChange",
DROP COLUMN "searchableByEmail",
DROP COLUMN "searchableByPhone",
DROP COLUMN "securityQuestions",
DROP COLUMN "servicesOffered",
DROP COLUMN "sessionTokens",
DROP COLUMN "shortBio",
DROP COLUMN "suspendedUntil",
DROP COLUMN "suspensionReason",
DROP COLUMN "tags",
DROP COLUMN "timezone",
DROP COLUMN "travelHistory",
DROP COLUMN "trustedDevices",
DROP COLUMN "userAgent",
DROP COLUMN "utmCampaign",
DROP COLUMN "utmMedium",
DROP COLUMN "utmSource",
DROP COLUMN "webhookUrl",
DROP COLUMN "website",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "trustLevel" TEXT NOT NULL DEFAULT 'starter',
ADD COLUMN     "trustScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."follows";

-- CreateTable
CREATE TABLE "public"."user_profiles" (
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "profilePicture" TEXT,
    "bio" TEXT,
    "shortBio" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "age" INTEGER,
    "profession" TEXT,
    "occupation" TEXT,
    "website" TEXT,
    "personalityType" TEXT,
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "instagramHandle" TEXT,
    "linkedinHandle" TEXT,
    "travelStyle" TEXT,
    "bucketList" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "travelBio" TEXT,
    "customFields" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."user_locations" (
    "userId" TEXT NOT NULL,
    "currentCity" TEXT,
    "countryOfResidence" TEXT,
    "currentLocation" TEXT,
    "nationality" TEXT,
    "originallyFrom" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kuala_Lumpur',
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "currency" TEXT NOT NULL DEFAULT 'MYR',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_locations_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."user_security" (
    "userId" TEXT NOT NULL,
    "emailVerifiedAt" TIMESTAMP(3),
    "phoneVerifiedAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginLocation" TEXT,
    "lastPasswordChangeAt" TIMESTAMP(3),
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "mfaRecoveryEmail" TEXT,
    "lastMfaAuthAt" TIMESTAMP(3),
    "mfaBackupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "accountLockedReason" TEXT,
    "lockoutUntil" TIMESTAMP(3),
    "suspendedUntil" TIMESTAMP(3),
    "suspensionReason" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_security_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."user_privacy" (
    "userId" TEXT NOT NULL,
    "profileVisibility" TEXT NOT NULL DEFAULT 'public',
    "searchableByPhone" BOOLEAN NOT NULL DEFAULT true,
    "searchableByEmail" BOOLEAN NOT NULL DEFAULT true,
    "allowDirectMessages" BOOLEAN NOT NULL DEFAULT true,
    "consentToDataProcessing" BOOLEAN NOT NULL DEFAULT true,
    "consentToMarketing" BOOLEAN NOT NULL DEFAULT false,
    "consentDate" TIMESTAMP(3),
    "deletionRequestedAt" TIMESTAMP(3),
    "deletionScheduledFor" TIMESTAMP(3),
    "dataExportRequestedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_privacy_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."user_preferences" (
    "userId" TEXT NOT NULL,
    "darkMode" BOOLEAN NOT NULL DEFAULT false,
    "googleCalendarConnected" BOOLEAN NOT NULL DEFAULT false,
    "googleCalendarRefreshToken" TEXT,
    "pushToken" TEXT,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."user_metadata" (
    "userId" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "membershipId" TEXT,
    "referralSource" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "affiliateId" TEXT,
    "lifetimeValue" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "internalNotes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_metadata_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."profile_completion_status" (
    "userId" TEXT NOT NULL,
    "completionScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "completionLevel" TEXT NOT NULL DEFAULT 'starter',
    "hasProfilePicture" BOOLEAN NOT NULL DEFAULT false,
    "hasDisplayName" BOOLEAN NOT NULL DEFAULT false,
    "hasBio" BOOLEAN NOT NULL DEFAULT false,
    "hasLocation" BOOLEAN NOT NULL DEFAULT false,
    "hasInterests" BOOLEAN NOT NULL DEFAULT false,
    "hasLanguages" BOOLEAN NOT NULL DEFAULT false,
    "hasProfession" BOOLEAN NOT NULL DEFAULT false,
    "hasDateOfBirth" BOOLEAN NOT NULL DEFAULT false,
    "hasSocialHandles" BOOLEAN NOT NULL DEFAULT false,
    "hasVerifiedEmail" BOOLEAN NOT NULL DEFAULT false,
    "hasVerifiedPhone" BOOLEAN NOT NULL DEFAULT false,
    "fieldWeights" JSONB NOT NULL DEFAULT '{}',
    "missingFields" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "nextRecommendation" TEXT,
    "reachedBasic" BOOLEAN NOT NULL DEFAULT false,
    "reachedIntermediate" BOOLEAN NOT NULL DEFAULT false,
    "reachedComplete" BOOLEAN NOT NULL DEFAULT false,
    "reachedExpert" BOOLEAN NOT NULL DEFAULT false,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "badgesUnlocked" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstCompleteAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_completion_status_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."user_service_profiles" (
    "userId" TEXT NOT NULL,
    "isHostAvailable" BOOLEAN NOT NULL DEFAULT false,
    "isGuideAvailable" BOOLEAN NOT NULL DEFAULT false,
    "isHostCertified" BOOLEAN NOT NULL DEFAULT false,
    "hostDescription" TEXT,
    "guideDescription" TEXT,
    "servicesOffered" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_service_profiles_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."auth_identities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerUid" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "deviceInfo" JSONB,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "locationData" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."login_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "identifier" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL,
    "failureReason" TEXT,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."device_registrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceFingerprint" TEXT NOT NULL,
    "deviceName" TEXT,
    "deviceInfo" JSONB NOT NULL,
    "isTrusted" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "ipAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_verification_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."security_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_preferences" (
    "userId" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "quietHours" JSONB,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kuala_Lumpur',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."user_payment_methods" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "gatewayMethodId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lastFour" TEXT,
    "brand" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_stats" (
    "userId" TEXT NOT NULL,
    "eventsAttended" INTEGER NOT NULL DEFAULT 0,
    "eventsHosted" INTEGER NOT NULL DEFAULT 0,
    "vouchesGiven" INTEGER NOT NULL DEFAULT 0,
    "vouchesReceived" INTEGER NOT NULL DEFAULT 0,
    "listingsPosted" INTEGER NOT NULL DEFAULT 0,
    "servicesProvided" INTEGER NOT NULL DEFAULT 0,
    "communitiesJoined" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_stats_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."vouches" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "voucheeId" TEXT NOT NULL,
    "vouchType" "public"."VouchType" NOT NULL DEFAULT 'PRIMARY',
    "weightPercentage" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "message" TEXT,
    "status" "public"."VouchStatus" NOT NULL DEFAULT 'PENDING',
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "isCommunityVouch" BOOLEAN NOT NULL DEFAULT false,
    "communityId" TEXT,
    "vouchedByAdminId" TEXT,
    "isAutoVouched" BOOLEAN NOT NULL DEFAULT false,
    "autoVouchCriteria" JSONB,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "revokeReason" TEXT,
    "trustImpact" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vouches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vouch_configs" (
    "id" TEXT NOT NULL,
    "maxPrimaryVouches" INTEGER NOT NULL DEFAULT 1,
    "maxSecondaryVouches" INTEGER NOT NULL DEFAULT 3,
    "maxCommunityVouches" INTEGER NOT NULL DEFAULT 2,
    "primaryVouchWeight" DOUBLE PRECISION NOT NULL DEFAULT 30.0,
    "secondaryVouchWeight" DOUBLE PRECISION NOT NULL DEFAULT 30.0,
    "communityVouchWeight" DOUBLE PRECISION NOT NULL DEFAULT 40.0,
    "trustMomentsWeight" DOUBLE PRECISION NOT NULL DEFAULT 30.0,
    "activityWeight" DOUBLE PRECISION NOT NULL DEFAULT 30.0,
    "cooldownDays" INTEGER NOT NULL DEFAULT 30,
    "minTrustRequired" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "autoVouchMinEvents" INTEGER NOT NULL DEFAULT 5,
    "autoVouchMinMemberDays" INTEGER NOT NULL DEFAULT 90,
    "autoVouchRequireZeroNegativity" BOOLEAN NOT NULL DEFAULT true,
    "reconnectionCooldownDays" INTEGER NOT NULL DEFAULT 30,
    "perTier" JSONB,
    "effectiveFrom" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vouch_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_ticket_tiers" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "tierName" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MYR',
    "totalQuantity" INTEGER,
    "soldQuantity" INTEGER NOT NULL DEFAULT 0,
    "minPurchase" INTEGER NOT NULL DEFAULT 1,
    "maxPurchase" INTEGER NOT NULL DEFAULT 10,
    "availableFrom" TIMESTAMP(3),
    "availableUntil" TIMESTAMP(3),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_ticket_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_tickets" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ticketTierId" TEXT,
    "ticketType" TEXT NOT NULL DEFAULT 'GENERAL',
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MYR',
    "status" "public"."EventTicketStatus" NOT NULL DEFAULT 'PENDING',
    "paymentTransactionId" TEXT,
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "ticketNumber" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedInAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "attendeeName" TEXT,
    "attendeeEmail" TEXT,
    "attendeePhone" TEXT,

    CONSTRAINT "event_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."services" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "serviceType" "public"."ServiceType" NOT NULL,
    "category" TEXT,
    "pricingType" "public"."PricingType" NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MYR',
    "maxGuests" INTEGER,
    "location" TEXT,
    "availability" JSONB,
    "requirements" JSONB,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "public"."ServiceStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."service_bookings" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "bookingType" "public"."ServiceType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "guestsCount" INTEGER NOT NULL DEFAULT 1,
    "baseAmount" DOUBLE PRECISION NOT NULL,
    "additionalFees" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MYR',
    "paymentTransactionId" TEXT,
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "platformFee" DOUBLE PRECISION,
    "providerPayout" DOUBLE PRECISION,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'PENDING',
    "specialRequests" TEXT,
    "bookingDetails" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),

    CONSTRAINT "service_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."marketplace_listings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MYR',
    "quantity" INTEGER,
    "location" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "public"."ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."listing_price_history" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MYR',
    "reason" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_price_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."marketplace_orders" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "shippingFee" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MYR',
    "paymentTransactionId" TEXT,
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "platformFee" DOUBLE PRECISION,
    "sellerPayout" DOUBLE PRECISION,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "shippingAddress" JSONB,
    "trackingNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),

    CONSTRAINT "marketplace_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."marketplace_cart_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketplace_cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."marketplace_disputes" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "initiatedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "public"."DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "marketplace_disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."marketplace_reviews" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketplace_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_providers" (
    "id" TEXT NOT NULL,
    "providerCode" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "providerType" TEXT NOT NULL,
    "supportedCountries" TEXT[],
    "supportedCurrencies" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "priorityOrder" INTEGER NOT NULL DEFAULT 0,
    "configuration" JSONB NOT NULL DEFAULT '{}',
    "feeStructure" JSONB NOT NULL DEFAULT '{}',
    "capabilities" JSONB NOT NULL DEFAULT '{}',
    "webhookConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_provider_routing" (
    "id" TEXT NOT NULL,
    "ruleName" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_provider_routing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."platform_fee_configs" (
    "id" TEXT NOT NULL,
    "configName" TEXT NOT NULL,
    "transactionType" "public"."TransactionType" NOT NULL,
    "feePercentage" DOUBLE PRECISION,
    "feeFixed" DOUBLE PRECISION,
    "minFee" DOUBLE PRECISION,
    "maxFee" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'MYR',
    "conditions" JSONB NOT NULL DEFAULT '{}',
    "recipientType" TEXT NOT NULL DEFAULT 'platform',
    "recipientId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveUntil" TIMESTAMP(3),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_fee_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transaction_fees" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "feeConfigId" TEXT,
    "feeType" TEXT NOT NULL,
    "feePercentage" DOUBLE PRECISION,
    "feeFixed" DOUBLE PRECISION,
    "calculatedFee" DOUBLE PRECISION NOT NULL,
    "recipientType" TEXT NOT NULL,
    "recipientId" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'MYR',
    "description" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transactionType" "public"."TransactionType" NOT NULL,
    "referenceType" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MYR',
    "totalFees" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "gatewayFee" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "netAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "providerId" TEXT NOT NULL,
    "gatewayTransactionId" TEXT NOT NULL,
    "gatewayPaymentMethodId" TEXT,
    "gatewayMetadata" JSONB,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "failureReason" TEXT,
    "processedAt" TIMESTAMP(3),
    "refundedAmount" DOUBLE PRECISION DEFAULT 0.0,
    "refundedAt" TIMESTAMP(3),
    "refundReason" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payout_distributions" (
    "id" TEXT NOT NULL,
    "paymentTransactionId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "recipientType" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MYR',
    "status" "public"."PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "releaseDate" TIMESTAMP(3),
    "gatewayPayoutId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedAt" TIMESTAMP(3),

    CONSTRAINT "payout_distributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscription_tiers" (
    "id" TEXT NOT NULL,
    "tierCode" TEXT NOT NULL,
    "tierName" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "currency" TEXT NOT NULL DEFAULT 'MYR',
    "billingCycle" TEXT NOT NULL DEFAULT 'MONTHLY',
    "features" JSONB NOT NULL DEFAULT '{}',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "trialDays" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "paymentProviderId" TEXT,
    "gatewaySubscriptionId" TEXT,
    "usageData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscription_payments" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MYR',
    "billingPeriodStart" TIMESTAMP(3) NOT NULL,
    "billingPeriodEnd" TIMESTAMP(3) NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 1,
    "paymentTransactionId" TEXT,
    "gatewayInvoiceId" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."feature_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "featureCode" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "feature_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."referrals" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "refereeId" TEXT,
    "referralCode" TEXT NOT NULL,
    "referralMethod" TEXT,
    "referralSource" TEXT,
    "campaignId" TEXT,
    "clickedAt" TIMESTAMP(3),
    "signedUpAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "isActivated" BOOLEAN NOT NULL DEFAULT false,
    "activationCriteria" JSONB,
    "referrerRewardGiven" BOOLEAN NOT NULL DEFAULT false,
    "refereeRewardGiven" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceInfo" JSONB,
    "metadata" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."referral_campaigns" (
    "id" TEXT NOT NULL,
    "campaignCode" TEXT NOT NULL,
    "campaignName" TEXT NOT NULL,
    "description" TEXT,
    "referrerRewardType" TEXT NOT NULL DEFAULT 'points',
    "referrerRewardAmount" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "refereeRewardType" TEXT NOT NULL DEFAULT 'points',
    "refereeRewardAmount" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "bonusRewards" JSONB,
    "activationCriteria" JSONB NOT NULL DEFAULT '{}',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "maxReferrals" INTEGER,
    "maxPerUser" INTEGER,
    "targetCountries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetUserSegment" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPaused" BOOLEAN NOT NULL DEFAULT false,
    "totalReferrals" INTEGER NOT NULL DEFAULT 0,
    "totalSignups" INTEGER NOT NULL DEFAULT 0,
    "totalActivated" INTEGER NOT NULL DEFAULT 0,
    "totalRewardsGiven" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."referral_rewards" (
    "id" TEXT NOT NULL,
    "referralId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rewardType" TEXT NOT NULL,
    "rewardAmount" DOUBLE PRECISION,
    "rewardDuration" INTEGER,
    "description" TEXT NOT NULL,
    "status" "public"."ReferralRewardStatus" NOT NULL DEFAULT 'PENDING',
    "isMilestoneReward" BOOLEAN NOT NULL DEFAULT false,
    "milestoneCount" INTEGER,
    "awardedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."referral_stats" (
    "userId" TEXT NOT NULL,
    "totalReferrals" INTEGER NOT NULL DEFAULT 0,
    "totalClicks" INTEGER NOT NULL DEFAULT 0,
    "totalSignups" INTEGER NOT NULL DEFAULT 0,
    "totalActivated" INTEGER NOT NULL DEFAULT 0,
    "clickToSignupRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "signupToActiveRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "overallConversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalPointsEarned" INTEGER NOT NULL DEFAULT 0,
    "totalCreditsEarned" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalRewardsCount" INTEGER NOT NULL DEFAULT 0,
    "milestonesReached" JSONB NOT NULL DEFAULT '[]',
    "bestConversionMonth" TEXT,
    "bestConversionCount" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "leaderboardRank" INTEGER,
    "topReferrerBadge" BOOLEAN NOT NULL DEFAULT false,
    "lastReferralAt" TIMESTAMP(3),
    "lastActivationAt" TIMESTAMP(3),
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_stats_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."user_connections" (
    "id" TEXT NOT NULL,
    "initiatorId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "public"."ConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "relationshipType" TEXT,
    "relationshipCategory" TEXT,
    "howWeMet" TEXT,
    "trustStrength" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "interactionCount" INTEGER NOT NULL DEFAULT 0,
    "lastInteraction" TIMESTAMP(3),
    "badges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mutualFriendsCount" INTEGER NOT NULL DEFAULT 0,
    "mutualCommunitiesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "connectedAt" TIMESTAMP(3),
    "removedAt" TIMESTAMP(3),
    "removedBy" TEXT,
    "canReconnectAt" TIMESTAMP(3),

    CONSTRAINT "user_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."connection_reviews" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "reviewType" TEXT NOT NULL DEFAULT 'general',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationSource" TEXT,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connection_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."connection_stats" (
    "userId" TEXT NOT NULL,
    "totalConnections" INTEGER NOT NULL DEFAULT 0,
    "pendingRequests" INTEGER NOT NULL DEFAULT 0,
    "sentRequests" INTEGER NOT NULL DEFAULT 0,
    "professionalConnections" INTEGER NOT NULL DEFAULT 0,
    "friendConnections" INTEGER NOT NULL DEFAULT 0,
    "familyConnections" INTEGER NOT NULL DEFAULT 0,
    "mentorConnections" INTEGER NOT NULL DEFAULT 0,
    "travelConnections" INTEGER NOT NULL DEFAULT 0,
    "communityConnections" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION,
    "highestRating" DOUBLE PRECISION,
    "totalReviewsReceived" INTEGER NOT NULL DEFAULT 0,
    "totalReviewsGiven" INTEGER NOT NULL DEFAULT 0,
    "totalMutualFriends" INTEGER NOT NULL DEFAULT 0,
    "trustChainDepth" INTEGER NOT NULL DEFAULT 1,
    "connectionQuality" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connection_stats_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."user_blocks" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "reason" TEXT,
    "blockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."travel_trips" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "purpose" TEXT,
    "countries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "duration" INTEGER,
    "coverImage" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."travel_companions" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companionId" TEXT,
    "companionName" TEXT,
    "companionEmail" TEXT,
    "companionPhone" TEXT,
    "invitationStatus" TEXT NOT NULL DEFAULT 'pending',
    "canRequestIntro" BOOLEAN NOT NULL DEFAULT true,
    "relationship" TEXT,
    "notes" TEXT,
    "hasVouched" BOOLEAN NOT NULL DEFAULT false,
    "vouchId" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "travel_companions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."travel_locations" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "placeName" TEXT,
    "placeType" TEXT,
    "visitDate" TIMESTAMP(3),
    "duration" INTEGER,
    "rating" INTEGER,
    "notes" TEXT,
    "wouldRecommend" BOOLEAN NOT NULL DEFAULT true,
    "tips" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "travel_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."travel_highlights" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "highlightType" TEXT NOT NULL,
    "image" TEXT,
    "date" TIMESTAMP(3),
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "travel_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."travel_stats" (
    "userId" TEXT NOT NULL,
    "totalTrips" INTEGER NOT NULL DEFAULT 0,
    "countriesVisited" INTEGER NOT NULL DEFAULT 0,
    "citiesVisited" INTEGER NOT NULL DEFAULT 0,
    "continentsVisited" INTEGER NOT NULL DEFAULT 0,
    "totalTravelDays" INTEGER NOT NULL DEFAULT 0,
    "countriesList" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "continentsList" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "travelCompanionsCount" INTEGER NOT NULL DEFAULT 0,
    "soloTripsCount" INTEGER NOT NULL DEFAULT 0,
    "firstTripDate" TIMESTAMP(3),
    "lastTripDate" TIMESTAMP(3),
    "favoriteDestination" TEXT,
    "travelFrequency" TEXT,
    "averageTripDuration" INTEGER,
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_stats_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."travel_bucket_list" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT,
    "destination" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "targetYear" INTEGER,
    "estimatedBudget" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'planning',
    "visitedDate" TIMESTAMP(3),
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "seekingCompanions" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_bucket_list_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_profiles_displayName_idx" ON "public"."user_profiles"("displayName");

-- CreateIndex
CREATE INDEX "user_locations_currentCity_idx" ON "public"."user_locations"("currentCity");

-- CreateIndex
CREATE INDEX "user_locations_countryOfResidence_idx" ON "public"."user_locations"("countryOfResidence");

-- CreateIndex
CREATE INDEX "user_locations_timezone_idx" ON "public"."user_locations"("timezone");

-- CreateIndex
CREATE INDEX "user_security_mfaEnabled_idx" ON "public"."user_security"("mfaEnabled");

-- CreateIndex
CREATE INDEX "user_security_emailVerifiedAt_idx" ON "public"."user_security"("emailVerifiedAt");

-- CreateIndex
CREATE INDEX "user_security_phoneVerifiedAt_idx" ON "public"."user_security"("phoneVerifiedAt");

-- CreateIndex
CREATE INDEX "user_security_lastLoginAt_idx" ON "public"."user_security"("lastLoginAt");

-- CreateIndex
CREATE INDEX "user_privacy_profileVisibility_idx" ON "public"."user_privacy"("profileVisibility");

-- CreateIndex
CREATE INDEX "user_privacy_deletionRequestedAt_idx" ON "public"."user_privacy"("deletionRequestedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_metadata_referralCode_key" ON "public"."user_metadata"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "user_metadata_membershipId_key" ON "public"."user_metadata"("membershipId");

-- CreateIndex
CREATE INDEX "user_metadata_referralSource_idx" ON "public"."user_metadata"("referralSource");

-- CreateIndex
CREATE INDEX "user_metadata_affiliateId_idx" ON "public"."user_metadata"("affiliateId");

-- CreateIndex
CREATE INDEX "profile_completion_status_completionScore_idx" ON "public"."profile_completion_status"("completionScore");

-- CreateIndex
CREATE INDEX "profile_completion_status_completionLevel_idx" ON "public"."profile_completion_status"("completionLevel");

-- CreateIndex
CREATE INDEX "profile_completion_status_lastCalculatedAt_idx" ON "public"."profile_completion_status"("lastCalculatedAt");

-- CreateIndex
CREATE INDEX "user_service_profiles_isHostAvailable_idx" ON "public"."user_service_profiles"("isHostAvailable");

-- CreateIndex
CREATE INDEX "user_service_profiles_isGuideAvailable_idx" ON "public"."user_service_profiles"("isGuideAvailable");

-- CreateIndex
CREATE INDEX "user_service_profiles_isHostCertified_idx" ON "public"."user_service_profiles"("isHostCertified");

-- CreateIndex
CREATE INDEX "auth_identities_userId_idx" ON "public"."auth_identities"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "auth_identities_provider_providerUid_key" ON "public"."auth_identities"("provider", "providerUid");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_sessionToken_key" ON "public"."user_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "user_sessions_userId_isActive_idx" ON "public"."user_sessions"("userId", "isActive");

-- CreateIndex
CREATE INDEX "user_sessions_sessionToken_idx" ON "public"."user_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "user_sessions_expiresAt_idx" ON "public"."user_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "login_attempts_identifier_attemptedAt_idx" ON "public"."login_attempts"("identifier", "attemptedAt");

-- CreateIndex
CREATE INDEX "login_attempts_ipAddress_attemptedAt_idx" ON "public"."login_attempts"("ipAddress", "attemptedAt");

-- CreateIndex
CREATE INDEX "login_attempts_userId_attemptedAt_idx" ON "public"."login_attempts"("userId", "attemptedAt");

-- CreateIndex
CREATE INDEX "device_registrations_userId_idx" ON "public"."device_registrations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "device_registrations_userId_deviceFingerprint_key" ON "public"."device_registrations"("userId", "deviceFingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "public"."password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "public"."password_reset_tokens"("userId");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "public"."password_reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_token_key" ON "public"."email_verification_tokens"("token");

-- CreateIndex
CREATE INDEX "email_verification_tokens_userId_idx" ON "public"."email_verification_tokens"("userId");

-- CreateIndex
CREATE INDEX "email_verification_tokens_token_idx" ON "public"."email_verification_tokens"("token");

-- CreateIndex
CREATE INDEX "security_events_userId_createdAt_idx" ON "public"."security_events"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "security_events_eventType_idx" ON "public"."security_events"("eventType");

-- CreateIndex
CREATE INDEX "security_events_severity_idx" ON "public"."security_events"("severity");

-- CreateIndex
CREATE INDEX "user_payment_methods_userId_idx" ON "public"."user_payment_methods"("userId");

-- CreateIndex
CREATE INDEX "user_payment_methods_userId_isDefault_idx" ON "public"."user_payment_methods"("userId", "isDefault");

-- CreateIndex
CREATE INDEX "user_activities_userId_createdAt_idx" ON "public"."user_activities"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "user_activities_activityType_idx" ON "public"."user_activities"("activityType");

-- CreateIndex
CREATE INDEX "user_stats_eventsAttended_idx" ON "public"."user_stats"("eventsAttended");

-- CreateIndex
CREATE INDEX "user_stats_totalPoints_idx" ON "public"."user_stats"("totalPoints");

-- CreateIndex
CREATE INDEX "vouches_voucheeId_status_idx" ON "public"."vouches"("voucheeId", "status");

-- CreateIndex
CREATE INDEX "vouches_voucherId_status_idx" ON "public"."vouches"("voucherId", "status");

-- CreateIndex
CREATE INDEX "vouches_communityId_status_idx" ON "public"."vouches"("communityId", "status");

-- CreateIndex
CREATE INDEX "vouches_isCommunityVouch_idx" ON "public"."vouches"("isCommunityVouch");

-- CreateIndex
CREATE INDEX "vouches_createdAt_idx" ON "public"."vouches"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "vouches_voucherId_voucheeId_vouchType_key" ON "public"."vouches"("voucherId", "voucheeId", "vouchType");

-- CreateIndex
CREATE INDEX "vouch_configs_effectiveFrom_idx" ON "public"."vouch_configs"("effectiveFrom");

-- CreateIndex
CREATE INDEX "event_ticket_tiers_eventId_isActive_idx" ON "public"."event_ticket_tiers"("eventId", "isActive");

-- CreateIndex
CREATE INDEX "event_ticket_tiers_availableFrom_availableUntil_idx" ON "public"."event_ticket_tiers"("availableFrom", "availableUntil");

-- CreateIndex
CREATE UNIQUE INDEX "event_tickets_ticketNumber_key" ON "public"."event_tickets"("ticketNumber");

-- CreateIndex
CREATE INDEX "event_tickets_eventId_idx" ON "public"."event_tickets"("eventId");

-- CreateIndex
CREATE INDEX "event_tickets_userId_idx" ON "public"."event_tickets"("userId");

-- CreateIndex
CREATE INDEX "event_tickets_ticketTierId_idx" ON "public"."event_tickets"("ticketTierId");

-- CreateIndex
CREATE INDEX "event_tickets_status_idx" ON "public"."event_tickets"("status");

-- CreateIndex
CREATE INDEX "event_tickets_paymentTransactionId_idx" ON "public"."event_tickets"("paymentTransactionId");

-- CreateIndex
CREATE INDEX "event_tickets_ticketNumber_idx" ON "public"."event_tickets"("ticketNumber");

-- CreateIndex
CREATE INDEX "event_tickets_purchasedAt_idx" ON "public"."event_tickets"("purchasedAt");

-- CreateIndex
CREATE INDEX "event_tickets_userId_status_idx" ON "public"."event_tickets"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "event_tickets_eventId_ticketNumber_key" ON "public"."event_tickets"("eventId", "ticketNumber");

-- CreateIndex
CREATE INDEX "services_providerId_status_idx" ON "public"."services"("providerId", "status");

-- CreateIndex
CREATE INDEX "services_serviceType_status_idx" ON "public"."services"("serviceType", "status");

-- CreateIndex
CREATE INDEX "services_status_idx" ON "public"."services"("status");

-- CreateIndex
CREATE INDEX "service_bookings_serviceId_idx" ON "public"."service_bookings"("serviceId");

-- CreateIndex
CREATE INDEX "service_bookings_customerId_status_idx" ON "public"."service_bookings"("customerId", "status");

-- CreateIndex
CREATE INDEX "service_bookings_providerId_status_idx" ON "public"."service_bookings"("providerId", "status");

-- CreateIndex
CREATE INDEX "service_bookings_status_idx" ON "public"."service_bookings"("status");

-- CreateIndex
CREATE INDEX "service_bookings_paymentTransactionId_idx" ON "public"."service_bookings"("paymentTransactionId");

-- CreateIndex
CREATE INDEX "service_bookings_paymentStatus_idx" ON "public"."service_bookings"("paymentStatus");

-- CreateIndex
CREATE INDEX "service_bookings_startDate_endDate_idx" ON "public"."service_bookings"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "marketplace_listings_userId_status_idx" ON "public"."marketplace_listings"("userId", "status");

-- CreateIndex
CREATE INDEX "marketplace_listings_category_idx" ON "public"."marketplace_listings"("category");

-- CreateIndex
CREATE INDEX "marketplace_listings_status_idx" ON "public"."marketplace_listings"("status");

-- CreateIndex
CREATE INDEX "marketplace_listings_createdAt_idx" ON "public"."marketplace_listings"("createdAt");

-- CreateIndex
CREATE INDEX "listing_price_history_listingId_changedAt_idx" ON "public"."listing_price_history"("listingId", "changedAt");

-- CreateIndex
CREATE INDEX "marketplace_orders_listingId_idx" ON "public"."marketplace_orders"("listingId");

-- CreateIndex
CREATE INDEX "marketplace_orders_buyerId_status_idx" ON "public"."marketplace_orders"("buyerId", "status");

-- CreateIndex
CREATE INDEX "marketplace_orders_sellerId_status_idx" ON "public"."marketplace_orders"("sellerId", "status");

-- CreateIndex
CREATE INDEX "marketplace_orders_status_idx" ON "public"."marketplace_orders"("status");

-- CreateIndex
CREATE INDEX "marketplace_orders_paymentTransactionId_idx" ON "public"."marketplace_orders"("paymentTransactionId");

-- CreateIndex
CREATE INDEX "marketplace_orders_paymentStatus_idx" ON "public"."marketplace_orders"("paymentStatus");

-- CreateIndex
CREATE INDEX "marketplace_orders_createdAt_idx" ON "public"."marketplace_orders"("createdAt");

-- CreateIndex
CREATE INDEX "marketplace_cart_items_userId_idx" ON "public"."marketplace_cart_items"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_cart_items_userId_listingId_key" ON "public"."marketplace_cart_items"("userId", "listingId");

-- CreateIndex
CREATE INDEX "marketplace_disputes_orderId_idx" ON "public"."marketplace_disputes"("orderId");

-- CreateIndex
CREATE INDEX "marketplace_disputes_status_idx" ON "public"."marketplace_disputes"("status");

-- CreateIndex
CREATE INDEX "marketplace_reviews_revieweeId_rating_idx" ON "public"."marketplace_reviews"("revieweeId", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_reviews_orderId_reviewerId_key" ON "public"."marketplace_reviews"("orderId", "reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_providers_providerCode_key" ON "public"."payment_providers"("providerCode");

-- CreateIndex
CREATE INDEX "payment_providers_providerCode_idx" ON "public"."payment_providers"("providerCode");

-- CreateIndex
CREATE INDEX "payment_providers_isActive_priorityOrder_idx" ON "public"."payment_providers"("isActive", "priorityOrder");

-- CreateIndex
CREATE INDEX "payment_provider_routing_providerId_isActive_idx" ON "public"."payment_provider_routing"("providerId", "isActive");

-- CreateIndex
CREATE INDEX "payment_provider_routing_priority_isActive_idx" ON "public"."payment_provider_routing"("priority", "isActive");

-- CreateIndex
CREATE INDEX "platform_fee_configs_transactionType_isActive_idx" ON "public"."platform_fee_configs"("transactionType", "isActive");

-- CreateIndex
CREATE INDEX "platform_fee_configs_effectiveFrom_effectiveUntil_idx" ON "public"."platform_fee_configs"("effectiveFrom", "effectiveUntil");

-- CreateIndex
CREATE INDEX "platform_fee_configs_priority_isActive_idx" ON "public"."platform_fee_configs"("priority", "isActive");

-- CreateIndex
CREATE INDEX "transaction_fees_transactionId_feeType_idx" ON "public"."transaction_fees"("transactionId", "feeType");

-- CreateIndex
CREATE INDEX "transaction_fees_feeConfigId_idx" ON "public"."transaction_fees"("feeConfigId");

-- CreateIndex
CREATE INDEX "transaction_fees_recipientType_recipientId_idx" ON "public"."transaction_fees"("recipientType", "recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_gatewayTransactionId_key" ON "public"."payment_transactions"("gatewayTransactionId");

-- CreateIndex
CREATE INDEX "payment_transactions_userId_status_idx" ON "public"."payment_transactions"("userId", "status");

-- CreateIndex
CREATE INDEX "payment_transactions_providerId_status_idx" ON "public"."payment_transactions"("providerId", "status");

-- CreateIndex
CREATE INDEX "payment_transactions_transactionType_idx" ON "public"."payment_transactions"("transactionType");

-- CreateIndex
CREATE INDEX "payment_transactions_transactionType_status_idx" ON "public"."payment_transactions"("transactionType", "status");

-- CreateIndex
CREATE INDEX "payment_transactions_referenceType_referenceId_idx" ON "public"."payment_transactions"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "payment_transactions_gatewayTransactionId_idx" ON "public"."payment_transactions"("gatewayTransactionId");

-- CreateIndex
CREATE INDEX "payment_transactions_processedAt_status_idx" ON "public"."payment_transactions"("processedAt", "status");

-- CreateIndex
CREATE INDEX "payment_transactions_createdAt_idx" ON "public"."payment_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "payout_distributions_paymentTransactionId_idx" ON "public"."payout_distributions"("paymentTransactionId");

-- CreateIndex
CREATE INDEX "payout_distributions_recipientId_status_idx" ON "public"."payout_distributions"("recipientId", "status");

-- CreateIndex
CREATE INDEX "payout_distributions_releaseDate_status_idx" ON "public"."payout_distributions"("releaseDate", "status");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_tiers_tierCode_key" ON "public"."subscription_tiers"("tierCode");

-- CreateIndex
CREATE INDEX "subscription_tiers_tierCode_isActive_idx" ON "public"."subscription_tiers"("tierCode", "isActive");

-- CreateIndex
CREATE INDEX "subscription_tiers_isActive_isPublic_idx" ON "public"."subscription_tiers"("isActive", "isPublic");

-- CreateIndex
CREATE INDEX "subscription_tiers_displayOrder_idx" ON "public"."subscription_tiers"("displayOrder");

-- CreateIndex
CREATE INDEX "user_subscriptions_userId_status_idx" ON "public"."user_subscriptions"("userId", "status");

-- CreateIndex
CREATE INDEX "user_subscriptions_tierId_status_idx" ON "public"."user_subscriptions"("tierId", "status");

-- CreateIndex
CREATE INDEX "user_subscriptions_status_idx" ON "public"."user_subscriptions"("status");

-- CreateIndex
CREATE INDEX "user_subscriptions_currentPeriodEnd_idx" ON "public"."user_subscriptions"("currentPeriodEnd");

-- CreateIndex
CREATE INDEX "user_subscriptions_gatewaySubscriptionId_idx" ON "public"."user_subscriptions"("gatewaySubscriptionId");

-- CreateIndex
CREATE INDEX "subscription_payments_subscriptionId_status_idx" ON "public"."subscription_payments"("subscriptionId", "status");

-- CreateIndex
CREATE INDEX "subscription_payments_userId_status_idx" ON "public"."subscription_payments"("userId", "status");

-- CreateIndex
CREATE INDEX "subscription_payments_dueDate_idx" ON "public"."subscription_payments"("dueDate");

-- CreateIndex
CREATE INDEX "subscription_payments_status_idx" ON "public"."subscription_payments"("status");

-- CreateIndex
CREATE INDEX "subscription_payments_paymentTransactionId_idx" ON "public"."subscription_payments"("paymentTransactionId");

-- CreateIndex
CREATE INDEX "feature_usage_userId_featureCode_idx" ON "public"."feature_usage"("userId", "featureCode");

-- CreateIndex
CREATE INDEX "feature_usage_subscriptionId_featureCode_idx" ON "public"."feature_usage"("subscriptionId", "featureCode");

-- CreateIndex
CREATE INDEX "feature_usage_periodStart_periodEnd_idx" ON "public"."feature_usage"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "feature_usage_usedAt_idx" ON "public"."feature_usage"("usedAt");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_referralCode_key" ON "public"."referrals"("referralCode");

-- CreateIndex
CREATE INDEX "referrals_referrerId_isActivated_idx" ON "public"."referrals"("referrerId", "isActivated");

-- CreateIndex
CREATE INDEX "referrals_refereeId_idx" ON "public"."referrals"("refereeId");

-- CreateIndex
CREATE INDEX "referrals_referralCode_idx" ON "public"."referrals"("referralCode");

-- CreateIndex
CREATE INDEX "referrals_campaignId_idx" ON "public"."referrals"("campaignId");

-- CreateIndex
CREATE INDEX "referrals_isActivated_idx" ON "public"."referrals"("isActivated");

-- CreateIndex
CREATE INDEX "referrals_createdAt_idx" ON "public"."referrals"("createdAt");

-- CreateIndex
CREATE INDEX "referrals_signedUpAt_idx" ON "public"."referrals"("signedUpAt");

-- CreateIndex
CREATE INDEX "referrals_activatedAt_idx" ON "public"."referrals"("activatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "referral_campaigns_campaignCode_key" ON "public"."referral_campaigns"("campaignCode");

-- CreateIndex
CREATE INDEX "referral_campaigns_campaignCode_isActive_idx" ON "public"."referral_campaigns"("campaignCode", "isActive");

-- CreateIndex
CREATE INDEX "referral_campaigns_isActive_isPaused_idx" ON "public"."referral_campaigns"("isActive", "isPaused");

-- CreateIndex
CREATE INDEX "referral_campaigns_startDate_endDate_idx" ON "public"."referral_campaigns"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "referral_rewards_referralId_idx" ON "public"."referral_rewards"("referralId");

-- CreateIndex
CREATE INDEX "referral_rewards_userId_status_idx" ON "public"."referral_rewards"("userId", "status");

-- CreateIndex
CREATE INDEX "referral_rewards_status_idx" ON "public"."referral_rewards"("status");

-- CreateIndex
CREATE INDEX "referral_rewards_isMilestoneReward_idx" ON "public"."referral_rewards"("isMilestoneReward");

-- CreateIndex
CREATE INDEX "referral_rewards_awardedAt_idx" ON "public"."referral_rewards"("awardedAt");

-- CreateIndex
CREATE INDEX "referral_stats_totalActivated_idx" ON "public"."referral_stats"("totalActivated");

-- CreateIndex
CREATE INDEX "referral_stats_totalPointsEarned_idx" ON "public"."referral_stats"("totalPointsEarned");

-- CreateIndex
CREATE INDEX "referral_stats_leaderboardRank_idx" ON "public"."referral_stats"("leaderboardRank");

-- CreateIndex
CREATE INDEX "referral_stats_topReferrerBadge_idx" ON "public"."referral_stats"("topReferrerBadge");

-- CreateIndex
CREATE INDEX "user_connections_initiatorId_idx" ON "public"."user_connections"("initiatorId");

-- CreateIndex
CREATE INDEX "user_connections_receiverId_idx" ON "public"."user_connections"("receiverId");

-- CreateIndex
CREATE INDEX "user_connections_status_idx" ON "public"."user_connections"("status");

-- CreateIndex
CREATE INDEX "user_connections_initiatorId_status_idx" ON "public"."user_connections"("initiatorId", "status");

-- CreateIndex
CREATE INDEX "user_connections_receiverId_status_idx" ON "public"."user_connections"("receiverId", "status");

-- CreateIndex
CREATE INDEX "user_connections_relationshipCategory_idx" ON "public"."user_connections"("relationshipCategory");

-- CreateIndex
CREATE INDEX "user_connections_trustStrength_idx" ON "public"."user_connections"("trustStrength");

-- CreateIndex
CREATE INDEX "user_connections_badges_idx" ON "public"."user_connections"("badges");

-- CreateIndex
CREATE INDEX "user_connections_canReconnectAt_idx" ON "public"."user_connections"("canReconnectAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_connections_initiatorId_receiverId_key" ON "public"."user_connections"("initiatorId", "receiverId");

-- CreateIndex
CREATE INDEX "connection_reviews_connectionId_idx" ON "public"."connection_reviews"("connectionId");

-- CreateIndex
CREATE INDEX "connection_reviews_reviewerId_idx" ON "public"."connection_reviews"("reviewerId");

-- CreateIndex
CREATE INDEX "connection_reviews_revieweeId_idx" ON "public"."connection_reviews"("revieweeId");

-- CreateIndex
CREATE INDEX "connection_reviews_rating_idx" ON "public"."connection_reviews"("rating");

-- CreateIndex
CREATE INDEX "connection_reviews_isPublic_isFeatured_idx" ON "public"."connection_reviews"("isPublic", "isFeatured");

-- CreateIndex
CREATE INDEX "connection_reviews_createdAt_idx" ON "public"."connection_reviews"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "connection_reviews_connectionId_reviewerId_key" ON "public"."connection_reviews"("connectionId", "reviewerId");

-- CreateIndex
CREATE INDEX "connection_stats_totalConnections_idx" ON "public"."connection_stats"("totalConnections");

-- CreateIndex
CREATE INDEX "connection_stats_averageRating_idx" ON "public"."connection_stats"("averageRating");

-- CreateIndex
CREATE INDEX "connection_stats_connectionQuality_idx" ON "public"."connection_stats"("connectionQuality");

-- CreateIndex
CREATE INDEX "user_blocks_blockerId_idx" ON "public"."user_blocks"("blockerId");

-- CreateIndex
CREATE INDEX "user_blocks_blockedId_idx" ON "public"."user_blocks"("blockedId");

-- CreateIndex
CREATE UNIQUE INDEX "user_blocks_blockerId_blockedId_key" ON "public"."user_blocks"("blockerId", "blockedId");

-- CreateIndex
CREATE INDEX "travel_trips_userId_startDate_idx" ON "public"."travel_trips"("userId", "startDate");

-- CreateIndex
CREATE INDEX "travel_trips_userId_isPublic_idx" ON "public"."travel_trips"("userId", "isPublic");

-- CreateIndex
CREATE INDEX "travel_trips_startDate_idx" ON "public"."travel_trips"("startDate");

-- CreateIndex
CREATE INDEX "travel_trips_countries_idx" ON "public"."travel_trips"("countries");

-- CreateIndex
CREATE INDEX "travel_companions_tripId_idx" ON "public"."travel_companions"("tripId");

-- CreateIndex
CREATE INDEX "travel_companions_userId_idx" ON "public"."travel_companions"("userId");

-- CreateIndex
CREATE INDEX "travel_companions_companionId_idx" ON "public"."travel_companions"("companionId");

-- CreateIndex
CREATE INDEX "travel_companions_invitationStatus_idx" ON "public"."travel_companions"("invitationStatus");

-- CreateIndex
CREATE INDEX "travel_locations_tripId_idx" ON "public"."travel_locations"("tripId");

-- CreateIndex
CREATE INDEX "travel_locations_country_city_idx" ON "public"."travel_locations"("country", "city");

-- CreateIndex
CREATE INDEX "travel_locations_placeType_idx" ON "public"."travel_locations"("placeType");

-- CreateIndex
CREATE INDEX "travel_highlights_tripId_idx" ON "public"."travel_highlights"("tripId");

-- CreateIndex
CREATE INDEX "travel_highlights_highlightType_idx" ON "public"."travel_highlights"("highlightType");

-- CreateIndex
CREATE INDEX "travel_stats_countriesVisited_idx" ON "public"."travel_stats"("countriesVisited");

-- CreateIndex
CREATE INDEX "travel_stats_totalTrips_idx" ON "public"."travel_stats"("totalTrips");

-- CreateIndex
CREATE INDEX "travel_bucket_list_userId_status_idx" ON "public"."travel_bucket_list"("userId", "status");

-- CreateIndex
CREATE INDEX "travel_bucket_list_country_idx" ON "public"."travel_bucket_list"("country");

-- CreateIndex
CREATE INDEX "travel_bucket_list_seekingCompanions_idx" ON "public"."travel_bucket_list"("seekingCompanions");

-- CreateIndex
CREATE INDEX "events_communityId_idx" ON "public"."events"("communityId");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "public"."events"("status");

-- CreateIndex
CREATE INDEX "events_hostType_idx" ON "public"."events"("hostType");

-- CreateIndex
CREATE INDEX "events_isFree_idx" ON "public"."events"("isFree");

-- CreateIndex
CREATE INDEX "events_communityId_date_idx" ON "public"."events"("communityId", "date");

-- CreateIndex
CREATE INDEX "notifications_readAt_idx" ON "public"."notifications"("readAt");

-- CreateIndex
CREATE INDEX "notifications_priority_idx" ON "public"."notifications"("priority");

-- CreateIndex
CREATE INDEX "notifications_userId_readAt_idx" ON "public"."notifications"("userId", "readAt");

-- CreateIndex
CREATE INDEX "redemptions_userId_idx" ON "public"."redemptions"("userId");

-- CreateIndex
CREATE INDEX "redemptions_rewardId_idx" ON "public"."redemptions"("rewardId");

-- CreateIndex
CREATE INDEX "redemptions_status_idx" ON "public"."redemptions"("status");

-- CreateIndex
CREATE INDEX "rewards_isActive_idx" ON "public"."rewards"("isActive");

-- CreateIndex
CREATE INDEX "rewards_category_idx" ON "public"."rewards"("category");

-- CreateIndex
CREATE INDEX "user_badges_userId_idx" ON "public"."user_badges"("userId");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "public"."users"("phone");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "public"."users"("username");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "public"."users"("status");

-- CreateIndex
CREATE INDEX "users_trustScore_idx" ON "public"."users"("trustScore");

-- CreateIndex
CREATE INDEX "users_trustLevel_idx" ON "public"."users"("trustLevel");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "public"."users"("deletedAt");

-- AddForeignKey
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_locations" ADD CONSTRAINT "user_locations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_security" ADD CONSTRAINT "user_security_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_privacy" ADD CONSTRAINT "user_privacy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_metadata" ADD CONSTRAINT "user_metadata_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile_completion_status" ADD CONSTRAINT "profile_completion_status_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_service_profiles" ADD CONSTRAINT "user_service_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."auth_identities" ADD CONSTRAINT "auth_identities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."login_attempts" ADD CONSTRAINT "login_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."device_registrations" ADD CONSTRAINT "device_registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."security_events" ADD CONSTRAINT "security_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_payment_methods" ADD CONSTRAINT "user_payment_methods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_activities" ADD CONSTRAINT "user_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_stats" ADD CONSTRAINT "user_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vouches" ADD CONSTRAINT "vouches_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vouches" ADD CONSTRAINT "vouches_voucheeId_fkey" FOREIGN KEY ("voucheeId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "public"."communities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_ticket_tiers" ADD CONSTRAINT "event_ticket_tiers_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_tickets" ADD CONSTRAINT "event_tickets_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_tickets" ADD CONSTRAINT "event_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_tickets" ADD CONSTRAINT "event_tickets_ticketTierId_fkey" FOREIGN KEY ("ticketTierId") REFERENCES "public"."event_ticket_tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_tickets" ADD CONSTRAINT "event_tickets_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES "public"."payment_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_rsvps" ADD CONSTRAINT "event_rsvps_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_rsvps" ADD CONSTRAINT "event_rsvps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_attendances" ADD CONSTRAINT "event_attendances_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_attendances" ADD CONSTRAINT "event_attendances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."services" ADD CONSTRAINT "services_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."service_bookings" ADD CONSTRAINT "service_bookings_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."service_bookings" ADD CONSTRAINT "service_bookings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."service_bookings" ADD CONSTRAINT "service_bookings_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."service_bookings" ADD CONSTRAINT "service_bookings_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES "public"."payment_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marketplace_listings" ADD CONSTRAINT "marketplace_listings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."listing_price_history" ADD CONSTRAINT "listing_price_history_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."marketplace_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marketplace_orders" ADD CONSTRAINT "marketplace_orders_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."marketplace_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marketplace_orders" ADD CONSTRAINT "marketplace_orders_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marketplace_orders" ADD CONSTRAINT "marketplace_orders_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marketplace_orders" ADD CONSTRAINT "marketplace_orders_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES "public"."payment_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marketplace_cart_items" ADD CONSTRAINT "marketplace_cart_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marketplace_cart_items" ADD CONSTRAINT "marketplace_cart_items_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."marketplace_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marketplace_disputes" ADD CONSTRAINT "marketplace_disputes_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."marketplace_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marketplace_disputes" ADD CONSTRAINT "marketplace_disputes_initiatedBy_fkey" FOREIGN KEY ("initiatedBy") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marketplace_reviews" ADD CONSTRAINT "marketplace_reviews_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."marketplace_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marketplace_reviews" ADD CONSTRAINT "marketplace_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marketplace_reviews" ADD CONSTRAINT "marketplace_reviews_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_provider_routing" ADD CONSTRAINT "payment_provider_routing_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."payment_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction_fees" ADD CONSTRAINT "transaction_fees_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."payment_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction_fees" ADD CONSTRAINT "transaction_fees_feeConfigId_fkey" FOREIGN KEY ("feeConfigId") REFERENCES "public"."platform_fee_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_transactions" ADD CONSTRAINT "payment_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_transactions" ADD CONSTRAINT "payment_transactions_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."payment_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payout_distributions" ADD CONSTRAINT "payout_distributions_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES "public"."payment_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payout_distributions" ADD CONSTRAINT "payout_distributions_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_subscriptions" ADD CONSTRAINT "user_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_subscriptions" ADD CONSTRAINT "user_subscriptions_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "public"."subscription_tiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscription_payments" ADD CONSTRAINT "subscription_payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."user_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscription_payments" ADD CONSTRAINT "subscription_payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscription_payments" ADD CONSTRAINT "subscription_payments_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES "public"."payment_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."feature_usage" ADD CONSTRAINT "feature_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referrals" ADD CONSTRAINT "referrals_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referrals" ADD CONSTRAINT "referrals_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referrals" ADD CONSTRAINT "referrals_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."referral_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referral_rewards" ADD CONSTRAINT "referral_rewards_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "public"."referrals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referral_rewards" ADD CONSTRAINT "referral_rewards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referral_stats" ADD CONSTRAINT "referral_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."point_histories" ADD CONSTRAINT "point_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_badges" ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "public"."badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_badges" ADD CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."redemptions" ADD CONSTRAINT "redemptions_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "public"."rewards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."redemptions" ADD CONSTRAINT "redemptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_connections" ADD CONSTRAINT "user_connections_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_connections" ADD CONSTRAINT "user_connections_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."connection_reviews" ADD CONSTRAINT "connection_reviews_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "public"."user_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."connection_reviews" ADD CONSTRAINT "connection_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."connection_reviews" ADD CONSTRAINT "connection_reviews_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."connection_stats" ADD CONSTRAINT "connection_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_blocks" ADD CONSTRAINT "user_blocks_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_blocks" ADD CONSTRAINT "user_blocks_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."communities" ADD CONSTRAINT "communities_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."community_members" ADD CONSTRAINT "community_members_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "public"."communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."community_members" ADD CONSTRAINT "community_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."matches" ADD CONSTRAINT "matches_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."matches" ADD CONSTRAINT "matches_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."travel_trips" ADD CONSTRAINT "travel_trips_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."travel_companions" ADD CONSTRAINT "travel_companions_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "public"."travel_trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."travel_companions" ADD CONSTRAINT "travel_companions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."travel_companions" ADD CONSTRAINT "travel_companions_companionId_fkey" FOREIGN KEY ("companionId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."travel_locations" ADD CONSTRAINT "travel_locations_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "public"."travel_trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."travel_highlights" ADD CONSTRAINT "travel_highlights_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "public"."travel_trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."travel_stats" ADD CONSTRAINT "travel_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
