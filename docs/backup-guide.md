# 💾 Backup Rehberi

Bu rehber database backup sistemini nasıl kullanacağınızı açıklar.

## 📋 Mevcut Durum

✅ **Backup script'i hazır:** `scripts/backup-database.ts`  
⚠️ **Otomatik backup:** Henüz kurulmadı (manuel çalışıyor)

---

## 🚀 Hızlı Başlangıç

### 1. İlk Backup'ı Alın

```bash
npm run backup:db
```

Bu komut:
- Database'inizin yedeğini alır
- `./backups/` klasörüne kaydeder
- Dosya adı: `backup_YYYY-MM-DD_HH-MM-SS.sql`

### 2. Backup'ı Kontrol Edin

```bash
# Backup dosyasını kontrol et
ls backups/
# veya Windows'ta
dir backups
```

---

## ⚙️ Otomatik Backup Kurulumu

### Seçenek 1: Vercel Cron Job (Önerilen) ⭐

Vercel'de otomatik backup için cron job kurabilirsiniz.

#### Adım 1: API Route Oluştur

`app/api/cron/backup-database/route.ts` dosyası oluşturun:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { backupDatabase } from '@/scripts/backup-database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Vercel Cron secret kontrolü
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const filepath = await backupDatabase({
      outputDir: './backups',
      compress: true,
      keepDays: 30,
    })

    return NextResponse.json({
      success: true,
      filepath,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

#### Adım 2: Vercel Cron Ayarları

`vercel.json` dosyasına ekleyin:

```json
{
  "crons": [
    {
      "path": "/api/cron/backup-database",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Bu ayar her gün saat 02:00'de backup alır.

#### Adım 3: Environment Variable Ekle

Vercel Dashboard → Settings → Environment Variables:
- `CRON_SECRET`: Rastgele bir string (güvenlik için)

---

### Seçenek 2: Local Cron Job (Kendi Sunucunuzda)

#### Windows (Task Scheduler)

1. **Task Scheduler**'ı açın
2. **Create Basic Task** tıklayın
3. İsim: "Database Backup"
4. Trigger: Daily, saat 02:00
5. Action: Start a program
6. Program: `npm`
7. Arguments: `run backup:db`
8. Start in: Proje klasörü yolu

#### Linux/Mac (Cron)

```bash
# Crontab'ı düzenle
crontab -e

# Şunu ekle (her gün saat 02:00'de)
0 2 * * * cd /path/to/project && npm run backup:db
```

---

### Seçenek 3: Supabase Otomatik Backup (En Kolay) ⭐⭐⭐

**Supabase zaten otomatik backup yapıyor!**

1. Supabase Dashboard → Settings → Database
2. **Backups** sekmesine gidin
3. Günlük otomatik backup'ları görebilirsiniz
4. Point-in-time recovery mevcut

**Avantajlar:**
- ✅ Otomatik (ekstra kurulum gerekmez)
- ✅ Güvenli (Supabase tarafında)
- ✅ Point-in-time recovery
- ✅ 7 günlük backup geçmişi

**Manuel Backup Almak İçin:**
- Supabase Dashboard → Database → Backups
- "Create backup" butonuna tıklayın

---

## 📊 Backup Stratejisi Önerisi

### Günlük Backup (Otomatik)
- **Supabase:** Zaten yapıyor ✅
- **Manuel Script:** Vercel cron ile kurulabilir

### Haftalık Backup (Manuel)
```bash
npm run backup:db -- --compress --keep-days 90
```

### Aylık Backup (Manuel)
```bash
npm run backup:db -- --output ./monthly-backups --keep-days 365
```

---

## 🔍 Backup Kontrolü

### Backup Dosyasını Kontrol Et

```bash
# Dosya boyutunu kontrol et
ls -lh backups/
# veya Windows'ta
dir backups
```

### Backup'ı Restore Et (Gerekirse)

```bash
# PostgreSQL restore
psql -U username -d database_name < backups/backup_2024-01-01_02-00-00.sql

# Veya Supabase'de:
# Dashboard → Database → Backups → Restore
```

---

## ✅ Yapılması Gerekenler Checklist

- [ ] İlk backup'ı al: `npm run backup:db`
- [ ] Backup dosyasını kontrol et
- [ ] Supabase otomatik backup'ları kontrol et
- [ ] (Opsiyonel) Vercel cron job kur
- [ ] (Opsiyonel) Local cron job kur

---

## 🎯 Önerilen Yaklaşım

**En Kolay:** Supabase otomatik backup kullanın (zaten aktif) ✅

**Ekstra Güvenlik İçin:** 
1. Supabase otomatik backup (zaten var)
2. Vercel cron job ile haftalık manuel backup script'i çalıştırın

---

## 📚 Daha Fazla Bilgi

- [Supabase Backup Dokümantasyonu](https://supabase.com/docs/guides/platform/backups)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

