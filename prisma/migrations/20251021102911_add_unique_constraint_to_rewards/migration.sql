-- Add unique constraint to rewards to prevent duplicates
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_title_category_key" UNIQUE ("title", "category");
