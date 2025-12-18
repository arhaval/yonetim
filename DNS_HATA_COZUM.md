# 🔧 DNS Hata Çözümü - "DNS Change Recommended"

## 🔍 Detaylı Kontrol Listesi

### 1️⃣ cPanel'de DNS Kaydını Tekrar Kontrol Edin

**cPanel → Zone Editor → denetim.arhaval.com**

Şunları kontrol edin:

#### ✅ Doğru Kayıt:
```
Type: CNAME
Name: denetim
Value: cname.vercel-dns.com
TTL: 3600
```

#### ❌ Yaygın Hatalar:

**Hata 1: Sonunda nokta var mı?**
- ❌ `cname.vercel-dns.com.` → YANLIŞ (sonunda nokta olmamalı)
- ✅ `cname.vercel-dns.com` → DOĞRU

**Hata 2: Name yanlış**
- ❌ `denetim.arhaval.com` → YANLIŞ
- ❌ `@` → YANLIŞ (subdomain için)
- ✅ `denetim` → DOĞRU

**Hata 3: Birden fazla kayıt**
- ❌ Hem CNAME hem A Record var → ÇAKIŞMA
- ✅ Sadece CNAME olmalı

**Hata 4: Eski kayıtlar**
- ❌ Eski CNAME veya A Record hala duruyor
- ✅ Eski kayıtları silin

### 2️⃣ DNS Yayılımını Kontrol Edin

**Online Kontrol:**
- https://dnschecker.org/#CNAME/denetim.arhaval.com
- Tüm sunucularda `cname.vercel-dns.com` görünmeli
- Eğer bazı sunucularda görünmüyorsa → Henüz yayılmamış

### 3️⃣ Vercel'in DNS Kontrolünü Zorla Yenileyin

**Vercel Dashboard'da:**
1. Settings → Domains → `denetim.arhaval.com`
2. Sayfayı yenileyin (F5)
3. "Verify" veya "Refresh" butonu varsa tıklayın
4. 5-10 dakika bekleyin

### 4️⃣ Alternatif: A Record Kullanın

Eğer CNAME çalışmıyorsa, A Record deneyin:

**cPanel'de:**
1. CNAME kaydını silin
2. Yeni A Record ekleyin:
   ```
   Type: A
   Name: denetim
   Value: 76.76.21.21
   TTL: 3600
   ```

**Not:** Vercel Dashboard'da A Record IP adresini görebilirsiniz.

### 5️⃣ cPanel'de TTL Değerini Düşürün

**TTL değerini düşürün:**
- Eski TTL: 14400 (4 saat)
- Yeni TTL: 300 (5 dakika) veya 3600 (1 saat)

Bu sayede değişiklikler daha hızlı yayılır.

### 6️⃣ Vercel CLI ile Kontrol

Terminal'de:
```bash
vercel domains ls
```

Domain'in durumunu gösterir.

## 🎯 Adım Adım Çözüm

### Adım 1: cPanel'de Kaydı Sil ve Yeniden Ekle

1. **cPanel → Zone Editor**
2. `denetim` için **TÜM kayıtları silin** (CNAME, A Record, vb.)
3. **5 dakika bekleyin**
4. **Yeni CNAME kaydı ekleyin:**
   ```
   Type: CNAME
   Name: denetim
   Value: cname.vercel-dns.com
   TTL: 300
   ```
5. **Kaydedin**

### Adım 2: 30 Dakika Bekleyin

DNS yayılımı için zaman gerekir.

### Adım 3: Kontrol Edin

- https://dnschecker.org/#CNAME/denetim.arhaval.com
- Vercel Dashboard'da durumu kontrol edin

### Adım 4: Hala Çalışmıyorsa

**Vercel Support'a başvurun:**
- Settings → Domains → Support
- Veya: support@vercel.com

## ⚠️ Önemli Notlar

1. **DNS yayılımı zaman alır** - İlk kurulumda 24 saate kadar sürebilir
2. **Vercel'in kontrolü gecikebilir** - DNS doğru olsa bile Vercel henüz görmemiş olabilir
3. **Birden fazla kayıt çakışması** - Eski kayıtları mutlaka silin
4. **TTL değeri** - Düşük TTL daha hızlı yayılır

## 🆘 Hala Çalışmıyorsa

1. **cPanel'deki DNS kaydının ekran görüntüsünü** paylaşın
2. **DNS checker sonucunu** paylaşın
3. **Vercel Dashboard'daki hata mesajını** paylaşın

Size daha spesifik yardımcı olabilirim!

