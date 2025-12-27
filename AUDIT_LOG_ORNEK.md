# 📋 Audit Log Örnekleri

## 🎯 Sisteminizde Neler Kaydedilmeli?

### 1. Finansal İşlemler

#### Ödeme Yapıldı
```
✅ Kim: Ahmet Yılmaz (Admin)
✅ Ne zaman: 27 Aralık 2024, 14:30
✅ Ne yaptı: Ödeme oluşturdu
✅ Detaylar: 5000 TL, Mehmet Streamer'a, Aralık ayı
```

#### Finansal Kayıt Eklendi
```
✅ Kim: Ahmet Yılmaz (Admin)
✅ Ne zaman: 27 Aralık 2024, 15:00
✅ Ne yaptı: Finansal kayıt ekledi
✅ Detaylar: 1000 TL, Gider, Ekipman kategorisi
```

#### Finansal Kayıt Silindi
```
✅ Kim: Ahmet Yılmaz (Admin)
✅ Ne zaman: 27 Aralık 2024, 16:00
✅ Ne yaptı: Finansal kayıt sildi
✅ Detaylar: 500 TL'lik kayıt silindi (Hatalı kayıt)
```

---

### 2. Onay İşlemleri

#### Script Onaylandı
```
✅ Kim: Ahmet Yılmaz (Admin)
✅ Ne zaman: 27 Aralık 2024, 17:00
✅ Ne yaptı: Script onayladı
✅ Detaylar: "Video Metni #123" script'i onaylandı, 500 TL ücret belirlendi
```

#### Ödeme Onaylandı
```
✅ Kim: Ahmet Yılmaz (Admin)
✅ Ne zaman: 27 Aralık 2024, 18:00
✅ Ne yaptı: Ödeme onayladı
✅ Detaylar: 3 yayın için ödeme onaylandı, Toplam: 1500 TL
```

---

### 3. Veri Değişiklikleri

#### Yayıncı Bilgileri Güncellendi
```
✅ Kim: Ahmet Yılmaz (Admin)
✅ Ne zaman: 27 Aralık 2024, 19:00
✅ Ne yaptı: Yayıncı bilgilerini güncelledi
✅ Detaylar: Mehmet Streamer, Saatlik ücret: 100 TL → 120 TL
```

#### Ücret Değiştirildi
```
✅ Kim: Ahmet Yılmaz (Admin)
✅ Ne zaman: 27 Aralık 2024, 20:00
✅ Ne yaptı: Script ücretini değiştirdi
✅ Detaylar: Script #123, Eski ücret: 400 TL, Yeni ücret: 500 TL
```

---

### 4. Silme İşlemleri

#### Kayıt Silindi
```
✅ Kim: Ahmet Yılmaz (Admin)
✅ Ne zaman: 27 Aralık 2024, 21:00
✅ Ne yaptı: Finansal kayıt sildi
✅ Detaylar: 1000 TL'lik kayıt silindi
```

---

## 🔍 Neden Önemli?

### Senaryo: Hatalı Ödeme Yapıldı

**Audit Log OLMADAN:**
- 5000 TL yanlış kişiye ödendi ❌
- Kim yaptı? → Bilinmiyor ❌
- Ne zaman? → Sadece tarih var ✅
- Nasıl düzelteceğiz? → Zor ❌

**Audit Log İLE:**
- 5000 TL yanlış kişiye ödendi ❌
- **Kim yaptı:** Ahmet Yılmaz ✅
- **Ne zaman:** 27 Aralık 14:30 ✅
- **Nasıl düzelteceğiz:** Ahmet'e sorabiliriz, log'a bakabiliriz ✅

---

## 📊 Veritabanında Nasıl Görünür?

### AuditLog Tablosu

```sql
id              → Log kaydı ID'si
userId          → İşlemi yapan kullanıcı ID'si
userName        → İşlemi yapan kullanıcı adı
action          → Yapılan işlem (payment_created, record_deleted, vb.)
entityType      → Hangi tablo (Payment, FinancialRecord, vb.)
entityId        → İlgili kayıt ID'si
oldValue        → Eski değer (güncelleme için)
newValue        → Yeni değer (güncelleme için)
details         → Detaylı bilgi (JSON)
timestamp       → İşlem zamanı
ipAddress       → IP adresi (güvenlik için)
```

---

## 💡 Pratik Örnek

### Senaryo: Birisi Finansal Kayıt Sildi

**Şu an (Audit Log olmadan):**
- Kayıt silindi ✅
- Ama kim sildi? → Bilinmiyor ❌
- Neden sildi? → Bilinmiyor ❌

**Audit Log ile:**
- Kayıt silindi ✅
- **Log kaydı:**
  ```
  Kim: Ahmet Yılmaz
  Ne zaman: 27 Aralık 2024, 15:00
  Ne yaptı: Finansal kayıt sildi
  Detaylar: 1000 TL'lik kayıt silindi
  Neden: "Hatalı kayıt, tekrar eklenecek"
  ```

**Sonuç:** Her şey kayıt altında! ✅

---

## 🎯 Özet

**Audit Log = Her önemli işlemin kaydı**

**Kaydedilmesi Gerekenler:**
- ✅ Ödeme yapıldı
- ✅ Finansal kayıt eklendi/silindi
- ✅ Onay yapıldı
- ✅ Veri güncellendi
- ✅ Kullanıcı silindi

**Faydaları:**
- Güvenlik ✅
- Sorumluluk ✅
- Hata takibi ✅
- Yasal uyum ✅

**Sonuç:** Her şirket sisteminde olmalı! ✅

