# 🔍 NEXTAUTH_URL Nasıl Bulunur?

## Yöntem 1: Vercel Dashboard'dan (En Kolay)

### Adımlar:

1. **Vercel Dashboard'a git:**
   - https://vercel.com/dashboard

2. **Projenizi seçin:**
   - "yonetim" adlı projeye tıklayın

3. **Deployments sekmesine git:**
   - Proje sayfasında üstte **"Deployments"** sekmesine tıklayın

4. **URL'i bul:**
   - En üstteki (en son) deployment'ı bulun
   - Deployment'ın yanında bir **link** göreceksiniz
   - Örnek: `yonetim-xxxxx.vercel.app` veya `yonetim.vercel.app`
   - Bu linke tıklayarak tam URL'i görebilirsiniz

5. **URL formatı:**
   - Genellikle şu şekilde olur: `https://yonetim-xxxxx.vercel.app`
   - Veya: `https://yonetim.vercel.app`

---

## Yöntem 2: Proje Ayarlarından

1. **Settings** → **General** sekmesine git
2. **"Domains"** bölümüne bak
3. Vercel'in otomatik verdiği domain'i görürsün

---

## Yöntem 3: Deployment Detaylarından

1. **Deployments** → En üstteki deployment'a tıkla
2. Deployment detay sayfasında **"Visit"** butonuna tıkla
3. Tarayıcıda açılan URL'i kopyala

---

## 📝 Örnek URL Formatları

- `https://yonetim-abc123.vercel.app`
- `https://yonetim.vercel.app`
- `https://yonetim-git-main-yourusername.vercel.app`

**Hepsi `https://` ile başlamalı!**

---

## ⚠️ Önemli Notlar

1. **İlk başta:** Vercel'in verdiği otomatik URL'i kullan
2. **Domain ekledikten sonra:** `https://yonetim.arhaval.com` olarak güncelle

---

## 🎯 Şimdi Ne Yapmalı?

1. Vercel Dashboard → Projeniz → **Deployments**
2. En üstteki deployment'ın yanındaki linki bul
3. O URL'i kopyala (örnek: `https://yonetim-xxxxx.vercel.app`)
4. Environment Variable olarak ekle: `NEXTAUTH_URL` = `https://yonetim-xxxxx.vercel.app`

---

**Bulamazsan ekran görüntüsü paylaş, yardımcı olayım!** 📸









