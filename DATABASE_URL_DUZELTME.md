# 🔧 DATABASE_URL Düzeltme - "Tenant or user not found" Hatası

## 🔍 Sorun

**Hata:**
```
Invalid `prisma.streamer.findUnique()` invocation: 
Error querying the database: FATAL: Tenant or user not found
```

Bu hata, Supabase Connection Pooler URL'inde **kullanıcı adı formatı** yanlış olduğunda oluşur.

## ✅ Çözüm: Vercel Dashboard'da DATABASE_URL'i Düzelt

### Adım 1: Vercel Dashboard'a Git

1. https://vercel.com/dashboard
2. Projenizi seçin
3. **Settings** → **Environment Variables**
4. `DATABASE_URL` değişkenini bulun

### Adım 2: Doğru URL Formatı

**YANLIŞ Format (Hata verir):**
```
postgresql://postgres:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**DOĞRU Format:**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Fark:** `postgres` → `postgres.PROJECT_REF` (nokta var!)

### Adım 3: Proje Referansını Bulma

**Supabase Dashboard'da:**
1. https://supabase.com/dashboard
2. Projenizi seçin
3. **Settings** → **General**
4. **Reference ID** kısmından proje referansınızı bulun
5. Örnek: `kwrbcwspdjlgixjkplzq`

### Adım 4: URL Formatı Şablonu

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Senin için:**
- PROJECT_REF: `kwrbcwspdjlgixjkplzq` (Supabase'den kontrol et)
- PASSWORD: `s1e0r1t1a89c`
- REGION: `eu-central-1` (muhtemelen)

**Örnek URL:**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## 🔄 Alternatif: Normal Database URL Kullan

Eğer pooler URL çalışmıyorsa, **normal database URL** kullanabilirsiniz:

**Normal Database URL:**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
```

**Farklar:**
- Port: `5432` (6543 değil)
- Host: `db.PROJECT_REF.supabase.co` (pooler.supabase.com değil)
- `?pgbouncer=true` parametresi yok
- Kullanıcı adı: `postgres.PROJECT_REF` (aynı)

## ✅ Adımlar

1. **Supabase Dashboard** → Projeniz → **Settings → General**
2. **Reference ID**'yi kopyala (örnek: `kwrbcwspdjlgixjkplzq`)
3. **Vercel Dashboard** → Projeniz → **Settings → Environment Variables**
4. `DATABASE_URL` değişkenini bul
5. **Edit** butonuna tıkla
6. **Value** alanına şunu yapıştır:
   ```
   postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
   (PROJECT_REF'i kendi proje referansınla değiştir!)
7. **Environment:** Production, Preview, Development (hepsini seç)
8. **Save** butonuna tıkla
9. **Deployments** → En üstteki → **"..."** → **Redeploy**
10. 2-3 dakika bekle

## 🎯 Kontrol

Redeploy sonrası:
- ✅ Site açılıyor mu?
- ✅ Login çalışıyor mu?
- ✅ Database sorguları başarılı mı?

**Hâlâ hata alıyorsanız:** Normal database URL'i kullanın (port 5432).

## ⚠️ ÖNEMLİ NOTLAR

1. **Kullanıcı adı formatı:** `postgres.PROJECT_REF` (nokta var!)
2. **Pooler port:** `6543` (normal port: `5432`)
3. **Pooler host:** `pooler.supabase.com` (normal host: `db.supabase.co`)
4. **Parametre:** `?pgbouncer=true` (sadece pooler için)

**En önemli kısım:** Kullanıcı adında `postgres.` (nokta) olmalı!

