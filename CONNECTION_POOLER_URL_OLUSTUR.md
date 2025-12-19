# 🔧 Connection Pooler URL'i Manuel Oluşturma

## 📋 Mevcut Bilgileriniz:
- **Host:** `db.kwrbcwspdjlgixjkplzq.supabase.co`
- **Port:** `5432`
- **Database:** `postgres`
- **User:** `postgres`
- **Proje Referansı:** `kwrbcwspdjlgixjkplzq`

## ✅ Connection Pooler URL Formatı:

```
postgresql://postgres.kwrbcwspdjlgixjkplzq:[ŞİFRENİZ]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## 🔍 Region Bulma:

Region'u bulmak için Supabase Dashboard'da:
1. **Settings → Infrastructure** sekmesine bak
2. Veya **Settings → General** → **Region** bilgisini kontrol et

**Yaygın Region'lar:**
- `eu-central-1` (Avrupa - Frankfurt)
- `us-east-1` (ABD - Doğu)
- `us-west-1` (ABD - Batı)
- `ap-southeast-1` (Asya - Singapur)

## 📝 Adım Adım:

### 1. Region'u Bul
Supabase Dashboard → Settings → General → **Region** bilgisini not al

### 2. URL'i Oluştur
Format:
```
postgresql://postgres.[PROJE_REFERANSI]:[ŞİFRE]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Örnek (eu-central-1 için):**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:[ŞİFRENİZ]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Örnek (us-east-1 için):**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:[ŞİFRENİZ]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 3. Test Et
```bash
npm run test-db
```

## ⚠️ Eğer Connection Pooler Çalışmazsa:

### Alternatif 1: IP Kısıtlamalarını Kaldır
1. Supabase Dashboard → Settings → Database
2. **Network Restrictions** bölümüne git
3. **"Restrict all access"** seçeneğini kaldır
4. Normal database URL'i kullan (port 5432)

### Alternatif 2: Normal Database URL (Geçici)
```
postgresql://postgres:[ŞİFRE]@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
```

**NOT:** Bu production'da yavaş olabilir, ama çalışır.

