-- CreateEnum
CREATE TYPE "EventParticipantStatus" AS ENUM ('REGISTERED', 'CONFIRMED', 'CHECKED_IN', 'CANCELED', 'NO_SHOW');

-- CreateTable
CREATE TABLE "event_participants" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "status" "EventParticipantStatus" NOT NULL DEFAULT 'REGISTERED',
    "qrCode" TEXT NOT NULL,
    "checkedInAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_participants_qrCode_key" ON "event_participants"("qrCode");

-- CreateIndex
CREATE INDEX "event_participants_eventId_idx" ON "event_participants"("eventId");

-- CreateIndex
CREATE INDEX "event_participants_userId_idx" ON "event_participants"("userId");

-- CreateIndex
CREATE INDEX "event_participants_status_idx" ON "event_participants"("status");

-- CreateIndex
CREATE INDEX "event_participants_checkedInAt_idx" ON "event_participants"("checkedInAt");

-- CreateIndex
CREATE INDEX "event_participants_createdAt_idx" ON "event_participants"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "event_participants_userId_eventId_key" ON "event_participants"("userId", "eventId");

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data Migration: Migrate EventRsvp records to EventParticipant
INSERT INTO "event_participants" ("id", "userId", "eventId", "status", "qrCode", "checkedInAt", "canceledAt", "createdAt", "updatedAt")
SELECT 
    er."id",
    er."userId",
    er."eventId",
    CASE 
        WHEN ea."checkedInAt" IS NOT NULL THEN 'CHECKED_IN'::"EventParticipantStatus"
        ELSE 'REGISTERED'::"EventParticipantStatus"
    END as "status",
    er."qrCode",
    ea."checkedInAt",
    NULL as "canceledAt",
    er."createdAt",
    CURRENT_TIMESTAMP as "updatedAt"
FROM "event_rsvps" er
LEFT JOIN "event_attendances" ea ON ea."userId" = er."userId" AND ea."eventId" = er."eventId"
ON CONFLICT ("userId", "eventId") DO NOTHING;

-- AlterTable: Add participantId to event_tickets
ALTER TABLE "event_tickets" ADD COLUMN "participantId" TEXT;

-- Data Migration: Link existing tickets to participants
UPDATE "event_tickets" et
SET "participantId" = ep."id"
FROM "event_participants" ep
WHERE ep."userId" = et."userId" AND ep."eventId" = et."eventId";

-- AlterTable: Make participantId required and remove old columns
ALTER TABLE "event_tickets" ALTER COLUMN "participantId" SET NOT NULL;
ALTER TABLE "event_tickets" DROP COLUMN "checkedInAt";
ALTER TABLE "event_tickets" DROP COLUMN "quantity";

-- CreateIndex for participantId
CREATE INDEX "event_tickets_participantId_idx" ON "event_tickets"("participantId");

-- AddForeignKey for participantId
ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "event_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropTable
DROP TABLE "event_attendances";

-- DropTable
DROP TABLE "event_rsvps";
