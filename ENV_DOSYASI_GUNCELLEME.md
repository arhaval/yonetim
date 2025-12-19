# 📝 .env Dosyası Güncelleme

## Mevcut Durum
`.env` dosyanızda `DATABASE_URL` var ama bağlantı çalışmıyor.

## ✅ Yapılacaklar

### 1. .env Dosyasını Aç
Proje klasöründe `.env` dosyasını bir metin editörüyle açın.

### 2. DATABASE_URL'i Kontrol Et
Şu satırın olduğundan emin olun:
```
DATABASE_URL="postgresql://postgres:S1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres"
```

**Eğer şifre farklıysa**, Supabase Dashboard'dan doğru şifreyi alın:
1. Supabase Dashboard → Settings → Database
2. "Database password" bölümünden şifreyi kopyalayın
3. URL'deki şifreyi güncelleyin

### 3. IP Kısıtlamasını Kaldır
1. Supabase Dashboard → Settings → Database
2. **"Network Restrictions"** bölümüne git
3. Eğer **"Restrict all access"** aktifse → **KALDIR**
4. Veya eklenmiş IP kısıtlamaları varsa → **SİL**

### 4. Test Et
```bash
npm run test-db
```

## 🔧 Alternatif: Connection Pooler URL (Önerilen)

Eğer Connection Pooler kullanmak isterseniz:

1. **Region'u bulun:**
   - Supabase Dashboard → Settings → General → **Region** bilgisini not alın
   - Genellikle: `eu-central-1`, `us-east-1`, vb.

2. **URL'i güncelleyin:**
   ```
   DATABASE_URL="postgresql://postgres.kwrbcwspdjlgixjkplzq:[ŞİFRE]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```

3. **Region'u test edin:**
   ```bash
   npm run test-regions
   ```

## ⚠️ Önemli
- `.env` dosyası `.gitignore`'da olduğu için Git'e commit edilmez
- Şifreleri asla Git'e push etmeyin
- Production'da Vercel Environment Variables kullanın

