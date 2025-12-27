# ✅ Deploy Kontrol Rehberi

## 🔍 Nasıl Kontrol Edeceğim?

### 1. ✅ Git Push Kontrolü

Terminal'de `git push` komutundan sonra şunu görmelisiniz:

```
Enumerating objects: ...
Counting objects: ...
Writing objects: ...
To https://github.com/arhaval/yonetim.git
   abc1234..def5678  main -> main
```

**"main -> main"** yazıyorsa başarılı! ✅

---

### 2. ✅ Vercel Deploy Kontrolü

#### Yöntem 1: Vercel Dashboard

1. [vercel.com](https://vercel.com) → Giriş yapın
2. Projenizi seçin: **arhaval-denetim-merkezi**
3. **Deployments** sekmesine gidin
4. En üstte yeni bir deployment görünmeli:
   - **Status:** Building veya Ready ✅
   - **Commit:** "Fix cron job authorization header for Vercel"
   - **Time:** Az önce (1-2 dakika önce)

**"Ready" yazıyorsa başarılı!** ✅

#### Yöntem 2: Terminal'den Kontrol

Terminal'de şu komutu çalıştırın:

```bash
git log --oneline -1
```

Şunu görmelisiniz:
```
def5678 Fix cron job authorization header for Vercel
```

---

### 3. ✅ Cron Job Kontrolü

Deploy tamamlandıktan sonra (5-10 dakika):

1. Vercel Dashboard → Projeniz → **Functions** sekmesi
2. **Cron Jobs** bölümüne bakın
3. Şunları görmelisiniz:
   - **Path:** `/api/cron/backup-database` ✅
   - **Schedule:** `0 2 * * *` ✅
   - **Status:** **Active** ✅ (Enable değil!)

**"Active" yazıyorsa başarılı!** ✅

---

### 4. ✅ Manuel Test (Opsiyonel)

Tarayıcıdan şu linke gidin (domain'inizi yazın):

```
https://your-domain.vercel.app/api/cron/backup-database
```

**Beklenen Sonuç:**
- Eğer secret kontrolü çalışıyorsa: `{"error":"Unauthorized"}` (Bu normal!)
- Vercel otomatik çağırdığında secret'ı ekler, siz manuel çağırınca eklemez

**VEYA** Vercel Dashboard → **Logs** sekmesine bakın:
- Son loglarda backup mesajları görünmeli

---

## 📋 Kontrol Checklist

- [ ] Git push başarılı (terminal'de "main -> main" göründü)
- [ ] Vercel'de yeni deployment görünüyor
- [ ] Deployment status: "Ready" ✅
- [ ] Cron job görünüyor (Functions → Cron Jobs)
- [ ] Cron job status: "Active" ✅

---

## ⏰ Ne Zaman Çalışacak?

**İlk Çalışma:**
- Yarın saat 02:00'de otomatik çalışacak
- Veya manuel test edebilirsiniz

**Sonraki Çalışmalar:**
- Her gün saat 02:00'de otomatik çalışacak

---

## 🎯 Hızlı Kontrol

### Terminal'de:

```bash
# Son commit'i kontrol et
git log --oneline -1

# Git durumunu kontrol et
git status
```

**Beklenen:**
- `git log`: Son commit görünmeli
- `git status`: "nothing to commit, working tree clean" yazmalı ✅

### Vercel Dashboard'da:

1. **Deployments** → En üstte yeni deployment ✅
2. **Functions** → **Cron Jobs** → Status: "Active" ✅

---

## ✅ Sonuç

**Her şey başarılıysa:**
- ✅ Git push tamamlandı
- ✅ Vercel deploy tamamlandı
- ✅ Cron job aktif
- ✅ Yarın saat 02:00'de ilk backup alınacak

**Hiçbir şey yapmanıza gerek yok!** Artık otomatik çalışacak. 🎉

---

## 📚 Daha Fazla Bilgi

- **Deploy Sonrası:** `DEPLOY_SONRASI.md`
- **Cron Job Kontrol:** `CRON_JOB_KONTROL.md`

