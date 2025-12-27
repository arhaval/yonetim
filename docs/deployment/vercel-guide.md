# 🚀 Vercel Deployment Rehberi

Bu rehber Vercel'e deployment yapmak için gerekli tüm adımları içerir.

## 📋 Adımlar

### 1. GitHub'a Push
```bash
git add .
git commit -m "Deploy"
git push
```

### 2. Vercel'de Proje Oluştur
1. Vercel.com'a git
2. "New Project" tıkla
3. GitHub repo'yu seç
4. Proje ayarlarını yap

### 3. Environment Variables Ekle
Vercel Dashboard → Settings → Environment Variables

**Gerekli Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - `production`

### 4. Deploy
Vercel otomatik olarak deploy eder. İlk deploy'dan sonra:
- Domain'i kontrol et
- Database bağlantısını test et
- Login'i test et

## 🔧 Sorun Giderme

### Database Bağlantı Hatası
- `DATABASE_URL` doğru mu kontrol et
- Connection pooler URL kullan
- IP whitelist kontrolü yap

### Build Hatası
- `npm run build` local'de test et
- Environment variables eksik mi kontrol et
- Prisma generate çalıştır

### Domain Sorunları
- DNS kayıtlarını kontrol et
- Vercel'de domain ayarlarını kontrol et

## 📚 Daha Fazla Bilgi

- [Vercel Dokümantasyonu](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

