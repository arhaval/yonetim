# 🌐 Domain Bağlama Rehberi - denetim.arhaval.com

## 📋 Adım Adım Domain Bağlama

### 1️⃣ Vercel Dashboard'dan Domain Ekleme

1. **Vercel Dashboard'a gidin:**
   - https://vercel.com/dashboard
   - Projenizi seçin: `arhaval-denetim-merkezi`

2. **Settings → Domains sekmesine gidin:**
   - Sol menüden **Settings** → **Domains**

3. **Domain ekleyin:**
   - **Add Domain** butonuna tıklayın
   - `denetim.arhaval.com` yazın
   - **Add** butonuna tıklayın

4. **DNS kayıtlarını alın:**
   - Vercel size DNS kayıtlarını gösterecek
   - Örnek:
     ```
     Type: CNAME
     Name: denetim
     Value: cname.vercel-dns.com
     ```

### 2️⃣ Domain Sağlayıcınızda DNS Ayarları

**Arhaval.com domain'inizin DNS ayarlarına gidin:**

#### Seçenek A: Subdomain (denetim.arhaval.com) - ÖNERİLEN

1. Domain sağlayıcınızın DNS panelini açın
   - (Örnek: GoDaddy, Namecheap, Cloudflare, vb.)

2. **CNAME kaydı ekleyin:**
   ```
   Type: CNAME
   Name: denetim
   Value: cname.vercel-dns.com
   TTL: 3600 (veya Auto)
   ```

#### Seçenek B: A Record (Alternatif)

Eğer CNAME çalışmazsa:
```
Type: A
Name: denetim
Value: 76.76.21.21 (Vercel'in IP adresi - Vercel'den alın)
TTL: 3600
```

### 3️⃣ SSL Sertifikası (Otomatik)

- ✅ Vercel **otomatik olarak SSL sertifikası** ekler
- ✅ Let's Encrypt ile ücretsiz SSL
- ✅ 24 saat içinde aktif olur
- ✅ HTTPS otomatik çalışır

### 4️⃣ DNS Yayılımı Bekleme

- ⏱️ DNS değişiklikleri **5 dakika - 48 saat** arasında yayılır
- Genellikle **15-30 dakika** içinde aktif olur
- Kontrol için: https://dnschecker.org

### 5️⃣ Kontrol

DNS yayıldıktan sonra:
- ✅ `denetim.arhaval.com` adresine gidin
- ✅ Site açılıyorsa başarılı!
- ✅ HTTPS çalışıyorsa SSL aktif

## 🔧 Sorun Giderme

### Domain çalışmıyorsa:

1. **DNS kontrolü:**
   ```bash
   # Terminal'de kontrol edin
   nslookup denetim.arhaval.com
   # veya
   dig denetim.arhaval.com
   ```

2. **Vercel Dashboard kontrolü:**
   - Settings → Domains
   - Domain'in durumunu kontrol edin
   - Hata varsa gösterilir

3. **Yayılım kontrolü:**
   - https://dnschecker.org/#CNAME/denetim.arhaval.com
   - Tüm DNS sunucularında yayılmış mı kontrol edin

### Yaygın Hatalar:

**❌ "Domain not configured"**
- DNS kayıtları henüz yayılmamış
- 24 saat bekleyin

**❌ "SSL Certificate pending"**
- SSL sertifikası oluşturuluyor
- 24 saat içinde aktif olur

**❌ "DNS not found"**
- DNS kayıtları yanlış
- Domain sağlayıcınızda kontrol edin

## 📝 Önemli Notlar

1. **DNS TTL:** Mümkünse düşük TTL kullanın (300-600 saniye)
2. **Propagation:** İlk kurulumda 24-48 saat bekleyebilir
3. **SSL:** Otomatik, manuel işlem gerekmez
4. **Backup:** Eski domain (vercel.app) hala çalışır

## ✅ Başarı Kriterleri

- ✅ `denetim.arhaval.com` açılıyor
- ✅ HTTPS çalışıyor (yeşil kilit)
- ✅ Vercel Dashboard'da "Valid" görünüyor
- ✅ Tüm sayfalar çalışıyor

## 🎯 Sonuç

Domain bağlandıktan sonra:
- ✅ `denetim.arhaval.com` adresinden erişebilirsiniz
- ✅ SSL otomatik aktif olur
- ✅ Eski Vercel URL'si de çalışmaya devam eder
- ✅ Tüm veriler aynen kalır

**Hazırsanız başlayalım!** 🚀

