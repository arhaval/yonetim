# Todo Tablosu ve Notes Sütunu Oluşturma - Supabase SQL Editor

## 🎯 Sorun
`npx prisma db push` çalışmıyor çünkü database bağlantı hatası var.

## ✅ Çözüm: Supabase SQL Editor'den Manuel Oluşturma

### Adım 1: Supabase Dashboard'a Git
1. https://supabase.com/dashboard adresine git
2. Projenizi seçin
3. Sol menüden **SQL Editor**'e tıklayın

### Adım 2: SQL Komutunu Çalıştır
Aşağıdaki SQL komutunu kopyalayıp SQL Editor'e yapıştırın ve **RUN** butonuna tıklayın:

```sql
-- Todo tablosunu oluştur (eğer yoksa)
CREATE TABLE IF NOT EXISTS "Todo" (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index'leri oluştur
CREATE INDEX IF NOT EXISTS "Todo_completed_idx" ON "Todo"("completed");
CREATE INDEX IF NOT EXISTS "Todo_createdAt_idx" ON "Todo"("createdAt");

-- Eğer tablo zaten varsa, sadece notes sütununu ekle
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'Todo'
    ) THEN
        -- Tablo var, sadece notes sütununu ekle
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'Todo' AND column_name = 'notes'
        ) THEN
            ALTER TABLE "Todo" ADD COLUMN "notes" TEXT;
        END IF;
    END IF;
END $$;
```

### Adım 3: Kontrol Et
Komut başarılı olduğunda şu mesajı göreceksiniz:
```
Success. No rows returned
```

## 🔍 Alternatif: Eğer IF NOT EXISTS Çalışmazsa

Eğer PostgreSQL versiyonunuz `IF NOT EXISTS` desteklemiyorsa, şu komutu kullanın:

```sql
-- Önce kontrol et, sonra ekle
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Todo' AND column_name = 'notes'
    ) THEN
        ALTER TABLE "Todo" ADD COLUMN "notes" TEXT;
    END IF;
END $$;
```

## ✅ Başarı Kontrolü

SQL Editor'de şu sorguyu çalıştırarak kontrol edebilirsiniz:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Todo' AND column_name = 'notes';
```

Eğer sonuç dönerse, sütun başarıyla eklendi demektir!

## 🚀 Sonraki Adımlar

1. ✅ SQL komutunu çalıştırın
2. ✅ Prisma Client'ı yeniden generate edin (build sırasında otomatik olacak)
3. ✅ Uygulamayı yeniden başlatın

**Not:** Vercel deployment sırasında `prisma generate` otomatik çalışacak, bu yüzden sadece SQL komutunu çalıştırmanız yeterli!

