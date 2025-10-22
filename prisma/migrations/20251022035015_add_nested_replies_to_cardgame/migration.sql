-- AlterTable
ALTER TABLE "public"."card_game_replies" ADD COLUMN     "parentReplyId" TEXT;

-- CreateIndex
CREATE INDEX "card_game_replies_parentReplyId_idx" ON "public"."card_game_replies"("parentReplyId");

-- AddForeignKey
ALTER TABLE "public"."card_game_replies" ADD CONSTRAINT "card_game_replies_parentReplyId_fkey" FOREIGN KEY ("parentReplyId") REFERENCES "public"."card_game_replies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
