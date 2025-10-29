-- AlterTable
ALTER TABLE "public"."payment_transactions" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "transactionId" TEXT,
ADD COLUMN     "xenditInvoiceId" TEXT,
ADD COLUMN     "xenditInvoiceUrl" TEXT;

-- CreateIndex
CREATE INDEX "payment_transactions_xenditInvoiceId_idx" ON "public"."payment_transactions"("xenditInvoiceId");

-- CreateIndex
CREATE INDEX "payment_transactions_status_paidAt_idx" ON "public"."payment_transactions"("status", "paidAt");
