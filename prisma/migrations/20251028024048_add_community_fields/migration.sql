-- AlterTable
ALTER TABLE "public"."communities" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "guidelines" TEXT,
ADD COLUMN     "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "socialLinks" JSONB,
ADD COLUMN     "websiteUrl" TEXT;
