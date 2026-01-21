# 💰 Ödeme Talep Sistemi

## 🎯 Genel Bakış

Yeni ödeme talep sistemi, tüm ekip üyelerinin (yayıncılar, seslendirmenler, editörler, içerik üreticileri) kendi ödemelerini talep edebilmelerini sağlar. Admin tek bir yerden tüm talepleri görüntüler, onaylar ve öder.

---

## 📋 Kurulum Adımları

### 1. Migration'ı Çalıştırın

Supabase SQL Editor'da şu dosyayı çalıştırın:

```bash
migration_payment_request_system.sql
```

Bu migration:
- ✅ `PaymentRequest` tablosunu oluşturur
- ✅ `PaymentRequestStatus` enum'unu ekler (PENDING, APPROVED, REJECTED, PAID)
- ✅ `PaymentRequestType` enum'unu ekler (CONTENT, VOICE, EDIT, STREAM, DESIGN, MANAGEMENT, OTHER)
- ✅ Gerekli index'leri oluşturur
- ✅ Foreign key ilişkilerini kurar

### 2. Prisma Schema'yı Güncelleyin

Prisma schema zaten güncellenmiştir. Şimdi Prisma client'ı yeniden oluşturun:

```bash
npx prisma generate
```

### 3. Sistemi Test Edin

Uygulamayı yeniden başlatın:

```bash
npm run dev
```

---

## 🚀 Nasıl Çalışır?

### Ekip Üyesi Perspektifi

1. **Dashboard'a Giriş Yapın**
   - Yayıncı: `/streamer-dashboard`
   - İçerik Üreticisi: `/creator-dashboard`
   - Seslendirmen: `/voice-actor-dashboard`
   - Editör/Ekip: `/team-dashboard`

2. **"Ödeme Taleplerim" Butonuna Tıklayın**
   - Her dashboard'da sağ üstte buton var

3. **Yeni Talep Oluşturun**
   - İş tipini seçin (Yayın, Seslendirme, Kurgu, vb.)
   - Tutarı girin
   - Detaylı açıklama yazın
   - İlgili içeriği seçin (opsiyonel)
   - Gönder

4. **Talep Durumunu Takip Edin**
   - **Beklemede (PENDING)**: Admin inceliyor
   - **Onaylandı (APPROVED)**: Admin onayladı, ödeme yapılacak
   - **Ödendi (PAID)**: Ödeme yapıldı, finansal kayıtlara düştü
   - **Reddedildi (REJECTED)**: Admin reddetti, red nedeni görünür

### Admin Perspektifi

1. **Ödeme Talepleri Sayfasına Gidin**
   - Sol menüden "Ödeme Talepleri" → `/admin-payment-requests`

2. **Bekleyen Talepleri İnceleyin**
   - Tüm bekleyen talepler listelenir
   - Talep eden kişi, iş tipi, tutar görünür

3. **Talep Üzerinde İşlem Yapın**
   - **İncele** butonuna tıklayın
   - Detayları görüntüleyin
   - Admin notu ekleyin (opsiyonel)
   - Üç seçenek:
     - ✅ **Onayla**: Talep onaylanır, ödeme bekler
     - ❌ **Reddet**: Red nedeni yazın ve reddedin
     - 💰 **Onayla ve Öde**: Direkt onaylar ve ödeme yapar

4. **Ödeme Yapın**
   - Onaylanmış taleplerde "Ödeme Yap" butonu görünür
   - Tıklayın ve onaylayın
   - Otomatik olarak:
     - ✅ Talep durumu "PAID" olur
     - ✅ Finansal kayıtlara gider olarak eklenir
     - ✅ İlgili kişiye bağlanır

---

## 📊 Özellikler

### İş Tipleri

| Tip | Açıklama | Örnek |
|-----|----------|-------|
| 📝 İçerik Üretimi | Metin yazımı, içerik oluşturma | "5 adet YouTube Shorts metni" |
| 🎙️ Seslendirme | Ses kaydı, dublaj | "10 dakika seslendirme" |
| 🎬 Kurgu | Video düzenleme, montaj | "3 video kurgusu" |
| 📺 Yayın | Canlı yayın, video yayını | "5 saat Twitch yayını" |
| 🎨 Tasarım | Grafik tasarım, thumbnail | "10 thumbnail tasarımı" |
| 👔 Yönetim | Proje yönetimi, koordinasyon | "Aylık proje yönetimi" |
| 📌 Diğer | Diğer hizmetler | "Özel proje" |

### Durum Akışı

```
PENDING → APPROVED → PAID
   ↓
REJECTED
```

### Otomatik İşlemler

✅ **Ödeme yapıldığında:**
- Finansal kayıt otomatik oluşturulur
- Kategori otomatik belirlenir (iş tipine göre)
- İlgili kişiye otomatik bağlanır (yayıncı, seslendirmen, vb.)
- Ödeme tarihi kaydedilir

---

## 🔗 Sayfa Yapısı

### Kullanıcı Sayfaları

- **`/payment-request/new`**: Yeni talep oluştur
- **`/my-payment-requests`**: Taleplerim (tüm kullanıcılar için)

### Admin Sayfaları

- **`/admin-payment-requests`**: Tüm talepleri yönet
- **`/payment-approval`**: İçerik ödemelerini onayla (eski sistem)
- **`/pending-payments`**: Bekleyen ödemeleri yap (eski sistem)

### API Endpoints

- **`GET /api/payment-requests`**: Talepleri getir
- **`POST /api/payment-requests`**: Yeni talep oluştur
- **`PATCH /api/payment-requests/[id]`**: Talebi güncelle (onay/red/ödeme)
- **`DELETE /api/payment-requests/[id]`**: Talebi sil (sadece PENDING)

---

## 💡 Kullanım Senaryoları

### Senaryo 1: Yayıncı Yayın Ödemesi Talep Ediyor

1. Yayıncı dashboard'a giriş yapar
2. "Ödeme Taleplerim" → "Yeni Talep"
3. İş tipi: **Yayın**
4. Tutar: **1500 TL**
5. Açıklama: "5 saat Twitch yayını - Eternal Fire maçları"
6. İlgili yayını seçer (opsiyonel)
7. Gönderir

Admin:
1. Talebi görür
2. İnceler
3. "Onayla ve Öde" der
4. ✅ 1500 TL finansal kayıtlara "Yayın Ödemesi" olarak düşer

### Senaryo 2: Seslendirmen Toplu İş İçin Ödeme İstiyor

1. Seslendirmen dashboard'a giriş yapar
2. "Ödeme Taleplerim" → "Yeni Talep"
3. İş tipi: **Seslendirme**
4. Tutar: **2000 TL**
5. Açıklama: "10 adet YouTube Shorts seslendirmesi - Toplam 15 dakika"
6. Gönderir

Admin:
1. Talebi görür
2. "Onaylar" (ödeme sonra yapılacak)
3. Daha sonra "Ödeme Yap" der
4. ✅ 2000 TL finansal kayıtlara düşer

### Senaryo 3: Admin Talebi Reddediyor

1. Editör yanlış tutar girmiş
2. Admin talebi inceler
3. Red nedeni: "Tutar anlaşılan ücretle uyuşmuyor. Lütfen 1000 TL olarak tekrar gönderin."
4. Reddeder
5. Editör red nedenini görür ve düzeltilmiş talep oluşturur

---

## 🎨 Kullanıcı Arayüzü

### Renkler ve Durumlar

- 🟡 **Beklemede**: Sarı badge
- 🟢 **Onaylandı**: Yeşil badge
- 🔵 **Ödendi**: Mavi badge
- 🔴 **Reddedildi**: Kırmızı badge

### İstatistikler

Her kullanıcı kendi sayfasında görür:
- Toplam talep sayısı
- Bekleyen tutar
- Ödenen tutar

Admin sayfasında:
- Toplam talep sayısı
- Bekleyen tutar
- Bekleyen onay sayısı

---

## 🔒 Güvenlik

### Yetki Kontrolü

- ✅ Kullanıcılar sadece kendi taleplerini görebilir
- ✅ Kullanıcılar sadece PENDING durumundaki kendi taleplerini silebilir
- ✅ Sadece admin onay/red/ödeme yapabilir
- ✅ Tüm API endpoint'leri cookie authentication ile korunmuş

### Veri Bütünlüğü

- ✅ Her talep sadece bir kişiye ait olabilir (constraint)
- ✅ Tutar 0'dan büyük olmalı
- ✅ Status değişiklikleri tarih damgası ile kaydedilir
- ✅ Ödeme yapıldığında finansal kayıt otomatik oluşturulur

---

## 📈 Raporlama

### Finansal Entegrasyon

Ödeme yapıldığında otomatik olarak `Financial` tablosuna kayıt düşer:

```typescript
{
  type: 'expense',
  category: 'Yayın Ödemesi', // İş tipine göre
  amount: 1500,
  description: 'Açıklama - Kişi Adı',
  date: new Date(),
  streamerId: '...', // İlgili kişi ID'si
}
```

Bu sayede:
- ✅ Tüm ödemeler finansal raporlara dahil olur
- ✅ Kişi bazlı ödeme takibi yapılabilir
- ✅ Aylık/yıllık gider raporları otomatik güncellenir

---

## 🆚 Eski Sistem vs Yeni Sistem

### Eski Sistem (Hala Çalışıyor)

**ContentRegistry Ödemeleri:**
- İçerik üretim süreci (metin → seslendirme → kurgu)
- Admin fiyatları belirler
- `/payment-approval`: Fiyat belirleme
- `/pending-payments`: Ödeme yapma

### Yeni Sistem

**PaymentRequest Sistemi:**
- Tüm ekip üyeleri için genel ödeme talebi
- Kullanıcılar kendi taleplerini oluşturur
- `/admin-payment-requests`: Tek yerden yönetim
- Daha esnek ve kapsamlı

**İkisi birlikte çalışır!** Eski verileriniz korunur, yeni sistem ek özellik sunar.

---

## 🐛 Sorun Giderme

### Migration Hatası

**Hata:** `column "voiceprice" does not exist`

**Çözüm:** Kolon isimlerini çift tırnak içine alın:
```sql
UPDATE "ContentRegistry" 
SET "status" = 'REVIEW' 
WHERE "status" = 'PUBLISHED';
```

### Prisma Hatası

**Hata:** `Unknown field paymentRequests`

**Çözüm:** Prisma client'ı yeniden oluşturun:
```bash
npx prisma generate
```

### API 401 Hatası

**Hata:** `Yetkisiz erişim`

**Çözüm:** Cookie'lerin doğru ayarlandığından emin olun. Logout yapıp tekrar login olun.

---

## 📞 Destek

Herhangi bir sorun yaşarsanız:

1. Migration dosyasının tamamen çalıştığından emin olun
2. Prisma generate yaptığınızdan emin olun
3. Uygulamayı yeniden başlatın
4. Browser cache'ini temizleyin

---

## ✅ Kontrol Listesi

Kurulum tamamlandıktan sonra kontrol edin:

- [ ] Migration başarıyla çalıştı
- [ ] Prisma generate yapıldı
- [ ] Uygulama yeniden başlatıldı
- [ ] Yayıncı dashboard'da "Ödeme Taleplerim" butonu görünüyor
- [ ] İçerik üreticisi dashboard'da buton görünüyor
- [ ] Seslendirmen dashboard'da buton görünüyor
- [ ] Admin menüsünde "Ödeme Talepleri" linki var
- [ ] Yeni talep oluşturulabiliyor
- [ ] Admin talepleri görebiliyor
- [ ] Admin onay/red yapabiliyor
- [ ] Ödeme yapıldığında finansal kayıtlara düşüyor

---

## 🎉 Tamamlandı!

Artık ekibiniz kendi ödemelerini talep edebilir ve siz tek bir yerden yönetebilirsiniz!

**Önemli:** Eski sistemler (payment-approval, pending-payments) hala çalışıyor. Yeni sistem ek bir özellik olarak eklenmiştir.

