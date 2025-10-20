-- CreateEnum
CREATE TYPE "AccountabilityImpact" AS ENUM ('POSITIVE', 'NEGATIVE', 'NEUTRAL');

-- CreateTable
CREATE TABLE "accountability_logs" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "voucheeId" TEXT NOT NULL,
    "chainId" TEXT,
    "impactType" "AccountabilityImpact" NOT NULL,
    "impactValue" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "relatedEntityType" TEXT,
    "relatedEntityId" TEXT,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "accountability_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "accountability_logs_voucherId_isProcessed_idx" ON "accountability_logs"("voucherId", "isProcessed");

-- CreateIndex
CREATE INDEX "accountability_logs_voucheeId_occurredAt_idx" ON "accountability_logs"("voucheeId", "occurredAt");

-- CreateIndex
CREATE INDEX "accountability_logs_impactType_isProcessed_idx" ON "accountability_logs"("impactType", "isProcessed");

-- CreateIndex
CREATE INDEX "accountability_logs_occurredAt_idx" ON "accountability_logs"("occurredAt");

-- AddForeignKey
ALTER TABLE "accountability_logs" ADD CONSTRAINT "accountability_logs_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accountability_logs" ADD CONSTRAINT "accountability_logs_voucheeId_fkey" FOREIGN KEY ("voucheeId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
