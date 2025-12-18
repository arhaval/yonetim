# ⚠️ DNS Kayıt Düzeltme

## 🔍 Sorun Tespiti

Vercel size şunu gösteriyor:
```
Type: CNAME
Name: yonetim
Value: f0b3e985060acee2.vercel-dns-017.com.
```

**Sorun:** Name `yonetim` olmamalı, `denetim` olmalı!

## ✅ Çözüm

### Seçenek 1: Domain'i Yeniden Ekleyin (ÖNERİLEN)

1. **Vercel Dashboard → Settings → Domains**
2. `yonetim.arhaval.com` veya yanlış eklenen domain'i **silin**
3. **Yeniden "Add Domain"** tıklayın
4. **Domain adını yazın:** `denetim.arhaval.com` (dikkatli yazın!)
5. **Production** seçin
6. **Add** butonuna tıklayın

### Seçenek 2: Mevcut Kaydı Kullanın (Geçici)

Eğer domain `yonetim.arhaval.com` olarak eklenmişse:

**cPanel'de:**
```
Type: CNAME
Name: yonetim
Value: f0b3e985060acee2.vercel-dns-017.com (sonundaki nokta OLMADAN)
TTL: 300
```

**Ama bu durumda:** `yonetim.arhaval.com` çalışır, `denetim.arhaval.com` çalışmaz!

## 🎯 Doğru DNS Kayıtları

**Eğer `denetim.arhaval.com` eklediyseniz, şunları görmelisiniz:**

```
Type: CNAME
Name: denetim
Value: f0b3e985060acee2.vercel-dns-017.com (veya benzeri)
```

## 📋 cPanel'de Eklerken Dikkat

**Value kısmında:**
- ❌ `f0b3e985060acee2.vercel-dns-017.com.` → YANLIŞ (sonunda nokta var)
- ✅ `f0b3e985060acee2.vercel-dns-017.com` → DOĞRU (sonunda nokta YOK)

**cPanel genellikle otomatik nokta ekler, kontrol edin!**

## 🔧 Kontrol

**Vercel Dashboard'da:**
- Hangi domain görünüyor?
- `denetim.arhaval.com` mı?
- Yoksa `yonetim.arhaval.com` mı?

**Eğer `yonetim.arhaval.com` görünüyorsa:**
- Domain'i silin ve `denetim.arhaval.com` olarak yeniden ekleyin

## ✅ Doğru Adımlar

1. **Vercel'de domain'i kontrol edin** → Hangi domain ekli?
2. **Eğer yanlışsa silin ve yeniden ekleyin** → `denetim.arhaval.com`
3. **Doğru DNS kayıtlarını alın** → Name: `denetim`
4. **cPanel'de ekleyin** → Value'da sonunda nokta olmadan

**Vercel Dashboard'da hangi domain görünüyor?** `denetim.arhaval.com` mı yoksa `yonetim.arhaval.com` mı?

