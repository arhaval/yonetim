# 🔐 Environment Variables Rehberi

Bu rehber projede kullanılan environment variables'ları açıklar.

## 📋 Gerekli Variables

### Production (Vercel)
```env
DATABASE_URL=postgresql://...
NODE_ENV=production
```

### Development (Local)
```env
DATABASE_URL=postgresql://...
NODE_ENV=development
```

## 🔧 Vercel'de Ekleme

1. Vercel Dashboard → Settings → Environment Variables
2. Her variable için:
   - Key: Variable adı
   - Value: Variable değeri
   - Environment: Production, Preview, Development

## 📚 Daha Fazla Bilgi

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

