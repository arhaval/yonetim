-- Add new fields to VoiceoverScript table
-- Mevcut verileri bozmadan güvenli varsayılanlarla ekle

-- voiceLink alanı ekle (audioFile'dan kopyala, sonra audioFile deprecated olacak)
ALTER TABLE "VoiceoverScript" ADD COLUMN IF NOT EXISTS "voiceLink" TEXT;

-- Mevcut audioFile değerlerini voiceLink'e kopyala
UPDATE "VoiceoverScript" SET "voiceLink" = "audioFile" WHERE "audioFile" IS NOT NULL AND "voiceLink" IS NULL;

-- Producer approval alanları
ALTER TABLE "VoiceoverScript" ADD COLUMN IF NOT EXISTS "producerApproved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "VoiceoverScript" ADD COLUMN IF NOT EXISTS "producerApprovedAt" TIMESTAMP(3);
ALTER TABLE "VoiceoverScript" ADD COLUMN IF NOT EXISTS "producerApprovedBy" TEXT;

-- Admin approval alanları
ALTER TABLE "VoiceoverScript" ADD COLUMN IF NOT EXISTS "adminApproved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "VoiceoverScript" ADD COLUMN IF NOT EXISTS "adminApprovedAt" TIMESTAMP(3);
ALTER TABLE "VoiceoverScript" ADD COLUMN IF NOT EXISTS "adminApprovedBy" TEXT;

-- price'ı nullable yap (şu an default 0, nullable yapmak için önce default'u kaldır)
ALTER TABLE "VoiceoverScript" ALTER COLUMN "price" DROP NOT NULL;
ALTER TABLE "VoiceoverScript" ALTER COLUMN "price" DROP DEFAULT;

-- Foreign key constraints ekle
-- producerApprovedBy -> User.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'VoiceoverScript_producerApprovedBy_fkey'
  ) THEN
    ALTER TABLE "VoiceoverScript" ADD CONSTRAINT "VoiceoverScript_producerApprovedBy_fkey" 
      FOREIGN KEY ("producerApprovedBy") REFERENCES "users"("id") ON DELETE SET NULL;
  END IF;
END $$;

-- adminApprovedBy -> User.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'VoiceoverScript_adminApprovedBy_fkey'
  ) THEN
    ALTER TABLE "VoiceoverScript" ADD CONSTRAINT "VoiceoverScript_adminApprovedBy_fkey" 
      FOREIGN KEY ("adminApprovedBy") REFERENCES "users"("id") ON DELETE SET NULL;
  END IF;
END $$;

