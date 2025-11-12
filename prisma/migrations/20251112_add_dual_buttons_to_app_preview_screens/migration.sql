-- AlterTable
-- Add primaryButton and secondaryButton JSON fields to support dual buttons on app preview screens
ALTER TABLE "app_preview_screens" ADD COLUMN "primaryButton" JSONB,
ADD COLUMN "secondaryButton" JSONB;

-- Add comments for clarity
COMMENT ON COLUMN "app_preview_screens"."primaryButton" IS 'Primary button configuration: { text: string, action: string, style?: string, icon?: string }';
COMMENT ON COLUMN "app_preview_screens"."secondaryButton" IS 'Secondary button configuration: { text: string, action: string, style?: string, icon?: string }';
