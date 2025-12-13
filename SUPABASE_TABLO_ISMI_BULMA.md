# 🔍 Supabase'de Tablo İsmi Bulma

## ❌ Sorun

`"User"` tablosu bulunamıyor. Prisma model ismi ile Supabase tablo ismi farklı olabilir.

## ✅ Çözüm: Tablo İsmini Bul

### Adım 1: Supabase SQL Editor'de Tabloları Listele

Supabase SQL Editor'de şu SQL'i çalıştırın:

```sql
-- Tüm tabloları listele
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Bu, tüm tabloları gösterecek. `User` yerine muhtemelen:
- `user` (küçük harf)
- `users` (çoğul)
- veya başka bir isim

### Adım 2: User Tablosunu Bul

```sql
-- User ile ilgili tabloları bul
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name ILIKE '%user%'
ORDER BY table_name;
```

---

## 🎯 Muhtemel Tablo İsimleri

Prisma genellikle şu şekilde tablo oluşturur:
- Model: `User` → Tablo: `User` (PostgreSQL'de büyük/küçük harf duyarlı!)
- Veya: `user` (küçük harf)

---

## ✅ Doğru SQL (Tablo İsmini Bulduktan Sonra)

Tablo ismini bulduktan sonra (örneğin `user` ise):

```sql
-- Eğer tablo ismi 'user' ise (küçük harf)
INSERT INTO "user" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@arhaval.com',
  '$2a$10$uzOHWqiaCU9qOHq9fGYC8egjlfCK1s2E7o98x9of/ZYPwEotEcYsu',
  'Admin',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET 
  password = '$2a$10$uzOHWqiaCU9qOHq9fGYC8egjlfCK1s2E7o98x9of/ZYPwEotEcYsu',
  "updatedAt" = NOW();
```

VEYA eğer tablo ismi `users` ise:

```sql
INSERT INTO "users" (id, email, password, name, role, "createdAt", "updatedAt")
...
```

---

**Önce tablo ismini bulun, sonra SQL'i çalıştırın!** 🔍

