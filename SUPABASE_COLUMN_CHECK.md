# 🔍 Supabase Column Kontrolü

## Column'u Kontrol Et

Supabase SQL Editor'de şu query'yi çalıştırın:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name LIKE '%script%' OR table_name LIKE '%voice%'
ORDER BY table_name, ordinal_position;
```

Bu, script veya voice içeren tüm tabloların kolonlarını gösterecek. `contentType` kolonunun eklenip eklenmediğini göreceksiniz.

---

## Eğer Column Yoksa

Doğru tablo adını bulduktan sonra (yukarıdaki query'den), şu şekilde ekleyin:

```sql
ALTER TABLE "doğru_tablo_adı_buraya" 
ADD COLUMN IF NOT EXISTS "contentType" TEXT;
```

**ÖNEMLİ:** Tablo adını tırnak içinde yazın (PostgreSQL case-sensitive olabilir).

---

## Alternatif: Tüm Tabloları ve Kolonlarını Gör

```sql
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

Bu, tüm tabloları ve kolonlarını gösterecek.










