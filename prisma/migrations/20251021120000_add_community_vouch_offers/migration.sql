-- CreateEnum
CREATE TYPE "VouchOfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "community_vouch_offers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "eligibilityReason" TEXT NOT NULL,
    "status" "VouchOfferStatus" NOT NULL DEFAULT 'PENDING',
    "eventsAttended" INTEGER NOT NULL DEFAULT 0,
    "membershipDays" INTEGER NOT NULL DEFAULT 0,
    "hasNegativeFeedback" BOOLEAN NOT NULL DEFAULT false,
    "offerMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "vouchId" TEXT,

    CONSTRAINT "community_vouch_offers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "community_vouch_offers_vouchId_key" ON "community_vouch_offers"("vouchId");

-- CreateIndex
CREATE INDEX "community_vouch_offers_userId_idx" ON "community_vouch_offers"("userId");

-- CreateIndex
CREATE INDEX "community_vouch_offers_communityId_idx" ON "community_vouch_offers"("communityId");

-- CreateIndex
CREATE INDEX "community_vouch_offers_status_idx" ON "community_vouch_offers"("status");

-- CreateIndex
CREATE INDEX "community_vouch_offers_expiresAt_idx" ON "community_vouch_offers"("expiresAt");

-- CreateIndex
CREATE INDEX "community_vouch_offers_createdAt_idx" ON "community_vouch_offers"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "community_vouch_offers_userId_communityId_status_key" ON "community_vouch_offers"("userId", "communityId", "status");

-- AddForeignKey
ALTER TABLE "community_vouch_offers" ADD CONSTRAINT "community_vouch_offers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_vouch_offers" ADD CONSTRAINT "community_vouch_offers_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
