# Sosyal Medya Takibi Kurulumu

Sosyal medya takibi özelliğini kullanmak için aşağıdaki adımları izleyin:

## 1. Prisma Client'ı Yeniden Generate Edin

Dev sunucusunu durdurun (Ctrl+C) ve şu komutu çalıştırın:

```bash
npx prisma generate
```

## 2. Veritabanını Güncelleyin

```bash
npx prisma db push
```

## 3. Sunucuyu Yeniden Başlatın

```bash
npm run dev
```

## 4. Aralık 2024 Başlangıç Değerlerini Ekleyin

1. Tarayıcıda `/social-media` sayfasına gidin
2. Ay seçicide "Aralık 2024" seçin
3. "Başlangıç Değerleri" butonuna tıklayın

Bu işlem şu değerleri ekleyecek:
- Instagram: 2.741
- YouTube: 19.032
- X: 5.819
- Twitch: 10.300
- TikTok: 772

## Kullanım

- Her ay için takipçi sayılarını güncelleyebilirsiniz
- Hedef belirleyebilirsiniz
- Dashboard'da tüm platformların durumunu görebilirsiniz
- Önceki aya göre değişim yüzdeleri otomatik hesaplanır












