/*
  Warnings:

  - You are about to drop the `user_service_profiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."user_service_profiles" DROP CONSTRAINT "user_service_profiles_userId_fkey";

-- DropTable
DROP TABLE "public"."user_service_profiles";
