# 🔧 Vercel Connection Pooler URL - Manuel Oluşturma

## 🎯 Çözüm: Connection Pooler URL'ini Manuel Oluştur

Supabase'de bulamadığın için, Connection Pooler URL'ini manuel olarak oluşturalım.

### Connection Pooler URL Formatı

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Senin Proje İçin URL

**Proje Referansın:** `kwrbcwspdjlgixjkplzq`  
**Şifren:** `s1e0r1t1a89c`  
**Region:** `eu-central-1` (muhtemelen, kontrol et)

**Connection Pooler URL:**
```
postgresql://postgres.skwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

⚠️ **ÖNEMLİ:** 
- `postgres.` (nokta var!)
- Port: **6543** (5432 değil!)
- `pooler.supabase.com` (db.supabase.co değil!)

---

## 🚀 Vercel'de Güncelle

### Adım 1: Vercel Dashboard

1. https://vercel.com/dashboard → Projenizi açın
2. **Settings** → **Environment Variables**

### Adım 2: DATABASE_URL'i Güncelle

1. `DATABASE_URL` değişkenini bul
2. **Edit** butonuna tıkla
3. **Value** alanına şunu yapıştır:
   ```
   postgresql://postgres.skwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
4. **Environment:** Production, Preview, Development (hepsini seç)
5. **Save** butonuna tıkla

### Adım 3: Redeploy

1. **Deployments** → En üstteki → **"..."** → **Redeploy**
2. **2-3 dakika bekle**

---

## 🔍 Region Kontrolü

Eğer `eu-central-1` çalışmazsa, şu region'ları dene:

1. **eu-central-1** (Almanya)
   ```
   postgresql://postgres.skwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

2. **us-east-1** (ABD Doğu)
   ```
   postgresql://postgres.skwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

3. **us-west-1** (ABD Batı)
   ```
   postgresql://postgres.skwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

---

## ✅ Test Et

1. Vercel'de redeploy yaptıktan sonra
2. https://arhaval-denetim-merkezi.vercel.app/login
3. Giriş yapmayı dene

---

**ÖNCE EU-CENTRAL-1'İ DENE, ÇALIŞMAZSA DİĞER REGION'LARI DENE!** 🚀


