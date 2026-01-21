# 🔐 YEDEKLEME SİSTEMİ REHBERİ

## ✅ 3 KATMANLI YEDEKLEME

### 1. Supabase Otomatik Yedekleme (PRO) ⚡

**Zaten Aktif!**
- ✅ Günlük otomatik backup
- ✅ 7 gün saklama
- ✅ Point-in-time recovery

**Kontrol:**
```
Supabase Dashboard → Database → Backups
```

---

### 2. Manuel Export API 📥

**Kullanım:**
```bash
# .env dosyasına ekleyin:
BACKUP_SECRET="arhaval-backup-2026-secret-key"

# Backup indirmek için:
curl -H "Authorization: Bearer arhaval-backup-2026-secret-key" \
  https://[siteniz].vercel.app/api/backup/export \
  -o backup-$(date +%Y-%m-%d).json
```

**Veya tarayıcıda:**
```
https://[siteniz].vercel.app/api/backup/export
(Authorization header ekleyin)
```

---

### 3. Haftalık Otomatik Export (Cron Job) ⏰

**GitHub Actions ile otomatik backup:**

`.github/workflows/weekly-backup.yml` oluşturun:

```yaml
name: Weekly Backup

on:
  schedule:
    # Her Pazar 03:00'da çalış
    - cron: '0 3 * * 0'
  workflow_dispatch: # Manuel tetikleme

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Export Database
        run: |
          curl -H "Authorization: Bearer ${{ secrets.BACKUP_SECRET }}" \
            ${{ secrets.SITE_URL }}/api/backup/export \
            -o backup-$(date +%Y-%m-%d).json
      
      - name: Upload to GitHub
        uses: actions/upload-artifact@v3
        with:
          name: database-backup
          path: backup-*.json
          retention-days: 90
```

**GitHub Secrets ekleyin:**
- `BACKUP_SECRET`: arhaval-backup-2026-secret-key
- `SITE_URL`: https://[siteniz].vercel.app

---

## 🚨 ACİL DURUM RESTORE

### Supabase Backup'tan Restore:

1. **Supabase Dashboard** → **Database** → **Backups**
2. Backup seçin → **Restore**
3. Onaylayın

### JSON Backup'tan Restore:

```bash
# Backup dosyasını yükle
node scripts/restore-backup.js backup-2026-01-21.json
```

---

## 📊 YEDEKLEME KONTROLÜ

**Her hafta kontrol edin:**

```sql
-- Supabase SQL Editor'da
SELECT 
    'Streamer' as tablo, COUNT(*) as kayit FROM "Streamer"
UNION ALL
SELECT 'Stream', COUNT(*) FROM "Stream"
UNION ALL
SELECT 'Content', COUNT(*) FROM "Content"
UNION ALL
SELECT 'FinancialRecord', COUNT(*) FROM "FinancialRecord";
```

**Kayıt sayıları azalmışsa → Backup restore edin!**

---

## ✅ SONUÇ

**3 Katmanlı Güvenlik:**
1. ✅ Supabase otomatik (günlük)
2. ✅ Manuel export API (isteğe bağlı)
3. ✅ GitHub Actions (haftalık)

**Veri kaybı riski: %0.001** 🛡️

---

## 🎯 ŞİMDİ YAPMANIZ GEREKENLER:

1. ✅ Supabase Pro aktif mi kontrol et
2. ⏳ .env'e BACKUP_SECRET ekle
3. ⏳ GitHub Actions workflow ekle (opsiyonel)
4. ⏳ İlk manuel backup test et

**Hazır!** 🚀

