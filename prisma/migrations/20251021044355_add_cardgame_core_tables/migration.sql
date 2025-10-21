-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."NotificationType" ADD VALUE 'SOCIAL';
ALTER TYPE "public"."NotificationType" ADD VALUE 'CONNECTION';
ALTER TYPE "public"."NotificationType" ADD VALUE 'ACHIEVEMENT';
ALTER TYPE "public"."NotificationType" ADD VALUE 'REMINDER';
ALTER TYPE "public"."NotificationType" ADD VALUE 'COMMUNITY';
ALTER TYPE "public"."NotificationType" ADD VALUE 'TRAVEL';

-- AlterEnum
ALTER TYPE "public"."PayoutStatus" ADD VALUE 'FROZEN';

-- AlterTable
ALTER TABLE "public"."card_game_feedbacks" ADD COLUMN     "isHelpful" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "questionText" TEXT,
ADD COLUMN     "topicTitle" TEXT;

-- AlterTable
ALTER TABLE "public"."payout_distributions" ADD COLUMN     "autoReleaseEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "canReleaseAt" TIMESTAMP(3),
ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "holdReason" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "requiresManualReview" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "status" SET DEFAULT 'HELD';

-- CreateTable
CREATE TABLE "public"."card_game_topics" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "gradient" TEXT,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_game_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."card_game_questions" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "sessionNumber" INTEGER NOT NULL,
    "questionOrder" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_game_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."card_game_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "sessionNumber" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "totalQuestions" INTEGER NOT NULL,
    "questionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION,

    CONSTRAINT "card_game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trust_score_histories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "change" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "previousScore" DOUBLE PRECISION,
    "reason" TEXT,
    "component" TEXT,
    "relatedEntityType" TEXT,
    "relatedEntityId" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trust_score_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."platform_configs" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."config_history" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "oldValue" JSONB NOT NULL,
    "newValue" JSONB NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "config_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "card_game_topics_isActive_displayOrder_idx" ON "public"."card_game_topics"("isActive", "displayOrder");

-- CreateIndex
CREATE INDEX "card_game_questions_topicId_idx" ON "public"."card_game_questions"("topicId");

-- CreateIndex
CREATE INDEX "card_game_questions_topicId_sessionNumber_idx" ON "public"."card_game_questions"("topicId", "sessionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "card_game_questions_topicId_sessionNumber_questionOrder_key" ON "public"."card_game_questions"("topicId", "sessionNumber", "questionOrder");

-- CreateIndex
CREATE INDEX "card_game_sessions_userId_idx" ON "public"."card_game_sessions"("userId");

-- CreateIndex
CREATE INDEX "card_game_sessions_topicId_idx" ON "public"."card_game_sessions"("topicId");

-- CreateIndex
CREATE INDEX "card_game_sessions_userId_completedAt_idx" ON "public"."card_game_sessions"("userId", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "card_game_sessions_userId_topicId_sessionNumber_key" ON "public"."card_game_sessions"("userId", "topicId", "sessionNumber");

-- CreateIndex
CREATE INDEX "trust_score_histories_userId_timestamp_idx" ON "public"."trust_score_histories"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "trust_score_histories_userId_component_idx" ON "public"."trust_score_histories"("userId", "component");

-- CreateIndex
CREATE INDEX "trust_score_histories_timestamp_idx" ON "public"."trust_score_histories"("timestamp");

-- CreateIndex
CREATE INDEX "platform_configs_category_idx" ON "public"."platform_configs"("category");

-- CreateIndex
CREATE UNIQUE INDEX "platform_configs_category_key_key" ON "public"."platform_configs"("category", "key");

-- CreateIndex
CREATE INDEX "config_history_configId_idx" ON "public"."config_history"("configId");

-- CreateIndex
CREATE INDEX "config_history_changedAt_idx" ON "public"."config_history"("changedAt");

-- CreateIndex
CREATE INDEX "config_history_category_key_idx" ON "public"."config_history"("category", "key");

-- CreateIndex
CREATE INDEX "payout_distributions_canReleaseAt_status_autoReleaseEnabled_idx" ON "public"."payout_distributions"("canReleaseAt", "status", "autoReleaseEnabled");

-- CreateIndex
CREATE INDEX "payout_distributions_status_requiresManualReview_idx" ON "public"."payout_distributions"("status", "requiresManualReview");

-- AddForeignKey
ALTER TABLE "public"."card_game_feedbacks" ADD CONSTRAINT "card_game_feedbacks_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."card_game_topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."card_game_questions" ADD CONSTRAINT "card_game_questions_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."card_game_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."card_game_sessions" ADD CONSTRAINT "card_game_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."card_game_sessions" ADD CONSTRAINT "card_game_sessions_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."card_game_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trust_score_histories" ADD CONSTRAINT "trust_score_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
