# 🔍 Supabase Database Kontrol Adımları

## ❌ Hata:
```
Can't reach database server at `db.kwrbcwspdjlgixjkplzq.supabase.co:5432`
```

## ✅ Kontrol Listesi:

### 1. Database Aktif mi?
1. **Supabase Dashboard** → Projenizi seçin
2. **Sol menüden "Database"** sekmesine tıklayın
3. Eğer **"Paused"** veya **"Pause"** butonu görüyorsanız → Database duraklatılmış!
4. **"Resume"** veya **"Restore"** butonuna tıklayın

### 2. IP Kısıtlamalarını Kontrol Et
1. **Settings → Database** sekmesine git
2. **"Network Restrictions"** bölümünü bul
3. Eğer **"Restrict all access"** aktifse → **KALDIR**
4. Eğer IP adresleri listelenmişse → **HEPSİNİ SİL**
5. **"Allow all IP addresses"** seçeneğini aktif et

### 3. Database Şifresini Kontrol Et
1. **Settings → Database** sekmesine git
2. **"Database password"** bölümünü bul
3. Eğer şifreyi bilmiyorsanız → **"Reset database password"** butonuna tıkla
4. **Yeni şifreyi kopyala**
5. `.env` dosyasındaki `DATABASE_URL`'deki şifreyi güncelle

### 4. Connection String'i Doğrudan Kopyala
1. **Settings → Database** sekmesine git
2. **"Connection string"** bölümünü bul
3. **"URI"** formatını seç
4. **Port 5432** olan URL'i kopyala (şu formatta):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
   ```
5. `.env` dosyasına yapıştır

### 5. Test Et
```bash
npm run test-db
```

## 🚨 Eğer Hala Çalışmıyorsa:

### Alternatif: Supabase SQL Editor'den Test Et
1. **Supabase Dashboard → SQL Editor**
2. Basit bir sorgu çalıştır:
   ```sql
   SELECT 1;
   ```
3. Eğer bu çalışıyorsa → Database aktif, sorun connection string'de
4. Eğer bu çalışmıyorsa → Database pause edilmiş veya başka bir sorun var

### Database Pause Edilmişse:
1. **Settings → Infrastructure** sekmesine git
2. **"Pause project"** veya **"Resume project"** butonunu kontrol et
3. Eğer pause edilmişse → **"Resume"** butonuna tıkla
4. Birkaç dakika bekle (database başlatılıyor)

---

**ÖNEMLİ:** Tüm bu adımları sırayla kontrol edin ve her adımı tamamladıktan sonra test edin!

