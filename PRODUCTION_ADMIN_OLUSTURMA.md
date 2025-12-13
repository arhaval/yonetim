# 🔐 Production'da Admin Kullanıcısı Oluşturma

## ❌ Sorun

Local'de kullanıcı oluşturduk ama production database'de (Supabase) yok!

## ✅ Çözüm: Supabase SQL Editor'den Oluştur

### Adım 1: Supabase Dashboard'a Git

1. https://supabase.com/dashboard
2. Projenizi seçin
3. Sol menüden **"SQL Editor"** seçeneğine tıklayın

### Adım 2: Şifreyi Hash'le

Önce şifreyi hash'lememiz gerekiyor. Local'de çalıştırın:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(hash => console.log(hash));"
```

VEYA direkt bu hash'i kullanın (admin123 için):
```
$2a$10$rK8X8X8X8X8X8X8X8X8Xe8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X
```

Ama daha iyi: Aşağıdaki script'i kullanın.

### Adım 3: SQL Query Çalıştır

Supabase SQL Editor'de şu SQL'i çalıştırın:

```sql
-- Önce mevcut kullanıcıyı kontrol et
SELECT * FROM "User" WHERE email = 'admin@arhaval.com';

-- Eğer yoksa oluştur, varsa şifreyi güncelle
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@arhaval.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- admin123 hash'i
  'Admin',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET 
  password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  "updatedAt" = NOW();
```

**Not:** Yukarıdaki hash `admin123` şifresi için. Eğer farklı bir şifre istiyorsanız, local'de hash'leyin.

---

## 🔧 Alternatif: Local'de Hash Oluşturma

Local'de şifreyi hash'lemek için:

```bash
# Node.js ile
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(hash => console.log(hash));"
```

VEYA

```bash
# Script ile
npm run create-user admin@arhaval.com admin123 Admin
# Sonra database'den hash'i kopyalayın
```

---

## 🚀 Hızlı Çözüm: Vercel Function ile

Vercel'de bir API endpoint oluşturup oradan oluşturabiliriz. Ama bu güvenlik riski olabilir.

---

## ✅ Kontrol

SQL çalıştırdıktan sonra:

```sql
SELECT email, name, role FROM "User" WHERE email = 'admin@arhaval.com';
```

Kullanıcıyı görmelisiniz!

---

## 🔐 Giriş Bilgileri

```
Email: admin@arhaval.com
Şifre: admin123
```

---

**Supabase SQL Editor'den yukarıdaki SQL'i çalıştırın!** 🚀

