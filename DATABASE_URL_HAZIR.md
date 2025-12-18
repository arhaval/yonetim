# 🔧 DATABASE_URL - Hazır Formatlar

## Proje Referansınız: `kwrbcwspdjlgixjkplzq`

## ✅ Seçenek 1: Connection Pooler URL (Önerilen - Daha Hızlı)

**Vercel Dashboard → Settings → Environment Variables → DATABASE_URL**

```
postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Özellikler:**
- ✅ Connection pooling (daha hızlı)
- ✅ Port: `6543`
- ✅ Host: `pooler.supabase.com`
- ✅ Parametre: `?pgbouncer=true`

---

## ✅ Seçenek 2: Normal Database URL (Alternatif)

**Eğer pooler URL çalışmazsa bu URL'i kullanın:**

```
postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
```

**Özellikler:**
- ✅ Direkt bağlantı
- ✅ Port: `5432`
- ✅ Host: `db.kwrbcwspdjlgixjkplzq.supabase.co`
- ✅ Parametre yok

---

## 🚀 Adımlar

1. **Vercel Dashboard** → Projeniz → **Settings → Environment Variables**
2. `DATABASE_URL` değişkenini bulun
3. **Edit** butonuna tıklayın
4. **Value** alanına **Seçenek 1** URL'ini yapıştırın:
   ```
   postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
5. **Environment:** Production, Preview, Development (hepsini seçin)
6. **Save** butonuna tıklayın
7. **Deployments** → En üstteki → **"..."** → **Redeploy**
8. 2-3 dakika bekleyin

---

## ⚠️ ÖNEMLİ NOTLAR

- ✅ Kullanıcı adı: `postgres.kwrbcwspdjlgixjkplzq` (nokta var!)
- ✅ Şifre: `s1e0r1t1a89c`
- ✅ Proje referansı: `kwrbcwspdjlgixjkplzq`

**En önemli kısım:** Kullanıcı adında `postgres.` (nokta) olmalı!

---

## 🔍 Region Kontrolü

Eğer `eu-central-1` çalışmazsa, şu region'ları deneyin:

**us-east-1 (ABD Doğu):**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**us-west-1 (ABD Batı):**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Önce `eu-central-1`'i deneyin, çalışmazsa diğerlerini deneyin!**

