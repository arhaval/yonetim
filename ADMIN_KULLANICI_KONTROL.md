# ✅ Admin Kullanıcısı Kontrol

## 🎯 Tablolar Oluşturuldu!

Şimdi admin kullanıcısının oluşturulup oluşturulmadığını kontrol edelim.

---

## 🔍 Kontrol: Admin Kullanıcısı Var mı?

Supabase SQL Editor'de şu SQL'i çalıştırın:

```sql
SELECT email, name, role FROM "User" WHERE email = 'admin@arhaval.com';
```

**Eğer sonuç görünüyorsa:**
- ✅ Admin kullanıcısı var!
- Giriş yapabilirsiniz

**Eğer sonuç boşsa:**
- ❌ Admin kullanıcısı yok
- Aşağıdaki SQL'i çalıştırın

---

## ✅ Admin Kullanıcısı Oluştur

Eğer kullanıcı yoksa, Supabase SQL Editor'de şu SQL'i çalıştırın:

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

## 🔐 Giriş Bilgileri

```
Email: admin@arhaval.com
Şifre: admin123
```

---

## 🚀 Giriş Yap

1. https://arhaval-denetim-merkezi.vercel.app/login adresine gidin
2. Yukarıdaki bilgilerle giriş yapın
3. ✅ Başarılı olmalı!

---

**Admin kullanıcısını kontrol edin ve giriş yapmayı deneyin!** 🎉

