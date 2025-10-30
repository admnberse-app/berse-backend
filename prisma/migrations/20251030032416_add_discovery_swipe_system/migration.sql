-- CreateEnum
CREATE TYPE "public"."SwipeAction" AS ENUM ('SKIP', 'INTERESTED');

-- CreateTable
CREATE TABLE "public"."user_swipes" (
    "id" TEXT NOT NULL,
    "swiperId" TEXT NOT NULL,
    "swipedUserId" TEXT NOT NULL,
    "action" "public"."SwipeAction" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "skipCount" INTEGER NOT NULL DEFAULT 0,
    "connectionSent" BOOLEAN NOT NULL DEFAULT false,
    "connectionId" TEXT,
    "shownInContext" TEXT,
    "distanceKm" DOUBLE PRECISION,

    CONSTRAINT "user_swipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."discovery_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "filters" JSONB,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "totalShown" INTEGER NOT NULL DEFAULT 0,
    "totalInterested" INTEGER NOT NULL DEFAULT 0,
    "totalSkips" INTEGER NOT NULL DEFAULT 0,
    "totalConnections" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "discovery_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_swipes_swiperId_swipedUserId_idx" ON "public"."user_swipes"("swiperId", "swipedUserId");

-- CreateIndex
CREATE INDEX "user_swipes_swiperId_action_idx" ON "public"."user_swipes"("swiperId", "action");

-- CreateIndex
CREATE INDEX "user_swipes_swipedUserId_idx" ON "public"."user_swipes"("swipedUserId");

-- CreateIndex
CREATE INDEX "user_swipes_skipCount_idx" ON "public"."user_swipes"("skipCount");

-- CreateIndex
CREATE INDEX "user_swipes_createdAt_idx" ON "public"."user_swipes"("createdAt");

-- CreateIndex
CREATE INDEX "discovery_sessions_userId_startedAt_idx" ON "public"."discovery_sessions"("userId", "startedAt");

-- AddForeignKey
ALTER TABLE "public"."user_swipes" ADD CONSTRAINT "user_swipes_swiperId_fkey" FOREIGN KEY ("swiperId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_swipes" ADD CONSTRAINT "user_swipes_swipedUserId_fkey" FOREIGN KEY ("swipedUserId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."discovery_sessions" ADD CONSTRAINT "discovery_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
