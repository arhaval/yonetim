# 🔧 Supabase Migration: Social Media Week Field Ekleme

## 📋 Migration Açıklaması

Bu migration, sosyal medya takibi için haftalık takip özelliği ekler. `SocialMediaStats` tablosuna `week` field'ı eklenir ve unique constraint güncellenir.

---

## 🚀 YÖNTEM: Supabase SQL Editor (Manuel)

### Adım 1: Supabase Dashboard'a Git

1. Tarayıcınızda https://supabase.com/dashboard adresine gidin
2. Giriş yapın (eğer yapmadıysanız)
3. Projenizi listeden seçin (tıklayın)

### Adım 2: SQL Editor'ü Aç

1. Sol menüden **"SQL Editor"** seçeneğine tıklayın
   - İkon: </> (code) veya "SQL Editor" yazısı
   - Genellikle "Database" bölümü altında

### Adım 3: Yeni Query Oluştur

1. **"New query"** veya **"+"** butonuna tıklayın
2. **SADECE AŞAĞIDAKİ SQL KODUNU** yapıştırın (markdown işaretleri olmadan):

```sql
ALTER TABLE "SocialMediaStats" 
ALTER COLUMN "month" DROP NOT NULL;

ALTER TABLE "SocialMediaStats" 
ADD COLUMN IF NOT EXISTS "week" TEXT;

ALTER TABLE "SocialMediaStats" 
DROP CONSTRAINT IF EXISTS "SocialMediaStats_month_platform_key";

ALTER TABLE "SocialMediaStats" 
ADD CONSTRAINT "SocialMediaStats_month_week_platform_key" 
UNIQUE ("month", "week", "platform");
```

**ÖNEMLİ:** Sadece SQL komutlarını kopyalayın, markdown başlıklarını (# işaretli satırları) kopyalamayın!

### Adım 4: Query'yi Çalıştır

1. **"Run"** butonuna tıklayın (veya `Ctrl+Enter` / `Cmd+Enter`)
2. Başarılı mesajını görmelisiniz

### Adım 5: Kontrol Et (Opsiyonel)

Aynı SQL Editor'de şu query'yi çalıştırarak kontrol edebilirsiniz:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'SocialMediaStats' 
AND column_name IN ('month', 'week');
```

Eğer her iki column da görünüyorsa, migration başarılıdır! ✅

---

## ✅ Sonuç

Bu migration tamamlandıktan sonra:
- ✅ Haftalık sosyal medya takibi yapılabilecek
- ✅ Aylık ve haftalık veriler aynı tabloda saklanabilecek
- ✅ Unique constraint doğru çalışacak

---

## 🆘 Sorun Giderme

### "Table does not exist" hatası alıyorum?

- Tablo adı farklı olabilir (örneğin `social_media_stats` veya `SocialMediaStats`)
- Supabase'de Table Editor'dan tablo adını kontrol edin
- Tablo adını doğru yazdığınızdan emin olun (büyük/küçük harf duyarlı!)

### "Constraint already exists" hatası alıyorum?

- Eski constraint zaten silinmiş olabilir
- Sadece yeni constraint'i eklemeyi deneyin:

```sql
ALTER TABLE "SocialMediaStats" 
ADD CONSTRAINT IF NOT EXISTS "SocialMediaStats_month_week_platform_key" 
UNIQUE ("month", "week", "platform");
```

---

**Not:** Bu migration production database'de yapılıyor, dikkatli olun!

