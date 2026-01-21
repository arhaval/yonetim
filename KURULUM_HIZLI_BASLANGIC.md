# 🚀 Ödeme Talep Sistemi - Hızlı Başlangıç

## ⚡ 3 Adımda Kurulum

### 1️⃣ Migration'ı Çalıştır

Supabase SQL Editor'a git ve şu dosyayı çalıştır:

```
migration_payment_request_system.sql
```

### 2️⃣ Prisma'yı Güncelle

Terminal'de çalıştır:

```bash
npx prisma generate
```

### 3️⃣ Uygulamayı Başlat

```bash
npm run dev
```

---

## ✅ Test Et

### Yayıncı Olarak:

1. `/streamer-login` ile giriş yap
2. "Ödeme Taleplerim" butonuna tıkla
3. "Yeni Talep" oluştur
4. İş tipi: **Yayın**
5. Tutar: **1000**
6. Açıklama: "Test yayını"
7. Gönder

### Admin Olarak:

1. `/login` ile admin girişi yap
2. Sol menüden "Ödeme Talepleri" tıkla
3. Talebi gör
4. "İncele" → "Onayla ve Öde"
5. ✅ Finansal kayıtlara düştü!

---

## 🎯 Kullanım

### Ekip Üyeleri:
- Dashboard → "Ödeme Taleplerim" → Yeni Talep

### Admin:
- Sol Menü → "Ödeme Talepleri" → Talepleri Yönet

---

## 📋 Özellikler

✅ Her ekip üyesi kendi ödemesini talep edebilir
✅ Admin tek yerden yönetir
✅ Otomatik finansal kayıt
✅ Durum takibi (Beklemede → Onaylandı → Ödendi)
✅ Red nedeni bildirimi
✅ İlgili içerik bağlantısı

---

## 🔗 Sayfalar

**Kullanıcılar:**
- `/my-payment-requests` - Taleplerim
- `/payment-request/new` - Yeni Talep

**Admin:**
- `/admin-payment-requests` - Tüm Talepler

---

## 💡 İş Tipleri

- 📝 İçerik Üretimi
- 🎙️ Seslendirme
- 🎬 Kurgu
- 📺 Yayın
- 🎨 Tasarım
- 👔 Yönetim
- 📌 Diğer

---

## 🆘 Sorun mu var?

1. Migration'ı tekrar çalıştır
2. `npx prisma generate` yap
3. Uygulamayı yeniden başlat
4. Browser cache'ini temizle

---

Detaylı bilgi için: `ODEME_TALEP_SISTEMI_README.md`

