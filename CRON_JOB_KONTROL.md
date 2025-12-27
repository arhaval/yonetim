# ✅ Cron Job Kontrol Rehberi

## 🎯 Deploy Sonrası Kontrol

### 1. ✅ Environment Variable Kontrolü

1. Vercel Dashboard → Projeniz → **Settings**
2. **Environment Variables** sekmesine gidin
3. `CRON_SECRET` görünmeli ✅
4. Value: `wqfqofqto23ormf` olmalı ✅

---

### 2. ✅ Cron Job Kontrolü

1. Vercel Dashboard → Projeniz → **Functions** sekmesine gidin
2. **Cron Jobs** bölümüne bakın
3. Şunları görmelisiniz:
   - **Path:** `/api/cron/backup-database`
   - **Schedule:** `0 2 * * *` (Her gün saat 02:00)
   - **Status:** Active ✅

---

### 3. ✅ İlk Çalıştırma Testi (Opsiyonel)

Manuel olarak test etmek isterseniz:

**Tarayıcıdan:**
```
https://your-domain.vercel.app/api/cron/backup-database?secret=wqfqofqto23ormf
```

**Veya Terminal'den:**
```bash
curl "https://your-domain.vercel.app/api/cron/backup-database?secret=wqfqofqto23ormf"
```

**Beklenen Sonuç:**
```json
{
  "success": true,
  "filepath": "./backups/backup_2024-12-27T...",
  "timestamp": "2024-12-27T...",
  "message": "Backup başarıyla tamamlandı"
}
```

---

### 4. ✅ Log Kontrolü

1. Vercel Dashboard → Projeniz → **Logs** sekmesine gidin
2. Cron job çalıştığında logları görebilirsiniz
3. Şu mesajları görmelisiniz:
   - `🔄 Otomatik backup başlatılıyor...`
   - `✅ Backup tamamlandı: ...`

---

## 📅 Ne Zaman Çalışacak?

**İlk Çalışma:**
- Deploy'dan sonraki ilk gün saat 02:00'de çalışacak
- Veya manuel test edebilirsiniz (yukarıdaki adımlar)

**Sonraki Çalışmalar:**
- Her gün saat 02:00'de otomatik çalışacak
- Vercel otomatik olarak çağıracak

---

## ✅ Kontrol Checklist

- [ ] Environment Variable eklendi (`CRON_SECRET`)
- [ ] Deploy tamamlandı
- [ ] Cron Job görünüyor (Functions → Cron Jobs)
- [ ] Schedule doğru (`0 2 * * *`)
- [ ] (Opsiyonel) Manuel test yapıldı

---

## 🎯 Sonuç

**Her şey hazır!** ✅

Artık:
- ✅ Her gün saat 02:00'de otomatik backup alınacak
- ✅ Vercel otomatik olarak çalıştıracak
- ✅ Hiçbir şey yapmanıza gerek yok

**Not:** İlk backup yarın saat 02:00'de alınacak. Beklemek istemezseniz yukarıdaki manuel testi yapabilirsiniz.

---

## 📚 Daha Fazla Bilgi

- **Backup Rehberi:** `docs/backup-guide.md`
- **Secret Rehberi:** `SECRET_NEDIR.md`

