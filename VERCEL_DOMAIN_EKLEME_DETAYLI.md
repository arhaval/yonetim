# 📝 Vercel Domain Ekleme - Detaylı Adımlar

## 🎯 "Add Domain" Ekranında Ne Yapmalı?

### 1️⃣ Domain Adını Yazın

**"Add Domain" ekranında:**

**En başa yazın:**
```
denetim.arhaval.com
```

**ÖNEMLİ:**
- ✅ `denetim.arhaval.com` → DOĞRU
- ❌ `denetim` → YANLIŞ (sadece subdomain)
- ❌ `www.denetim.arhaval.com` → YANLIŞ
- ❌ `https://denetim.arhaval.com` → YANLIŞ (http/https yazmayın)

### 2️⃣ "Connect to an Environment" Seçimi

**Şunu seçin:**
```
✅ Production
```

**Neden Production?**
- Production = Canlı site (herkesin göreceği)
- Preview = Test için (geçici)
- Development = Geliştirme için (local)

**Sizin durumunuzda:** Production seçin çünkü canlı siteyi bağlıyorsunuz.

### 3️⃣ "Add" veya "Continue" Butonuna Tıklayın

Domain eklendikten sonra Vercel size DNS kayıtlarını gösterecek.

## 📋 Adım Adım Ekran Görüntüsü Rehberi

### Ekran 1: Domain Adı
```
┌─────────────────────────────────┐
│ Add Domain                      │
├─────────────────────────────────┤
│ Domain:                         │
│ [denetim.arhaval.com        ]  │ ← Buraya yazın
│                                 │
│ Connect to an environment:      │
│ ○ Production  ← Bu seçeneği seçin
│ ○ Preview                       │
│ ○ Development                   │
│                                 │
│         [Add] [Cancel]          │
└─────────────────────────────────┘
```

### Ekran 2: DNS Kayıtları (Domain ekledikten sonra)
```
┌─────────────────────────────────┐
│ Configure DNS                   │
├─────────────────────────────────┤
│ Add this DNS record:            │
│                                 │
│ Type: CNAME                     │
│ Name: denetim                   │
│ Value: cname.vercel-dns.com     │
│                                 │
│ [Copy] [Verify]                 │
└─────────────────────────────────┘
```

## ✅ Doğru Seçimler

1. **Domain:** `denetim.arhaval.com`
2. **Environment:** `Production`
3. **Add** butonuna tıklayın

## 🔍 Sonraki Adımlar

Domain ekledikten sonra:

1. **Vercel size DNS kayıtlarını gösterecek**
2. **cPanel'de bu kayıtları ekleyin** (zaten eklemişsiniz)
3. **15-30 dakika bekleyin**
4. **Durum "Valid" olmalı**

## ⚠️ Önemli Notlar

- **Domain adı:** Tam domain adını yazın (`denetim.arhaval.com`)
- **Environment:** Production seçin
- **DNS kayıtları:** Vercel'in verdiği tam değeri kullanın

**Hazırsanız "Add" butonuna tıklayın!** 🚀

