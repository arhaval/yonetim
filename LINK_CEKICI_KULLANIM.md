# Instagram Link Çekici - Kullanım Rehberi

## 🎯 Ne İşe Yarar?

Instagram gönderi linklerini vererek, o gönderilerin istatistiklerini çekersiniz.

## 🚀 Nasıl Kullanılır?

### Yöntem 1: Otomatik (Önerilen)
`CALISTIR_LINK.bat` dosyasına çift tıklayın.

### Yöntem 2: Manuel
```cmd
py -3.12 instagram_link_cekici.py
```

## 📝 Adımlar

1. **Scripti çalıştırın**
   - `CALISTIR_LINK.bat` dosyasına çift tıklayın

2. **Giriş yapın** (ilk sefer)
   - Instagram hesabınıza giriş yapılacak
   - Session kaydedilecek (bir daha giriş yapmanız gerekmez)

3. **Gönderi linklerini girin**
   - Instagram'da gönderilerinizi açın
   - Linki kopyalayın (Paylaş > Linki Kopyala)
   - Scripte yapıştırın ve Enter'a basın
   - İstediğiniz kadar link ekleyebilirsiniz
   - Bitirmek için boş bırakıp Enter'a basın

4. **Sonuçları görün**
   - Script her gönderiyi işler
   - Sonuçlar `sonuc_link.json` dosyasına kaydedilir

## 📋 Örnek Linkler

```
https://www.instagram.com/p/ABC123/
https://www.instagram.com/reel/XYZ789/
https://www.instagram.com/p/DEF456/
```

## ✅ Çekilen Veriler

Her gönderi için:
- ✅ Beğeni sayısı
- ✅ Yorum sayısı
- ✅ Kaydedilme sayısı
- ✅ İzlenme sayısı (video için)
- ✅ Erişim (Reach) - Business hesabı varsa
- ✅ Gösterim (Impressions) - Business hesabı varsa
- ✅ Açıklama (ilk 200 karakter)
- ✅ Tarih

## 📁 Çıktı Dosyası

Sonuçlar `sonuc_link.json` dosyasına kaydedilir.

## ⚠️ Notlar

- **Public gönderiler:** Sadece public gönderiler çekilebilir
- **Business/Creator hesabı:** Reach ve Impressions için gerekli
- **Session:** İlk girişten sonra session kaydedilir, bir daha giriş yapmanız gerekmez
- **Çoklu link:** İstediğiniz kadar link ekleyebilirsiniz

## 🎉 Avantajlar

- ✅ Otomatik gönderi çekme sorununu aşar
- ✅ İstediğiniz gönderileri seçebilirsiniz
- ✅ Hızlı ve kolay
- ✅ Her gönderi için detaylı bilgi

## 🔧 Sorun Giderme

**"Gönderi çekilemedi" hatası:**
- Gönderi gizli olabilir
- Link yanlış olabilir
- Instagram API'si değişmiş olabilir

**"Session geçersiz" hatası:**
- Yeni giriş yapılacak
- Instagram uygulamasından giriş yapın ve tekrar deneyin

