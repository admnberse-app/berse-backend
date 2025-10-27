-- AlterTable
ALTER TABLE "public"."card_game_feedbacks" ADD COLUMN     "answerStartedAt" TIMESTAMP(3),
ADD COLUMN     "answerSubmittedAt" TIMESTAMP(3),
ADD COLUMN     "questionViewedAt" TIMESTAMP(3),
ADD COLUMN     "timeSpentSeconds" INTEGER;

-- AlterTable
ALTER TABLE "public"."card_game_sessions" ADD COLUMN     "appVersion" TEXT,
ADD COLUMN     "deviceOS" TEXT,
ADD COLUMN     "devicePlatform" TEXT,
ADD COLUMN     "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'in-progress',
ADD COLUMN     "totalDuration" INTEGER;

-- CreateTable
CREATE TABLE "public"."card_game_streaks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_game_streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."card_game_achievements" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "criteria" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_game_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_card_game_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_card_game_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "card_game_streaks_userId_key" ON "public"."card_game_streaks"("userId");

-- CreateIndex
CREATE INDEX "card_game_streaks_userId_currentStreak_idx" ON "public"."card_game_streaks"("userId", "currentStreak");

-- CreateIndex
CREATE UNIQUE INDEX "card_game_achievements_code_key" ON "public"."card_game_achievements"("code");

-- CreateIndex
CREATE INDEX "card_game_achievements_code_idx" ON "public"."card_game_achievements"("code");

-- CreateIndex
CREATE INDEX "user_card_game_achievements_userId_idx" ON "public"."user_card_game_achievements"("userId");

-- CreateIndex
CREATE INDEX "user_card_game_achievements_achievementId_idx" ON "public"."user_card_game_achievements"("achievementId");

-- CreateIndex
CREATE INDEX "user_card_game_achievements_unlockedAt_idx" ON "public"."user_card_game_achievements"("unlockedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_card_game_achievements_userId_achievementId_key" ON "public"."user_card_game_achievements"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "card_game_feedbacks_userId_topicId_sessionNumber_idx" ON "public"."card_game_feedbacks"("userId", "topicId", "sessionNumber");

-- CreateIndex
CREATE INDEX "card_game_sessions_userId_status_idx" ON "public"."card_game_sessions"("userId", "status");

-- CreateIndex
CREATE INDEX "card_game_sessions_topicId_completedAt_idx" ON "public"."card_game_sessions"("topicId", "completedAt");

-- AddForeignKey
ALTER TABLE "public"."card_game_streaks" ADD CONSTRAINT "card_game_streaks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_card_game_achievements" ADD CONSTRAINT "user_card_game_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_card_game_achievements" ADD CONSTRAINT "user_card_game_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "public"."card_game_achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
