-- Add passwordVersion field to user_security table for immediate token invalidation
-- This field is incremented whenever the password changes, invalidating all existing tokens

ALTER TABLE "user_security" 
ADD COLUMN IF NOT EXISTS "passwordVersion" INTEGER NOT NULL DEFAULT 1;

-- Set initial password version for all existing users
UPDATE "user_security" 
SET "passwordVersion" = 1 
WHERE "passwordVersion" IS NULL;
