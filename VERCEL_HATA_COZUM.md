# 🔧 Vercel Server-Side Hata Çözümü

## ❌ Hata: "Application error: a server-side exception has occurred"

Bu hata genellikle bir sayfa render edilirken veya API route'unda oluşur.

---

## 🔍 Hangi Sayfada Hata Oluyor?

1. **Ana sayfa** (`/`) mı?
2. **Yayıncılar sayfası** (`/streamers`) mı?
3. **Yeni yayıncı sayfası** (`/streamers/new`) mı?
4. **Başka bir sayfa** mı?

---

## ✅ Yapılan Düzeltmeler

### 1. Streamers Sayfasına Error Handling Eklendi

`app/streamers/page.tsx` dosyasına try-catch eklendi. Artık database hatası olsa bile sayfa çalışacak.

---

## 🚀 Hızlı Çözüm

### Adım 1: Vercel Loglarını Kontrol Et

1. Vercel Dashboard → Projeniz
2. **Deployments** → En son deployment
3. **Functions** sekmesi → Hangi function'da hata var?
4. **Logs** sekmesi → Detaylı hata mesajını gör

### Adım 2: Hata Mesajını Paylaş

Vercel loglarında görünen hata mesajını paylaş, birlikte çözelim.

---

## 🔧 Yaygın Hatalar ve Çözümleri

### Hata 1: Database Connection Error

**Hata:** `Can't reach database server`

**Çözüm:**
- DATABASE_URL doğru mu kontrol et
- Connection Pooler URL kullanıldığından emin ol

### Hata 2: Prisma Query Error

**Hata:** `Invalid prisma.* invocation`

**Çözüm:**
- Tablolar mevcut mu kontrol et
- Prisma schema doğru mu kontrol et

### Hata 3: Missing Environment Variable

**Hata:** `Environment variable not found`

**Çözüm:**
- Vercel → Settings → Environment Variables
- Gerekli değişkenler ekli mi kontrol et

---

## 📋 Kontrol Listesi

- [ ] Hangi sayfada hata olduğunu belirle
- [ ] Vercel loglarını kontrol et
- [ ] Hata mesajını paylaş
- [ ] DATABASE_URL doğru mu kontrol et
- [ ] Environment variables eksik mi kontrol et

---

## 💡 Hızlı Test

1. **Local'de test et:**
   ```bash
   npm run dev
   ```
   Hata local'de de oluyor mu?

2. **Vercel'de redeploy:**
   - Deployments → Redeploy
   - Hata devam ediyor mu?

---

**HANGİ SAYFADA HATA OLUYOR? VERCEL LOGLARINDA NE YAZIYOR?** 🔍

