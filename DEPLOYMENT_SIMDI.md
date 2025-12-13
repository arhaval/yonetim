# 🚀 Siteyi Aktif Etme - ŞİMDİ YAPILACAKLAR

## ✅ Hazır Olanlar

- ✅ Proje yapısı hazır
- ✅ `vercel.json` konfigürasyonu mevcut
- ✅ Environment variables bilgileri hazır

## 🎯 ŞİMDİ YAPILACAKLAR

### 1️⃣ Vercel Web Arayüzü ile Deploy (Önerilen)

**Adım 1: Vercel Dashboard'a Git**
1. https://vercel.com/dashboard adresine git
2. Giriş yap (zaten hesabın varsa)

**Adım 2: Yeni Proje Ekle**
1. **"Add New Project"** butonuna tıkla
2. GitHub repository'nizi seç: `arhaval-denetim-merkezi` (veya hangi repo ismi ise)
3. **"Import"** butonuna tıkla

**Adım 3: Proje Ayarları**
- Framework Preset: Next.js (otomatik algılanmalı)
- Root Directory: `./` (boş bırak)
- Build Command: `npm run build` (varsayılan)
- Output Directory: `.next` (varsayılan)
- Install Command: `npm install` (varsayılan)

**Adım 4: Environment Variables Ekle**

**Settings** sekmesine git → **Environment Variables** → Şunları ekle:

```
Key: DATABASE_URL
Value: postgresql://postgres:s1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
Environment: Production, Preview, Development (hepsini seç!)
```

```
Key: NEXTAUTH_SECRET
Value: 1BSekt+AWkHRBZO8PSZyo2U6SJi6uN/g3e5sqK11CIE=
Environment: Production, Preview, Development (hepsini seç!)
```

```
Key: NEXTAUTH_URL
Value: (İlk başta boş bırak, deployment sonrası Vercel'in verdiği URL'yi ekle)
Örnek: https://arhaval-denetim-merkezi-xxxxx.vercel.app
Environment: Production, Preview, Development (hepsini seç!)
```

**Adım 5: Deploy Et**
1. **"Deploy"** butonuna tıkla
2. Build işlemini bekle (2-3 dakika)
3. Deployment URL'ini kopyala

**Adım 6: NEXTAUTH_URL'i Güncelle**
1. Deployment sonrası Vercel'in verdiği URL'yi al (örnek: `https://arhaval-denetim-merkezi-xxxxx.vercel.app`)
2. **Settings** → **Environment Variables** → `NEXTAUTH_URL`'i güncelle
3. Vercel'in verdiği URL'yi ekle (sonuna `/` koyma!)
4. **Redeploy** yap

---

### 2️⃣ Vercel CLI ile Deploy (Alternatif)

**Adım 1: Login Yap**
```bash
vercel login
```
(Tarayıcıda açılacak, giriş yap)

**Adım 2: Deploy Et**
```bash
vercel --yes
```

**Adım 3: Environment Variables Ekle**
Vercel Dashboard'dan environment variables'ları ekle (yukarıdaki gibi)

**Adım 4: Production Deploy**
```bash
vercel --prod
```

---

## 📋 Deployment Sonrası Yapılacaklar

### 1. Database Migration

Deployment başarılı olduktan sonra, **local'de** şunları çalıştır:

```bash
# .env dosyasına DATABASE_URL ekle (yukarıdaki değer)
npx prisma generate
npx prisma migrate deploy
```

**VEYA** Vercel Build Command'ına ekle (otomatik olsun):

`vercel.json` dosyasına `buildCommand` ekle:
```json
{
  "buildCommand": "npx prisma generate && npm run build"
}
```

### 2. İlk Admin Kullanıcısı Oluştur

**Local'de** (DATABASE_URL environment variable ile):

```bash
npm run create-user admin@arhaval.com sifre123 Admin
```

**VEYA** Vercel Terminal'den (varsa):
```bash
npx prisma studio
# Prisma Studio'dan manuel ekle
```

---

## ✅ Kontrol Listesi

- [ ] Vercel Dashboard'a giriş yapıldı
- [ ] GitHub repository bağlandı
- [ ] Proje oluşturuldu
- [ ] Environment variables eklendi (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL)
- [ ] İlk deployment yapıldı
- [ ] Deployment başarılı oldu
- [ ] NEXTAUTH_URL güncellendi
- [ ] Redeploy yapıldı
- [ ] Database migration çalıştırıldı
- [ ] İlk admin kullanıcısı oluşturuldu
- [ ] Site test edildi

---

## 🆘 Sorun Giderme

**Build hatası: `contentType column does not exist`**
- ✅ **ÇÖZÜLDÜ!** Build komutu artık otomatik column ekliyor
- Eğer hala hata alırsanız: `DEPLOYMENT_CONTENTTYPE_FIX.md` dosyasına bakın
- Veya Supabase SQL Editor'den manuel ekleyin (yukarıdaki rehberde var)

**Build hatası alırsan:**
- Environment variables'ların doğru eklendiğini kontrol et
- `npx prisma generate` komutunu build'e ekle

**Database bağlantı hatası:**
- DATABASE_URL'in doğru olduğunu kontrol et
- Supabase'de database'in aktif olduğunu kontrol et

**Login çalışmıyorsa:**
- NEXTAUTH_SECRET'ın doğru olduğunu kontrol et
- NEXTAUTH_URL'in deployment URL'i ile eşleştiğini kontrol et

---

**Hazırsan başlayalım!** 🚀

