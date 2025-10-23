-- AlterTable
ALTER TABLE "public"."badges" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."communities" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."events" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "communities_city_idx" ON "public"."communities"("city");

-- CreateIndex
CREATE INDEX "communities_country_idx" ON "public"."communities"("country");

-- CreateIndex
CREATE INDEX "communities_latitude_longitude_idx" ON "public"."communities"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "events_city_idx" ON "public"."events"("city");

-- CreateIndex
CREATE INDEX "events_country_idx" ON "public"."events"("country");

-- CreateIndex
CREATE INDEX "events_latitude_longitude_idx" ON "public"."events"("latitude", "longitude");

-- RenameForeignKey
ALTER TABLE "public"."homesurf_reviews" RENAME CONSTRAINT "homesurf_reviews_bookingId_fkey" TO "homesurf_review_booking_host_fkey";
