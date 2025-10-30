-- AlterTable
ALTER TABLE "public"."discovery_sessions" ADD COLUMN     "shownUserIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
