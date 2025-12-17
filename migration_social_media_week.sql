-- Migration: Add week field to SocialMediaStats table for weekly tracking
-- This migration adds support for both monthly and weekly social media tracking

-- Step 1: Make month field nullable (if not already)
ALTER TABLE "SocialMediaStats" 
ALTER COLUMN "month" DROP NOT NULL;

-- Step 2: Add week field
ALTER TABLE "SocialMediaStats" 
ADD COLUMN IF NOT EXISTS "week" TEXT;

-- Step 3: Drop the old unique constraint
ALTER TABLE "SocialMediaStats" 
DROP CONSTRAINT IF EXISTS "SocialMediaStats_month_platform_key";

-- Step 4: Add new unique constraint for month, week, and platform combination
ALTER TABLE "SocialMediaStats" 
ADD CONSTRAINT "SocialMediaStats_month_week_platform_key" 
UNIQUE ("month", "week", "platform");

