-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."email_change_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "oldEmail" TEXT NOT NULL,
    "newEmail" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_change_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "email_change_requests_token_key" ON "public"."email_change_requests"("token");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "email_change_requests_token_idx" ON "public"."email_change_requests"("token");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "email_change_requests_userId_idx" ON "public"."email_change_requests"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "email_change_requests_expiresAt_idx" ON "public"."email_change_requests"("expiresAt");

-- AddForeignKey
ALTER TABLE "public"."email_change_requests" ADD CONSTRAINT "email_change_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
