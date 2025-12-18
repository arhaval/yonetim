# ✅ yonetim.arhaval.com DNS Kayıtları

## 📋 Vercel'den Gelen DNS Kayıtları

```
Type: CNAME
Name: yonetim
Value: f0b3e985060acee2.vercel-dns-017.com.
```

## 🔧 cPanel'de Eklerken

### Doğru Kayıt:

```
Type: CNAME
Name: yonetim
Value: f0b3e985060acee2.vercel-dns-017.com
TTL: 300 (veya 3600)
```

### ⚠️ ÖNEMLİ:

1. **Name:** `yonetim` (sadece bu, `yonetim.arhaval.com` değil)
2. **Value:** `f0b3e985060acee2.vercel-dns-017.com` (sonundaki nokta OLMADAN)
   - ❌ `f0b3e985060acee2.vercel-dns-017.com.` → YANLIŞ (nokta var)
   - ✅ `f0b3e985060acee2.vercel-dns-017.com` → DOĞRU (nokta yok)

## 📝 cPanel Adımları

1. **cPanel → Zone Editor** (veya DNS Zone Editor)
2. **Yeni kayıt ekle:**
   - Type: **CNAME**
   - Name: **yonetim**
   - Value: **f0b3e985060acee2.vercel-dns-017.com** (sonunda nokta YOK)
   - TTL: **300** (veya 3600)
3. **Kaydet**

## ⏱️ Bekleme Süresi

- **15-30 dakika** bekleyin
- DNS yayılımı zaman alır
- Vercel otomatik kontrol eder

## ✅ Kontrol

### 1. DNS Yayılımı:
- https://dnschecker.org/#CNAME/yonetim.arhaval.com
- Tüm sunucularda `f0b3e985060acee2.vercel-dns-017.com` görünmeli

### 2. Vercel Dashboard:
- Settings → Domains → `yonetim.arhaval.com`
- Durum **"Valid"** olmalı
- "DNS Change Recommended" kaybolmalı

### 3. Site Kontrolü:
- `yonetim.arhaval.com` adresine gidin
- Site açılıyorsa başarılı!

## 🎯 Özet

- ✅ Domain: `yonetim.arhaval.com`
- ✅ DNS Name: `yonetim`
- ✅ DNS Value: `f0b3e985060acee2.vercel-dns-017.com` (nokta YOK)
- ✅ TTL: 300 veya 3600

**cPanel'de bu kaydı ekledikten sonra 15-30 dakika bekleyin!** 🚀

