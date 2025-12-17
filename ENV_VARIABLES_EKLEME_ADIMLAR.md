# 🔐 Environment Variables Ekleme - Hızlı Adımlar

## ⚠️ ÖNEMLİ: Environment Variables Henüz Eklenmedi!

Vercel CLI ile kontrol ettim: **Environment variables henüz eklenmemiş.**

## 🎯 Hemen Şimdi Ekle (2 dakika)

### Adım 1: Vercel Dashboard'a Git

1. https://vercel.com/dashboard adresine git
2. **`arhaval-denetim-merkezi`** projesine tıkla

### Adım 2: Environment Variables Sayfasına Git

1. Üst menüden **"Settings"** sekmesine tıkla
2. Sol menüden **"Environment Variables"** seçeneğine tıkla

### Adım 3: 3 Environment Variable Ekle

Aşağıdaki 3 değişkeni sırayla ekle:

#### 1️⃣ DATABASE_URL

- **Key:** `DATABASE_URL`
- **Value:** `postgresql://postgres:s1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres`
- **Environment:** 
  - ✅ Production
  - ✅ Preview
  - ✅ Development
  - (Hepsini seç!)
- **"Add"** butonuna tıkla

#### 2️⃣ NEXTAUTH_SECRET

- **Key:** `NEXTAUTH_SECRET`
- **Value:** `1BSekt+AWkHRBZO8PSZyo2U6SJi6uN/g3e5sqK11CIE=`
- **Environment:** 
  - ✅ Production
  - ✅ Preview
  - ✅ Development
  - (Hepsini seç!)
- **"Add"** butonuna tıkla

#### 3️⃣ NEXTAUTH_URL

- **Key:** `NEXTAUTH_URL`
- **Value:** `https://arhaval-denetim-merkezi.vercel.app` (Vercel'in verdiği production URL)
- **Environment:** 
  - ✅ Production
  - ✅ Preview
  - ✅ Development
  - (Hepsini seç!)
- **"Add"** butonuna tıkla

### Adım 4: Redeploy Yap

Environment variables eklendikten sonra:

1. **"Deployments"** sekmesine git
2. En üstteki deployment'ın yanındaki **"..."** (üç nokta) butonuna tıkla
3. **"Redeploy"** seçeneğini seç
4. **"Redeploy"** butonuna tıkla

## ✅ Kontrol Listesi

- [ ] DATABASE_URL eklendi (Production, Preview, Development)
- [ ] NEXTAUTH_SECRET eklendi (Production, Preview, Development)
- [ ] NEXTAUTH_URL eklendi (Production, Preview, Development)
- [ ] Redeploy yapıldı
- [ ] Build başarılı oldu
- [ ] Site çalışıyor

---

**Not:** Environment variables eklendikten sonra mutlaka redeploy yapın! Yoksa yeni variables kullanılmaz.






