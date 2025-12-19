# 🔑 .env Dosyası Şifre Güncelleme

## ✅ Yeni Şifre:
```
S1e0r1t1a89c
```
(Büyük S ile başlıyor)

## 📝 .env Dosyasını Güncelle:

### 1. .env Dosyasını Aç
Proje klasöründe `.env` dosyasını bir metin editörüyle açın.

### 2. DATABASE_URL Satırını Bul ve Güncelle
Şu satırı bulun:
```
DATABASE_URL="postgresql://postgres:s1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres"
```

Şu şekilde güncelleyin (büyük S ile):
```
DATABASE_URL="postgresql://postgres:S1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres"
```

**ÖNEMLİ:** Şifre büyük S ile: `S1e0r1t1a89c` (küçük s değil!)

### 3. Dosyayı Kaydet
Değişiklikleri kaydedin.

### 4. Test Et
```bash
npm run test-db
```

---

## 📋 Tam .env Dosyası İçeriği (Örnek):

```
DATABASE_URL="postgresql://postgres:S1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres"

NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3001"
```

---

**⚠️ ÖNEMLİ:** 
- IP kısıtlamasını kaldırmayı unutmayın!
- Şifre büyük S ile: `S1e0r1t1a89c`

