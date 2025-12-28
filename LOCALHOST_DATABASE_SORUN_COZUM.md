# 🔧 Localhost Database Bağlantı Sorunu Çözümü

## ❌ Sorun

"Tenant or user not found" veya "Can't reach database server" hatası alıyorsunuz.

## 🔍 Yapılan Kontroller

1. ✅ Region: `eu-north-1` (Stockholm) - Doğru
2. ✅ Kullanıcı adı formatı: `postgres.kwrbcwspdjlgixjkplzq` - Doğru
3. ✅ Port: `6543` (Pooler) veya `5432` (Normal) - Doğru
4. ❓ Şifre: Kontrol edilmeli

## ✅ Çözüm Adımları

### Adım 1: Supabase Dashboard'dan Doğru Connection String'i Alın

1. **Supabase Dashboard** → Projenizi seçin
2. **Settings** → **Database**
3. **Connection string** bölümüne gidin
4. **URI** formatını seçin
5. **Show password** butonuna tıklayın
6. **Tam URL'i kopyalayın**

### Adım 2: Connection Pooling URL'ini Deneyin

**Settings → Database → Connection Pooling** bölümüne gidin:
- **Session mode** veya **Transaction mode** seçin
- **URI** formatını kopyalayın
- Şifreyi gerçek şifrenizle değiştirin

**Format:**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:[ŞİFRE]@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Adım 3: Normal Database URL'ini Deneyin

Eğer pooler çalışmazsa, normal database URL'ini kullanın:

**Settings → Database → Connection string → URI**

**Format:**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:[ŞİFRE]@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
```

### Adım 4: .env Dosyasını Güncelleyin

Kopyaladığınız URL'i `.env` dosyasına yapıştırın:

```env
DATABASE_URL=postgresql://postgres.kwrbcwspdjlgixjkplzq:[ŞİFRE]@...
```

### Adım 5: Test Edin

```bash
npm run test-db
```

## ⚠️ Önemli Notlar

1. **Şifre büyük/küçük harf duyarlıdır!**
   - `s1e0r1t1a89c` (küçük s)
   - `S1e0r1t1a89c` (büyük S)
   - Supabase Dashboard'dan kontrol edin

2. **Kullanıcı adı formatı:**
   - ✅ Doğru: `postgres.kwrbcwspdjlgixjkplzq` (nokta var!)
   - ❌ Yanlış: `postgres` (nokta yok!)

3. **Region:**
   - Projeniz Stockholm (eu-north-1) region'unda
   - Pooler host: `aws-0-eu-north-1.pooler.supabase.com`
   - Normal host: `db.kwrbcwspdjlgixjkplzq.supabase.co`

## 🔄 Alternatif Çözümler

### Çözüm 1: Şifreyi Reset Edin

1. Supabase Dashboard → Settings → Database
2. **Reset database password** butonuna tıklayın
3. Yeni şifreyi kopyalayın
4. `.env` dosyasını güncelleyin

### Çözüm 2: IP Kısıtlamasını Kontrol Edin

1. Supabase Dashboard → Settings → Database
2. **Connection Pooling** → **IP Allowlist**
3. Tüm IP'lere izin verildiğinden emin olun
4. Veya local IP'nizi ekleyin

### Çözüm 3: Farklı Region'ları Deneyin

Eğer Stockholm çalışmazsa, diğer region'ları deneyin:
- `eu-central-1` (Frankfurt)
- `us-east-1` (Virginia)
- `us-west-1` (California)

## 📋 Test Komutları

```bash
# Database bağlantısını test et
npm run test-db

# Development server'ı başlat
npm run dev
```

## 🎯 Başarı Kriterleri

- ✅ `npm run test-db` komutu başarılı olmalı
- ✅ `✅ BAŞARILI! Database bağlantısı çalışıyor.` mesajını görmelisiniz
- ✅ Development server başladığında database hatası olmamalı

---

**ÖNEMLİ:** Supabase Dashboard'dan direkt connection string'i kopyalayın ve `.env` dosyasına yapıştırın. Manuel yazmak yerine kopyala-yapıştır kullanın!

