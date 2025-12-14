# ✅ Vercel'de DATABASE_URL Değiştirme - Adım Adım

## 🎯 Yapılacaklar

Vercel'de `DATABASE_URL` değişkenini **tamamen** değiştir.

---

## 📋 Adım Adım

### 1. Vercel Dashboard'a Git

1. https://vercel.com/dashboard
2. Projenizi açın: **Arhaval Denetim Merkezi**
3. **Settings** (üst menü)
4. **Environment Variables** (sol menü)

### 2. DATABASE_URL'i Bul ve Edit Et

1. `DATABASE_URL` değişkenini bulun
2. Sağ tarafta **"..."** (üç nokta) → **Edit** veya direkt **Edit** butonuna tıklayın

### 3. Eski URL'i Sil, Yeni URL'i Yapıştır

**Eski URL (hepsini sil):**
```
postgresql://postgres.skwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Yeni URL (bunu yapıştır):**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Fark:** `postgres.skwrbcwspdjlgixjkplzq` → `postgres.kwrbcwspdjlgixjkplzq` (s harfi yok!)

### 4. Environment Seçimi

- ✅ **Production**
- ✅ **Preview**  
- ✅ **Development**

(Hepsini seç!)

### 5. Save

**Save** butonuna tıklayın.

### 6. Redeploy

1. **Deployments** (üst menü)
2. En üstteki deployment'ın yanında **"..."** (üç nokta)
3. **Redeploy** → **Redeploy**

---

## ✅ Kontrol

Değişiklikten sonra URL şöyle olmalı:

```
postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**ÖNEMLİ:** `postgres.kwrbcwspdjlgixjkplzq` (s harfi YOK!)

---

## 🚀 Test

1. Redeploy tamamlandıktan sonra (2-3 dakika)
2. https://arhaval-denetim-merkezi.vercel.app/login
3. Giriş yapmayı deneyin

---

**TAM URL'İ DEĞİŞTİR, SADECE BİR KISMI DEĞİL!** 🎯

