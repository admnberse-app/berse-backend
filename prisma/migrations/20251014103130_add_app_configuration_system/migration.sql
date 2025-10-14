-- CreateEnum
CREATE TYPE "public"."AppPlatform" AS ENUM ('IOS', 'ANDROID', 'WEB');

-- CreateEnum
CREATE TYPE "public"."LegalDocumentType" AS ENUM ('TOS', 'PRIVACY_POLICY', 'EULA', 'COOKIE_POLICY', 'COMMUNITY_GUIDELINES', 'REFUND_POLICY', 'ACCEPTABLE_USE');

-- CreateEnum
CREATE TYPE "public"."AnnouncementPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."MaintenanceStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DELAYED');

-- CreateEnum
CREATE TYPE "public"."AppNoticeType" AS ENUM ('INFO', 'WARNING', 'ERROR', 'SUCCESS', 'PROMOTION', 'UPDATE');

-- CreateTable
CREATE TABLE "public"."app_configs" (
    "id" TEXT NOT NULL,
    "configKey" TEXT NOT NULL,
    "configValue" TEXT NOT NULL,
    "dataType" TEXT NOT NULL DEFAULT 'string',
    "category" TEXT NOT NULL DEFAULT 'general',
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isEditable" BOOLEAN NOT NULL DEFAULT true,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."onboarding_screens" (
    "id" TEXT NOT NULL,
    "screenOrder" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "ctaText" TEXT,
    "ctaAction" TEXT,
    "ctaUrl" TEXT,
    "backgroundColor" TEXT,
    "isSkippable" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "targetAudience" TEXT NOT NULL DEFAULT 'all',
    "minAppVersion" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_screens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."onboarding_analytics" (
    "id" TEXT NOT NULL,
    "screenId" TEXT NOT NULL,
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

    CONSTRAINT "onboarding_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."app_versions" (
    "id" TEXT NOT NULL,
    "versionNumber" TEXT NOT NULL,
    "versionCode" INTEGER NOT NULL,
    "platform" "public"."AppPlatform" NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "releaseNotes" TEXT NOT NULL,
    "releaseType" TEXT NOT NULL DEFAULT 'stable',
    "isForceUpdate" BOOLEAN NOT NULL DEFAULT false,
    "minSupportedVersion" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "downloadUrl" TEXT,
    "storeUrl" TEXT,
    "features" JSONB,
    "bugFixes" JSONB,
    "improvements" JSONB,
    "deprecations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."legal_documents" (
    "id" TEXT NOT NULL,
    "documentType" "public"."LegalDocumentType" NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "requiresAcceptance" BOOLEAN NOT NULL DEFAULT false,
    "changesSummary" TEXT,
    "previousVersionId" TEXT,
    "createdBy" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."legal_document_acceptances" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceInfo" JSONB,
    "documentVersion" TEXT NOT NULL,
    "documentType" "public"."LegalDocumentType" NOT NULL,

    CONSTRAINT "legal_document_acceptances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "imageUrl" TEXT,
    "thumbnailUrl" TEXT,
    "videoUrl" TEXT,
    "priority" "public"."AnnouncementPriority" NOT NULL DEFAULT 'NORMAL',
    "displayType" TEXT NOT NULL DEFAULT 'banner',
    "targetAudience" TEXT NOT NULL DEFAULT 'all',
    "targetCountries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetUserSegment" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minAppVersion" TEXT,
    "ctaText" TEXT,
    "ctaUrl" TEXT,
    "ctaAction" TEXT,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isDismissible" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."announcement_analytics" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "userId" TEXT,
    "viewed" BOOLEAN NOT NULL DEFAULT false,
    "viewedAt" TIMESTAMP(3),
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "clickedAt" TIMESTAMP(3),
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "dismissedAt" TIMESTAMP(3),
    "viewedFrom" TEXT,
    "deviceInfo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcement_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."faqs" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "notHelpfulCount" INTEGER NOT NULL DEFAULT 0,
    "relatedFaqIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedArticleIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."faq_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "faq_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."faq_analytics" (
    "id" TEXT NOT NULL,
    "faqId" TEXT NOT NULL,
    "userId" TEXT,
    "viewed" BOOLEAN NOT NULL DEFAULT false,
    "viewedAt" TIMESTAMP(3),
    "markedHelpful" BOOLEAN,
    "markedAt" TIMESTAMP(3),
    "searchQuery" TEXT,
    "viewedFrom" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faq_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."help_articles" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "thumbnailUrl" TEXT,
    "videoUrl" TEXT,
    "attachments" JSONB,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metaDescription" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPremiumOnly" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "notHelpfulCount" INTEGER NOT NULL DEFAULT 0,
    "averageTimeSpent" DOUBLE PRECISION,
    "relatedArticleIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedFaqIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdBy" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "help_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."help_article_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "help_article_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."help_article_analytics" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "userId" TEXT,
    "viewed" BOOLEAN NOT NULL DEFAULT false,
    "viewedAt" TIMESTAMP(3),
    "markedHelpful" BOOLEAN,
    "markedAt" TIMESTAMP(3),
    "timeSpentSeconds" INTEGER,
    "scrollDepth" DOUBLE PRECISION,
    "viewedFrom" TEXT,
    "searchQuery" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "help_article_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."maintenance_schedules" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "estimatedDuration" INTEGER,
    "status" "public"."MaintenanceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "affectedFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isFullDowntime" BOOLEAN NOT NULL DEFAULT false,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "userMessage" TEXT,
    "technicalDetails" TEXT,
    "updates" JSONB,
    "notifyUsers" BOOLEAN NOT NULL DEFAULT true,
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "notifiedAt" TIMESTAMP(3),
    "actualStartTime" TIMESTAMP(3),
    "actualEndTime" TIMESTAMP(3),
    "completionNotes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."feature_flags" (
    "id" TEXT NOT NULL,
    "featureKey" TEXT NOT NULL,
    "featureName" TEXT NOT NULL,
    "description" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "rolloutPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "rolloutStrategy" TEXT NOT NULL DEFAULT 'percentage',
    "targetUserIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetSegments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetCountries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetPlatforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minAppVersion" TEXT,
    "maxAppVersion" TEXT,
    "isABTest" BOOLEAN NOT NULL DEFAULT false,
    "abTestVariant" TEXT,
    "abTestMetrics" JSONB,
    "enabledAt" TIMESTAMP(3),
    "disabledAt" TIMESTAMP(3),
    "scheduledEnableAt" TIMESTAMP(3),
    "scheduledDisableAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dependencies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."feature_flag_analytics" (
    "id" TEXT NOT NULL,
    "featureFlagId" TEXT NOT NULL,
    "userId" TEXT,
    "wasEnabled" BOOLEAN NOT NULL,
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "variant" TEXT,
    "userSegment" TEXT,
    "platform" TEXT,
    "appVersion" TEXT,
    "featureUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "usageCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "feature_flag_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."app_notices" (
    "id" TEXT NOT NULL,
    "noticeType" "public"."AppNoticeType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "icon" TEXT,
    "displayLocation" TEXT[] DEFAULT ARRAY['home']::TEXT[],
    "displayStyle" TEXT NOT NULL DEFAULT 'banner',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isDismissible" BOOLEAN NOT NULL DEFAULT true,
    "autoDismiss" BOOLEAN NOT NULL DEFAULT false,
    "autoDismissSeconds" INTEGER,
    "targetAudience" TEXT NOT NULL DEFAULT 'all',
    "targetUserIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetSegments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetCountries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minAppVersion" TEXT,
    "ctaText" TEXT,
    "ctaAction" TEXT,
    "ctaUrl" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "impressionCount" INTEGER NOT NULL DEFAULT 0,
    "dismissCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."app_notice_dismissals" (
    "id" TEXT NOT NULL,
    "noticeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dismissedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_notice_dismissals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_configs_configKey_key" ON "public"."app_configs"("configKey");

-- CreateIndex
CREATE INDEX "app_configs_configKey_idx" ON "public"."app_configs"("configKey");

-- CreateIndex
CREATE INDEX "app_configs_category_isPublic_idx" ON "public"."app_configs"("category", "isPublic");

-- CreateIndex
CREATE INDEX "onboarding_screens_screenOrder_isActive_idx" ON "public"."onboarding_screens"("screenOrder", "isActive");

-- CreateIndex
CREATE INDEX "onboarding_screens_isActive_idx" ON "public"."onboarding_screens"("isActive");

-- CreateIndex
CREATE INDEX "onboarding_analytics_screenId_viewed_idx" ON "public"."onboarding_analytics"("screenId", "viewed");

-- CreateIndex
CREATE INDEX "onboarding_analytics_userId_idx" ON "public"."onboarding_analytics"("userId");

-- CreateIndex
CREATE INDEX "onboarding_analytics_createdAt_idx" ON "public"."onboarding_analytics"("createdAt");

-- CreateIndex
CREATE INDEX "app_versions_platform_isCurrent_idx" ON "public"."app_versions"("platform", "isCurrent");

-- CreateIndex
CREATE INDEX "app_versions_platform_isActive_idx" ON "public"."app_versions"("platform", "isActive");

-- CreateIndex
CREATE INDEX "app_versions_releaseDate_idx" ON "public"."app_versions"("releaseDate");

-- CreateIndex
CREATE UNIQUE INDEX "app_versions_versionNumber_platform_key" ON "public"."app_versions"("versionNumber", "platform");

-- CreateIndex
CREATE INDEX "legal_documents_documentType_isCurrent_idx" ON "public"."legal_documents"("documentType", "isCurrent");

-- CreateIndex
CREATE INDEX "legal_documents_effectiveDate_idx" ON "public"."legal_documents"("effectiveDate");

-- CreateIndex
CREATE UNIQUE INDEX "legal_documents_documentType_version_key" ON "public"."legal_documents"("documentType", "version");

-- CreateIndex
CREATE INDEX "legal_document_acceptances_userId_documentType_idx" ON "public"."legal_document_acceptances"("userId", "documentType");

-- CreateIndex
CREATE INDEX "legal_document_acceptances_documentId_idx" ON "public"."legal_document_acceptances"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "legal_document_acceptances_userId_documentId_key" ON "public"."legal_document_acceptances"("userId", "documentId");

-- CreateIndex
CREATE INDEX "announcements_isActive_publishedAt_idx" ON "public"."announcements"("isActive", "publishedAt");

-- CreateIndex
CREATE INDEX "announcements_priority_isActive_idx" ON "public"."announcements"("priority", "isActive");

-- CreateIndex
CREATE INDEX "announcements_expiresAt_idx" ON "public"."announcements"("expiresAt");

-- CreateIndex
CREATE INDEX "announcements_isPinned_isActive_idx" ON "public"."announcements"("isPinned", "isActive");

-- CreateIndex
CREATE INDEX "announcement_analytics_announcementId_viewed_idx" ON "public"."announcement_analytics"("announcementId", "viewed");

-- CreateIndex
CREATE INDEX "announcement_analytics_userId_idx" ON "public"."announcement_analytics"("userId");

-- CreateIndex
CREATE INDEX "faqs_categoryId_isActive_idx" ON "public"."faqs"("categoryId", "isActive");

-- CreateIndex
CREATE INDEX "faqs_isFeatured_isActive_idx" ON "public"."faqs"("isFeatured", "isActive");

-- CreateIndex
CREATE INDEX "faqs_displayOrder_idx" ON "public"."faqs"("displayOrder");

-- CreateIndex
CREATE INDEX "faq_categories_displayOrder_isActive_idx" ON "public"."faq_categories"("displayOrder", "isActive");

-- CreateIndex
CREATE INDEX "faq_analytics_faqId_viewed_idx" ON "public"."faq_analytics"("faqId", "viewed");

-- CreateIndex
CREATE INDEX "faq_analytics_userId_idx" ON "public"."faq_analytics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "help_articles_slug_key" ON "public"."help_articles"("slug");

-- CreateIndex
CREATE INDEX "help_articles_categoryId_isActive_idx" ON "public"."help_articles"("categoryId", "isActive");

-- CreateIndex
CREATE INDEX "help_articles_slug_idx" ON "public"."help_articles"("slug");

-- CreateIndex
CREATE INDEX "help_articles_isFeatured_isActive_idx" ON "public"."help_articles"("isFeatured", "isActive");

-- CreateIndex
CREATE INDEX "help_articles_publishedAt_idx" ON "public"."help_articles"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "help_article_categories_slug_key" ON "public"."help_article_categories"("slug");

-- CreateIndex
CREATE INDEX "help_article_categories_displayOrder_isActive_idx" ON "public"."help_article_categories"("displayOrder", "isActive");

-- CreateIndex
CREATE INDEX "help_article_analytics_articleId_viewed_idx" ON "public"."help_article_analytics"("articleId", "viewed");

-- CreateIndex
CREATE INDEX "help_article_analytics_userId_idx" ON "public"."help_article_analytics"("userId");

-- CreateIndex
CREATE INDEX "maintenance_schedules_status_startTime_idx" ON "public"."maintenance_schedules"("status", "startTime");

-- CreateIndex
CREATE INDEX "maintenance_schedules_startTime_endTime_idx" ON "public"."maintenance_schedules"("startTime", "endTime");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_featureKey_key" ON "public"."feature_flags"("featureKey");

-- CreateIndex
CREATE INDEX "feature_flags_featureKey_isEnabled_idx" ON "public"."feature_flags"("featureKey", "isEnabled");

-- CreateIndex
CREATE INDEX "feature_flags_isEnabled_isGlobal_idx" ON "public"."feature_flags"("isEnabled", "isGlobal");

-- CreateIndex
CREATE INDEX "feature_flag_analytics_featureFlagId_wasEnabled_idx" ON "public"."feature_flag_analytics"("featureFlagId", "wasEnabled");

-- CreateIndex
CREATE INDEX "feature_flag_analytics_userId_idx" ON "public"."feature_flag_analytics"("userId");

-- CreateIndex
CREATE INDEX "feature_flag_analytics_evaluatedAt_idx" ON "public"."feature_flag_analytics"("evaluatedAt");

-- CreateIndex
CREATE INDEX "app_notices_isActive_startDate_endDate_idx" ON "public"."app_notices"("isActive", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "app_notices_noticeType_isActive_idx" ON "public"."app_notices"("noticeType", "isActive");

-- CreateIndex
CREATE INDEX "app_notices_priority_isActive_idx" ON "public"."app_notices"("priority", "isActive");

-- CreateIndex
CREATE INDEX "app_notice_dismissals_userId_idx" ON "public"."app_notice_dismissals"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "app_notice_dismissals_noticeId_userId_key" ON "public"."app_notice_dismissals"("noticeId", "userId");

-- AddForeignKey
ALTER TABLE "public"."onboarding_analytics" ADD CONSTRAINT "onboarding_analytics_screenId_fkey" FOREIGN KEY ("screenId") REFERENCES "public"."onboarding_screens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."legal_document_acceptances" ADD CONSTRAINT "legal_document_acceptances_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."legal_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."announcement_analytics" ADD CONSTRAINT "announcement_analytics_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "public"."announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."faqs" ADD CONSTRAINT "faqs_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."faq_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."faq_analytics" ADD CONSTRAINT "faq_analytics_faqId_fkey" FOREIGN KEY ("faqId") REFERENCES "public"."faqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."help_articles" ADD CONSTRAINT "help_articles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."help_article_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."help_article_analytics" ADD CONSTRAINT "help_article_analytics_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "public"."help_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."feature_flag_analytics" ADD CONSTRAINT "feature_flag_analytics_featureFlagId_fkey" FOREIGN KEY ("featureFlagId") REFERENCES "public"."feature_flags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."app_notice_dismissals" ADD CONSTRAINT "app_notice_dismissals_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "public"."app_notices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
