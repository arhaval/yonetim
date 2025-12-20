-- Migration: Add contentCreatorId and voiceActorId to FinancialRecord
-- Run this SQL directly in Supabase SQL Editor

-- Add contentCreatorId column
ALTER TABLE "FinancialRecord" 
ADD COLUMN IF NOT EXISTS "contentCreatorId" TEXT;

-- Add voiceActorId column
ALTER TABLE "FinancialRecord" 
ADD COLUMN IF NOT EXISTS "voiceActorId" TEXT;

-- Add foreign key constraints
DO $$ 
BEGIN
    -- Add foreign key for ContentCreator if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'FinancialRecord_contentCreatorId_fkey'
    ) THEN
        ALTER TABLE "FinancialRecord"
        ADD CONSTRAINT "FinancialRecord_contentCreatorId_fkey" 
        FOREIGN KEY ("contentCreatorId") 
        REFERENCES "ContentCreator"("id") 
        ON DELETE SET NULL;
    END IF;

    -- Add foreign key for VoiceActor if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'FinancialRecord_voiceActorId_fkey'
    ) THEN
        ALTER TABLE "FinancialRecord"
        ADD CONSTRAINT "FinancialRecord_voiceActorId_fkey" 
        FOREIGN KEY ("voiceActorId") 
        REFERENCES "VoiceActor"("id") 
        ON DELETE SET NULL;
    END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS "FinancialRecord_contentCreatorId_idx" 
ON "FinancialRecord"("contentCreatorId");

CREATE INDEX IF NOT EXISTS "FinancialRecord_voiceActorId_idx" 
ON "FinancialRecord"("voiceActorId");

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'FinancialRecord'
AND column_name IN ('contentCreatorId', 'voiceActorId');

