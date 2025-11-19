-- AlterTable
-- Make quantity nullable for unlimited stock rewards
ALTER TABLE "rewards" ALTER COLUMN "quantity" DROP NOT NULL,
ALTER COLUMN "quantity" DROP DEFAULT;
