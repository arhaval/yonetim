# 🔧 Database Hatası Çözümü: "Tenant or user not found"

## 🔍 Sorun

**Hata Mesajı:**
```
Invalid `prisma.user.findUnique()` invocation: 
Error querying the database: FATAL: Tenant or user not found
```

Bu hata, Supabase Connection Pooler URL'inde **kullanıcı adı formatı** yanlış olduğunda oluşur.

## ✅ Çözüm

### 1. Vercel Dashboard'da DATABASE_URL Kontrolü

**Settings → Environment Variables → DATABASE_URL**

### 2. Doğru Pooler URL Formatı

**YANLIŞ Format:**
```
postgresql://postgres:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**DOĞRU Format:**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Fark:** `postgres` → `postgres.PROJECT_REF` (nokta var!)

### 3. Proje Referansını Bulma

Supabase Dashboard'da:
1. **Settings → General**
2. **Reference ID** kısmından proje referansınızı bulun
3. Örnek: `kwrbcwspdjlgixjkplzq`

### 4. URL Formatı

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Örnek:**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## 🔄 Alternatif: Normal Database URL Kullan

Eğer pooler URL çalışmıyorsa, normal database URL'i kullanabilirsiniz:

```
postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

**Farklar:**
- Port: `5432` (6543 değil)
- `?pgbouncer=true` parametresi yok
- Kullanıcı adı: `postgres.PROJECT_REF` (aynı)

## ✅ Adımlar

1. **Vercel Dashboard** → Projeniz → **Settings → Environment Variables**
2. `DATABASE_URL` değişkenini bulun
3. Değerini **doğru format** ile güncelleyin
4. **Save** butonuna tıklayın
5. **Deployments → Redeploy** yapın
6. 2-3 dakika bekleyin

## 🎯 Kontrol

Redeploy sonrası:
- Site açılıyor mu?
- Login çalışıyor mu?
- Database sorguları başarılı mı?

**Hâlâ hata alıyorsanız:** Normal database URL'i kullanın (port 5432).

