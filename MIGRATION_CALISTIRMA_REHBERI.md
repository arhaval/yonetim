# Prisma Migration Çalıştırma Rehberi

## 🎯 Neden Migration Gerekli?

Performans optimizasyonları için database'e indexler ekledik. Bu indexlerin aktif olması için migration çalıştırılmalı.

## 📋 İki Yöntem Var

### Yöntem 1: `prisma db push` (Hızlı - Önerilen) ⭐

Bu yöntem schema'yı direkt database'e uygular, migration dosyası oluşturmaz.

**Kullanım:**
```bash
npx prisma db push
```

**Avantajlar:**
- ✅ Hızlı
- ✅ Kolay
- ✅ Development için ideal

**Dezavantajlar:**
- ⚠️ Migration geçmişi tutulmaz
- ⚠️ Production'da dikkatli kullanılmalı

### Yöntem 2: `prisma migrate dev` (Profesyonel)

Bu yöntem migration dosyası oluşturur ve geçmişi tutar.

**Kullanım:**
```bash
npx prisma migrate dev --name add_performance_indexes
```

**Avantajlar:**
- ✅ Migration geçmişi tutulur
- ✅ Production için uygun
- ✅ Geri alınabilir

**Dezavantajlar:**
- ⚠️ Biraz daha uzun sürer

## 🚀 Adım Adım (Önerilen: Yöntem 1)

### Adım 1: Terminal Aç
- VS Code/Cursor'da Terminal aç (Ctrl + `)
- Veya CMD/PowerShell aç

### Adım 2: Proje Klasörüne Git
```bash
cd "C:\Users\Casper\Desktop\Arhaval Denetim Merkezi"
```

### Adım 3: Migration Çalıştır
```bash
npx prisma db push
```

### Adım 4: Prisma Client Yeniden Generate
```bash
npx prisma generate
```

### Adım 5: Kontrol Et
```bash
npx prisma studio
```
Bu komut Prisma Studio'yu açar, indexlerin oluşturulduğunu görebilirsiniz.

## ⚠️ Önemli Notlar

1. **Database Backup:** Migration öncesi backup alın (production ise)
2. **Connection String:** `.env` dosyasında `DATABASE_URL` doğru olmalı
3. **Hata Durumu:** Eğer hata alırsanız, hata mesajını kontrol edin

## 🔍 Hata Durumunda

### "Schema and database are out of sync"
**Çözüm:** 
```bash
npx prisma db push --accept-data-loss
```
⚠️ Dikkat: Bu komut veri kaybına neden olabilir!

### "Connection refused"
**Çözüm:** 
- Database'in çalıştığından emin olun
- `DATABASE_URL` doğru mu kontrol edin

### "Table does not exist"
**Çözüm:**
- Önce schema'yı kontrol edin
- Database'de tablolar oluşturulmuş mu kontrol edin

## ✅ Başarılı Migration Sonrası

Migration başarılı olduğunda:
- ✅ Indexler oluşturuldu
- ✅ Database güncellendi
- ✅ Performans iyileştirmeleri aktif

## 🎯 Sonraki Adımlar

1. ✅ Migration çalıştır
2. ✅ Prisma generate
3. ✅ Build test: `npm run build`
4. ✅ Canlıya al

