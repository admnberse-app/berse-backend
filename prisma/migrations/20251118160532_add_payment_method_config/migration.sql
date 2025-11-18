-- Note: PaymentMethodType enum already exists in database (used by other tables)

-- CreateTable
CREATE TABLE "payment_method_configs" (
    "id" TEXT NOT NULL,
    "methodType" TEXT NOT NULL,
    "methodCode" TEXT NOT NULL,
    "methodName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "iconUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "availableCountries" TEXT[],
    "availableCurrencies" TEXT[],
    "providerId" TEXT,
    "accountDetails" JSONB,
    "requiresProof" BOOLEAN NOT NULL DEFAULT false,
    "autoApprove" BOOLEAN NOT NULL DEFAULT true,
    "processingTime" TEXT,
    "feePercentage" DOUBLE PRECISION,
    "feeFixed" DOUBLE PRECISION,
    "minAmount" DOUBLE PRECISION,
    "maxAmount" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "payment_method_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_method_configs_methodCode_key" ON "payment_method_configs"("methodCode");

-- CreateIndex
CREATE INDEX "payment_method_configs_methodType_isActive_idx" ON "payment_method_configs"("methodType", "isActive");

-- CreateIndex
CREATE INDEX "payment_method_configs_category_isActive_idx" ON "payment_method_configs"("category", "isActive");

-- CreateIndex
CREATE INDEX "payment_method_configs_displayOrder_isActive_idx" ON "payment_method_configs"("displayOrder", "isActive");

-- CreateIndex
CREATE INDEX "payment_method_configs_methodCode_idx" ON "payment_method_configs"("methodCode");

-- AddForeignKey
ALTER TABLE "payment_method_configs" ADD CONSTRAINT "payment_method_configs_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "payment_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
