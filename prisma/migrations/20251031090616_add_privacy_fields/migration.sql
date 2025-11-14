-- AlterTable
ALTER TABLE "public"."user_privacy" ADD COLUMN IF NOT EXISTS "locationPrecision" TEXT NOT NULL DEFAULT 'city',
ADD COLUMN IF NOT EXISTS "searchableByUsername" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "showLocation" BOOLEAN NOT NULL DEFAULT true;
