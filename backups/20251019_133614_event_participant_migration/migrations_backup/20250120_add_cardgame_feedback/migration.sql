-- Create table for BerseCardGame feedback and ratings
CREATE TABLE IF NOT EXISTS "CardGameFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "sessionNumber" INTEGER NOT NULL,
    "questionId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardGameFeedback_pkey" PRIMARY KEY ("id")
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS "CardGameFeedback_userId_idx" ON "CardGameFeedback"("userId");
CREATE INDEX IF NOT EXISTS "CardGameFeedback_topicId_idx" ON "CardGameFeedback"("topicId");
CREATE INDEX IF NOT EXISTS "CardGameFeedback_questionId_idx" ON "CardGameFeedback"("questionId");

-- Create table for storing topic statistics
CREATE TABLE IF NOT EXISTS "CardGameStats" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalFeedback" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardGameStats_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CardGameStats_topicId_key" ON "CardGameStats"("topicId");