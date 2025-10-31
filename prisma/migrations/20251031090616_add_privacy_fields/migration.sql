-- DropIndex
DROP INDEX "public"."user_security_passwordVersion_idx";

-- AlterTable
ALTER TABLE "public"."user_privacy" ADD COLUMN     "locationPrecision" TEXT NOT NULL DEFAULT 'city',
ADD COLUMN     "searchableByUsername" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showLocation" BOOLEAN NOT NULL DEFAULT true;
