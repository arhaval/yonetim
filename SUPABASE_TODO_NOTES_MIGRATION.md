# Todo Notes Sütunu Ekleme - Supabase SQL Editor

## 🎯 Sorun
`npx prisma db push` çalışmıyor çünkü database bağlantı hatası var.

## ✅ Çözüm: Supabase SQL Editor'den Manuel Ekleme

### Adım 1: Supabase Dashboard'a Git
1. https://supabase.com/dashboard adresine git
2. Projenizi seçin
3. Sol menüden **SQL Editor**'e tıklayın

### Adım 2: SQL Komutunu Çalıştır
Aşağıdaki SQL komutunu kopyalayıp SQL Editor'e yapıştırın ve **RUN** butonuna tıklayın:

```sql
-- Todo tablosuna notes sütunu ekle
ALTER TABLE "Todo" ADD COLUMN IF NOT EXISTS "notes" TEXT;
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

