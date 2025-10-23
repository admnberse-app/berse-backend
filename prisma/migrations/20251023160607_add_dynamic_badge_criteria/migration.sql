-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."BadgeType" ADD VALUE 'COMMUNITY_BUILDER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'COMMUNITY_CHAMPION';
ALTER TYPE "public"."BadgeType" ADD VALUE 'MODERATOR_PRO';
ALTER TYPE "public"."BadgeType" ADD VALUE 'COMMUNITY_LEADER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'COMMUNITY_ORGANIZER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'FIRST_SALE';
ALTER TYPE "public"."BadgeType" ADD VALUE 'TRUSTED_SELLER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'POWER_BUYER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'MARKETPLACE_PRO';
ALTER TYPE "public"."BadgeType" ADD VALUE 'FIVE_STAR_SELLER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'VOUCHED';
ALTER TYPE "public"."BadgeType" ADD VALUE 'TRUST_BUILDER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'HIGHLY_VOUCHED';
ALTER TYPE "public"."BadgeType" ADD VALUE 'VOUCH_GIVER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'COMMUNITY_VOUCHED';
ALTER TYPE "public"."BadgeType" ADD VALUE 'GLOBE_TROTTER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'ADVENTURE_SEEKER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'LOCAL_HOST';
ALTER TYPE "public"."BadgeType" ADD VALUE 'SUPER_HOST';
ALTER TYPE "public"."BadgeType" ADD VALUE 'TOUR_GUIDE';
ALTER TYPE "public"."BadgeType" ADD VALUE 'EARLY_ADOPTER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'DAILY_ACTIVE';
ALTER TYPE "public"."BadgeType" ADD VALUE 'FEEDBACK_CHAMPION';
ALTER TYPE "public"."BadgeType" ADD VALUE 'CONVERSATION_STARTER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'SUPER_RESPONDER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'LEVEL_10';
ALTER TYPE "public"."BadgeType" ADD VALUE 'LEVEL_25';
ALTER TYPE "public"."BadgeType" ADD VALUE 'LEVEL_50';
ALTER TYPE "public"."BadgeType" ADD VALUE 'POINTS_MASTER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'PERFECT_PROFILE';

-- AlterTable
ALTER TABLE "public"."badges" ADD COLUMN     "category" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "criteriaConfig" JSONB,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "requiredCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "tier" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "badges_isActive_idx" ON "public"."badges"("isActive");

-- CreateIndex
CREATE INDEX "badges_category_idx" ON "public"."badges"("category");
