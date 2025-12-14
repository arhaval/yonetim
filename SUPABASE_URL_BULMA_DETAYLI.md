# 🔍 Supabase Doğru URL Bulma - Detaylı Rehber

## ❌ Hata: "Tenant or user not found"

Bu hata, URL formatının hala yanlış olduğunu gösteriyor. Supabase Dashboard'dan **kesin doğru URL'i** almalıyız.

---

## 🎯 Adım 1: Supabase Dashboard'a Git

1. https://supabase.com/dashboard
2. Projenizi açın
3. Sol menüden **Settings** (⚙️ ikonu, en altta)
4. **Database** sekmesine tıklayın

---

## 🔍 Adım 2: Connection String'i Bul

Supabase Dashboard'da **3 farklı yerde** connection string olabilir:

### Yer 1: Connection String (Direct Connection)
- **Database** sayfasında
- **Connection string** veya **Connection info** bölümü
- Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`

### Yer 2: Connection Pooling (Session Mode)
- **Database** sayfasında
- **Connection pooling** sekmesi
- **Session mode** seçeneği
- Format: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true`

### Yer 3: Connection Pooling (Transaction Mode)
- **Database** sayfasında
- **Connection pooling** sekmesi
- **Transaction mode** seçeneği
- Format: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`

---

## 📸 Supabase Dashboard'da Ne Görmelisin?

**Database sayfasında şunları görmelisin:**

1. **Connection string** (Direct connection için)
2. **Connection pooling** (Pooler için)
3. **Connection info** (Genel bilgiler)

**Her birinde "URI" veya "Connection string" butonu olmalı!**

---

## 🚀 Adım 3: Doğru URL'i Kopyala

**Connection Pooling (Session Mode)** URL'ini kopyala - bu en güvenli seçenek!

Format şöyle olmalı:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**ÖNEMLİ:** 
- `postgres.[PROJECT_REF]` (nokta var, proje referansı var)
- `pooler.supabase.com` (pooler var!)
- Port: `6543`
- `?pgbouncer=true` (query string var!)

---

## ⚠️ Eğer Supabase Dashboard'da Bulamazsan

### Alternatif 1: Direct Connection (IP whitelist gerekli)

```
postgresql://postgres:s1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
```

**Not:** Bu çalışmazsa, Supabase'de IP whitelist'i kaldırman gerekir.

### Alternatif 2: Farklı Region'ları Dene

**eu-central-1:**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**us-east-1:**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**us-west-1:**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## 🔧 Adım 4: Vercel'de Güncelle

1. Vercel → **Settings** → **Environment Variables**
2. `DATABASE_URL` → **Edit**
3. Supabase'den kopyaladığın URL'i yapıştır
4. **Save**
5. **Redeploy**

---

## ✅ Kontrol Listesi

- [ ] Supabase Dashboard'a gittim
- [ ] Settings → Database'e tıkladım
- [ ] Connection Pooling (Session Mode) URL'ini buldum
- [ ] URL'i kopyaladım
- [ ] Vercel'de DATABASE_URL'i güncelledim
- [ ] Redeploy yaptım

---

## 🆘 Hala Çalışmıyorsa

1. **Supabase Dashboard'da ekran görüntüsü al** (Database sayfası)
2. **Vercel'de DATABASE_URL'in değerini kontrol et** (gizli karakter var mı?)
3. **Supabase proje şifresini kontrol et** (s1e0r1t1a89c doğru mu?)

---

**ÖNCE SUPABASE DASHBOARD'DAN KESIN DOĞRU URL'İ AL, SONRA VERCEL'DE GÜNCELLE!** 🎯

