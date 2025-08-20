-- Create table for BerseCardGame feedback and ratings
CREATE TABLE "CardGameFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "sessionNumber" INTEGER NOT NULL,
    "questionId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardGameFeedback_pkey" PRIMARY KEY ("id")
);

-- Add foreign key to User
ALTER TABLE "CardGameFeedback" ADD CONSTRAINT "CardGameFeedback_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create index for efficient queries
CREATE INDEX "CardGameFeedback_userId_idx" ON "CardGameFeedback"("userId");
CREATE INDEX "CardGameFeedback_topicId_idx" ON "CardGameFeedback"("topicId");
CREATE INDEX "CardGameFeedback_questionId_idx" ON "CardGameFeedback"("questionId");

-- Create table for storing topic statistics
CREATE TABLE "CardGameStats" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalFeedback" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardGameStats_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CardGameStats_topicId_key" ON "CardGameStats"("topicId");