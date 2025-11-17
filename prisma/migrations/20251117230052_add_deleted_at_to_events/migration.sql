-- AlterTable
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "events_deletedAt_idx" ON "events"("deletedAt");
