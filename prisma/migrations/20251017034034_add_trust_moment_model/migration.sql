-- CreateTable
CREATE TABLE "public"."trust_moments" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "giverId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "eventId" TEXT,
    "momentType" TEXT NOT NULL DEFAULT 'general',
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "experienceDescription" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationSource" TEXT,
    "trustImpact" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trust_moments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trust_moments_eventId_idx" ON "public"."trust_moments"("eventId");

-- CreateIndex
CREATE INDEX "trust_moments_giverId_idx" ON "public"."trust_moments"("giverId");

-- CreateIndex
CREATE INDEX "trust_moments_receiverId_idx" ON "public"."trust_moments"("receiverId");

-- CreateIndex
CREATE INDEX "trust_moments_momentType_idx" ON "public"."trust_moments"("momentType");

-- CreateIndex
CREATE INDEX "trust_moments_rating_idx" ON "public"."trust_moments"("rating");

-- CreateIndex
CREATE INDEX "trust_moments_isPublic_idx" ON "public"."trust_moments"("isPublic");

-- CreateIndex
CREATE INDEX "trust_moments_createdAt_idx" ON "public"."trust_moments"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "trust_moments_connectionId_giverId_eventId_key" ON "public"."trust_moments"("connectionId", "giverId", "eventId");

-- AddForeignKey
ALTER TABLE "public"."trust_moments" ADD CONSTRAINT "trust_moments_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trust_moments" ADD CONSTRAINT "trust_moments_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "public"."user_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trust_moments" ADD CONSTRAINT "trust_moments_giverId_fkey" FOREIGN KEY ("giverId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trust_moments" ADD CONSTRAINT "trust_moments_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
