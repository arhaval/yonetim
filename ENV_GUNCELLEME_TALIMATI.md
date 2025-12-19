# 📝 .env Dosyası Güncelleme Talimatı

## ✅ Yapılacaklar:

### 1. .env Dosyasını Aç
Proje klasöründe `.env` dosyasını bir metin editörüyle açın (Notepad, VS Code, vb.)

### 2. DATABASE_URL Satırını Bul ve Güncelle
Şu satırı bulun:
```
DATABASE_URL="..."
```

Şu şekilde güncelleyin:
```
DATABASE_URL="postgresql://postgres:s1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres"
```

### 3. Dosyayı Kaydet
Değişiklikleri kaydedin.

### 4. Test Et
```bash
npm run test-db
```

---

## 📋 Tam .env Dosyası İçeriği (Örnek):

```
DATABASE_URL="postgresql://postgres:s1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres"

NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3001"
```

---

**ÖNEMLİ:** 
- IP kısıtlamasını kaldırdıktan sonra bu URL çalışmalı
- Şifre küçük harfle: `s1e0r1t1a89c` (büyük S değil!)

