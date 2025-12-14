# 🔍 Supabase IP Ayarlarını Bulma

## 📍 Menüden IP Ayarlarını Bulma

Supabase Dashboard'da gördüğünüz menüden:

### 1. **Settings** Seçeneğine Tıklayın

1. Sol menüden **Settings** seçeneğine tıklayın
2. **Database** sekmesine gidin
3. Sayfayı aşağı kaydırın
4. Şu bölümleri arayın:
   - **Network Restrictions**
   - **IP Allowlist**
   - **Connection Security**
   - **Database Access**

### 2. **Configuration** Seçeneğine Tıklayın (Alternatif)

1. Sol menüden **Configuration** seçeneğine tıklayın
2. **Database** veya **Network** bölümüne bakın

### 3. **Security Advisor** Seçeneğine Tıklayın (Alternatif)

1. Sol menüden **Security Advisor** seçeneğine tıklayın
2. IP veya Network ile ilgili uyarıları kontrol edin

---

## 🎯 En Muhtemel Yer: Settings → Database

**Adım adım:**

1. **Settings** → **Database** sekmesine git
2. Sayfayı aşağı kaydır
3. Şu başlıkları ara:
   - "Network Restrictions"
   - "IP Allowlist" 
   - "Connection Pooling"
   - "Database Access"

4. **"Allow all IPs"** veya **"Disable restrictions"** seçeneğini bul
5. Aktif et ve **Save** butonuna tıkla

---

## 🔄 Eğer Bulamazsanız

### Seçenek 1: Supabase Project Settings (Üst Menü)

1. Dashboard'un **üst kısmında** proje adının yanındaki **⚙️ Settings** ikonuna tıkla
2. **Database** sekmesine git
3. **Connection Info** bölümüne bak

### Seçenek 2: Direkt URL

Şu URL'yi deneyin (proje referansınızı kullanarak):
```
https://supabase.com/dashboard/project/kwrbcwspdjlgixjkplzq/settings/database
```

### Seçenek 3: Connection String'i Kontrol Et

1. **Settings** → **Database** → **Connection Info**
2. **Connection String** bölümüne bak
3. Orada **Connection Pooling** veya **Direct Connection** seçenekleri olabilir

---

## ✅ Bulduğunuzda Yapılacaklar

1. **"Allow all IPs"** seçeneğini aktif et
2. **Save** butonuna tıkla
3. 1-2 dakika bekle
4. Vercel'de redeploy yap
5. Test et

---

**Settings → Database sekmesine gidip sayfayı aşağı kaydırın, Network Restrictions bölümünü bulun!** 🚀


