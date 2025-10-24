-- Marketplace Unification Data Migration Script
-- This script migrates existing data to the new unified marketplace structure
-- 
-- IMPORTANT: Run this AFTER applying the Prisma migration
-- 
-- Steps:
-- 1. Add new columns to existing tables
-- 2. Migrate existing MarketplaceListing data (set type=PRODUCT)
-- 3. Create default pricing options for existing listings
-- 4. Migrate Service data to MarketplaceListing (if Service table exists)
-- 5. Migrate ServiceBooking data to MarketplaceOrder (if ServiceBooking table exists)
-- 6. Drop old Service and ServiceBooking tables

-- ============================================================================
-- STEP 1: Add new columns to MarketplaceListing
-- ============================================================================

-- Note: These will be added by Prisma migration, but explicitly listing for clarity
-- ALTER TABLE "MarketplaceListing" ADD COLUMN IF NOT EXISTS "type" "ListingType" NOT NULL DEFAULT 'PRODUCT';
-- ALTER TABLE "MarketplaceListing" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
-- ALTER TABLE "MarketplaceListing" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
-- ... (all other new columns from schema.prisma)

-- ============================================================================
-- STEP 2: Migrate existing MarketplaceListing data
-- ============================================================================

-- Set type=PRODUCT for all existing listings
UPDATE "MarketplaceListing"
SET "type" = 'PRODUCT'
WHERE "type" IS NULL;

-- Set default values for new boolean fields
UPDATE "MarketplaceListing"
SET 
  "isNegotiable" = FALSE,
  "isPriceOnRequest" = FALSE,
  "allowDirectContact" = FALSE,
  "hasActivePromotion" = FALSE
WHERE "isNegotiable" IS NULL;

-- ============================================================================
-- STEP 3: Create default pricing options for existing listings
-- ============================================================================

-- For each existing MarketplaceListing with a price, create a default MONEY pricing option
INSERT INTO "MarketplacePricingOption" (
  "id",
  "listingId",
  "pricingType",
  "priceStructure",
  "price",
  "currency",
  "isActive",
  "displayOrder",
  "createdAt",
  "updatedAt"
)
SELECT 
  cuid() as "id",
  ml."id" as "listingId",
  'MONEY' as "pricingType",
  'FIXED' as "priceStructure",
  ml."price" as "price",
  'MYR' as "currency",
  TRUE as "isActive",
  1 as "displayOrder",
  NOW() as "createdAt",
  NOW() as "updatedAt"
FROM "MarketplaceListing" ml
WHERE ml."price" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "MarketplacePricingOption" mpo 
    WHERE mpo."listingId" = ml."id"
  );

-- ============================================================================
-- STEP 4: Migrate Service data to MarketplaceListing (if table exists)
-- ============================================================================

-- Check if Service table exists before migration
-- Run this only if you have existing Service records

/*
INSERT INTO "MarketplaceListing" (
  "id",
  "userId",
  "type",
  "title",
  "description",
  "category",
  "location",
  "address",
  "latitude",
  "longitude",
  "serviceType",
  "serviceLocation",
  "duration",
  "durationUnit",
  "maxGuests",
  "requirements",
  "isNegotiable",
  "allowDirectContact",
  "status",
  "isActive",
  "viewCount",
  "createdAt",
  "updatedAt"
)
SELECT 
  s."id",
  s."providerId" as "userId",
  'SERVICE' as "type",
  s."title",
  s."description",
  'OTHER' as "category", -- Map to appropriate category
  s."location",
  s."address",
  s."latitude",
  s."longitude",
  s."serviceType",
  s."serviceLocation",
  s."duration",
  s."durationUnit",
  s."maxGuests",
  s."requirements",
  s."isNegotiable",
  TRUE as "allowDirectContact",
  CASE 
    WHEN s."status" = 'ACTIVE' THEN 'ACTIVE'
    WHEN s."status" = 'PAUSED' THEN 'INACTIVE'
    WHEN s."status" = 'DRAFT' THEN 'DRAFT'
    ELSE 'INACTIVE'
  END as "status",
  CASE WHEN s."status" = 'ACTIVE' THEN TRUE ELSE FALSE END as "isActive",
  0 as "viewCount",
  s."createdAt",
  s."updatedAt"
FROM "Service" s
WHERE NOT EXISTS (
  SELECT 1 FROM "MarketplaceListing" ml WHERE ml."id" = s."id"
);

-- Create pricing options for migrated services
INSERT INTO "MarketplacePricingOption" (
  "id",
  "listingId",
  "pricingType",
  "priceStructure",
  "price",
  "currency",
  "isActive",
  "displayOrder",
  "createdAt",
  "updatedAt"
)
SELECT 
  cuid() as "id",
  s."id" as "listingId",
  'MONEY' as "pricingType",
  s."pricingType" as "priceStructure",
  s."basePrice" as "price",
  'MYR' as "currency",
  TRUE as "isActive",
  1 as "displayOrder",
  NOW() as "createdAt",
  NOW() as "updatedAt"
FROM "Service" s
WHERE s."basePrice" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "MarketplacePricingOption" mpo 
    WHERE mpo."listingId" = s."id"
  );
*/

-- ============================================================================
-- STEP 5: Migrate ServiceBooking data to MarketplaceOrder (if table exists)
-- ============================================================================

/*
INSERT INTO "MarketplaceOrder" (
  "id",
  "buyerId",
  "sellerId",
  "listingId",
  "orderType",
  "quantity",
  "totalPrice",
  "currency",
  "scheduledDate",
  "scheduledTime",
  "notes",
  "status",
  "fulfillmentStatus",
  "createdAt",
  "updatedAt"
)
SELECT 
  sb."id",
  sb."customerId" as "buyerId",
  s."providerId" as "sellerId",
  sb."serviceId" as "listingId",
  'SERVICE' as "orderType",
  1 as "quantity",
  sb."totalPrice",
  'MYR' as "currency",
  sb."scheduledDate",
  sb."scheduledTime",
  sb."notes",
  CASE 
    WHEN sb."status" = 'PENDING' THEN 'PENDING'
    WHEN sb."status" = 'CONFIRMED' THEN 'CONFIRMED'
    WHEN sb."status" = 'COMPLETED' THEN 'COMPLETED'
    WHEN sb."status" = 'CANCELLED' THEN 'CANCELLED'
    ELSE 'PENDING'
  END as "status",
  CASE 
    WHEN sb."status" = 'COMPLETED' THEN 'FULFILLED'
    WHEN sb."status" = 'CONFIRMED' THEN 'IN_PROGRESS'
    WHEN sb."status" = 'CANCELLED' THEN 'CANCELLED'
    ELSE 'PENDING'
  END as "fulfillmentStatus",
  sb."createdAt",
  sb."updatedAt"
FROM "ServiceBooking" sb
JOIN "Service" s ON s."id" = sb."serviceId"
WHERE NOT EXISTS (
  SELECT 1 FROM "MarketplaceOrder" mo WHERE mo."id" = sb."id"
);
*/

-- ============================================================================
-- STEP 6: Drop old tables (ONLY after verifying migration success)
-- ============================================================================

-- DO NOT run these commands until you've verified the data migration!
-- 
-- DROP TABLE IF EXISTS "ServiceBooking" CASCADE;
-- DROP TABLE IF EXISTS "Service" CASCADE;
-- DROP TYPE IF EXISTS "BookingStatus";
-- DROP TYPE IF EXISTS "ServiceStatus";

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these after migration to verify success:
/*
-- Check listing counts by type
SELECT "type", COUNT(*) 
FROM "MarketplaceListing" 
GROUP BY "type";

-- Check pricing options
SELECT COUNT(*) as "total_pricing_options"
FROM "MarketplacePricingOption";

-- Check orders by type
SELECT "orderType", COUNT(*) 
FROM "MarketplaceOrder" 
GROUP BY "orderType";

-- Verify all listings have at least one pricing option
SELECT COUNT(*) as "listings_without_pricing"
FROM "MarketplaceListing" ml
WHERE NOT EXISTS (
  SELECT 1 FROM "MarketplacePricingOption" mpo 
  WHERE mpo."listingId" = ml."id"
);
*/
