/*
  Warnings:

  - You are about to drop the `Badge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CardGameFeedback` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CardGameReply` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CardGameStats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CardGameUpvote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Community` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommunityMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventAttendance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventRSVP` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Follow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Match` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PointHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PushSubscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Redemption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RefreshToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reward` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserBadge` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CardGameFeedback" DROP CONSTRAINT "CardGameFeedback_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CardGameReply" DROP CONSTRAINT "CardGameReply_feedbackId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CardGameReply" DROP CONSTRAINT "CardGameReply_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CardGameUpvote" DROP CONSTRAINT "CardGameUpvote_feedbackId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CardGameUpvote" DROP CONSTRAINT "CardGameUpvote_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Community" DROP CONSTRAINT "Community_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommunityMember" DROP CONSTRAINT "CommunityMember_communityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommunityMember" DROP CONSTRAINT "CommunityMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_hostId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventAttendance" DROP CONSTRAINT "EventAttendance_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventAttendance" DROP CONSTRAINT "EventAttendance_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventRSVP" DROP CONSTRAINT "EventRSVP_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventRSVP" DROP CONSTRAINT "EventRSVP_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Follow" DROP CONSTRAINT "Follow_followerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Follow" DROP CONSTRAINT "Follow_followingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Match" DROP CONSTRAINT "Match_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Match" DROP CONSTRAINT "Match_senderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PointHistory" DROP CONSTRAINT "PointHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PushSubscription" DROP CONSTRAINT "PushSubscription_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Redemption" DROP CONSTRAINT "Redemption_rewardId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Redemption" DROP CONSTRAINT "Redemption_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_referredById_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserBadge" DROP CONSTRAINT "UserBadge_badgeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserBadge" DROP CONSTRAINT "UserBadge_userId_fkey";

-- DropTable
DROP TABLE "public"."Badge";

-- DropTable
DROP TABLE "public"."CardGameFeedback";

-- DropTable
DROP TABLE "public"."CardGameReply";

-- DropTable
DROP TABLE "public"."CardGameStats";

-- DropTable
DROP TABLE "public"."CardGameUpvote";

-- DropTable
DROP TABLE "public"."Community";

-- DropTable
DROP TABLE "public"."CommunityMember";

-- DropTable
DROP TABLE "public"."Event";

-- DropTable
DROP TABLE "public"."EventAttendance";

-- DropTable
DROP TABLE "public"."EventRSVP";

-- DropTable
DROP TABLE "public"."Follow";

-- DropTable
DROP TABLE "public"."Match";

-- DropTable
DROP TABLE "public"."Message";

-- DropTable
DROP TABLE "public"."Notification";

-- DropTable
DROP TABLE "public"."PointHistory";

-- DropTable
DROP TABLE "public"."PushSubscription";

-- DropTable
DROP TABLE "public"."Redemption";

-- DropTable
DROP TABLE "public"."RefreshToken";

-- DropTable
DROP TABLE "public"."Reward";

-- DropTable
DROP TABLE "public"."User";

-- DropTable
DROP TABLE "public"."UserBadge";

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "profilePicture" TEXT,
    "bio" TEXT,
    "city" TEXT,
    "interests" TEXT[],
    "instagramHandle" TEXT,
    "linkedinHandle" TEXT,
    "referralCode" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'GENERAL_USER',
    "isHostCertified" BOOLEAN NOT NULL DEFAULT false,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "referredById" TEXT,
    "countryOfResidence" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "mfaBackupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "nationality" TEXT,
    "username" TEXT,
    "mfaRecoveryEmail" TEXT,
    "lastMfaAuthAt" TIMESTAMP(3),
    "pushToken" TEXT,
    "lastSeenAt" TIMESTAMP(3),
    "googleCalendarConnected" BOOLEAN DEFAULT false,
    "googleCalendarRefreshToken" TEXT,
    "profileVisibility" TEXT DEFAULT 'public',
    "searchableByPhone" BOOLEAN DEFAULT true,
    "searchableByEmail" BOOLEAN DEFAULT true,
    "allowDirectMessages" BOOLEAN DEFAULT true,
    "emailVerificationToken" TEXT,
    "emailVerificationExpires" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "loginAttempts" INTEGER DEFAULT 0,
    "lockoutUntil" TIMESTAMP(3),
    "sessionTokens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "deviceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "trustedDevices" JSONB DEFAULT '[]',
    "securityQuestions" JSONB DEFAULT '[]',
    "accountLockedReason" TEXT,
    "suspendedUntil" TIMESTAMP(3),
    "suspensionReason" TEXT,
    "deletionRequestedAt" TIMESTAMP(3),
    "deletionScheduledFor" TIMESTAMP(3),
    "dataExportRequestedAt" TIMESTAMP(3),
    "lastPasswordChangeAt" TIMESTAMP(3),
    "passwordHistory" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requirePasswordChange" BOOLEAN DEFAULT false,
    "consentToDataProcessing" BOOLEAN DEFAULT true,
    "consentToMarketing" BOOLEAN DEFAULT false,
    "consentDate" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "lastLoginLocation" TEXT,
    "timezone" TEXT DEFAULT 'Asia/Kuala_Lumpur',
    "preferredLanguage" TEXT DEFAULT 'en',
    "currency" TEXT DEFAULT 'MYR',
    "darkMode" BOOLEAN DEFAULT false,
    "notificationPreferences" JSONB DEFAULT '{"sms": false, "push": true, "email": true}',
    "apiKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "webhookUrl" TEXT,
    "integrations" JSONB DEFAULT '{}',
    "customFields" JSONB DEFAULT '{}',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "internalNotes" TEXT,
    "referralSource" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "affiliateId" TEXT,
    "lifetimeValue" DOUBLE PRECISION DEFAULT 0,
    "age" INTEGER,
    "communityRole" TEXT DEFAULT 'member',
    "currentLocation" TEXT,
    "eventsAttended" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "originallyFrom" TEXT,
    "personalityType" TEXT,
    "profession" TEXT,
    "servicesOffered" JSONB,
    "shortBio" TEXT,
    "travelHistory" JSONB,
    "website" TEXT,
    "membershipId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."EventType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "mapLink" TEXT,
    "maxAttendees" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hostId" TEXT NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_rsvps" (
    "id" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "event_rsvps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_attendances" (
    "id" TEXT NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "event_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."point_histories" (
    "id" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "point_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."badges" (
    "id" TEXT NOT NULL,
    "type" "public"."BadgeType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "criteria" TEXT NOT NULL,
    "imageUrl" TEXT,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_badges" (
    "id" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rewards" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pointsRequired" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "partner" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."redemptions" (
    "id" TEXT NOT NULL,
    "status" "public"."RedemptionStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,

    CONSTRAINT "redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."follows" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."communities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "category" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "communities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."community_members" (
    "id" TEXT NOT NULL,
    "role" "public"."CommunityRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,

    CONSTRAINT "community_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."matches" (
    "id" TEXT NOT NULL,
    "type" "public"."MatchType" NOT NULL,
    "status" "public"."MatchStatus" NOT NULL DEFAULT 'PENDING',
    "compatibility" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "interests" TEXT[],
    "availability" JSONB,
    "location" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."refresh_tokens" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "tokenFamily" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."push_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."card_game_feedbacks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "sessionNumber" INTEGER NOT NULL,
    "questionId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_game_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."card_game_upvotes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_game_upvotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."card_game_replies" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_game_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."card_game_stats" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalFeedback" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_game_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "public"."users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_referralCode_key" ON "public"."users"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_membershipId_key" ON "public"."users"("membershipId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_totalPoints_idx" ON "public"."users"("totalPoints");

-- CreateIndex
CREATE INDEX "users_city_idx" ON "public"."users"("city");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "public"."users"("role");

-- CreateIndex
CREATE INDEX "users_isHostCertified_idx" ON "public"."users"("isHostCertified");

-- CreateIndex
CREATE INDEX "users_mfaEnabled_idx" ON "public"."users"("mfaEnabled");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "public"."users"("createdAt");

-- CreateIndex
CREATE INDEX "users_referredById_idx" ON "public"."users"("referredById");

-- CreateIndex
CREATE INDEX "events_hostId_idx" ON "public"."events"("hostId");

-- CreateIndex
CREATE INDEX "events_type_idx" ON "public"."events"("type");

-- CreateIndex
CREATE INDEX "events_date_idx" ON "public"."events"("date");

-- CreateIndex
CREATE INDEX "events_location_idx" ON "public"."events"("location");

-- CreateIndex
CREATE INDEX "events_createdAt_idx" ON "public"."events"("createdAt");

-- CreateIndex
CREATE INDEX "events_type_date_idx" ON "public"."events"("type", "date");

-- CreateIndex
CREATE INDEX "events_hostId_date_idx" ON "public"."events"("hostId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "event_rsvps_qrCode_key" ON "public"."event_rsvps"("qrCode");

-- CreateIndex
CREATE INDEX "event_rsvps_userId_idx" ON "public"."event_rsvps"("userId");

-- CreateIndex
CREATE INDEX "event_rsvps_eventId_idx" ON "public"."event_rsvps"("eventId");

-- CreateIndex
CREATE INDEX "event_rsvps_createdAt_idx" ON "public"."event_rsvps"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "event_rsvps_userId_eventId_key" ON "public"."event_rsvps"("userId", "eventId");

-- CreateIndex
CREATE INDEX "event_attendances_userId_idx" ON "public"."event_attendances"("userId");

-- CreateIndex
CREATE INDEX "event_attendances_eventId_idx" ON "public"."event_attendances"("eventId");

-- CreateIndex
CREATE INDEX "event_attendances_checkedInAt_idx" ON "public"."event_attendances"("checkedInAt");

-- CreateIndex
CREATE UNIQUE INDEX "event_attendances_userId_eventId_key" ON "public"."event_attendances"("userId", "eventId");

-- CreateIndex
CREATE INDEX "point_histories_userId_idx" ON "public"."point_histories"("userId");

-- CreateIndex
CREATE INDEX "point_histories_action_idx" ON "public"."point_histories"("action");

-- CreateIndex
CREATE INDEX "point_histories_createdAt_idx" ON "public"."point_histories"("createdAt");

-- CreateIndex
CREATE INDEX "point_histories_userId_createdAt_idx" ON "public"."point_histories"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "badges_type_key" ON "public"."badges"("type");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "public"."user_badges"("userId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "follows_followerId_followingId_key" ON "public"."follows"("followerId", "followingId");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "public"."messages"("senderId");

-- CreateIndex
CREATE INDEX "messages_receiverId_idx" ON "public"."messages"("receiverId");

-- CreateIndex
CREATE INDEX "messages_isRead_idx" ON "public"."messages"("isRead");

-- CreateIndex
CREATE INDEX "messages_createdAt_idx" ON "public"."messages"("createdAt");

-- CreateIndex
CREATE INDEX "messages_receiverId_isRead_idx" ON "public"."messages"("receiverId", "isRead");

-- CreateIndex
CREATE INDEX "messages_senderId_receiverId_idx" ON "public"."messages"("senderId", "receiverId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "public"."notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "public"."notifications"("isRead");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "public"."notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "public"."notifications"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "public"."notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "public"."notifications"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "communities_name_key" ON "public"."communities"("name");

-- CreateIndex
CREATE INDEX "communities_name_idx" ON "public"."communities"("name");

-- CreateIndex
CREATE INDEX "communities_category_idx" ON "public"."communities"("category");

-- CreateIndex
CREATE INDEX "communities_createdAt_idx" ON "public"."communities"("createdAt");

-- CreateIndex
CREATE INDEX "community_members_userId_idx" ON "public"."community_members"("userId");

-- CreateIndex
CREATE INDEX "community_members_communityId_idx" ON "public"."community_members"("communityId");

-- CreateIndex
CREATE INDEX "community_members_role_idx" ON "public"."community_members"("role");

-- CreateIndex
CREATE UNIQUE INDEX "community_members_userId_communityId_key" ON "public"."community_members"("userId", "communityId");

-- CreateIndex
CREATE INDEX "matches_senderId_idx" ON "public"."matches"("senderId");

-- CreateIndex
CREATE INDEX "matches_receiverId_idx" ON "public"."matches"("receiverId");

-- CreateIndex
CREATE INDEX "matches_status_idx" ON "public"."matches"("status");

-- CreateIndex
CREATE INDEX "matches_type_idx" ON "public"."matches"("type");

-- CreateIndex
CREATE INDEX "matches_expiresAt_idx" ON "public"."matches"("expiresAt");

-- CreateIndex
CREATE INDEX "matches_createdAt_idx" ON "public"."matches"("createdAt");

-- CreateIndex
CREATE INDEX "matches_senderId_status_idx" ON "public"."matches"("senderId", "status");

-- CreateIndex
CREATE INDEX "matches_receiverId_status_idx" ON "public"."matches"("receiverId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "matches_senderId_receiverId_type_key" ON "public"."matches"("senderId", "receiverId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "public"."refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "public"."refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_tokenHash_idx" ON "public"."refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "public"."refresh_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_userId_key" ON "public"."push_subscriptions"("userId");

-- CreateIndex
CREATE INDEX "push_subscriptions_userId_idx" ON "public"."push_subscriptions"("userId");

-- CreateIndex
CREATE INDEX "card_game_feedbacks_userId_idx" ON "public"."card_game_feedbacks"("userId");

-- CreateIndex
CREATE INDEX "card_game_feedbacks_topicId_idx" ON "public"."card_game_feedbacks"("topicId");

-- CreateIndex
CREATE INDEX "card_game_feedbacks_questionId_idx" ON "public"."card_game_feedbacks"("questionId");

-- CreateIndex
CREATE INDEX "card_game_upvotes_userId_idx" ON "public"."card_game_upvotes"("userId");

-- CreateIndex
CREATE INDEX "card_game_upvotes_feedbackId_idx" ON "public"."card_game_upvotes"("feedbackId");

-- CreateIndex
CREATE UNIQUE INDEX "card_game_upvotes_userId_feedbackId_key" ON "public"."card_game_upvotes"("userId", "feedbackId");

-- CreateIndex
CREATE INDEX "card_game_replies_userId_idx" ON "public"."card_game_replies"("userId");

-- CreateIndex
CREATE INDEX "card_game_replies_feedbackId_idx" ON "public"."card_game_replies"("feedbackId");

-- CreateIndex
CREATE UNIQUE INDEX "card_game_stats_topicId_key" ON "public"."card_game_stats"("topicId");

-- CreateIndex
CREATE INDEX "card_game_stats_topicId_idx" ON "public"."card_game_stats"("topicId");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_rsvps" ADD CONSTRAINT "event_rsvps_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_rsvps" ADD CONSTRAINT "event_rsvps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_attendances" ADD CONSTRAINT "event_attendances_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_attendances" ADD CONSTRAINT "event_attendances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."point_histories" ADD CONSTRAINT "point_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_badges" ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "public"."badges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_badges" ADD CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."redemptions" ADD CONSTRAINT "redemptions_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "public"."rewards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."redemptions" ADD CONSTRAINT "redemptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."follows" ADD CONSTRAINT "follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."follows" ADD CONSTRAINT "follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."communities" ADD CONSTRAINT "communities_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."community_members" ADD CONSTRAINT "community_members_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "public"."communities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."community_members" ADD CONSTRAINT "community_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."matches" ADD CONSTRAINT "matches_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."matches" ADD CONSTRAINT "matches_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."card_game_feedbacks" ADD CONSTRAINT "card_game_feedbacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."card_game_upvotes" ADD CONSTRAINT "card_game_upvotes_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "public"."card_game_feedbacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."card_game_upvotes" ADD CONSTRAINT "card_game_upvotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."card_game_replies" ADD CONSTRAINT "card_game_replies_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "public"."card_game_feedbacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."card_game_replies" ADD CONSTRAINT "card_game_replies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
