-- Add unique constraints to prevent duplicate onboarding screens
ALTER TABLE "app_preview_screens" ADD CONSTRAINT "app_preview_screens_title_screenOrder_key" UNIQUE ("title", "screenOrder");
ALTER TABLE "user_setup_screens" ADD CONSTRAINT "user_setup_screens_title_screenOrder_key" UNIQUE ("title", "screenOrder");
