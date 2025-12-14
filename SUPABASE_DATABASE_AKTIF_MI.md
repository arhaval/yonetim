# 🔍 Supabase Database Aktif mi Kontrol Et

## ⚠️ Hata Devam Ediyor

Hata hala devam ediyorsa, şunları kontrol et:

### 1. Database Pause Edilmiş mi?

1. **Supabase Dashboard** → Projenizi açın
2. **Sol üst köşede** proje durumunu kontrol edin
3. Eğer **"Paused"** yazıyorsa:
   - **"Resume"** veya **"Restore"** butonuna tıklayın
   - Database'in aktif olmasını bekleyin (1-2 dakika)

### 2. Database Settings Kontrol

1. **Settings** → **Database** sekmesine git
2. **Database Status** veya **Connection Info** bölümüne bak
3. Database'in **"Active"** olduğundan emin ol

---

## 🔓 IP Kısıtlamasını Kaldır (En Önemli!)

### Adım 1: Settings → Database

1. **Settings** → **Database** sekmesine git
2. Sayfayı **aşağı kaydır**
3. Şu bölümleri ara:
   - **"Network Restrictions"**
   - **"IP Allowlist"**
   - **"Connection Security"**
   - **"Database Access"**

### Adım 2: Allow All IPs

1. **"Allow all IPs"** veya **"Disable restrictions"** seçeneğini bul
2. **Aktif et**
3. **Save** veya **Update** butonuna tıkla

---

## 🔄 Vercel'de Redeploy Yap

1. **Vercel Dashboard** → Projeniz
2. **Deployments** sekmesine git
3. En üstteki deployment'ın yanındaki **"..."** → **Redeploy**
4. **Redeploy** butonuna tıkla
5. **2-3 dakika bekle**

---

## 🔍 Alternatif: Connection Pooler URL Kullan

Eğer IP kısıtlamasını kaldıramazsanız:

1. **Supabase Dashboard** → **Settings** → **Database**
2. **Connection Info** bölümüne git
3. **Connection Pooling** veya **Pooler** seçeneğini ara
4. **Transaction mode** connection string'i kopyala
5. **Vercel'de DATABASE_URL'i güncelle:**
   - Settings → Environment Variables
   - DATABASE_URL → Edit
   - Yeni pooler URL'ini yapıştır
   - Save
6. **Redeploy yap**

**Connection Pooler URL formatı:**
```
postgresql://postgres.skwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

⚠️ **Not:** Port **6543** olmalı (5432 değil!)

---

## ✅ Kontrol Listesi

- [ ] Supabase database aktif mi kontrol edildi
- [ ] IP kısıtlaması kaldırıldı (Allow all IPs)
- [ ] Vercel'de redeploy yapıldı
- [ ] 2-3 dakika beklendi
- [ ] Test edildi

---

**ÖNCE SUPABASE'DE IP KISITLAMASINI KALDIR!** 🚀


