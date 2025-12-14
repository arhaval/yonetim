# API Entegrasyon Rehberi

## 📋 Genel Bakış

Sistem YouTube ve Instagram içeriklerini otomatik olarak çekmek için API entegrasyonları kullanır.

## 🎥 YouTube API Entegrasyonu

### 1. YouTube API Key Alma

1. **Google Cloud Console'a gidin**: https://console.cloud.google.com/
2. **Yeni proje oluşturun** veya mevcut projeyi seçin
3. **YouTube Data API v3'ü etkinleştirin**:
   - "APIs & Services" > "Library" bölümüne gidin
   - "YouTube Data API v3" arayın ve "Enable" butonuna tıklayın
4. **API Key oluşturun**:
   - "APIs & Services" > "Credentials" bölümüne gidin
   - "Create Credentials" > "API Key" seçin
   - API Key'inizi kopyalayın

### 2. API Key'i Sisteme Ekleme

`.env` dosyanıza şu satırı ekleyin:

```env
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 3. Nasıl Çalışıyor?

#### Tek Video Çekme:
```
POST /api/content/youtube
Body: { "url": "https://www.youtube.com/watch?v=VIDEO_ID" }
```

**Desteklenen URL Formatları:**
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/shorts/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

**Çekilen Veriler:**
- ✅ Başlık (title)
- ✅ Görüntülenme sayısı (views)
- ✅ Beğeni sayısı (likes)
- ✅ Yorum sayısı (comments)
- ✅ Video süresi (duration)
- ✅ Yayın tarihi (publishDate)
- ✅ Kanal adı (creatorName)
- ✅ Video tipi (Video/Shorts otomatik tespit)

#### Tüm Kanal Çekme:
```
POST /api/content/youtube
Body: { "channelId": "UC..." veya "@channelname" }
```

**Desteklenen Formatlar:**
- Channel ID: `UC...`
- Handle: `@channelname`
- Channel URL: `https://www.youtube.com/@channelname`

### 4. Kullanım Senaryoları

#### Senaryo 1: Yeni İçerik Formundan
1. Kullanıcı "Yeni İçerik" sayfasına gider
2. Platform: YouTube seçer
3. Tip: Video veya Shorts seçer
4. **İçerik Linki** alanına YouTube URL'i yapıştırır
5. "Kaydet" butonuna tıklar
6. Sistem otomatik olarak:
   - URL'den video ID'yi çıkarır
   - YouTube API'den tüm istatistikleri çeker
   - Veritabanına kaydeder

#### Senaryo 2: İçerikler Sayfasından
1. Kullanıcı "İçerikler" sayfasına gider
2. Platform: YouTube seçer
3. "API'den Çek" butonuna tıklar
4. Seçenekler:
   - **1**: Tek video çek (URL girer)
   - **2**: Tüm kanalı çek (Channel ID/Handle/URL girer)

## 📸 Instagram API Entegrasyonu

### 1. Instagram Graph API Kurulumu

Instagram API kullanmak için:

1. **Facebook Developer Console'a gidin**: https://developers.facebook.com/
2. **Yeni uygulama oluşturun**
3. **Instagram Graph API'yi ekleyin**
4. **Instagram Business Account bağlayın**
5. **Access Token alın**

### 2. Access Token'ı Sisteme Ekleme

`.env` dosyanıza şu satırı ekleyin:

```env
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_business_account_id
```

### 3. Nasıl Çalışıyor? (Şu Anki Durum)

#### Tek İçerik Çekme:
```
POST /api/content/instagram
Body: { "url": "https://www.instagram.com/p/POST_ID/" }
```

**Desteklenen URL Formatları:**
- `https://www.instagram.com/p/POST_ID/`
- `https://www.instagram.com/reel/REEL_ID/`

**Şu Anki Durum:**
- ✅ URL kaydediliyor
- ✅ İçerik tipi otomatik tespit ediliyor (Reels/Post)
- ⚠️ İstatistikler henüz çekilmiyor (API entegrasyonu devam ediyor)

**Gelecekte Çekilecek Veriler:**
- Başlık (caption)
- Beğeni sayısı (likes)
- Yorum sayısı (comments)
- Paylaşım sayısı (shares)
- Kaydetme sayısı (saves)

### 4. Instagram API Entegrasyonu Tamamlama

`app/api/content/instagram/route.ts` dosyasında `fetchSingleInstagramContent` fonksiyonunu güncelleyin:

```typescript
// Instagram Graph API ile içerik çekme
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN
const INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID

// URL'den media ID çıkar
const mediaId = extractMediaIdFromUrl(url)

// Instagram Graph API çağrısı
const response = await fetch(
  `https://graph.instagram.com/${mediaId}?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&access_token=${INSTAGRAM_ACCESS_TOKEN}`
)

const instagramData = await response.json()

// Veritabanına kaydet
await prisma.content.create({
  data: {
    title: instagramData.caption || 'Instagram İçeriği',
    type: instagramData.media_type === 'REELS' ? 'reel' : 'post',
    platform: 'Instagram',
    url: instagramData.permalink,
    publishDate: new Date(instagramData.timestamp),
    likes: parseInt(instagramData.like_count || '0'),
    comments: parseInt(instagramData.comments_count || '0'),
    // ...
  }
})
```

## 🔄 Otomatik Veri Çekme Akışı

### Adım 1: Kullanıcı URL Girer
```
Kullanıcı → Yeni İçerik Formu → URL Girer
```

### Adım 2: Sistem URL'yi Analiz Eder
```
Sistem → URL Formatını Kontrol Eder
       → Platform Belirler (YouTube/Instagram)
       → İçerik ID'sini Çıkarır
```

### Adım 3: API'den Veri Çekilir
```
Sistem → İlgili API'yi Çağırır
       → Video/Post Detaylarını Alır
       → İstatistikleri Toplar
```

### Adım 4: Veritabanına Kaydedilir
```
Sistem → Veritabanına Kaydeder
       → Kullanıcıya Başarı Mesajı Gösterir
       → İçerikler Sayfasına Yönlendirir
```

## 📊 Çekilen Veri Örnekleri

### YouTube Video Örneği:
```json
{
  "title": "Video Başlığı",
  "platform": "YouTube",
  "type": "video",
  "url": "https://www.youtube.com/watch?v=...",
  "views": 1000000,
  "likes": 50000,
  "comments": 5000,
  "publishDate": "2024-01-15",
  "creatorName": "Kanal Adı"
}
```

### Instagram Reels Örneği:
```json
{
  "title": "Reels Başlığı",
  "platform": "Instagram",
  "type": "reel",
  "url": "https://www.instagram.com/reel/...",
  "likes": 10000,
  "comments": 500,
  "shares": 200,
  "saves": 1000
}
```

## ⚙️ Sistem Yapılandırması

### .env Dosyası Örneği:
```env
# YouTube API
YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Instagram API (Gelecekte)
INSTAGRAM_ACCESS_TOKEN=IGQWXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
INSTAGRAM_BUSINESS_ACCOUNT_ID=1784140XXXXXXXXX

# Veritabanı
DATABASE_URL="file:./dev.db"
```

## 🚀 Hızlı Başlangıç

1. **YouTube API Key alın** (yukarıdaki adımları takip edin)
2. **.env dosyasına ekleyin**: `YOUTUBE_API_KEY=your_key`
3. **Sistemi test edin**:
   - Yeni İçerik sayfasına gidin
   - YouTube seçin
   - Bir YouTube video URL'i yapıştırın
   - Kaydet'e tıklayın
   - İstatistiklerin otomatik çekildiğini görün!

## 🔍 Sorun Giderme

### YouTube API Hataları:
- **"API key bulunamadı"**: .env dosyasında `YOUTUBE_API_KEY` kontrol edin
- **"Quota exceeded"**: Günlük API limiti aşıldı (10,000 birim/gün)
- **"Video bulunamadı"**: URL formatını kontrol edin

### Instagram API Hataları:
- **"Access token bulunamadı"**: .env dosyasında `INSTAGRAM_ACCESS_TOKEN` kontrol edin
- **"Geçersiz URL formatı"**: URL formatını kontrol edin

## 📝 Notlar

- YouTube API günlük 10,000 birim limiti vardır
- Her video çekme işlemi ~1 birim kullanır
- Instagram API için Business Account gerekir
- Access token'lar periyodik olarak yenilenmelidir







