-- CreateTable
CREATE TABLE "public"."card_game_reply_upvotes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "replyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_game_reply_upvotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "card_game_reply_upvotes_replyId_idx" ON "public"."card_game_reply_upvotes"("replyId");

-- CreateIndex
CREATE INDEX "card_game_reply_upvotes_userId_idx" ON "public"."card_game_reply_upvotes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "card_game_reply_upvotes_userId_replyId_key" ON "public"."card_game_reply_upvotes"("userId", "replyId");

-- AddForeignKey
ALTER TABLE "public"."card_game_reply_upvotes" ADD CONSTRAINT "card_game_reply_upvotes_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "public"."card_game_replies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."card_game_reply_upvotes" ADD CONSTRAINT "card_game_reply_upvotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
