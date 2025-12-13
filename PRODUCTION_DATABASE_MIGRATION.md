# 🚀 Production Database Migration

## ❌ Sorun

Supabase'de tablo yok! Prisma migration çalıştırmamız gerekiyor.

---

## ✅ Çözüm: Prisma DB Push

### Yöntem 1: Local'den Production Database'e Push (ÖNERİLEN)

**Adım 1: .env Dosyasını Kontrol Et**

Local `.env` dosyanızda `DATABASE_URL` production database'e işaret ediyor mu kontrol edin:

```env
DATABASE_URL=postgresql://postgres:PASSWORD@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
```

**Adım 2: Prisma DB Push**

```bash
# Prisma client'ı generate et
npx prisma generate

# Database schema'yı push et
npx prisma db push
```

Bu komut:
- ✅ Tüm tabloları oluşturur
- ✅ Index'leri ekler
- ✅ Foreign key'leri ayarlar

**Adım 3: Admin Kullanıcısı Oluştur**

```bash
npm run create-user admin@arhaval.com admin123 Admin
```

---

## ✅ Yöntem 2: Supabase SQL Editor'den Manuel

Eğer Prisma db push çalışmazsa, Supabase SQL Editor'den manuel oluşturabilirsiniz.

### User Tablosu Oluştur

```sql
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Admin Kullanıcısı Ekle

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
);
```

---

## 🎯 Önerilen: Prisma DB Push

En kolay ve güvenli yol Prisma db push kullanmak. Tüm schema'yı otomatik oluşturur.

---

**Önce tabloları listeleyin, sonra uygun yöntemi seçin!** 🚀

