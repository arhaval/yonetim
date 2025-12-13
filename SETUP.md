# Kurulum ve Başlatma

## Adım 1: Bağımlılıkları Yükle
```bash
npm install
```

## Adım 2: Veritabanını Oluştur
```bash
npx prisma generate
npx prisma db push
```

## Adım 3: İlk Kullanıcıyı Oluştur
```bash
npm run create-user admin@example.com sifre123 Admin
```
(Email, şifre ve ismi kendi bilgilerinizle değiştirin)

## Adım 4: Sunucuyu Başlat
```bash
npm run dev
```

## Adım 5: Tarayıcıda Aç
`http://localhost:3001` adresine gidin ve oluşturduğunuz kullanıcı bilgileriyle giriş yapın.

---

## Sorun Giderme

### Port 3001 kullanımda mı?
`package.json` dosyasındaki `-p 3001` kısmını farklı bir port numarasıyla değiştirin (örn: `-p 3002`).

### "Module not found" hatası alıyorsanız
```bash
npm install
```

### Veritabanı hatası alıyorsanız
```bash
npx prisma db push
```

### Sunucu başlamıyorsa
Terminal çıktısındaki hata mesajlarını kontrol edin.








