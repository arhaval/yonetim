# Instagram İstatistik Çekme Scripti

Bu script, Instagram hesabınızdan son 5 gönderinin detaylı istatistiklerini çeker.

## Kurulum

1. Gerekli Python paketlerini yükleyin:
```bash
pip install instagrapi python-dotenv
```

veya requirements.txt dosyasını kullanarak:
```bash
pip install -r requirements.txt
```

## Kullanım

1. `.env` dosyası oluşturun (`.env.example` dosyasını kopyalayarak):
```bash
cp .env.example .env
```

2. `.env` dosyasını düzenleyin ve Instagram bilgilerinizi girin:
```
INSTAGRAM_USERNAME=kullanici_adiniz
INSTAGRAM_PASSWORD=sifreniz
```

3. Scripti çalıştırın:
```bash
python instagram_stats.py
```

## Çıktı

Script, `sonuc.json` dosyasına şu bilgileri kaydeder:
- Her gönderi için:
  - Beğeni sayısı
  - Yorum sayısı
  - Erişim (Reach) - Business/Creator hesabı gerektirir
  - Gösterim (Impressions) - Business/Creator hesabı gerektirir
  - Kaydedilme (Saves) sayısı
  - Gönderi URL'si
  - Gönderi tarihi
  - Gönderi açıklaması (ilk 100 karakter)

## Notlar

- **Güvenlik**: `.env` dosyasını asla Git'e commit etmeyin!
- **Business/Creator Hesabı**: Reach ve Impressions verileri için Instagram Business veya Creator hesabı gereklidir. Normal hesaplarda bu veriler `null` olarak görünecektir.
- **Rate Limiting**: Instagram çok fazla istek yaparsanız geçici olarak engelleyebilir. Bu durumda birkaç dakika bekleyin.
- **2FA**: Eğer hesabınızda 2 faktörlü doğrulama varsa, geçici olarak kapatmanız gerekebilir veya instagrapi'nin 2FA desteğini kullanmanız gerekir.

## Hata Yönetimi

Script, aşağıdaki durumlarda hata mesajları gösterir:
- Giriş yapılamazsa
- Gönderiler çekilemezse
- Insights alınamazsa (Business/Creator hesabı olmayabilir)

Tüm hatalar terminalde görüntülenir ve script çökmeden devam eder.

