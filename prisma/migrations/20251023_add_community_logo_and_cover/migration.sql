-- AlterTable
-- Replace imageUrl with logoUrl and add coverImageUrl to communities table
ALTER TABLE "communities" RENAME COLUMN "imageUrl" TO "logoUrl";
ALTER TABLE "communities" ADD COLUMN "coverImageUrl" TEXT;

-- Add comment
COMMENT ON COLUMN "communities"."logoUrl" IS 'Community logo image URL';
COMMENT ON COLUMN "communities"."coverImageUrl" IS 'Community cover/banner image URL';
