# 🔧 Sistem İyileştirme Planı

## 📊 Mevcut Durum Analizi

### ✅ İyi Yapılan Şeyler
- Next.js 14 kullanımı
- Prisma ORM ile tip güvenliği
- API route'larında cache kullanımı (`revalidate`)
- Index'ler tanımlı (schema.prisma)
- `Promise.all` ile paralel sorgular (reports API)

### ❌ Tespit Edilen Sorunlar

---

## 1. 🐢 HIZ PROBLEMLERİ

### A) Veritabanı Bağlantısı
**Sorun:** Supabase free tier'da connection limit ve latency yüksek.

**Çözümler:**
```bash
# 1. Supabase Connection Pooler kullanın (pgbouncer)
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# 2. Prepared statements devre dışı (pooler için)
DATABASE_URL="...?pgbouncer=true&connection_limit=1"
```

### B) N+1 Query Problemi
**Sorun:** Bazı API'lerde ilişkili verileri ayrı ayrı çekme.

**Örnek Sorunlu Kod:**
```typescript
// ❌ Yavaş - Her kayıt için ayrı sorgu
const records = await prisma.financialRecord.findMany()
for (const record of records) {
  const streamer = await prisma.streamer.findUnique({ where: { id: record.streamerId } })
}
```

**Çözüm:**
```typescript
// ✅ Hızlı - Tek sorguda tüm ilişkiler
const records = await prisma.financialRecord.findMany({
  include: { streamer: true }
})
```

### C) Gereksiz Veri Çekme
**Sorun:** `select` kullanılmadan tüm alanlar çekiliyor.

**Çözüm:**
```typescript
// ✅ Sadece gerekli alanları çek
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    // password: false - çekilmez
  }
})
```

### D) Cache Eksikliği
**Sorun:** Her istekte veritabanına gidiliyor.

**Çözümler:**
1. **API Route Cache:**
```typescript
export const revalidate = 60 // 60 saniye cache
```

2. **React Query / SWR kullanımı (client-side):**
```typescript
const { data } = useSWR('/api/team', fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 60000,
})
```

---

## 2. 🏗️ MİMARİ SORUNLAR

### A) Mükerrer Ödeme Kayıtları (DÜZELTİLDİ ✅)
- `/api/payouts` → Payout + FinancialRecord
- `/api/financial` → FinancialRecord (+ TeamPayment kaldırıldı)
- `/api/payment-approval/approve` → Payment + FinancialRecord

### B) Tutarsız Durum Yönetimi
**Sorun:** VoiceoverScript ve ContentRegistry farklı durum akışları.

**Öneri:** Tek bir durum makinesi (state machine) kullanın.

### C) API Route Sayısı Fazla
**Sorun:** 60+ API route, bakımı zor.

**Öneri:** 
- REST yerine tRPC veya GraphQL düşünün
- Veya route'ları gruplandırın

---

## 3. 🔒 GÜVENLİK EKSİKLERİ

### A) Rate Limiting
**Sorun:** API'lerde rate limit yok.

**Çözüm:** `lib/rate-limit.ts` dosyası var ama kullanılmıyor!

```typescript
// Her API route'a ekleyin:
import { rateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimit(request)
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  // ...
}
```

### B) Input Validation
**Sorun:** Zod kullanılıyor ama her yerde değil.

**Öneri:** Tüm POST/PATCH/PUT route'larına Zod validation ekleyin.

### C) SQL Injection
**Sorun:** Prisma kullanıldığı için büyük risk yok, ama raw query'lerde dikkat!

---

## 4. 📱 FRONTEND SORUNLARI

### A) Bundle Size
**Sorun:** Büyük kütüphaneler (recharts, jspdf) lazy load edilmiyor.

**Çözüm:**
```typescript
// ❌ Yavaş
import { LineChart } from 'recharts'

// ✅ Hızlı - Lazy load
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), {
  ssr: false,
  loading: () => <div>Yükleniyor...</div>
})
```

### B) Gereksiz Re-render
**Sorun:** State yönetimi optimize değil.

**Çözüm:** 
- `useMemo` ve `useCallback` kullanın
- Context yerine Zustand/Jotai düşünün

---

## 5. 🗄️ VERİTABANI OPTİMİZASYONU

### A) Eksik Index'ler
Şu alanlara index ekleyin:

```prisma
model FinancialRecord {
  // Mevcut index'ler iyi
  // Ek olarak composite index:
  @@index([entryType, direction, occurredAt])
}

model VoiceoverScript {
  // Eksik index:
  @@index([status, createdAt])
  @@index([voiceActorId, status])
}
```

### B) Soft Delete
**Sorun:** Kayıtlar fiziksel olarak siliniyor.

**Öneri:** `deletedAt` alanı ekleyip soft delete yapın.

---

## 6. 📈 ÖNCELİKLİ YAPILACAKLAR

### Acil (Bu Hafta)
1. ✅ Mükerrer ödeme sorunu düzeltildi
2. ⏳ Supabase Connection Pooler URL'i kontrol et
3. ⏳ Yavaş sorguları logla ve optimize et

### Kısa Vadeli (Bu Ay)
1. Rate limiting aktif et
2. Client-side cache (SWR/React Query)
3. Lazy loading ekle

### Orta Vadeli (3 Ay)
1. API route'ları birleştir/sadeleştir
2. Soft delete implementasyonu
3. Audit log'ları arşivle

### Uzun Vadeli (6 Ay)
1. tRPC veya GraphQL'e geçiş değerlendir
2. Redis cache ekle
3. Supabase Pro'ya geçiş değerlendir

---

## 7. 🛠️ HIZLI DÜZELTMELER

### Prisma Query Logging (Yavaş sorguları bul)
```typescript
// lib/prisma.ts'e eklendi
// 1 saniyeden uzun sorgular loglanacak
```

### API Response Time Header
```typescript
// Her API route'a ekle:
const start = Date.now()
// ... işlemler
const duration = Date.now() - start
response.headers.set('X-Response-Time', `${duration}ms`)
```

---

## 8. 📊 PERFORMANS METRİKLERİ

İzlenmesi gereken metrikler:
- API response time (hedef: <500ms)
- Database query time (hedef: <100ms)
- Page load time (hedef: <2s)
- Time to First Byte (hedef: <200ms)

Vercel Analytics veya custom logging ile izleyin.

