# 🔧 Prisma Prepared Statement Hatası Çözümü

## ❌ Hata
```
Error occurred during query execution: ConnectorError(ConnectorError { 
  user_facing_error: None, 
  kind: QueryError(PostgresError { 
    code: "42P05", 
    message: "prepared statement \"s3\" already exists", 
    severity: "ERROR"
  })
})
```

## 🔍 Sorun
Bu hata, Supabase Connection Pooler kullanırken Prisma'nın prepared statement cache'i ile ilgili bir uyumsuzluktan kaynaklanıyor. Connection Pooler, prepared statement'ları farklı şekilde yönetir ve Prisma'nın cache mekanizması ile çakışır.

## ✅ Çözüm

### 1. Prisma Client Singleton Pattern
Prisma Client'ı her zaman singleton pattern ile kullanıyoruz. Bu, prepared statement'ların doğru şekilde yönetilmesini sağlar.

### 2. Connection Pooler URL Kontrolü
DATABASE_URL'iniz Connection Pooler URL'si kullanıyor olmalı:
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Önemli:** URL'de `?pgbouncer=true` parametresi olmalı!

### 3. Prisma Client Yapılandırması
`lib/prisma.ts` dosyasında Prisma Client singleton pattern ile oluşturuluyor:

```typescript
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}
```

## 🚀 Ek Öneriler

### 1. Connection Limit Kontrolü
Supabase Connection Pooler'da connection limit'inizi kontrol edin. Free tier'da genellikle 60 connection limit vardır.

### 2. Prisma Client Versiyonu
Prisma Client'ın güncel versiyonunu kullanın:
```bash
npm install @prisma/client@latest
npm install prisma@latest --save-dev
```

### 3. Vercel Environment Variables
Vercel'de `DATABASE_URL` environment variable'ınızın doğru olduğundan emin olun:
- Connection Pooler URL kullanın (port 6543)
- `?pgbouncer=true` parametresi ekleyin

## 📝 Test
Değişikliklerden sonra:
1. Vercel'de redeploy yapın
2. Uygulamayı test edin
3. Hata devam ederse, Supabase Dashboard'dan connection pooler ayarlarını kontrol edin

---

**NOT:** Bu hata genellikle Vercel serverless ortamında görülür. Singleton pattern kullanımı sorunu çözer.

