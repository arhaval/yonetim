# 🔧 DNS "Change Recommended" Çözümü

## ⚠️ Sorun: "DNS Change Recommended"

Bu hata, DNS kayıtlarının henüz doğru yapılandırılmadığı veya yayılmadığı anlamına gelir.

## ✅ Çözüm Adımları

### 1️⃣ Vercel'den Doğru DNS Kayıtlarını Alın

Vercel Dashboard'da:
1. **Settings → Domains** → `denetim.arhaval.com` seçin
2. **Configuration** sekmesine gidin
3. Vercel size şu bilgileri gösterecek:

**Örnek DNS Kayıtları:**
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

### 2️⃣ Domain Sağlayıcınızda Kontrol Edin

**DNS Panelinizde şunları kontrol edin:**

#### ✅ Doğru CNAME Kaydı:
```
Type: CNAME
Name: denetim (veya @)
Value: cname.vercel-dns.com
TTL: 3600
```

#### ❌ Yanlış Kayıtlar:
- `denetim.arhaval.com` → YANLIŞ (sadece `denetim` olmalı)
- Eski IP adresi → YANLIŞ (Vercel'in verdiği değeri kullanın)
- Farklı CNAME değeri → YANLIŞ

### 3️⃣ DNS Kayıtlarını Düzeltin

**Domain sağlayıcınızın DNS panelinde:**

1. **Mevcut `denetim` kaydını bulun**
2. **Silin veya düzenleyin**
3. **Yeni kayıt ekleyin:**
   - Type: CNAME
   - Name: `denetim`
   - Value: Vercel'in verdiği değer (örnek: `cname.vercel-dns.com`)
   - TTL: 3600

### 4️⃣ DNS Yayılımını Bekleyin

- ⏱️ **5-30 dakika** bekleyin
- 🔄 DNS değişiklikleri yayılması zaman alır
- ✅ Kontrol: https://dnschecker.org

### 5️⃣ Vercel'de Tekrar Kontrol Edin

1. Vercel Dashboard → Settings → Domains
2. `denetim.arhaval.com` seçin
3. Durum **"Valid"** olmalı
4. "DNS Change Recommended" kaybolmalı

## 🔍 DNS Kontrol Komutları

### Terminal'de kontrol:
```bash
# CNAME kaydını kontrol et
nslookup -type=CNAME denetim.arhaval.com

# Tüm DNS kayıtlarını gör
nslookup denetim.arhaval.com
```

### Online kontrol:
- https://dnschecker.org/#CNAME/denetim.arhaval.com
- https://www.whatsmydns.net/#CNAME/denetim.arhaval.com

## ⚠️ Yaygın Hatalar

### Hata 1: "Name" yanlış
- ❌ `denetim.arhaval.com` → YANLIŞ
- ✅ `denetim` → DOĞRU

### Hata 2: "Value" yanlış
- ❌ Eski IP adresi → YANLIŞ
- ✅ Vercel'in verdiği CNAME değeri → DOĞRU

### Hata 3: TTL çok yüksek
- ❌ TTL: 86400 (24 saat) → Yavaş yayılır
- ✅ TTL: 3600 (1 saat) → Hızlı yayılır

## 📋 Adım Adım Checklist

- [ ] Vercel Dashboard'dan DNS kayıtlarını aldım
- [ ] Domain sağlayıcımın DNS panelini açtım
- [ ] Eski `denetim` kaydını sildim/düzenledim
- [ ] Yeni CNAME kaydını ekledim (Name: `denetim`, Value: Vercel'in verdiği değer)
- [ ] TTL'yi 3600 olarak ayarladım
- [ ] 15-30 dakika bekledim
- [ ] DNS checker ile kontrol ettim
- [ ] Vercel Dashboard'da durumu kontrol ettim

## 🎯 Başarı Kriterleri

✅ Vercel Dashboard'da "Valid" görünüyor
✅ "DNS Change Recommended" kayboldu
✅ `denetim.arhaval.com` açılıyor
✅ HTTPS çalışıyor

## 🆘 Hala Çalışmıyorsa

1. **DNS kayıtlarını tekrar kontrol edin**
2. **24 saat bekleyin** (ilk kurulumda yayılım uzun sürebilir)
3. **Vercel Support'a başvurun** (Settings → Domains → Support)

## 💡 İpucu

Eğer CNAME çalışmıyorsa, Vercel size **A Record** değerleri de verebilir. O zaman:
```
Type: A
Name: denetim
Value: 76.76.21.21 (Vercel'in verdiği IP)
```

Hangi domain sağlayıcısını kullanıyorsunuz? (GoDaddy, Namecheap, Cloudflare, vb.) Size özel adımları paylaşabilirim.

