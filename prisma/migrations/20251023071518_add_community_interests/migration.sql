-- AlterTable
ALTER TABLE "public"."communities" ADD COLUMN IF NOT EXISTS "interests" TEXT[] DEFAULT ARRAY[]::TEXT[];
