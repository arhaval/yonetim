# 🚀 PERFORMANS OPTİMİZASYONU REHBERİ

## ✅ Yapılacaklar Listesi

### 1. DATABASE OPTİMİZASYONU (ÖNCELİKLİ)

#### A. SQL Migration'ı Çalıştır
```bash
# Dosya: PERFORMANS_OPTIMIZASYONU.sql
# Supabase SQL Editor'da çalıştırın
```

**Bu migration şunları yapar:**
- ✅ Tüm tablolara eksik index'leri ekler
- ✅ Composite index'ler (çoklu sorgular için)
- ✅ Partial index'ler (WHERE koşullu sorgular için)
- ✅ VACUUM ve ANALYZE (veritabanı temizliği)
- ✅ Materialized View (ağır sorgular için)
- ✅ Auto-vacuum ayarları

#### B. Supabase Dashboard Ayarları

**1. Connection Pooling Aktifleştir:**
```
Settings → Database → Connection Pooling
Mode: Transaction (daha hızlı)
Pool Size: 15 (Pro plan için)
```

**2. Database Settings:**
```
Settings → Database → Configuration
- shared_buffers: 256MB (Pro plan için)
- effective_cache_size: 1GB
- work_mem: 16MB
```

**3. API Settings:**
```
Settings → API
- Enable RLS (Row Level Security) ✓
- Enable Realtime: Sadece gerekli tablolar için
```

---

### 2. PRISMA OPTİMİZASYONU

#### A. Connection Pool (.env)
```env
# Mevcut DATABASE_URL'inizi şu formata çevirin:

# Transaction mode (daha hızlı)
DATABASE_URL="postgresql://user:pass@host:6543/db?pgbouncer=true&connection_limit=10"

# Direct connection (migration için)
DIRECT_URL="postgresql://user:pass@host:5432/db"
```

#### B. Prisma Schema Güncelle
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "fullTextIndex"]
  binaryTargets   = ["native", "debian-openssl-3.0.x"]
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

### 3. FRONTEND OPTİMİZASYONU

#### A. Cache Sistemi Kullan
```typescript
import { fetchWithCache } from '@/lib/cache'

// Önce:
const res = await fetch('/api/streams')
const data = await res.json()

// Sonra (30 saniye cache):
const data = await fetchWithCache('/api/streams', {}, 30000)
```

#### B. Debounce ile Arama
```typescript
import { debounce } from '@/lib/cache'

const handleSearch = debounce((query: string) => {
  // API call
}, 500) // 500ms bekle
```

#### C. Lazy Loading (Büyük Listeler İçin)
```typescript
// Infinite scroll için
const [page, setPage] = useState(1)
const [hasMore, setHasMore] = useState(true)

const loadMore = async () => {
  const data = await fetch(`/api/streams?page=${page}&limit=20`)
  // ...
  setPage(page + 1)
}
```

---

### 4. IMAGE OPTİMİZASYONU

#### A. Next.js Image Component Kullan
```tsx
// Önce:
<img src={profilePhoto} alt="Profile" />

// Sonra:
import Image from 'next/image'
<Image 
  src={profilePhoto} 
  alt="Profile" 
  width={100} 
  height={100}
  loading="lazy"
  quality={75}
/>
```

#### B. Cloudinary/Supabase Storage
```typescript
// Resimleri optimize et
const optimizedUrl = `${imageUrl}?width=400&quality=75`
```

---

### 5. API ROUTE OPTİMİZASYONU

#### A. Revalidation Ekle
```typescript
// Her API route'a ekle
export const revalidate = 30 // 30 saniye cache
```

#### B. Pagination Kullan
```typescript
// Tüm liste API'lerinde
const page = parseInt(searchParams.get('page') || '1')
const limit = parseInt(searchParams.get('limit') || '20')
const skip = (page - 1) * limit

const items = await prisma.model.findMany({
  skip,
  take: limit,
  // ...
})
```

#### C. Select Kullan (Gereksiz alanları çekme)
```typescript
// Önce:
const users = await prisma.user.findMany()

// Sonra:
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    // Sadece gerekli alanlar
  }
})
```

---

### 6. VERCEL DEPLOYMENT OPTİMİZASYONU

#### A. Vercel Dashboard Ayarları
```
Project Settings → Performance
- Edge Functions: Aktif
- Image Optimization: Aktif
- Caching: Aggressive
```

#### B. Environment Variables
```env
# Vercel'de ekle:
NODE_ENV=production
ENABLE_DEBUG=false
```

---

### 7. MONITORING & ANALYTICS

#### A. Supabase Monitoring
```
Dashboard → Reports
- Query Performance
- Slow Queries
- Connection Pool Usage
```

#### B. Vercel Analytics
```
Project → Analytics
- Page Load Times
- API Response Times
- Core Web Vitals
```

---

## 📊 PERFORMANS KONTROLÜ

### Test Sorguları (Supabase SQL Editor)

```sql
-- 1. Yavaş sorguları bul
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 10;

-- 2. Index kullanımını kontrol et
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    idx_tup_read as tuples_read
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- 3. Tablo boyutları
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 4. Cache hit ratio (>95% olmalı)
SELECT 
    sum(heap_blks_read) as heap_read,
    sum(heap_blks_hit)  as heap_hit,
    sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM pg_statio_user_tables;
```

---

## 🎯 ÖNCELİK SIRASI

1. **ÇOK ÖNEMLİ (Hemen Yapın):**
   - ✅ SQL Migration'ı çalıştır (PERFORMANS_OPTIMIZASYONU.sql)
   - ✅ Supabase Connection Pooling aktifleştir
   - ✅ Prisma connection pool ayarla (.env)

2. **ÖNEMLİ (Bu Hafta):**
   - ⏳ Cache sistemi entegre et (lib/cache.ts)
   - ⏳ API'lere revalidation ekle
   - ⏳ Image optimization kontrol et

3. **İYİLEŞTİRME (Zamanla):**
   - ⏳ Lazy loading ekle
   - ⏳ Debounce/throttle ekle
   - ⏳ Monitoring kur

---

## 📈 BEKLENEN SONUÇLAR

**Önce:**
- Sayfa yükleme: 3-5 saniye
- API response: 500-1000ms
- Database query: 200-500ms

**Sonra:**
- Sayfa yükleme: 0.5-1 saniye ⚡
- API response: 50-200ms ⚡
- Database query: 10-50ms ⚡

**Hedef:** %80-90 performans artışı 🚀

---

## 🆘 SORUN GİDERME

### Hala Yavaşsa:

1. **Supabase Logs kontrol et:**
   ```
   Dashboard → Logs → Slow Queries
   ```

2. **Vercel Logs kontrol et:**
   ```
   Project → Logs → Function Logs
   ```

3. **Browser DevTools:**
   ```
   Network tab → Yavaş istekleri bul
   Performance tab → Profiling yap
   ```

4. **Database Vacuum:**
   ```sql
   VACUUM FULL ANALYZE;
   ```

---

## 📞 DESTEK

Sorun devam ederse:
- Supabase Support (Pro plan)
- Vercel Support
- GitHub Issues

Başarılar! 🎉

