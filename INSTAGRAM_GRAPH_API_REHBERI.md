# Instagram Graph API Kullanım Rehberi

## 🎯 Neden Instagram Graph API?

- ✅ **Resmi API** - Instagram'ın resmi API'si
- ✅ **Güvenilir** - Sürekli güncellenir
- ✅ **Detaylı veri** - Tüm istatistikleri çeker
- ✅ **Otomatik** - Manuel giriş gerekmez

## 📋 Gereksinimler

1. **Facebook Developer Hesabı**
   - https://developers.facebook.com/
   - Facebook hesabınızla giriş yapın

2. **Instagram Business veya Creator Hesabı**
   - Hesabınızı Business/Creator'a çevirin
   - Facebook sayfanızla bağlayın

3. **Uygulama Oluşturma**
   - Facebook Developer'da yeni uygulama oluşturun
   - Instagram Basic Display veya Instagram Graph API'yi etkinleştirin

## 🚀 Kurulum Adımları

### Adım 1: Facebook Developer Hesabı
1. https://developers.facebook.com/ adresine gidin
2. "Get Started" butonuna tıklayın
3. Facebook hesabınızla giriş yapın

### Adım 2: Uygulama Oluştur
1. "My Apps" > "Create App"
2. "Business" tipini seçin
3. Uygulama adını girin

### Adım 3: Instagram Graph API Ekle
1. Uygulama ayarlarından "Add Product"
2. "Instagram Graph API" seçin
3. Kurulum adımlarını takip edin

### Adım 4: Access Token Al
1. "Tools" > "Graph API Explorer"
2. Uygulamanızı seçin
3. "Generate Access Token" butonuna tıklayın
4. İzinleri seçin (instagram_basic, instagram_manage_insights)
5. Token'ı kopyalayın

### Adım 5: Instagram Business ID Bul
1. Graph API Explorer'da:
   ```
   GET /me/accounts
   ```
2. Instagram sayfanızın ID'sini bulun

## 💻 Python Scripti

Instagram Graph API ile çalışan bir script hazırlayabiliriz:

```python
import requests
import json

ACCESS_TOKEN = "your_access_token"
INSTAGRAM_BUSINESS_ID = "your_instagram_business_id"

# Gönderileri çek
url = f"https://graph.instagram.com/{INSTAGRAM_BUSINESS_ID}/media"
params = {
    "fields": "id,caption,like_count,comments_count,timestamp",
    "access_token": ACCESS_TOKEN
}

response = requests.get(url, params=params)
data = response.json()

print(json.dumps(data, indent=2))
```

## 📊 Çekilebilen Veriler

- ✅ Beğeni sayısı
- ✅ Yorum sayısı
- ✅ Paylaşım sayısı
- ✅ Kaydedilme sayısı
- ✅ Erişim (Reach)
- ✅ Gösterim (Impressions)
- ✅ Tıklama sayısı
- ✅ Profil ziyaretleri

## ⚠️ Önemli Notlar

- **Business/Creator hesabı gerekli** - Normal hesap çalışmaz
- **Access Token süresi** - Token'ların süresi dolabilir, yenileme gerekir
- **Rate Limits** - API kullanım limitleri var
- **Ücretsiz** - Temel kullanım ücretsizdir

## 🔗 Kaynaklar

- [Instagram Graph API Dokümantasyonu](https://developers.facebook.com/docs/instagram-api)
- [Facebook Developer Console](https://developers.facebook.com/)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)

## 🎯 Sonuç

Instagram Graph API kullanmak en iyi çözümdür:
- ✅ Otomatik
- ✅ Güvenilir
- ✅ Detaylı veri
- ✅ Resmi API

Manuel giriş yerine bu yöntemi kullanmanızı öneririm!

