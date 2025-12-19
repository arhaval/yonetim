# 🚨 Vercel'de Database Bağlantı Hatası - 500 Error

## ❌ Hata:
```
POST https://yonetim.arhaval.com/api/auth/login 500 (Internal Server Error)
```

Bu hata, **Vercel'deki DATABASE_URL** environment variable'ının yanlış veya eksik olduğunu gösteriyor.

## ✅ ÇÖZÜM: Vercel'de DATABASE_URL'i Güncelle

### ADIM 1: Supabase'den Connection String Kopyala

1. **Supabase Dashboard** → **Settings → Database**
2. **"Connection string"** bölümünü bul
3. **"URI"** formatını seç
4. **"Show password"** butonuna tıkla
5. **Tam URL'i kopyala** (şifre dahil)

**Format:**
```
postgresql://postgres:S1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
```

### ADIM 2: Vercel'de DATABASE_URL'i Güncelle

1. **Vercel Dashboard** → Projenizi seçin
2. **Settings** → **Environment Variables** sekmesine git
3. **`DATABASE_URL`** değişkenini bul
4. **"Edit"** butonuna tıkla
5. **Supabase'den kopyaladığın URL'i yapıştır**
6. **Production, Preview, Development** hepsini seç
7. **"Save"** butonuna tıkla

### ADIM 3: Redeploy Yap

1. **Deployments** sekmesine git
2. En son deployment'ın yanındaki **"..."** menüsüne tıkla
3. **"Redeploy"** seçeneğini seç
4. **"Redeploy"** butonuna tıkla

### ADIM 4: Test Et

Birkaç dakika bekle (deployment tamamlanana kadar), sonra:
- Siteyi yenile
- Login sayfasına git
- Giriş yapmayı dene

---

## 🔍 Alternatif: Connection Pooler URL Kullan

Eğer normal URL çalışmazsa, Connection Pooler URL'i kullan:

1. **Supabase Dashboard → Settings → Database → Connection Pooling**
2. **"Connection string" → "URI"** formatını seç
3. **Port 6543** olan URL'i kopyala
4. Vercel'de `DATABASE_URL` olarak ekle

**Format:**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:[ŞİFRE]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## ⚠️ ÖNEMLİ:

- **Local `.env`** ve **Vercel Environment Variables** aynı URL'i kullanmalı
- IP kısıtlaması kaldırıldığına göre, normal URL (port 5432) çalışmalı
- Vercel'de güncelledikten sonra **mutlaka redeploy yap!**

---

**Vercel'de DATABASE_URL'i güncelle ve redeploy yap!**
