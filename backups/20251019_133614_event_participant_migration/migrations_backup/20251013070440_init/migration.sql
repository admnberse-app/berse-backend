/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[membershipId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."CommunityRole" AS ENUM ('MEMBER', 'MODERATOR', 'ADMIN', 'OWNER');

-- AlterTable
ALTER TABLE "public"."CardGameFeedback" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."CardGameStats" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "accountLockedReason" TEXT,
ADD COLUMN     "affiliateId" TEXT,
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "allowDirectMessages" BOOLEAN DEFAULT true,
ADD COLUMN     "apiKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "communityRole" TEXT DEFAULT 'member',
ADD COLUMN     "consentDate" TIMESTAMP(3),
ADD COLUMN     "consentToDataProcessing" BOOLEAN DEFAULT true,
ADD COLUMN     "consentToMarketing" BOOLEAN DEFAULT false,
ADD COLUMN     "countryOfResidence" TEXT,
ADD COLUMN     "currency" TEXT DEFAULT 'MYR',
ADD COLUMN     "currentLocation" TEXT,
ADD COLUMN     "customFields" JSONB DEFAULT '{}',
ADD COLUMN     "darkMode" BOOLEAN DEFAULT false,
ADD COLUMN     "dataExportRequestedAt" TIMESTAMP(3),
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "deletionRequestedAt" TIMESTAMP(3),
ADD COLUMN     "deletionScheduledFor" TIMESTAMP(3),
ADD COLUMN     "deviceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "emailVerificationExpires" TIMESTAMP(3),
ADD COLUMN     "emailVerificationToken" TEXT,
ADD COLUMN     "eventsAttended" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "googleCalendarConnected" BOOLEAN DEFAULT false,
ADD COLUMN     "googleCalendarRefreshToken" TEXT,
ADD COLUMN     "integrations" JSONB DEFAULT '{}',
ADD COLUMN     "internalNotes" TEXT,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "lastLoginLocation" TEXT,
ADD COLUMN     "lastMfaAuthAt" TIMESTAMP(3),
ADD COLUMN     "lastPasswordChangeAt" TIMESTAMP(3),
ADD COLUMN     "lastSeenAt" TIMESTAMP(3),
ADD COLUMN     "lifetimeValue" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "lockoutUntil" TIMESTAMP(3),
ADD COLUMN     "loginAttempts" INTEGER DEFAULT 0,
ADD COLUMN     "membershipId" TEXT,
ADD COLUMN     "mfaBackupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mfaRecoveryEmail" TEXT,
ADD COLUMN     "mfaSecret" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "notificationPreferences" JSONB DEFAULT '{"sms": false, "push": true, "email": true}',
ADD COLUMN     "originallyFrom" TEXT,
ADD COLUMN     "passwordHistory" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "passwordResetExpires" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT,
ADD COLUMN     "personalityType" TEXT,
ADD COLUMN     "preferredLanguage" TEXT DEFAULT 'en',
ADD COLUMN     "profession" TEXT,
ADD COLUMN     "profileVisibility" TEXT DEFAULT 'public',
ADD COLUMN     "pushToken" TEXT,
ADD COLUMN     "referralSource" TEXT,
ADD COLUMN     "requirePasswordChange" BOOLEAN DEFAULT false,
ADD COLUMN     "searchableByEmail" BOOLEAN DEFAULT true,
ADD COLUMN     "searchableByPhone" BOOLEAN DEFAULT true,
ADD COLUMN     "securityQuestions" JSONB DEFAULT '[]',
ADD COLUMN     "servicesOffered" JSONB,
ADD COLUMN     "sessionTokens" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "shortBio" TEXT,
ADD COLUMN     "suspendedUntil" TIMESTAMP(3),
ADD COLUMN     "suspensionReason" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "timezone" TEXT DEFAULT 'Asia/Kuala_Lumpur',
ADD COLUMN     "travelHistory" JSONB,
ADD COLUMN     "trustedDevices" JSONB DEFAULT '[]',
ADD COLUMN     "userAgent" TEXT,
ADD COLUMN     "username" TEXT,
ADD COLUMN     "utmCampaign" TEXT,
ADD COLUMN     "utmMedium" TEXT,
ADD COLUMN     "utmSource" TEXT,
ADD COLUMN     "webhookUrl" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "public"."Community" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "category" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunityMember" (
    "id" TEXT NOT NULL,
    "role" "public"."CommunityRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,

    CONSTRAINT "CommunityMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RefreshToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "tokenFamily" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CardGameUpvote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardGameUpvote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CardGameReply" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardGameReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Community_name_key" ON "public"."Community"("name");

-- CreateIndex
CREATE INDEX "Community_name_idx" ON "public"."Community"("name");

-- CreateIndex
CREATE INDEX "Community_category_idx" ON "public"."Community"("category");

-- CreateIndex
CREATE INDEX "Community_createdAt_idx" ON "public"."Community"("createdAt");

-- CreateIndex
CREATE INDEX "CommunityMember_userId_idx" ON "public"."CommunityMember"("userId");

-- CreateIndex
CREATE INDEX "CommunityMember_communityId_idx" ON "public"."CommunityMember"("communityId");

-- CreateIndex
CREATE INDEX "CommunityMember_role_idx" ON "public"."CommunityMember"("role");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityMember_userId_communityId_key" ON "public"."CommunityMember"("userId", "communityId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "public"."RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "public"."RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_tokenHash_idx" ON "public"."RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "public"."RefreshToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_userId_key" ON "public"."PushSubscription"("userId");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "public"."PushSubscription"("userId");

-- CreateIndex
CREATE INDEX "CardGameUpvote_userId_idx" ON "public"."CardGameUpvote"("userId");

-- CreateIndex
CREATE INDEX "CardGameUpvote_feedbackId_idx" ON "public"."CardGameUpvote"("feedbackId");

-- CreateIndex
CREATE UNIQUE INDEX "CardGameUpvote_userId_feedbackId_key" ON "public"."CardGameUpvote"("userId", "feedbackId");

-- CreateIndex
CREATE INDEX "CardGameReply_userId_idx" ON "public"."CardGameReply"("userId");

-- CreateIndex
CREATE INDEX "CardGameReply_feedbackId_idx" ON "public"."CardGameReply"("feedbackId");

-- CreateIndex
CREATE INDEX "CardGameStats_topicId_idx" ON "public"."CardGameStats"("topicId");

-- CreateIndex
CREATE INDEX "Event_hostId_idx" ON "public"."Event"("hostId");

-- CreateIndex
CREATE INDEX "Event_type_idx" ON "public"."Event"("type");

-- CreateIndex
CREATE INDEX "Event_date_idx" ON "public"."Event"("date");

-- CreateIndex
CREATE INDEX "Event_location_idx" ON "public"."Event"("location");

-- CreateIndex
CREATE INDEX "Event_createdAt_idx" ON "public"."Event"("createdAt");

-- CreateIndex
CREATE INDEX "Event_type_date_idx" ON "public"."Event"("type", "date");

-- CreateIndex
CREATE INDEX "Event_hostId_date_idx" ON "public"."Event"("hostId", "date");

-- CreateIndex
CREATE INDEX "EventAttendance_userId_idx" ON "public"."EventAttendance"("userId");

-- CreateIndex
CREATE INDEX "EventAttendance_eventId_idx" ON "public"."EventAttendance"("eventId");

-- CreateIndex
CREATE INDEX "EventAttendance_checkedInAt_idx" ON "public"."EventAttendance"("checkedInAt");

-- CreateIndex
CREATE INDEX "EventRSVP_userId_idx" ON "public"."EventRSVP"("userId");

-- CreateIndex
CREATE INDEX "EventRSVP_eventId_idx" ON "public"."EventRSVP"("eventId");

-- CreateIndex
CREATE INDEX "EventRSVP_createdAt_idx" ON "public"."EventRSVP"("createdAt");

-- CreateIndex
CREATE INDEX "Match_senderId_idx" ON "public"."Match"("senderId");

-- CreateIndex
CREATE INDEX "Match_receiverId_idx" ON "public"."Match"("receiverId");

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "public"."Match"("status");

-- CreateIndex
CREATE INDEX "Match_type_idx" ON "public"."Match"("type");

-- CreateIndex
CREATE INDEX "Match_expiresAt_idx" ON "public"."Match"("expiresAt");

-- CreateIndex
CREATE INDEX "Match_createdAt_idx" ON "public"."Match"("createdAt");

-- CreateIndex
CREATE INDEX "Match_senderId_status_idx" ON "public"."Match"("senderId", "status");

-- CreateIndex
CREATE INDEX "Match_receiverId_status_idx" ON "public"."Match"("receiverId", "status");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "public"."Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_receiverId_idx" ON "public"."Message"("receiverId");

-- CreateIndex
CREATE INDEX "Message_isRead_idx" ON "public"."Message"("isRead");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "public"."Message"("createdAt");

-- CreateIndex
CREATE INDEX "Message_receiverId_isRead_idx" ON "public"."Message"("receiverId", "isRead");

-- CreateIndex
CREATE INDEX "Message_senderId_receiverId_idx" ON "public"."Message"("senderId", "receiverId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "public"."Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "public"."Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "public"."Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "public"."Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "public"."Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "public"."Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PointHistory_userId_idx" ON "public"."PointHistory"("userId");

-- CreateIndex
CREATE INDEX "PointHistory_action_idx" ON "public"."PointHistory"("action");

-- CreateIndex
CREATE INDEX "PointHistory_createdAt_idx" ON "public"."PointHistory"("createdAt");

-- CreateIndex
CREATE INDEX "PointHistory_userId_createdAt_idx" ON "public"."PointHistory"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_membershipId_key" ON "public"."User"("membershipId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_totalPoints_idx" ON "public"."User"("totalPoints");

-- CreateIndex
CREATE INDEX "User_city_idx" ON "public"."User"("city");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- CreateIndex
CREATE INDEX "User_isHostCertified_idx" ON "public"."User"("isHostCertified");

-- CreateIndex
CREATE INDEX "User_mfaEnabled_idx" ON "public"."User"("mfaEnabled");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "public"."User"("createdAt");

-- CreateIndex
CREATE INDEX "User_referredById_idx" ON "public"."User"("referredById");

-- AddForeignKey
ALTER TABLE "public"."Community" ADD CONSTRAINT "Community_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityMember" ADD CONSTRAINT "CommunityMember_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "public"."Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityMember" ADD CONSTRAINT "CommunityMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CardGameFeedback" ADD CONSTRAINT "CardGameFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CardGameUpvote" ADD CONSTRAINT "CardGameUpvote_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "public"."CardGameFeedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CardGameUpvote" ADD CONSTRAINT "CardGameUpvote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CardGameReply" ADD CONSTRAINT "CardGameReply_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "public"."CardGameFeedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CardGameReply" ADD CONSTRAINT "CardGameReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
