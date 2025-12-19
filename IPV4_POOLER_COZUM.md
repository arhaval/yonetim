# 🔧 IPv4 Sorunu - Session Pooler Kullan

## ⚠️ Sorun:
```
Not IPv4 compatible
Use Session Pooler if on a IPv4 network
```

Bu, direkt database bağlantısının IPv4 ağlarında çalışmadığı anlamına geliyor. **Session Pooler** kullanmalısınız.

## ✅ ÇÖZÜM: Session Pooler URL'i Kullan

### ADIM 1: Session Pooler URL'ini Al

1. **Supabase Dashboard** → **Settings → Database**
2. **"Connection string"** bölümünde
3. **"View parameters"** butonuna tıkla
4. **"Session Pooler"** sekmesine git
5. **"URI"** formatını seç
6. **"Show password"** butonuna tıkla
7. **Tam URL'i kopyala** (port 6543 olacak)

**Format:**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:[ŞİFRE]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### ADIM 2: Local .env Dosyasını Güncelle

1. `.env` dosyasını aç
2. `DATABASE_URL` satırını bul
3. **Session Pooler URL'ini yapıştır**
4. Dosyayı kaydet

### ADIM 3: Vercel'de DATABASE_URL'i Güncelle

1. **Vercel Dashboard** → Projenizi seçin
2. **Settings → Environment Variables**
3. **`DATABASE_URL`** değişkenini bul
4. **"Edit"** butonuna tıkla
5. **Session Pooler URL'ini yapıştır**
6. **Production, Preview, Development** hepsini seç ✅
7. **"Save"** butonuna tıkla

### ADIM 4: Vercel'de Redeploy Yap

1. **Deployments** sekmesine git
2. En son deployment'ın yanındaki **"..."** menüsüne tıkla
3. **"Redeploy"** seçeneğini seç
4. **"Redeploy"** butonuna tıkla
5. **2-3 dakika bekle**

### ADIM 5: Test Et

**Local'de:**
```bash
npm run test-db
```

**Canlı sitede:**
- Siteyi yenile
- Login sayfasına git
- Giriş yapmayı dene

---

## 📋 Session Pooler URL Formatı:

```
postgresql://postgres.kwrbcwspdjlgixjkplzq:[ŞİFRE]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Önemli farklar:**
- ✅ Username: `postgres.kwrbcwspdjlgixjkplzq` (proje referansı ile)
- ✅ Host: `aws-0-[REGION].pooler.supabase.com` (pooler)
- ✅ Port: `6543` (5432 değil!)
- ✅ Parametre: `?pgbouncer=true` (sonunda)

---

## 🔍 Region Bulma:

Region'u bulmak için:
1. **Settings → General** sekmesine git
2. **"Region"** bilgisini kontrol et
3. Genellikle: `eu-central-1`, `us-east-1`, vb.

---

**ÖNEMLİ:** IPv4 ağlarında Session Pooler kullanmak zorunlu! Direkt bağlantı çalışmaz!

