# 🔐 Vercel'de Secret Ekleme (Hazır Format)

## ✅ Hazır Format

**Key:** `CRON_SECRET`  
**Value:** `wqfqofqto23ormf`  
**Environment:** Production, Preview, Development (hepsini seçin)

---

## 📋 Adım Adım Talimatlar

### Adım 1: Vercel Dashboard'a Gidin
1. [vercel.com](https://vercel.com) adresine gidin
2. Giriş yapın
3. Projenizi seçin: **arhaval-denetim-merkezi** (veya proje adınız)

### Adım 2: Settings'e Gidin
1. Proje sayfasında üst menüden **Settings** tıklayın
2. Sol menüden **Environment Variables** tıklayın

### Adım 3: Yeni Variable Ekleyin
1. **Add New** butonuna tıklayın
2. Şu bilgileri girin:

   **Key:**
   ```
   CRON_SECRET
   ```

   **Value:**
   ```
   wqfqofqto23ormf
   ```

   **Environment:** (3 kutusu da işaretli olmalı)
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

3. **Save** butonuna tıklayın

### Adım 4: Deploy Edin
1. Terminal'de şu komutları çalıştırın:
   ```bash
   git add .
   git commit -m "Add CRON_SECRET environment variable"
   git push
   ```

2. Vercel otomatik olarak deploy eder
3. Deploy tamamlandıktan sonra cron job çalışmaya başlar

---

## ✅ Kontrol

Deploy'dan sonra:
1. Vercel Dashboard → **Functions** sekmesine gidin
2. **Cron Jobs** bölümüne bakın
3. `/api/cron/backup-database` görünmeli
4. Schedule: `0 2 * * *` (Her gün saat 02:00)

---

## 📝 Kopyala-Yapıştır Formatı

### Key:
```
CRON_SECRET
```

### Value:
```
wqfqofqto23ormf
```

### Environment:
- Production ✅
- Preview ✅
- Development ✅

---

## 🎯 Özet

1. Vercel Dashboard → Settings → Environment Variables
2. Add New → Key: `CRON_SECRET`, Value: `wqfqofqto23ormf`
3. Environment: Hepsini seçin (Production, Preview, Development)
4. Save
5. Deploy: `git push`

**Bitti!** Artık hiçbir şey yapmanıza gerek yok. Vercel otomatik kullanır. ✅

