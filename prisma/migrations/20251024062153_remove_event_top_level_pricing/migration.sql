/*
  Warnings:

  - You are about to drop the column `organizerPayout` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `platformFee` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `ticketsSold` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `totalRevenue` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."events" DROP COLUMN "organizerPayout",
DROP COLUMN "platformFee",
DROP COLUMN "price",
DROP COLUMN "ticketsSold",
DROP COLUMN "totalRevenue";
