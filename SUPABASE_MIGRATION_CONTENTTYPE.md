# 🔧 Supabase Migration: contentType Column Ekleme

## ⚠️ ÖNEMLİ: Database'de `contentType` Column'u Yok!

Build hatası: `The column main.VoiceoverScript.contentType does not exist in the current database.`

---

## 🚀 YÖNTEM 1: Otomatik Script (ÖNERİLEN - EN KOLAY!)

### Tek Komutla Çözüm:

```bash
npm run add-contenttype
```

Bu script:
- ✅ Otomatik olarak `contentType` column'unu ekler
- ✅ Hata kontrolü yapar
- ✅ Column'un eklendiğini doğrular
- ✅ Zaten varsa uyarı verir (hata vermez)

**Not:** `.env` dosyanızda `DATABASE_URL` doğru ayarlanmış olmalı!

---

## 🎯 YÖNTEM 2: Supabase SQL Editor (Manuel)

Eğer script çalışmazsa, manuel olarak ekleyebilirsiniz:

### Adım 1: Supabase Dashboard'a Git

1. Tarayıcınızda https://supabase.com/dashboard adresine gidin
2. Giriş yapın (eğer yapmadıysanız)
3. Projenizi listeden seçin (tıklayın)

### Adım 2: SQL Editor'ü Aç

1. Sol menüden **"SQL Editor"** seçeneğine tıklayın
   - İkon: </> (code) veya "SQL Editor" yazısı
   - Genellikle "Database" bölümü altında

### Adım 3: Yeni Query Oluştur

1. **"New query"** veya **"+"** butonuna tıklayın
2. Aşağıdaki SQL kodunu yapıştırın:

```sql
ALTER TABLE "VoiceoverScript" 
ADD COLUMN IF NOT EXISTS "contentType" TEXT;
```

### Adım 4: Query'yi Çalıştır

1. **"Run"** butonuna tıklayın (veya `Ctrl+Enter` / `Cmd+Enter`)
2. Başarılı mesajını görmelisiniz: "Success. No rows returned"

### Adım 5: Kontrol Et (Opsiyonel)

Aynı SQL Editor'de şu query'yi çalıştırarak kontrol edebilirsiniz:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'VoiceoverScript' 
AND column_name = 'contentType';
```

Eğer sonuç dönerse, column başarıyla eklenmiştir! ✅

---

## ✅ Sonuç

Bu column eklendikten sonra:
- ✅ Build başarılı olacak
- ✅ Site çalışacak
- ✅ `contentType` field'ı kullanılabilecek

---

## 🆘 Sorun Giderme

### Script çalışmıyor mu?

1. **DATABASE_URL kontrolü:**
   ```bash
   # .env dosyanızda DATABASE_URL var mı kontrol edin
   # Format: postgresql://user:password@host:port/database
   ```

2. **Prisma Client güncel mi?**
   ```bash
   npm run db:generate
   ```

3. **Manuel yöntemi deneyin** (Yöntem 2)

### SQL Editor bulamıyorum?

- Sol menüde "Database" > "SQL Editor" yolunu takip edin
- Veya üst menüde arama kutusuna "SQL" yazın

### "Table does not exist" hatası alıyorum?

- Tablo adı farklı olabilir (örneğin `voiceover_script` veya `VoiceoverScript`)
- Supabase'de Table Editor'dan tablo adını kontrol edin
- Tablo adını doğru yazdığınızdan emin olun (büyük/küçük harf duyarlı!)

---

**Not:** Bu migration production database'de yapılıyor, dikkatli olun!

