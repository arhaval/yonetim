# 🔍 Vercel'de DNS Kayıtlarını Bulma

## 📍 Alternatif Yol - DNS Kayıtlarını Bulma

### Yöntem 1: Domain Detay Sayfası

1. **Vercel Dashboard'a gidin:**
   - https://vercel.com/dashboard

2. **Projenizi seçin:**
   - `arhaval-denetim-merkezi` projesine tıklayın

3. **Settings → Domains:**
   - Sol menüden **Settings** → **Domains** sekmesine gidin
   - `denetim.arhaval.com` domain'ine tıklayın

4. **Domain detay sayfasında:**
   - Sayfanın üst kısmında domain bilgileri görünür
   - **"DNS Configuration"** veya **"Configure DNS"** butonu olabilir
   - Veya sayfanın altında DNS kayıtları listelenir

### Yöntem 2: Domain Listesi Sayfası

1. **Settings → Domains** sayfasında
2. `denetim.arhaval.com` satırının yanında:
   - **"..."** (üç nokta) menüsüne tıklayın
   - **"View DNS"** veya **"DNS Records"** seçeneğini bulun

### Yöntem 3: Vercel CLI ile Kontrol

Terminal'de şu komutu çalıştırın:
```bash
vercel domains inspect denetim.arhaval.com
```

### Yöntem 4: Domain Ekleme Sırasında

Eğer domain'i yeni eklediyseniz:
1. Domain ekleme sayfasında DNS kayıtları gösterilir
2. Ekran görüntüsü alın veya not edin

## 🎯 Genellikle Gösterilen DNS Kayıtları

Vercel genellikle şunlardan birini gösterir:

**Seçenek 1: CNAME**
```
Type: CNAME
Name: denetim
Value: cname.vercel-dns.com
```

**Seçenek 2: A Record**
```
Type: A
Name: denetim
Value: 76.76.21.21
```

## 📸 Ekran Görüntüsü İsterseniz

Vercel Dashboard'da şu sayfayı açın ve ekran görüntüsü paylaşın:
- Settings → Domains → `denetim.arhaval.com`

Size daha net yardımcı olabilirim.

## 🔧 Alternatif: Manuel DNS Kayıtları

Eğer Vercel'de bulamazsanız, genellikle şu kayıtları kullanın:

**CNAME Kaydı (Önerilen):**
```
Type: CNAME
Name: denetim
Value: cname.vercel-dns.com
TTL: 3600
```

**A Record (Alternatif):**
```
Type: A
Name: denetim
Value: 76.76.21.21
TTL: 3600
```

Hangi sayfayı görüyorsunuz? Ekran görüntüsü paylaşabilir misiniz?

