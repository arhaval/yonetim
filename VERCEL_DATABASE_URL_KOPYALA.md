# 📋 Vercel'e Kopyala-Yapıştır: DATABASE_URL

## ✅ Doğru URL (Kopyala ve Yapıştır)

Aşağıdaki URL'yi **tamamen kopyalayıp** Vercel'e yapıştırın:

```
postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## 🔍 Kontrol Listesi

URL'yi yapıştırdıktan sonra şunları kontrol edin:

1. ✅ **Başlangıç:** `postgresql://postgres.` (nokta var mı?)
2. ✅ **Kullanıcı adı:** `postgres.kwrbcwspdjlgixjkplzq` (nokta var mı?)
3. ✅ **Şifre:** `s1e0r1t1a89c`
4. ✅ **Host:** `aws-0-eu-central-1.pooler.supabase.com`
5. ✅ **Port:** `6543`
6. ✅ **Parametre:** `?pgbouncer=true`

---

## ⚠️ Yaygın Hatalar

1. **Boşluk eklemek:** URL'nin başında veya sonunda boşluk olmamalı
2. **Satır sonu:** URL tek satır olmalı, alt satıra geçmemeli
3. **Tırnak işareti:** URL'yi tırnak içine almamalısınız
4. **Eski URL:** Eski URL'i tamamen silip yenisini yapıştırmalısınız

---

## 🚀 Adımlar

1. **Yukarıdaki URL'yi kopyalayın** (tamamen)
2. **Vercel Dashboard** → Projeniz → **Settings → Environment Variables**
3. `DATABASE_URL` değişkenini bulun
4. **Edit** butonuna tıklayın
5. **Eski URL'i tamamen silin**
6. **Yeni URL'yi yapıştırın** (Ctrl+V)
7. **Environment:** Production, Preview, Development (hepsini seçin)
8. **Save** butonuna tıklayın
9. **Deployments** → En üstteki → **"..."** → **Redeploy**
10. 2-3 dakika bekleyin

---

## 🔄 Hâlâ Hata Alıyorsanız

**Alternatif URL'i deneyin (Normal Database):**

```
postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
```

Bu URL'de:
- Port: `5432` (6543 değil)
- Host: `db.kwrbcwspdjlgixjkplzq.supabase.co` (pooler.supabase.com değil)
- Parametre yok (`?pgbouncer=true` yok)

---

## ✅ Test

Redeploy sonrası:
- Site açılıyor mu?
- Login çalışıyor mu?
- Database sorguları başarılı mı?

**Hata devam ederse:** Vercel Dashboard'da URL'i tekrar kontrol edin ve yukarıdaki URL ile karşılaştırın.

