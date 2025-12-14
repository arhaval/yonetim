# 🔗 Supabase URL/Connection String Ayarları

## 📍 Supabase'de Connection String Bulma

### Adım 1: Settings → Database

1. Supabase Dashboard → **Settings** (sol menüden veya üst menüden)
2. **Database** sekmesine tıkla
3. **Connection Info** veya **Connection String** bölümünü bul

### Adım 2: Connection String'i Kopyala

Supabase'de şu bilgileri göreceksiniz:

**Direct Connection:**
```
postgresql://postgres:[PASSWORD]@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
```

**Connection Pooler (varsa):**
```
postgresql://postgres.skwrbcwspdjlgixjkplzq:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

⚠️ **ÖNEMLİ:** 
- Şifreyi (`[PASSWORD]`) gerçek şifrenizle değiştirin
- Sizin şifreniz: `s1e0r1t1a89c`

---

## 🎯 Vercel'de DATABASE_URL Ayarlama

### Adım 1: Vercel Dashboard

1. https://vercel.com/dashboard → Projenizi açın
2. **Settings** → **Environment Variables** sekmesine gidin

### Adım 2: DATABASE_URL'i Kontrol Et veya Ekle

**Eğer DATABASE_URL yoksa:**
1. **"Add New"** butonuna tıklayın
2. **Key:** `DATABASE_URL`
3. **Value:** 
   ```
   postgresql://postgres:s1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
   ```
4. **Environment:** 
   - ✅ Production
   - ✅ Preview
   - ✅ Development
   (Hepsini seçin!)
5. **Save** butonuna tıklayın

**Eğer DATABASE_URL varsa:**
1. **Edit** butonuna tıklayın
2. **Value** alanını kontrol edin
3. Şu formatta olmalı:
   ```
   postgresql://postgres:s1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
   ```
4. Eğer farklıysa, düzeltin ve **Save** butonuna tıklayın

---

## 🔄 Connection Pooler Kullan (Önerilen)

Eğer Supabase'de **Connection Pooler** seçeneği varsa:

1. Supabase → **Settings** → **Database** → **Connection Pooling**
2. **Transaction mode** connection string'i kopyala
3. Vercel'de DATABASE_URL'i bu yeni URL ile güncelle

**Connection Pooler URL formatı:**
```
postgresql://postgres.skwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

⚠️ **Not:** Port numarası **6543** olmalı (5432 değil!)

---

## ✅ Kontrol Listesi

- [ ] Supabase'de Connection String bulundu
- [ ] Vercel'de DATABASE_URL eklendi/güncellendi
- [ ] Environment seçenekleri (Production, Preview, Development) seçildi
- [ ] Vercel'de redeploy yapıldı

---

## 🚀 Sonraki Adımlar

1. Vercel'de redeploy yap:
   - **Deployments** → En üstteki → **"..."** → **Redeploy**

2. 2-3 dakika bekle

3. Test et:
   - https://arhaval-denetim-merkezi.vercel.app/login
   - Giriş yapmayı dene

---

**Önce Supabase'de Connection String'i bul, sonra Vercel'de kontrol et!** 🚀


