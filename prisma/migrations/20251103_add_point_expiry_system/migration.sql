-- AlterTable: Add point expiry fields to point_histories
ALTER TABLE "point_histories" 
ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "expired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "expiredAt" TIMESTAMP(3);

-- AlterTable: Add expiry tracking fields to users
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "pointsExpired" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "pointsSpent" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex: Add index for efficient expiry queries
CREATE INDEX IF NOT EXISTS "PointHistory_expiresAt_expired_idx" ON "point_histories"("expiresAt", "expired");

-- Backfill existing PointHistory records with expiresAt (createdAt + 12 months)
-- This was done via backfill-point-expiry.ts script
-- UPDATE "PointHistory" SET "expiresAt" = "createdAt" + INTERVAL '12 months' WHERE "expiresAt" IS NULL;
