# ✅ Vercel'de DATABASE_URL Kontrolü - Hızlı Rehber

## 🎯 ÖNEMLİ: Vercel'de DATABASE_URL Kontrol Et

### Adım 1: Vercel Dashboard'a Git

1. https://vercel.com/dashboard adresine git
2. **"arhaval-denetim-merkezi"** projesini aç

### Adım 2: Environment Variables Sayfasına Git

1. **Settings** sekmesine tıkla
2. Sol menüden **Environment Variables** seçeneğine tıkla

### Adım 3: DATABASE_URL'i Kontrol Et

**Eğer DATABASE_URL YOKSA:**
1. **"Add New"** butonuna tıkla
2. Şunları gir:
   - **Key:** `DATABASE_URL`
   - **Value:** 
     ```
     postgresql://postgres:s1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
     ```
   - **Environment:** 
     - ✅ Production
     - ✅ Preview
     - ✅ Development
     - (Hepsini seç!)
3. **Save** butonuna tıkla

**Eğer DATABASE_URL VARSA:**
1. **Edit** butonuna tıkla
2. **Value** alanını kontrol et
3. Şu formatta olmalı:
   ```
   postgresql://postgres:s1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
   ```
4. Eğer farklıysa veya yanlışsa, düzelt ve **Save** butonuna tıkla

---

## 🔄 Redeploy Yap

1. **Deployments** sekmesine git
2. En üstteki deployment'ı bul
3. Sağ taraftaki **"..."** (üç nokta) menüsüne tıkla
4. **Redeploy** seçeneğini seç
5. **Redeploy** butonuna tıkla

---

## 📝 Supabase URL Configuration (Opsiyonel)

Supabase'de gördüğünüz URL Configuration sayfasında:

1. **Site URL** alanını şu şekilde güncelleyebilirsin:
   ```
   https://arhaval-denetim-merkezi.vercel.app
   ```

2. **Redirect URLs** bölümüne şunu ekleyebilirsin:
   ```
   https://arhaval-denetim-merkezi.vercel.app/*
   ```

3. **Save changes** butonuna tıkla

⚠️ **Not:** Bu authentication için, database connection için değil. Ama yine de güncellemek iyi olur.

---

## ✅ Kontrol Listesi

- [ ] Vercel'de DATABASE_URL eklendi/kontrol edildi
- [ ] Environment seçenekleri (Production, Preview, Development) seçildi
- [ ] Vercel'de redeploy yapıldı
- [ ] (Opsiyonel) Supabase'de Site URL güncellendi

---

**ÖNCE VERCEL'DE DATABASE_URL'İ KONTROL ET!** 🚀


