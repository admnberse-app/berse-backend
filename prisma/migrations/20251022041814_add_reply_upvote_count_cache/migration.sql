-- AlterTable
ALTER TABLE "public"."card_game_replies" ADD COLUMN     "upvoteCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "card_game_replies_upvoteCount_idx" ON "public"."card_game_replies"("upvoteCount");
