# 🔍 Supabase'de User Tablosunu Bulma ve Admin Oluşturma

## ❌ Sorun

`"User"` tablosu bulunamıyor. PostgreSQL'de tablo ismi farklı olabilir.

## ✅ Adım 1: Tablo İsmini Bul

Supabase SQL Editor'de şu SQL'i çalıştırın:

```sql
-- Tüm tabloları listele
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Bu, tüm tabloları gösterecek. `User` tablosunu arayın.

---

## 🎯 Muhtemel Tablo İsimleri

- `User` (büyük harf - Prisma varsayılan)
- `user` (küçük harf)
- `users` (çoğul)

---

## ✅ Adım 2: User Tablosunu Kontrol Et

```sql
-- User ile ilgili tabloları bul
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name ILIKE '%user%' OR table_name = 'User')
ORDER BY table_name;
```

---

## ✅ Adım 3: Tablo Kolonlarını Kontrol Et

Tablo ismini bulduktan sonra (örneğin `user`):

```sql
-- Tablo kolonlarını gör
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user'  -- veya bulduğunuz tablo ismi
AND table_schema = 'public'
ORDER BY ordinal_position;
```

---

## ✅ Adım 4: Admin Kullanıcısı Oluştur

### Senaryo A: Tablo ismi `user` (küçük harf)

```sql
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

### Senaryo B: Tablo ismi `User` (büyük harf)

```sql
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
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

### Senaryo C: Tablo ismi `users` (çoğul)

```sql
INSERT INTO "users" (id, email, password, name, role, "createdAt", "updatedAt")
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

---

## 🔍 Hızlı Kontrol: Tüm Tabloları Gör

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

---

## ✅ Kontrol

Kullanıcıyı oluşturduktan sonra:

```sql
-- Tablo ismini kullanarak kontrol et (örneğin 'user')
SELECT email, name, role FROM "user" WHERE email = 'admin@arhaval.com';
```

---

**Önce tablo ismini bulun, sonra uygun SQL'i çalıştırın!** 🔍

