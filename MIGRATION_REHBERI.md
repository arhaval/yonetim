# 🔧 Veritabanı Migration Rehberi

## Migration Nedir?
Migration, veritabanına yeni kolonlar (alanlar) eklemek için yapılan işlemdir. Bu durumda `ContentCreator` ve `VoiceActor` tablolarına `iban` kolonunu eklememiz gerekiyor.

## ✅ En Kolay Yol: Migration Endpoint'ini Kullanmak

### Adım 1: Vercel Environment Variables'a Secret Token Ekleyin

1. Vercel Dashboard'a gidin: https://vercel.com/dashboard
2. Projenizi seçin: `arhaval-denetim-merkezi`
3. **Settings** > **Environment Variables** bölümüne gidin
4. Yeni bir environment variable ekleyin:
   - **Name**: `MIGRATION_SECRET`
   - **Value**: `arhaval-migration-2024` (istediğiniz bir şifre)
   - **Environment**: Production, Preview, Development (hepsini seçin)
5. **Save** butonuna tıklayın

### Adım 2: Migration'ı Çalıştırın

**Seçenek 1: Tarayıcıdan (En Kolay)**

1. Tarayıcınızda şu URL'yi açın (Secret token'ı yukarıda belirlediğiniz değerle değiştirin):
   ```
   https://arhaval-denetim-merkezi.vercel.app/api/migrate
   ```
   
   Ama bu çalışmaz çünkü POST isteği gerekiyor. Bunun yerine:

**Seçenek 2: Terminal/Command Prompt'tan**

Windows'ta Command Prompt'u açın ve şu komutu çalıştırın (Secret token'ı yukarıda belirlediğiniz değerle değiştirin):

```bash
curl -X POST https://arhaval-denetim-merkezi.vercel.app/api/migrate -H "Authorization: Bearer arhaval-migration-2024"
```

**Seçenek 3: Postman veya API Test Aracı Kullanın**

1. Postman veya benzeri bir araç açın
2. Yeni bir POST request oluşturun
3. URL: `https://arhaval-denetim-merkezi.vercel.app/api/migrate`
4. Headers bölümüne ekleyin:
   - Key: `Authorization`
   - Value: `Bearer arhaval-migration-2024`
5. Send butonuna tıklayın

**Seçenek 4: Tarayıcı Console'dan (En Pratik)**

1. Tarayıcınızda Vercel sitesine gidin
2. F12 tuşuna basın (Developer Tools'u açın)
3. Console sekmesine gidin
4. Şu kodu yapıştırın ve Enter'a basın:

```javascript
fetch('https://arhaval-denetim-merkezi.vercel.app/api/migrate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer arhaval-migration-2024'
  }
})
.then(res => res.json())
.then(data => console.log('Migration sonucu:', data))
.catch(err => console.error('Hata:', err))
```

## ✅ Alternatif Yol: Direkt SQL Komutu (Eğer Veritabanına Erişiminiz Varsa)

Eğer Supabase, Neon, veya başka bir Postgres veritabanı kullanıyorsanız:

1. Veritabanı yönetim paneline gidin (Supabase Dashboard, Neon Console, vb.)
2. SQL Editor'ü açın
3. Şu komutları çalıştırın:

```sql
ALTER TABLE "ContentCreator" ADD COLUMN IF NOT EXISTS "iban" TEXT;
ALTER TABLE "VoiceActor" ADD COLUMN IF NOT EXISTS "iban" TEXT;
```

## ✅ Kontrol Etme

Migration başarılı olduysa, artık:
- İçerik üreticisi eklerken IBAN alanı çalışacak
- Seslendirmen eklerken IBAN alanı çalışacak
- Detay sayfalarında IBAN görünecek

## ❌ Hata Durumunda

Eğer "column already exists" hatası alırsanız, bu normaldir - kolon zaten eklenmiş demektir. Sorun yok!

Eğer başka bir hata alırsanız, lütfen hata mesajını paylaşın.

