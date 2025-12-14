# 🔐 Supabase'de Admin Şifresi Güncelleme

## ✅ Database Bağlantısı Çalışıyor!

Artık "geçersiz şifre" hatası alıyorsunuz, bu database'e bağlanabildiğimiz anlamına geliyor! 🎉

---

## 🚀 Hızlı Çözüm: Supabase SQL Editor

### Adım 1: Supabase Dashboard

1. https://supabase.com/dashboard → Projenizi açın
2. Sol menüden **SQL Editor**
3. **New query** butonuna tıklayın

### Adım 2: Şifreyi Güncelle

Aşağıdaki SQL'i çalıştırın:

```sql
-- Admin kullanıcısının şifresini güncelle (admin123)
UPDATE "User"
SET password = '$2a$10$rOzJ8K8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK'
WHERE email = 'admin@arhaval.com';
```

**Ama bekle!** Bu hash yanlış. Doğru hash'i oluşturmak için:

### Adım 3: Doğru Hash'i Oluştur

**Seçenek 1: Online Tool (Hızlı)**
1. https://bcrypt-generator.com/ adresine gidin
2. **Password:** `admin123`
3. **Rounds:** `10`
4. **Generate** butonuna tıklayın
5. Oluşturulan hash'i kopyalayın

**Seçenek 2: Node.js Script (Güvenli)**

Local'de şunu çalıştırın:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(h => console.log(h))"
```

### Adım 4: SQL'i Güncelle ve Çalıştır

Oluşturduğunuz hash ile SQL'i güncelleyin:

```sql
UPDATE "User"
SET password = '[BURAYA_HASH_YAPIŞTIR]'
WHERE email = 'admin@arhaval.com';
```

**Örnek (gerçek hash değil, sadece format):**
```sql
UPDATE "User"
SET password = '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRST'
WHERE email = 'admin@arhaval.com';
```

### Adım 5: Kontrol Et

```sql
SELECT email, name, role FROM "User" WHERE email = 'admin@arhaval.com';
```

---

## 🔄 Alternatif: Yeni Admin Kullanıcısı Oluştur

Eğer admin kullanıcısı yoksa:

```sql
-- Yeni admin kullanıcısı oluştur
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@arhaval.com',
  '$2a$10$[BURAYA_HASH_YAPIŞTIR]',
  'Admin',
  'admin',
  NOW(),
  NOW()
);
```

---

## ✅ Test

1. SQL'i çalıştırdıktan sonra
2. https://arhaval-denetim-merkezi.vercel.app/login
3. Giriş yapmayı deneyin:
   - Email: `admin@arhaval.com`
   - Şifre: `admin123`

---

## 💡 Hızlı Hash Oluşturma

**Node.js ile:**
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(h => console.log(h))"
```

**Online:**
- https://bcrypt-generator.com/
- https://bcrypt.online/

---

**ÖNCE HASH OLUŞTUR, SONRA SQL'İ ÇALIŞTIR!** 🔐

