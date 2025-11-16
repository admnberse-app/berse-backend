-- AlterTable
ALTER TABLE "rewards" ADD COLUMN "voucherCode" TEXT,
ADD COLUMN "voucherImageUrl" TEXT,
ADD COLUMN "redemptionLink" TEXT,
ADD COLUMN "instructions" TEXT,
ADD COLUMN "validityDays" INTEGER,
ADD COLUMN "fulfillmentData" JSONB;
