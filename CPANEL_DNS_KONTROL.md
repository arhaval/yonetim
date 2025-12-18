# ✅ cPanel DNS Kontrolü

## 🔍 DNS Kaydını Kontrol Etme

### 1️⃣ Terminal'de Kontrol

DNS kaydının doğru eklenip eklenmediğini kontrol edin:

```bash
nslookup -type=CNAME denetim.arhaval.com
```

**Beklenen Çıktı:**
```
denetim.arhaval.com    canonical name = cname.vercel-dns.com
```

### 2️⃣ Online Kontrol

- https://dnschecker.org/#CNAME/denetim.arhaval.com
- Tüm DNS sunucularında yayılmış mı kontrol edin

### 3️⃣ cPanel'de Kontrol

cPanel → Zone Editor veya DNS Zone Editor'da:

**Doğru Kayıt:**
```
Type: CNAME
Name: denetim
Value: cname.vercel-dns.com
TTL: 14400 (veya 3600)
```

**Yanlış Kayıtlar:**
- ❌ Name: `denetim.arhaval.com` → YANLIŞ (sadece `denetim` olmalı)
- ❌ Value: Farklı bir değer → YANLIŞ
- ❌ Type: A Record → YANLIŞ (CNAME olmalı)

## ⏱️ DNS Yayılımı

- **cPanel'de kayıt eklendikten sonra:** 5-30 dakika
- **İlk kurulumda:** 24 saate kadar sürebilir
- **TTL değeri düşükse:** Daha hızlı yayılır

## ✅ Başarı Kontrolü

1. **DNS yayıldı mı?**
   - https://dnschecker.org kontrol edin
   - Tüm sunucularda `cname.vercel-dns.com` görünmeli

2. **Vercel Dashboard'da:**
   - Settings → Domains → `denetim.arhaval.com`
   - Durum **"Valid"** olmalı
   - "DNS Change Recommended" kaybolmalı

3. **Site açılıyor mu?**
   - `denetim.arhaval.com` adresine gidin
   - Site açılıyorsa başarılı!

## 🆘 Sorun Giderme

### DNS yayılmadıysa:
- 30 dakika daha bekleyin
- cPanel'de kaydı tekrar kontrol edin
- TTL değerini düşürün (3600)

### Vercel hala "DNS Change Recommended" diyorsa:
- DNS kaydının doğru olduğundan emin olun
- 24 saat bekleyin (ilk kurulumda normal)
- Vercel Support'a başvurun

## 📋 cPanel DNS Kaydı Özeti

```
Type: CNAME
Name: denetim
Value: cname.vercel-dns.com
TTL: 3600
```

Bu kaydı eklediyseniz, şimdi DNS yayılımını bekleyin! 🚀

