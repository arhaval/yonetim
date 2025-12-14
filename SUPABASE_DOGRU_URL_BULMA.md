# 🔧 Supabase Doğru Connection URL Bulma

## ❌ Hata: "Tenant or user not found"

Bu hata, Connection Pooler URL formatının yanlış olduğunu gösteriyor.

---

## 🎯 Çözüm: Supabase Dashboard'dan Doğru URL'i Al

### Adım 1: Supabase Dashboard

1. https://supabase.com/dashboard → Projenizi açın
2. **Settings** (sol menü, en altta)
3. **Database** → **Connection string** veya **Connection pooling**

### Adım 2: Connection String'i Bul

**2 seçenek var:**

#### Seçenek 1: Connection Pooling (Önerilen)
- **Connection pooling** sekmesine git
- **Session mode** veya **Transaction mode** seç
- **URI** formatını kopyala
- Format şöyle olmalı:
  ```
  postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
  ```

#### Seçenek 2: Direct Connection (IP whitelist gerektirir)
- **Connection string** sekmesine git
- **URI** formatını kopyala
- Format şöyle olmalı:
  ```
  postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
  ```

---

## 🔍 Manuel Format Kontrolü

Eğer Supabase Dashboard'da bulamazsan, şu formatları dene:

### Format 1: Connection Pooler (Session Mode)
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Format 2: Connection Pooler (Transaction Mode)
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### Format 3: Direct Connection (IP whitelist gerekli)
```
postgresql://postgres:s1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
```

---

## ⚠️ ÖNEMLİ: URL Formatındaki Farklar

### Connection Pooler URL:
- ✅ `postgres.[PROJECT_REF]` (nokta var!)
- ✅ `pooler.supabase.com`
- ✅ Port: `6543`
- ✅ `?pgbouncer=true`

### Direct Connection URL:
- ✅ `postgres` (nokta YOK!)
- ✅ `db.[PROJECT_REF].supabase.co`
- ✅ Port: `5432`
- ✅ Query string yok

---

## 🚀 Hızlı Test

**Vercel'de şu URL'leri sırayla dene:**

### 1. Connection Pooler (Session Mode) - ÖNCE BUNU DENE
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 2. Connection Pooler (Transaction Mode)
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### 3. Direct Connection (IP whitelist gerekli)
```
postgresql://postgres:s1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
```

---

## 📋 Supabase Dashboard'da Nereye Bakmalı?

1. **Settings** → **Database**
2. Şu sekmeleri kontrol et:
   - **Connection string**
   - **Connection pooling**
   - **Connection info**

**Her sekmede farklı formatlar var, hepsini kontrol et!**

---

## ✅ Doğru URL'i Bulduktan Sonra

1. Vercel → **Settings** → **Environment Variables**
2. `DATABASE_URL` → **Edit**
3. Doğru URL'i yapıştır
4. **Save**
5. **Redeploy**

---

**ÖNCE SUPABASE DASHBOARD'DAN DOĞRU URL'İ AL, SONRA VERCEL'DE GÜNCELLE!** 🚀

