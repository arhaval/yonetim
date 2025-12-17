# 🚀 Vercel Environment Variables Ekleme - Adım Adım

## 📋 Hazır Bilgiler

### 1. DATABASE_URL
```
postgresql://postgres:s1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
```

### 2. NEXTAUTH_SECRET
```
1BSekt+AWkHRBZO8PSZyo2U6SJi6uN/g3e5sqK11CIE=
```

### 3. NEXTAUTH_URL
İlk başta Vercel'in verdiği URL'yi kullan (örnek: `https://yonetim-xxxxx.vercel.app`)
Domain ekledikten sonra: `https://yonetim.arhaval.com`

---

## 🎯 Adım Adım Ekleme

### Adım 1: Vercel Dashboard'a Git

1. https://vercel.com/dashboard adresine git
2. Projenizi seçin (muhtemelen "yonetim" adında)

### Adım 2: Environment Variables Sayfasına Git

1. Proje sayfasında → **Settings** sekmesine tıkla
2. Sol menüden **Environment Variables** seçeneğine tıkla

### Adım 3: DATABASE_URL Ekle

1. **"Add New"** butonuna tıkla
2. Şunları gir:
   - **Key:** `DATABASE_URL`
   - **Value:** `postgresql://postgres:s1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres`
   - **Environment:** 
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
     - (Hepsini seç!)
3. **"Save"** butonuna tıkla

⚠️ **ÖNEMLİ:** Secret seçme, direkt value olarak ekle!

### Adım 4: NEXTAUTH_SECRET Ekle

1. **"Add New"** butonuna tıkla
2. Şunları gir:
   - **Key:** `NEXTAUTH_SECRET`
   - **Value:** `1BSekt+AWkHRBZO8PSZyo2U6SJi6uN/g3e5sqK11CIE=`
   - **Environment:** 
     - ✅ Production
     - ✅ Preview
     - ✅ Development
     - (Hepsini seç!)
3. **"Save"** butonuna tıkla

### Adım 5: NEXTAUTH_URL Ekle

1. Önce Vercel'in verdiği proje URL'ini bul:
   - Proje sayfasında → **Deployments** sekmesine git
   - En üstteki deployment'ın URL'ini kopyala (örnek: `https://yonetim-xxxxx.vercel.app`)

2. **"Add New"** butonuna tıkla
3. Şunları gir:
   - **Key:** `NEXTAUTH_URL`
   - **Value:** Vercel'in verdiği URL (örnek: `https://yonetim-xxxxx.vercel.app`)
   - **Environment:** 
     - ✅ Production
     - ✅ Preview
     - ✅ Development
     - (Hepsini seç!)
4. **"Save"** butonuna tıkla

---

## ✅ Kontrol Listesi

- [ ] DATABASE_URL eklendi (Production, Preview, Development)
- [ ] NEXTAUTH_SECRET eklendi (Production, Preview, Development)
- [ ] NEXTAUTH_URL eklendi (Production, Preview, Development)
- [ ] Tüm variables'lar direkt value olarak eklendi (Secret değil!)

---

## 🔄 Sonraki Adımlar

Environment variables eklendikten sonra:

1. **Redeploy yap:**
   - Proje sayfasında → **Deployments** → En üstteki deployment'ın yanındaki **"..."** → **Redeploy**

2. **Veya yeni bir commit push et:**
   - Herhangi bir değişiklik yap ve GitHub'a push et
   - Vercel otomatik deploy edecek

3. **Database migration çalıştır:**
   - Vercel Terminal'de veya local'de:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

4. **İlk admin kullanıcısı oluştur:**
   ```bash
   npm run create-user
   ```

---

**Hazırsan başlayalım!** 🚀







