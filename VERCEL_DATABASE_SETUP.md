# 🔧 Vercel Database Kurulumu - ZORUNLU ADIMLAR

## ⚠️ ÖNEMLİ: Bu adımları takip etmezseniz veriler kaybolur!

### 1️⃣ Vercel Environment Variables Ayarları

1. Vercel Dashboard'a gidin: https://vercel.com/dashboard
2. Projenizi seçin
3. **Settings** → **Environment Variables**
4. `DATABASE_URL` değişkenini bulun

### 2️⃣ DATABASE_URL Değeri

**✅ DOĞRU DEĞER (SADECE BU KULLANILMALI):**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:S1e0r1t1a89c@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
```

**AÇIKLAMA:**
- Project Reference: kwrbcwspdjlgixjkplzq
- Region: eu-north-1 (Europe North - Stockholm)
- Password: S1e0r1t1a89c
- Port: 5432 (Session Mode Pooler)

**❌ YANLIŞ DEĞERLER (BUNLARI KULLANMAYIN):**
```
# Direct connection - YANLIŞ!
postgresql://postgres:***@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres

# Transaction pooler - YANLIŞ!
postgresql://postgres.kwrbcwspdjlgixjkplzq:***@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
```

### 3️⃣ Kontrol Listesi

DATABASE_URL'de şunlar OLMALI:
- ✅ `pooler.supabase.com` (hostname)
- ✅ Port `5432`
- ✅ Region: `aws-1-eu-north-1`
- ✅ Username: `postgres.kwrbcwspdjlgixjkplzq`

DATABASE_URL'de şunlar OLMAMALI:
- ❌ `db.supabase.co` (direct connection)
- ❌ Port `6543` (transaction pooler)
- ❌ Farklı region

### 4️⃣ Vercel'de Kaydetme

1. Eski `DATABASE_URL` varsa **SİL**
2. Yeni `DATABASE_URL` ekle (yukarıdaki doğru değeri kopyala)
3. **Environment** seçenekleri:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. **Save** butonuna tıkla
5. **Redeploy** yap:
   - Deployments sekmesine git
   - En son deployment'ı bul
   - Üç nokta (...) → **Redeploy**

### 5️⃣ Test

Deploy bittikten sonra:
```bash
# API test
curl https://your-site.vercel.app/api/team

# Ekip üyeleri görünmeli
```

### 🆘 Sorun Devam Ederse

1. Vercel Dashboard → Settings → Environment Variables
2. `DATABASE_URL`'i tamamen sil
3. Tarayıcıyı yenile
4. Yeniden ekle (doğru değerle)
5. Redeploy

### 📝 Notlar

- Bu ayar **bir kez** yapılmalı ve **asla değişmemeli**
- Her deployment'ta otomatik olarak bu değer kullanılır
- Eğer veriler kayboluyorsa, %99 bu ayar yanlıştır
- Prisma artık yanlış URL kullanılırsa **hata verecek** şekilde ayarlandı

---

**Son güncelleme:** 2026-01-22
**Durum:** Aktif ve zorunlu

