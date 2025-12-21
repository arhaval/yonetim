# 🖼️ Logo Format Rehberi

## En İyi Logo Formatı: **PNG veya SVG**

### ✅ Önerilen Formatlar:

#### 1. **PNG (Önerilen)**
- **Avantajlar:**
  - Şeffaf arka plan desteği
  - Tüm tarayıcılarda çalışır
  - Yüksek kalite
  - Logo için ideal
  
- **Özellikler:**
  - Boyut: 48x48px (sidebar için), 120x40px (header için)
  - Format: PNG-24 (şeffaf arka plan için)
  - Renk: RGB
  - Dosya boyutu: < 50KB (optimize edilmiş)

#### 2. **SVG (En İyi Seçenek)**
- **Avantajlar:**
  - Vektör format (her boyutta keskin)
  - Çok küçük dosya boyutu
  - Şeffaf arka plan
  - Retina ekranlarda mükemmel
  
- **Özellikler:**
  - Dosya boyutu: < 10KB
  - Tüm modern tarayıcılarda çalışır
  - CSS ile renk değiştirilebilir

#### 3. **WebP (Alternatif)**
- **Avantajlar:**
  - Modern tarayıcılar için optimize
  - Küçük dosya boyutu
  - Yüksek kalite
  
- **Not:** Eski tarayıcılar için fallback gerekir

## 📐 Logo Boyutları

### Sidebar Logo:
- **Boyut:** 48x48px (veya 2x için 96x96px)
- **Aspect Ratio:** 1:1 (kare)
- **Kullanım:** Sidebar'da küçük logo

### Header Logo:
- **Boyut:** 120x40px (veya 2x için 240x80px)
- **Aspect Ratio:** 3:1 (yatay)
- **Kullanım:** Üst header'da logo

## 🎨 Logo Özellikleri

### Renk:
- **Şeffaf arka plan** (PNG-24 veya SVG)
- Logo renkleri beyaz arka plan üzerinde görünmeli
- Dark mode için ayrı logo gerekebilir

### Optimizasyon:
- **PNG için:** TinyPNG veya ImageOptim kullanın
- **SVG için:** SVGOMG ile optimize edin
- Dosya boyutu mümkün olduğunca küçük olmalı

## 📁 Dosya Konumu

Logo dosyası şu konumda olmalı:
```
public/arhaval-logo.png
```

veya

```
public/arhaval-logo.svg
```

## 🔧 Kod Kullanımı

Next.js Image component kullanılıyor:
```tsx
<Image
  src="/arhaval-logo.png"
  alt="Arhaval Logo"
  width={48}
  height={48}
  priority
  unoptimized={false}
/>
```

## ✅ Kontrol Listesi

- [ ] Logo şeffaf arka planlı mı?
- [ ] Dosya boyutu < 50KB (PNG) veya < 10KB (SVG)?
- [ ] Logo beyaz arka plan üzerinde net görünüyor mu?
- [ ] Retina ekranlar için 2x versiyonu var mı?
- [ ] Dosya `public/` klasöründe mi?

## 🚀 Önerilen Araçlar

1. **PNG Optimizasyon:**
   - TinyPNG: https://tinypng.com/
   - ImageOptim: https://imageoptim.com/

2. **SVG Optimizasyon:**
   - SVGOMG: https://jakearchibald.github.io/svgomg/
   - SVG Cleaner: https://github.com/RazrFalcon/svgcleaner

3. **Format Dönüştürme:**
   - CloudConvert: https://cloudconvert.com/
   - Convertio: https://convertio.co/

## 📝 Notlar

- Logo dosyası değiştiğinde Next.js otomatik olarak optimize eder
- `priority` prop'u ile logo öncelikli yüklenir
- `unoptimized={false}` ile Next.js image optimization aktif

