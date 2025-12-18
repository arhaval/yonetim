# 🚨 ACİL: Database Hatası Çözümü

## ❌ Hata

```
Invalid `prisma.streamer.findUnique()` invocation: 
Error querying the database: FATAL: Tenant or user not found
```

## ✅ Çözüm: Vercel Dashboard'da DATABASE_URL'i Düzelt

### Adım 1: Supabase'den Proje Referansını Bul

1. https://supabase.com/dashboard
2. Projenizi seçin
3. **Settings** → **General**
4. **Reference ID** kısmından proje referansınızı kopyalayın
   - Örnek: `kwrbcwspdjlgixjkplzq`

### Adım 2: Vercel Dashboard'a Git

1. https://vercel.com/dashboard
2. Projenizi seçin
3. **Settings** → **Environment Variables**
4. `DATABASE_URL` değişkenini bulun
5. **Edit** butonuna tıklayın

### Adım 3: Doğru URL'i Yapıştır

**ÖNEMLİ:** Kullanıcı adında `postgres.` (nokta) olmalı!

**Pooler URL (Önerilen - Daha Hızlı):**
```
postgresql://postgres.[PROJECT_REF]:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Örnek (PROJECT_REF'i kendi proje referansınla değiştir!):**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Normal Database URL (Alternatif - Pooler çalışmazsa):**
```
postgresql://postgres.[PROJECT_REF]:s1e0r1t1a89c@db.[PROJECT_REF].supabase.co:5432/postgres
```

**Örnek:**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
```

### Adım 4: Kaydet ve Redeploy

1. **Value** alanına doğru URL'i yapıştırın
2. **Environment:** Production, Preview, Development (hepsini seç)
3. **Save** butonuna tıklayın
4. **Deployments** → En üstteki deployment → **"..."** → **Redeploy**
5. 2-3 dakika bekleyin

## 🔍 Kontrol Listesi

- ✅ Kullanıcı adı: `postgres.PROJECT_REF` (nokta var!)
- ✅ Şifre: `s1e0r1t1a89c`
- ✅ Pooler port: `6543` (normal port: `5432`)
- ✅ Pooler host: `pooler.supabase.com` (normal host: `db.supabase.co`)
- ✅ Pooler parametresi: `?pgbouncer=true` (sadece pooler için)

## ⚠️ En Sık Yapılan Hatalar

1. **YANLIŞ:** `postgres:s1e0r1t1a89c@...` (nokta yok!)
2. **DOĞRU:** `postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@...` (nokta var!)

**Kullanıcı adında mutlaka `postgres.` (nokta) olmalı!**

## 🎯 Test

Redeploy sonrası:
- Site açılıyor mu?
- Login çalışıyor mu?
- Database sorguları başarılı mı?

**Hâlâ hata alıyorsanız:** Normal database URL'i kullanın (port 5432, pooler parametresi yok).

