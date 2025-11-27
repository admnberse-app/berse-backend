-- AlterTable: Add manual payment fields to payment_transactions
ALTER TABLE "payment_transactions" ADD COLUMN IF NOT EXISTS "proofOfPaymentUrl" TEXT;
ALTER TABLE "payment_transactions" ADD COLUMN IF NOT EXISTS "proofUploadedAt" TIMESTAMP(3);
ALTER TABLE "payment_transactions" ADD COLUMN IF NOT EXISTS "verifiedBy" TEXT;
ALTER TABLE "payment_transactions" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);
ALTER TABLE "payment_transactions" ADD COLUMN IF NOT EXISTS "verificationNotes" TEXT;
ALTER TABLE "payment_transactions" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
ALTER TABLE "payment_transactions" ADD COLUMN IF NOT EXISTS "manualPaymentDetails" JSONB;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "payment_transactions_proofUploadedAt_status_idx" ON "payment_transactions"("proofUploadedAt", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "payment_transactions_verifiedBy_idx" ON "payment_transactions"("verifiedBy");

-- AddForeignKey: Add foreign key for verifier
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_verifiedBy_fkey" 
FOREIGN KEY ("verifiedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
