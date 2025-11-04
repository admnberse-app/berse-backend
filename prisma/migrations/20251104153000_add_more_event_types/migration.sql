-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.

ALTER TYPE "public"."EventType" ADD VALUE 'EDUCATIONAL';
ALTER TYPE "public"."EventType" ADD VALUE 'NETWORKING';
ALTER TYPE "public"."EventType" ADD VALUE 'WORKSHOP';
ALTER TYPE "public"."EventType" ADD VALUE 'CONFERENCE';
ALTER TYPE "public"."EventType" ADD VALUE 'CHARITY';
ALTER TYPE "public"."EventType" ADD VALUE 'RELIGIOUS';
ALTER TYPE "public"."EventType" ADD VALUE 'CULTURAL';
ALTER TYPE "public"."EventType" ADD VALUE 'OTHERS';
