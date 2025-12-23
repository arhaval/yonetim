# 🧹 Veritabanı Temizleme Rehberi

## 📋 Seçenekler

### Yöntem 1: Prisma Studio (Önerilen - En Güvenli) ⭐

Görsel arayüz ile manuel kontrol ve silme:

```bash
npm run db:studio
```

Bu komut Prisma Studio'yu açar. Oradan:
1. Tabloları görüntüleyin
2. İstediğiniz kayıtları seçin
3. Sil butonuna tıklayın

**Avantajlar:**
- ✅ Görsel kontrol
- ✅ Hangi kayıtların silineceğini görebilirsiniz
- ✅ Yanlışlıkla silme riski düşük

---

### Yöntem 2: Temizleme Scripti (Otomatik)

#### Tüm Eski Kayıtları Sil (Kullanıcılar Korunur)

```bash
npm run cleanup-old-data
```

Bu komut şunları siler:
- ✅ Yayınlar (Stream)
- ✅ Ödemeler (Payment)
- ✅ Ekip Ödemeleri (TeamPayment)
- ✅ Finansal Kayıtlar (FinancialRecord)
- ✅ Seslendirme Metinleri (VoiceoverScript)
- ✅ Görevler (Task)
- ✅ Dış Yayınlar (ExternalStream)
- ✅ Sosyal Medya İstatistikleri (SocialMediaStats)

**Korunan Veriler:**
- ✅ Yayıncılar (Streamer)
- ✅ İçerik Üreticileri (ContentCreator)
- ✅ Seslendirmenler (VoiceActor)
- ✅ Ekip Üyeleri (TeamMember)
- ✅ Admin Kullanıcıları (User)
- ✅ İçerikler (Content) - varsayılan olarak korunur

#### Belirli Tarihten Önceki Kayıtları Sil

```bash
npm run cleanup-old-data -- --before=2024-01-01
```

Bu komut sadece belirtilen tarihten önceki kayıtları siler.

**Örnek:**
```bash
# 1 Ocak 2024'ten önceki tüm kayıtları sil
npm run cleanup-old-data -- --before=2024-01-01

# 15 Aralık 2023'ten önceki kayıtları sil
npm run cleanup-old-data -- --before=2023-12-15
```

---

### Yöntem 3: Tüm Verileri Sıfırla (Dikkatli Kullanın!)

```bash
npm run reset-all-data
```

Bu komut tüm yayın, ödeme ve finansal verileri siler (kullanıcılar korunur).

---

### Yöntem 4: Tam Temizlik (Tüm Veriler)

```bash
npm run reset-db
```

⚠️ **DİKKAT:** Bu komut TÜM verileri siler (kullanıcılar hariç)!

---

## 🎯 Hangi Yöntemi Seçmeliyim?

### Test Kayıtlarını Temizlemek İçin:
```bash
npm run cleanup-old-data
```

### Belirli Tarihten Önceki Kayıtları Silmek İçin:
```bash
npm run cleanup-old-data -- --before=2024-01-01
```

### Manuel Kontrol İçin:
```bash
npm run db:studio
```

### Tüm Verileri Sıfırlamak İçin (Dikkatli!):
```bash
npm run reset-all-data
```

---

## ⚠️ Önemli Notlar

1. **Yedek Alın:** Önemli veriler varsa önce yedek alın
2. **Production'da Dikkatli Olun:** Production veritabanında bu komutları çalıştırmadan önce emin olun
3. **Kullanıcılar Korunur:** Tüm scriptler kullanıcı verilerini korur
4. **İçerikler:** Varsayılan olarak içerikler korunur, script içinde yorum satırını kaldırarak aktif edebilirsiniz

---

## 🔍 Veritabanı Durumunu Kontrol Etme

```bash
npm run db:studio
```

Prisma Studio'da tüm tabloları görüntüleyebilir ve kayıt sayılarını kontrol edebilirsiniz.

