-- AlterTable
ALTER TABLE "public"."user_privacy" ADD COLUMN IF NOT EXISTS "allowMessagesViaPhone" BOOLEAN NOT NULL DEFAULT true;
