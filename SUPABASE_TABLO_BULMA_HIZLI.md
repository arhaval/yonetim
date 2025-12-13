# 🔍 Supabase'de Tablo İsmini Bulma - HIZLI

## ⚠️ ÖNEMLİ: Önce Tablo İsmini Bulun!

"User" tablosu yok hatası alıyorsunuz. Önce gerçek tablo ismini bulmalıyız.

---

## 🎯 ADIM 1: Tabloları Listele

Supabase SQL Editor'de şu SQL'i çalıştırın:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Sonuç:** Tüm tabloları göreceksiniz. `User` veya `user` veya başka bir isim arayın.

---

## 🔍 ADIM 2: User İçeren Tabloları Bul

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name ILIKE '%user%' OR table_name = 'User' OR table_name = 'user')
ORDER BY table_name;
```

---

## ✅ ADIM 3: Tablo İsmini Bulduktan Sonra

### Eğer tablo ismi `user` ise (küçük harf - EN OLASI):

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

### Eğer tablo ismi başka bir şeyse:

Tablo ismini bulduktan sonra, yukarıdaki SQL'de `"user"` yerine bulduğunuz tablo ismini kullanın.

---

## 🆘 Eğer Hiç Tablo Yoksa

Eğer hiç tablo yoksa, Prisma migration çalıştırmanız gerekiyor:

```bash
# Local'de (DATABASE_URL production database'e işaret ediyorsa)
npx prisma db push
```

---

**ÖNCE TABLO İSMİNİ BULUN, SONRA INSERT YAPIN!** 🔍

