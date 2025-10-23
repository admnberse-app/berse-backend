/*
  Warnings:

  - The values [PER_NIGHT] on the enum `PricingType` will be removed. If these variants are still used in the database, this will fail.
  - The values [GUIDING,HOMESTAY] on the enum `ServiceType` will be removed. If these variants are still used in the database, this will fail.
  - The values [SERVICE_BOOKING] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `currency` on the `marketplace_listings` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `marketplace_listings` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `marketplace_orders` table. All the data in the column will be lost.
  - You are about to drop the `service_bookings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `services` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `marketplace_listings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderType` to the `marketplace_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricingOptionId` to the `marketplace_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricingType` to the `marketplace_orders` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ListingType" AS ENUM ('PRODUCT', 'SERVICE');

-- CreateEnum
CREATE TYPE "public"."PaymentMethodType" AS ENUM ('MONEY', 'FREE', 'TREATS', 'BARTER');

-- CreateEnum
CREATE TYPE "public"."PriceStructureType" AS ENUM ('FIXED', 'PER_HOUR', 'PER_DAY', 'PER_SESSION', 'PER_PERSON', 'PACKAGE', 'PROJECT');

-- CreateEnum
CREATE TYPE "public"."ExchangeCategory" AS ENUM ('FOOD', 'BOOKS', 'ELECTRONICS', 'SERVICES', 'CLOTHING', 'EXPERIENCE', 'HOUSEHOLD', 'COLLECTIBLES', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ServiceLocationType" AS ENUM ('PROVIDER_LOCATION', 'CUSTOMER_LOCATION', 'ONLINE', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "public"."ProductCondition" AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR');

-- CreateEnum
CREATE TYPE "public"."DurationUnit" AS ENUM ('MINUTES', 'HOURS', 'DAYS');

-- CreateEnum
CREATE TYPE "public"."FulfillmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED');

-- DropForeignKey (moved here before dropping tables)
ALTER TABLE "public"."service_bookings" DROP CONSTRAINT IF EXISTS "service_bookings_customerId_fkey";
ALTER TABLE "public"."service_bookings" DROP CONSTRAINT IF EXISTS "service_bookings_paymentTransactionId_fkey";
ALTER TABLE "public"."service_bookings" DROP CONSTRAINT IF EXISTS "service_bookings_providerId_fkey";
ALTER TABLE "public"."service_bookings" DROP CONSTRAINT IF EXISTS "service_bookings_serviceId_fkey";
ALTER TABLE "public"."services" DROP CONSTRAINT IF EXISTS "services_providerId_fkey";

-- DropTable (moved here before altering enums)
DROP TABLE IF EXISTS "public"."service_bookings";
DROP TABLE IF EXISTS "public"."services";

-- AlterEnum
ALTER TYPE "public"."PayoutStatus" ADD VALUE IF NOT EXISTS 'PAID';

-- AlterEnum
BEGIN;
CREATE TYPE "public"."PricingType_new" AS ENUM ('PER_HOUR', 'PER_DAY', 'PER_PERSON', 'PER_SESSION', 'FIXED');
ALTER TYPE "public"."PricingType" RENAME TO "PricingType_old";
ALTER TYPE "public"."PricingType_new" RENAME TO "PricingType";
DROP TYPE "public"."PricingType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ServiceType_new" AS ENUM ('TUTORING', 'CONSULTATION', 'TRANSPORT', 'HOME_SERVICES', 'PROFESSIONAL', 'WELLNESS', 'OTHER');
ALTER TYPE "public"."ServiceType" RENAME TO "ServiceType_old";
ALTER TYPE "public"."ServiceType_new" RENAME TO "ServiceType";
DROP TYPE "public"."ServiceType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."TransactionType_new" AS ENUM ('EVENT_TICKET', 'MARKETPLACE_ORDER', 'SUBSCRIPTION', 'DONATION', 'REFUND');
ALTER TABLE "public"."payment_transactions" ALTER COLUMN "transactionType" TYPE "public"."TransactionType_new" USING ("transactionType"::text::"public"."TransactionType_new");
ALTER TABLE "public"."platform_fee_configs" ALTER COLUMN "transactionType" TYPE "public"."TransactionType_new" USING ("transactionType"::text::"public"."TransactionType_new");
ALTER TYPE "public"."TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "public"."TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "public"."TransactionType_old";
COMMIT;

-- DropEnums (drop these now that dependent tables are gone)
DROP TYPE IF EXISTS "public"."BookingStatus";
DROP TYPE IF EXISTS "public"."ServiceStatus";

-- DropIndex
DROP INDEX "public"."marketplace_listings_category_idx";

-- DropIndex
DROP INDEX "public"."marketplace_listings_status_idx";

-- DropIndex
DROP INDEX "public"."marketplace_orders_createdAt_idx";

-- DropIndex
DROP INDEX "public"."marketplace_orders_status_idx";

-- AlterTable
ALTER TABLE "public"."marketplace_listings" DROP COLUMN "currency",
DROP COLUMN "price",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "allowDirectContact" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "condition" "public"."ProductCondition",
ADD COLUMN     "discountAmount" DOUBLE PRECISION,
ADD COLUMN     "discountPercentage" DOUBLE PRECISION,
ADD COLUMN     "discountValidUntil" TIMESTAMP(3),
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "durationUnit" "public"."DurationUnit",
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "hasActivePromotion" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isNegotiable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPriceOnRequest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastBumpedAt" TIMESTAMP(3),
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "maxGuests" INTEGER,
ADD COLUMN     "preferredContactMethod" TEXT,
ADD COLUMN     "promotionId" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "requirements" JSONB,
ADD COLUMN     "serviceLocation" "public"."ServiceLocationType",
ADD COLUMN     "serviceType" "public"."ServiceType",
ADD COLUMN     "shippingAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shippingFee" DOUBLE PRECISION,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "type" "public"."ListingType" NOT NULL,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."marketplace_orders" DROP COLUMN "notes",
ADD COLUMN     "buyerNotes" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "contactInfoRevealed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "discountAmount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "exchangeDescription" TEXT,
ADD COLUMN     "exchangeFulfilled" BOOLEAN DEFAULT false,
ADD COLUMN     "fulfillmentStatus" "public"."FulfillmentStatus" DEFAULT 'PENDING',
ADD COLUMN     "orderType" "public"."ListingType" NOT NULL,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "payoutDate" TIMESTAMP(3),
ADD COLUMN     "payoutStatus" "public"."PayoutStatus",
ADD COLUMN     "priceStructure" "public"."PriceStructureType",
ADD COLUMN     "pricingOptionId" TEXT NOT NULL,
ADD COLUMN     "pricingType" "public"."PaymentMethodType" NOT NULL,
ADD COLUMN     "promotionId" TEXT,
ADD COLUMN     "refundedAt" TIMESTAMP(3),
ADD COLUMN     "revealedAt" TIMESTAMP(3),
ADD COLUMN     "scheduledDate" TIMESTAMP(3),
ADD COLUMN     "scheduledTime" TEXT,
ADD COLUMN     "sellerNotes" TEXT,
ADD COLUMN     "serviceLocation" TEXT,
ADD COLUMN     "specialRequests" TEXT,
ADD COLUMN     "voucherCode" TEXT,
ADD COLUMN     "voucherId" TEXT,
ALTER COLUMN "quantity" SET DEFAULT 1,
ALTER COLUMN "unitPrice" DROP NOT NULL,
ALTER COLUMN "subtotal" DROP NOT NULL,
ALTER COLUMN "shippingFee" DROP NOT NULL,
ALTER COLUMN "totalAmount" DROP NOT NULL,
ALTER COLUMN "currency" DROP NOT NULL;

-- DropEnums (already dropped earlier, removing duplicate)
-- DROP TYPE "public"."BookingStatus";
-- DROP TYPE "public"."ServiceStatus";

-- CreateTable
CREATE TABLE "public"."marketplace_pricing_options" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "pricingType" "public"."PaymentMethodType" NOT NULL,
    "price" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'MYR',
    "priceStructure" "public"."PriceStructureType",
    "exchangeDescription" TEXT,
    "exchangeCategory" "public"."ExchangeCategory",
    "estimatedValue" DOUBLE PRECISION,
    "packageDetails" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "label" TEXT,
    "allowsVouchers" BOOLEAN NOT NULL DEFAULT true,
    "minOrderAmount" DOUBLE PRECISION,
    "maxOrderAmount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_pricing_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "marketplace_pricing_options_listingId_idx" ON "public"."marketplace_pricing_options"("listingId");

-- CreateIndex
CREATE INDEX "marketplace_pricing_options_pricingType_idx" ON "public"."marketplace_pricing_options"("pricingType");

-- CreateIndex
CREATE INDEX "marketplace_pricing_options_isDefault_idx" ON "public"."marketplace_pricing_options"("isDefault");

-- CreateIndex
CREATE INDEX "marketplace_listings_type_status_isActive_idx" ON "public"."marketplace_listings"("type", "status", "isActive");

-- CreateIndex
CREATE INDEX "marketplace_listings_category_status_idx" ON "public"."marketplace_listings"("category", "status");

-- CreateIndex
CREATE INDEX "marketplace_listings_location_idx" ON "public"."marketplace_listings"("location");

-- CreateIndex
CREATE INDEX "marketplace_listings_latitude_longitude_idx" ON "public"."marketplace_listings"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "marketplace_listings_publishedAt_idx" ON "public"."marketplace_listings"("publishedAt");

-- CreateIndex
CREATE INDEX "marketplace_listings_isFeatured_isActive_publishedAt_idx" ON "public"."marketplace_listings"("isFeatured", "isActive", "publishedAt");

-- CreateIndex
CREATE INDEX "marketplace_listings_hasActivePromotion_isActive_idx" ON "public"."marketplace_listings"("hasActivePromotion", "isActive");

-- CreateIndex
CREATE INDEX "marketplace_orders_pricingOptionId_idx" ON "public"."marketplace_orders"("pricingOptionId");

-- CreateIndex
CREATE INDEX "marketplace_orders_status_createdAt_idx" ON "public"."marketplace_orders"("status", "createdAt");

-- CreateIndex
CREATE INDEX "marketplace_orders_fulfillmentStatus_idx" ON "public"."marketplace_orders"("fulfillmentStatus");

-- CreateIndex
CREATE INDEX "marketplace_orders_scheduledDate_idx" ON "public"."marketplace_orders"("scheduledDate");

-- CreateIndex
CREATE INDEX "marketplace_orders_orderType_status_idx" ON "public"."marketplace_orders"("orderType", "status");

-- RenameForeignKey (removing duplicate/conflicting renames)
-- These constraints seem to have naming issues, skipping rename
-- ALTER TABLE "public"."homesurf_reviews" RENAME CONSTRAINT "homesurf_review_booking_guest_fkey" TO "homesurf_review_booking_host_fkey";
-- ALTER TABLE "public"."homesurf_reviews" RENAME CONSTRAINT "homesurf_review_booking_host_fkey" TO "homesurf_review_booking_guest_fkey";

-- AddForeignKey
ALTER TABLE "public"."marketplace_pricing_options" ADD CONSTRAINT "marketplace_pricing_options_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."marketplace_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marketplace_orders" ADD CONSTRAINT "marketplace_orders_pricingOptionId_fkey" FOREIGN KEY ("pricingOptionId") REFERENCES "public"."marketplace_pricing_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
