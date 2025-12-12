# Arhaval Denetim Merkezi

Yayıncı ve içerik yönetim sistemi. Bu sistem yayıncıların, içeriklerin, finansal kayıtların ve ekip üyelerinin takibini yapmanızı sağlar.

## Özellikler

- **Yayıncı Yönetimi**: Yayıncıları ekleyin, düzenleyin ve takip edin
- **Dış Yayın Takibi**: Yayıncıların başka takımlara gittiği yayınları kaydedin
- **İçerik Takibi**: İçeriklerin etkileşim metriklerini (beğeni, yorum, paylaşım) takip edin
- **Finansal Yönetim**: Gelir ve giderleri kaydedin, aylık raporlar görüntüleyin
- **Ekip Yönetimi**: Ekip üyelerini ve görevlerini yönetin
- **Raporlama**: Aylık istatistikler ve analizler

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Environment variables'ı ayarlayın:
```bash
# .env dosyası oluşturun ve API bilgilerinizi ekleyin
# .env dosyasına şunları ekleyin:
# DATABASE_URL="file:./dev.db"
# YOUTUBE_API_KEY=your_youtube_api_key_here
# INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here (opsiyonel)
```

YouTube API key almak için:
- https://console.cloud.google.com/apis/credentials adresine gidin
- Yeni bir proje oluşturun veya mevcut projeyi seçin
- "Create Credentials" > "API Key" seçin
- YouTube Data API v3'ü etkinleştirin
- API key'i kopyalayın ve .env dosyasına ekleyin

3. Veritabanını oluşturun:
```bash
npx prisma generate
npx prisma db push
```

4. İlk admin kullanıcısını oluşturun:
```bash
npm run create-user <email> <password> [name]
# Örnek: npm run create-user admin@example.com sifre123 Admin
```

5. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

6. Tarayıcınızda `http://localhost:3001` adresine gidin.

## İlk Kullanıcı Oluşturma

İlk kullanıcıyı oluşturmak için:

1. `npx prisma studio` komutu ile Prisma Studio'yu açın
2. User tablosuna gidin
3. Yeni bir kullanıcı ekleyin:
   - email: istediğiniz email
   - password: bcrypt ile hashlenmiş şifre (şimdilik manuel olarak hash'lenmeli)
   - name: kullanıcı adı
   - role: "admin"

Veya API endpoint'i kullanarak kayıt sayfası ekleyebilirsiniz.

## Teknolojiler

- Next.js 14 (App Router)
- TypeScript
- Prisma ORM
- SQLite (geliştirme için)
- Tailwind CSS
- date-fns

## Veritabanı Yapısı

- **User**: Sistem kullanıcıları
- **Streamer**: Yayıncılar
- **Stream**: Yayınlar
- **ExternalStream**: Dış yayınlar (başka takımlar)
- **Content**: İçerikler
- **FinancialRecord**: Finansal kayıtlar
- **TeamMember**: Ekip üyeleri
- **Task**: Görevler
- **Payment**: Ödemeler

## Notlar

- Production ortamında SQLite yerine PostgreSQL kullanmanız önerilir
- Şifreler bcrypt ile hash'lenir
- Session yönetimi cookie tabanlıdır (production'da JWT kullanılmalı)

