-- AlterTable
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "communities_deletedAt_idx" ON "communities"("deletedAt");
