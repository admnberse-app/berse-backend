-- CreateEnum
CREATE TYPE "public"."user_setup_screen_type" AS ENUM ('PROFILE', 'NETWORK', 'COMMUNITY', 'PREFERENCES', 'TUTORIAL', 'VERIFICATION');

-- CreateTable
CREATE TABLE "public"."app_preview_screens" (
    "id" TEXT NOT NULL,
    "screenOrder" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "animationUrl" TEXT,
    "iconName" TEXT,
    "ctaText" TEXT,
    "ctaAction" TEXT,
    "backgroundColor" TEXT DEFAULT '#FFFFFF',
    "textColor" TEXT DEFAULT '#000000',
    "isSkippable" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "minAppVersion" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_preview_screens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."app_preview_analytics" (
    "id" TEXT NOT NULL,
    "screenId" TEXT NOT NULL,
    "sessionId" TEXT,
    "userId" TEXT,
    "viewed" BOOLEAN NOT NULL DEFAULT false,
    "viewedAt" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "skippedAt" TIMESTAMP(3),
    "timeSpentSeconds" INTEGER,
    "deviceInfo" JSONB,
    "appVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_preview_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_setup_screens" (
    "id" TEXT NOT NULL,
    "screenOrder" INTEGER NOT NULL,
    "screenType" "public"."user_setup_screen_type" NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "iconName" TEXT,
    "ctaText" TEXT,
    "ctaAction" TEXT,
    "ctaUrl" TEXT,
    "backgroundColor" TEXT DEFAULT '#FFFFFF',
    "textColor" TEXT DEFAULT '#000000',
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isSkippable" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "targetAudience" TEXT NOT NULL DEFAULT 'all',
    "requiredFields" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minAppVersion" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_setup_screens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_setup_analytics" (
    "id" TEXT NOT NULL,
    "screenId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "viewed" BOOLEAN NOT NULL DEFAULT false,
    "viewedAt" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "skippedAt" TIMESTAMP(3),
    "timeSpentSeconds" INTEGER,
    "actionsTaken" JSONB,
    "deviceInfo" JSONB,
    "appVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_setup_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "app_preview_screens_isActive_screenOrder_idx" ON "public"."app_preview_screens"("isActive", "screenOrder");

-- CreateIndex
CREATE INDEX "app_preview_analytics_screenId_viewed_idx" ON "public"."app_preview_analytics"("screenId", "viewed");

-- CreateIndex
CREATE INDEX "app_preview_analytics_sessionId_idx" ON "public"."app_preview_analytics"("sessionId");

-- CreateIndex
CREATE INDEX "app_preview_analytics_userId_idx" ON "public"."app_preview_analytics"("userId");

-- CreateIndex
CREATE INDEX "app_preview_analytics_createdAt_idx" ON "public"."app_preview_analytics"("createdAt");

-- CreateIndex
CREATE INDEX "user_setup_screens_isActive_screenOrder_idx" ON "public"."user_setup_screens"("isActive", "screenOrder");

-- CreateIndex
CREATE INDEX "user_setup_screens_screenType_idx" ON "public"."user_setup_screens"("screenType");

-- CreateIndex
CREATE INDEX "user_setup_screens_isRequired_idx" ON "public"."user_setup_screens"("isRequired");

-- CreateIndex
CREATE INDEX "user_setup_analytics_userId_completed_idx" ON "public"."user_setup_analytics"("userId", "completed");

-- CreateIndex
CREATE INDEX "user_setup_analytics_screenId_viewed_idx" ON "public"."user_setup_analytics"("screenId", "viewed");

-- CreateIndex
CREATE INDEX "user_setup_analytics_createdAt_idx" ON "public"."user_setup_analytics"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_setup_analytics_screenId_userId_key" ON "public"."user_setup_analytics"("screenId", "userId");

-- AddForeignKey
ALTER TABLE "public"."app_preview_analytics" ADD CONSTRAINT "app_preview_analytics_screenId_fkey" FOREIGN KEY ("screenId") REFERENCES "public"."app_preview_screens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_setup_analytics" ADD CONSTRAINT "user_setup_analytics_screenId_fkey" FOREIGN KEY ("screenId") REFERENCES "public"."user_setup_screens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_setup_analytics" ADD CONSTRAINT "user_setup_analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
