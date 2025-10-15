-- AlterTable
ALTER TABLE "public"."user_locations" ADD COLUMN     "lastLocationUpdate" TIMESTAMP(3),
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "user_locations_latitude_longitude_idx" ON "public"."user_locations"("latitude", "longitude");
