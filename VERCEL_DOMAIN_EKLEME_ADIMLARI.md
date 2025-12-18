# 🌐 Vercel'e Domain Ekleme - Adım Adım

## ⚠️ Sorun: Domain Vercel'e Eklenmemiş

Vercel CLI'da `denetim.arhaval.com` görünmüyor. Domain'i Vercel'e eklemeniz gerekiyor.

## 📋 Adım Adım Domain Ekleme

### 1️⃣ Vercel Dashboard'a Gidin

1. **https://vercel.com/dashboard** adresine gidin
2. Giriş yapın
3. **Projenizi seçin:** `arhaval-denetim-merkezi`

### 2️⃣ Settings → Domains

1. Sol menüden **Settings** → **Domains** sekmesine gidin
2. **"Add Domain"** veya **"Add"** butonuna tıklayın

### 3️⃣ Domain Adını Girin

1. Domain adını yazın: `denetim.arhaval.com`
2. **"Add"** veya **"Continue"** butonuna tıklayın

### 4️⃣ DNS Kayıtlarını Alın

Vercel size DNS kayıtlarını gösterecek:

**Örnek:**
```
Type: CNAME
Name: denetim
Value: cname.vercel-dns.com
```

VEYA

```
Type: A
Name: denetim
Value: 76.76.21.21
```

### 5️⃣ cPanel'de DNS Kaydını Ekleyin

**Eğer henüz eklemediyseniz:**

1. **cPanel → Zone Editor**
2. **Yeni kayıt ekle:**
   ```
   Type: CNAME
   Name: denetim
   Value: cname.vercel-dns.com (Vercel'in verdiği tam değer)
   TTL: 300
   ```
3. **Kaydedin**

### 6️⃣ Bekleyin ve Kontrol Edin

- ⏱️ **15-30 dakika** bekleyin
- 🔄 Vercel otomatik olarak DNS'i kontrol eder
- ✅ Durum **"Valid"** olmalı

## 🔍 Kontrol

### Vercel Dashboard'da:
1. Settings → Domains
2. `denetim.arhaval.com` görünmeli
3. Durum **"Valid"** olmalı

### Terminal'de:
```bash
vercel domains ls
```

`denetim.arhaval.com` görünmeli.

## ⚠️ Önemli Notlar

1. **Önce Vercel'e domain ekleyin** → Sonra DNS kaydını ekleyin
2. **DNS kaydı doğru olmalı** → Vercel'in verdiği tam değeri kullanın
3. **Yayılım zaman alır** → 15-30 dakika bekleyin

## 🆘 Sorun Giderme

### "Domain already exists" hatası:
- Domain başka bir Vercel projesine bağlı olabilir
- O projeden kaldırın veya bu projeye transfer edin

### "Invalid domain" hatası:
- Domain adını kontrol edin
- `denetim.arhaval.com` formatında olmalı

### DNS kaydı ekledim ama hala çalışmıyor:
- 30 dakika daha bekleyin
- DNS checker ile kontrol edin: https://dnschecker.org

## ✅ Başarı Kriterleri

- ✅ Vercel Dashboard'da domain görünüyor
- ✅ Durum "Valid"
- ✅ `denetim.arhaval.com` açılıyor
- ✅ HTTPS çalışıyor

**Vercel Dashboard'da domain'i eklediniz mi?** Eğer eklemediyseniz, yukarıdaki adımları takip edin.

