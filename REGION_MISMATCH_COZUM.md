# ✅ Region Mismatch Sorunu - Çözüm

## 🔍 Sorun:
Supabase projeniz **Stockholm (eu-north-1)** bölgesinde ama pooler URL'i **Frankfurt (eu-central-1)** kullanıyor.

Bu yüzden **"FATAL: Tenant or user not found"** hatası alıyorsunuz.

## ✅ Çözüm:

### Stockholm (eu-north-1) için Doğru Pooler URL Formatı:

```
postgresql://postgres.kwrbcwspdjlgixjkplzq:S1e0r1t1a89c@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Önemli:**
- ✅ Host: `aws-0-eu-north-1.pooler.supabase.com` (Stockholm)
- ✅ Port: `6543` (Pooler)
- ✅ Username: `postgres.kwrbcwspdjlgixjkplzq` (nokta ile!)
- ✅ Password: `S1e0r1t1a89c`
- ✅ Query: `?pgbouncer=true`

### ❌ Yanlış (Frankfurt - eu-central-1):
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:S1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## 📝 Adımlar:

### 1. Vercel'de DATABASE_URL Güncelle:

1. **Vercel Dashboard** → Projenizi seçin
2. **Settings → Environment Variables**
3. **`DATABASE_URL`** değişkenini bul
4. **Edit** butonuna tıkla
5. **Yeni değeri yapıştır:**
   ```
   postgresql://postgres.kwrbcwspdjlgixjkplzq:S1e0r1t1a89c@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
6. **Save** butonuna tıkla
7. **Redeploy** yap (Deployments → En son deployment → "Redeploy")

### 2. Local .env Dosyasını Güncelle:

`.env` dosyanızda:
```env
DATABASE_URL="postgresql://postgres.kwrbcwspdjlgixjkplzq:S1e0r1t1a89c@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### 3. Test Et:

```bash
npm run test-db
```

Veya tarayıcıda:
```
https://yonetim.arhaval.com/api/db-info
```

---

## 🌍 Supabase Region Kodları:

| Region | AWS Kodu | Pooler Host |
|--------|----------|-------------|
| Stockholm | eu-north-1 | `aws-0-eu-north-1.pooler.supabase.com` |
| Frankfurt | eu-central-1 | `aws-0-eu-central-1.pooler.supabase.com` |
| London | eu-west-2 | `aws-0-eu-west-2.pooler.supabase.com` |
| US East | us-east-1 | `aws-0-us-east-1.pooler.supabase.com` |

---

## ✅ Kontrol:

`/api/db-info` endpoint'inde şunları kontrol edin:
- ✅ `host`: `aws-0-eu-north-1.pooler.supabase.com`
- ✅ `port`: `6543`
- ✅ `user`: `postgres.kwrbcwspdjlgixjkplzq`

---

**Bu değişiklikten sonra "Tenant or user not found" hatası çözülmeli!**

