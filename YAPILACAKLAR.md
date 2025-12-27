# ✅ Yapılacaklar Listesi

## 🎯 ŞU AN YAPMANIZ GEREKENLER

### 1. ✅ İlk Backup'ı Test Edin

```bash
npm run backup:db
```

Bu komut:
- Database'inizin yedeğini alır
- `./backups/` klasörüne kaydeder
- Dosya adı: `backup_YYYY-MM-DD_HH-MM-SS.sql`

**Kontrol:**
```bash
# Backup dosyasını kontrol et
dir backups
# veya
ls backups
```

---

### 2. ✅ Supabase Otomatik Backup'ı Kontrol Edin

**Supabase zaten otomatik backup yapıyor!** ✅

1. Supabase Dashboard'a gidin
2. Settings → Database → **Backups** sekmesine gidin
3. Günlük otomatik backup'ları görebilirsiniz
4. Point-in-time recovery mevcut

**Not:** Supabase otomatik backup yeterli olabilir. Ekstra güvenlik için Vercel cron job kurabilirsiniz.

---

### 3. ⚠️ Vercel Cron Job Kurulumu (Opsiyonel)

Eğer Vercel üzerinden de otomatik backup istiyorsanız:

#### Adım 1: Environment Variable Ekle

Vercel Dashboard → Settings → Environment Variables:
- **Key:** `CRON_SECRET`
- **Value:** Rastgele bir string (örn: `your-secret-key-12345`)
- **Environment:** Production, Preview, Development

#### Adım 2: Deploy Et

```bash
git add .
git commit -m "Add automatic backup cron job"
git push
```

Vercel otomatik olarak deploy eder ve cron job aktif olur.

#### Adım 3: Test Et

Deploy'dan sonra:
- Vercel Dashboard → Functions → Cron Jobs
- `/api/cron/backup-database` görünmeli
- Her gün saat 02:00'de çalışacak

---

## 📊 Otomatik Yedekleme Durumu

### ✅ Supabase (Aktif)
- **Durum:** Otomatik çalışıyor ✅
- **Sıklık:** Günlük
- **Saklama:** 7 gün
- **Point-in-time recovery:** Var ✅

### ⚠️ Vercel Cron Job (Kurulmadı)
- **Durum:** Kod hazır, kurulum gerekiyor
- **Sıklık:** Her gün saat 02:00 (kurulumdan sonra)
- **Saklama:** 30 gün
- **Kurulum:** Yukarıdaki adımları takip edin

---

## 🎯 Önerilen Yaklaşım

### Seçenek 1: Sadece Supabase (En Kolay) ⭐⭐⭐

**Yapılacaklar:**
- ✅ Hiçbir şey yapmanıza gerek yok!
- ✅ Supabase zaten otomatik backup yapıyor
- ✅ Dashboard'dan kontrol edin

**Avantajlar:**
- Otomatik (ekstra kurulum yok)
- Güvenli (Supabase tarafında)
- Point-in-time recovery
- 7 günlük backup geçmişi

### Seçenek 2: Supabase + Vercel Cron (Ekstra Güvenlik) ⭐⭐

**Yapılacaklar:**
1. ✅ Supabase backup'larını kontrol edin (zaten aktif)
2. ⚠️ Vercel cron job kurun (yukarıdaki adımlar)
3. ✅ Her iki sistem de çalışır

**Avantajlar:**
- İki farklı yerde backup
- Ekstra güvenlik
- 30 günlük saklama (Vercel)

---

## 📋 Checklist

### Hemen Yapılacaklar
- [ ] İlk backup'ı test et: `npm run backup:db`
- [ ] Backup dosyasını kontrol et
- [ ] Supabase backup'larını kontrol et (Dashboard)

### Opsiyonel (Ekstra Güvenlik)
- [ ] Vercel'de `CRON_SECRET` environment variable ekle
- [ ] Deploy et
- [ ] Vercel cron job'ı kontrol et

---

## 🔍 Backup Kontrolü

### Supabase Backup Kontrolü
1. Supabase Dashboard → Settings → Database → Backups
2. Son backup tarihini kontrol edin
3. Backup'ları restore edebilirsiniz

### Manuel Backup Kontrolü
```bash
# Backup dosyalarını listele
dir backups
# veya
ls -lh backups

# Backup dosyasını kontrol et
type backups\backup_2024-01-01_02-00-00.sql
# veya
head backups/backup_2024-01-01_02-00-00.sql
```

---

## ❓ Sık Sorulan Sorular

### Q: Otomatik yedekleme çalışıyor mu?
**A:** Evet! Supabase otomatik olarak günlük backup yapıyor. Ekstra güvenlik için Vercel cron job kurabilirsiniz.

### Q: Backup'lar nerede saklanıyor?
**A:** 
- Supabase: Supabase sunucularında (Dashboard'dan erişilebilir)
- Manuel: `./backups/` klasöründe (local)

### Q: Backup'ı nasıl restore ederim?
**A:**
- Supabase: Dashboard → Database → Backups → Restore
- Manuel: `psql` komutu ile restore edebilirsiniz

### Q: Vercel cron job kurmalı mıyım?
**A:** İsteğe bağlı. Supabase backup yeterli olabilir, ama ekstra güvenlik için kurabilirsiniz.

---

## 📚 Daha Fazla Bilgi

- **Backup Rehberi:** `docs/backup-guide.md`
- **Supabase Backup:** [Supabase Dokümantasyonu](https://supabase.com/docs/guides/platform/backups)
- **Vercel Cron:** [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

