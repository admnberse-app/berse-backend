-- AlterTable: Add soft delete to Reward table
ALTER TABLE "rewards" 
ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- AlterTable: Add soft delete to MarketplaceListing table
ALTER TABLE "marketplace_listings" 
ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- AlterTable: Add soft delete to TravelTrip table
ALTER TABLE "travel_trips" 
ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- CreateIndex: Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS "rewards_deletedAt_idx" ON "rewards"("deletedAt");
CREATE INDEX IF NOT EXISTS "marketplace_listings_deletedAt_idx" ON "marketplace_listings"("deletedAt");
CREATE INDEX IF NOT EXISTS "travel_trips_deletedAt_idx" ON "travel_trips"("deletedAt");
