# 🚀 Deployment Adımları

## ✅ Tamamlanan

- [x] Environment Variables eklendi (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL)

## 🔄 Şimdi Yapılacaklar

### 1. GitHub Bağlantısını Kontrol Et

1. **Vercel Dashboard** → Projeniz → **Settings** → **Git**
2. GitHub repository bağlı mı kontrol et:
   - Eğer **"Connect Git Repository"** görüyorsan → GitHub'ı bağla
   - Eğer zaten bağlıysa → Hangi branch? (muhtemelen `main`)

### 2. Deploy Et

#### Seçenek A: GitHub Bağlıysa (Otomatik Deploy)

1. Küçük bir değişiklik yap (örnek: README'ye bir satır ekle)
2. Git push yap:
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push
   ```
3. Vercel otomatik olarak deploy edecek!

#### Seçenek B: GitHub Bağlı Değilse

1. **Settings** → **Git** → **Connect Git Repository**
2. GitHub → `arhaval/yonetim` repository'sini seç
3. Vercel otomatik olarak deploy edecek!

#### Seçenek C: Manuel Deploy

1. **Deployments** sekmesine git
2. **"Redeploy"** butonuna tıkla (eğer varsa)

### 3. Deployment'ı Bekle

- Vercel deployment yaparken **"Building"** göreceksin
- Bittiğinde **"Ready"** olacak
- Deployment URL'ini göreceksin (örnek: `https://arhaval-yonetim.vercel.app`)

### 4. Database Migration

Deployment başarılı olduktan sonra:

**Vercel Terminal'de veya local'de (DATABASE_URL environment variable ile):**

```bash
npx prisma generate
npx prisma migrate deploy
```

**Not:** Vercel'de terminal kullanmak için:
- Proje → **Deployments** → En son deployment → **"..."** → **"View Function Logs"** veya **"View Build Logs"**
- Veya local'de `.env` dosyasına `DATABASE_URL` ekleyip çalıştır

### 5. İlk Admin Kullanıcısı Oluştur

```bash
npm run create-user <email> <password> [name]
# Örnek: npm run create-user admin@arhaval.com sifre123 Admin
```

---

## 🎯 Şimdi Ne Yapmalı?

1. **Settings** → **Git** → GitHub bağlı mı kontrol et
2. Eğer bağlıysa → Küçük bir değişiklik yap ve push et
3. Eğer bağlı değilse → GitHub'ı bağla
4. Deployment'ı bekle
5. Database migration çalıştır
6. İlk admin kullanıcısı oluştur

---

**GitHub bağlantısını kontrol et ve haber ver!** 🚀












