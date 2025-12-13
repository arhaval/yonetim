# 🚀 Production Database Tablolarını Oluşturma

## ❌ Sorun

Supabase'de hiç tablo yok! Prisma migration çalıştırmamız gerekiyor.

---

## ✅ Çözüm: Prisma DB Push

### Adım 1: .env Dosyasını Kontrol Et

Local `.env` dosyanızda `DATABASE_URL` production database'e işaret ediyor mu?

**Kontrol et:**
1. Proje klasöründe `.env` dosyasını açın
2. `DATABASE_URL` satırını bulun
3. Production database URL'i olmalı:
   ```
   DATABASE_URL=postgresql://postgres:PASSWORD@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
   ```

**Eğer yoksa veya yanlışsa:**
- `.env` dosyasına ekleyin
- Veya mevcut olanı production URL'i ile değiştirin

---

### Adım 2: Prisma DB Push (TÜM TABLOLARI OLUŞTURUR)

**Terminal'de (proje klasöründe) şu komutları çalıştırın:**

```bash
# 1. Prisma client'ı generate et
npx prisma generate

# 2. Database schema'yı push et (TÜM TABLOLARI OLUŞTURUR)
npx prisma db push
```

**Bu komut:**
- ✅ Tüm tabloları oluşturur (User, Streamer, Content, vb.)
- ✅ Index'leri ekler
- ✅ Foreign key'leri ayarlar
- ✅ Tüm schema'yı production database'e uygular

**Süre:** 1-2 dakika sürebilir

---

### Adım 3: Kontrol Et

Supabase SQL Editor'de tekrar tabloları listeleyin:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Artık tabloları görmelisiniz:
- User
- Streamer
- Content
- Stream
- vb.

---

### Adım 4: Admin Kullanıcısı Oluştur

Tablolar oluşturulduktan sonra:

```bash
npm run create-user admin@arhaval.com admin123 Admin
```

VEYA Supabase SQL Editor'den:

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

## 🎯 Özet: Yapılacaklar

1. ✅ `.env` dosyasında `DATABASE_URL` production database'e işaret ediyor mu kontrol et
2. ✅ `npx prisma generate` çalıştır
3. ✅ `npx prisma db push` çalıştır (TÜM TABLOLARI OLUŞTURUR)
4. ✅ Supabase'de tabloları kontrol et
5. ✅ Admin kullanıcısı oluştur

---

**Şimdi terminal'de `npx prisma db push` komutunu çalıştırın!** 🚀

