# 🔧 Localhost DATABASE_URL Düzeltme

## ❌ Mevcut Sorun

`.env` dosyanızda DATABASE_URL var ama şu sorunlar var:
1. ❌ Region: `eu-north-1` → `eu-central-1` olmalı
2. ❌ Şifre: `S1e0r1t1a89c` → `s1e0r1t1a89c` olmalı (küçük s)

## ✅ Çözüm: .env Dosyasını Güncelle

### Seçenek 1: Normal Database URL (Önerilen - Daha Güvenilir)

`.env` dosyanızda `DATABASE_URL` satırını şununla değiştirin:

```
DATABASE_URL=postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
```

**Özellikler:**
- ✅ Direkt bağlantı (pooler yok)
- ✅ Port: `5432`
- ✅ Host: `db.kwrbcwspdjlgixjkplzq.supabase.co`
- ✅ Şifre: `s1e0r1t1a89c` (küçük s)
- ✅ Kullanıcı adı: `postgres.kwrbcwspdjlgixjkplzq` (nokta var)

### Seçenek 2: Connection Pooler URL (Düzeltilmiş)

Eğer pooler kullanmak istiyorsanız:

```
DATABASE_URL=postgresql://postgres.kwrbcwspdjlgixjkplzq:s1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Değişiklikler:**
- ✅ Region: `eu-north-1` → `eu-central-1`
- ✅ Şifre: `S1e0r1t1a89c` → `s1e0r1t1a89c` (küçük s)

## 🚀 Adımlar

1. `.env` dosyanızı açın
2. `DATABASE_URL` satırını bulun
3. Eski satırı silin
4. Yukarıdaki **Seçenek 1** URL'ini yapıştırın (önerilen)
5. Dosyayı kaydedin
6. Development server'ı yeniden başlatın:
   ```bash
   npm run dev
   ```

## 🎯 Test

Server başladıktan sonra:
- Console'da `✅ Prisma database connection successful` mesajını görmelisiniz
- Eğer `❌ Prisma database connection failed!` görürseniz, hata mesajını kontrol edin

## ⚠️ Önemli Notlar

- **Şifre küçük harfle başlamalı:** `s1e0r1t1a89c` (büyük S değil!)
- **Kullanıcı adında nokta olmalı:** `postgres.kwrbcwspdjlgixjkplzq`
- **Normal URL daha güvenilir:** Pooler URL'leri bazen sorun çıkarabiliyor

## 🔄 Hâlâ Çalışmazsa

Eğer hâlâ "Tenant or user not found" hatası alıyorsanız:

1. Supabase Dashboard'a gidin
2. **Settings** → **Database**
3. **Connection String** bölümünden doğru URL'i kopyalayın
4. Şifreyi gerçek şifrenizle değiştirin
5. `.env` dosyasına yapıştırın

