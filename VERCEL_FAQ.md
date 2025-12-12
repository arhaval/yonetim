# Vercel Deployment Sık Sorulan Sorular

## Aynı Hesapta Birden Fazla Proje

### ✅ Sorun Olmaz!

Vercel'de aynı hesapta **sınırsız sayıda proje** olabilir. Her proje:
- Bağımsız çalışır
- Kendi domain'ine sahip olabilir
- Kendi environment variables'larına sahiptir
- Birbirini etkilemez

### Örnek Senaryo

```
Vercel Hesabınız:
├── Proje 1: eski-proje.vercel.app
├── Proje 2: yeni-proje.vercel.app
└── Proje 3: arhaval-denetim.vercel.app  ← Yeni proje
```

Hepsi aynı hesapta sorunsuz çalışır!

## Yeni Hesap Açmak Gerekli mi?

### ❌ Gerekli Değil

**Aynı hesabı kullanmanın avantajları:**
- ✅ Tek bir yerden tüm projeleri yönetirsiniz
- ✅ Tek bir dashboard'dan her şeyi görürsünüz
- ✅ Daha kolay yönetim
- ✅ Ücretsiz plan limitleri paylaşılır (genelde yeterli)

**Yeni hesap açmanın durumları:**
- Farklı ekipler için ayrı hesaplar
- Farklı ödeme yöntemleri
- Tamamen izole ortam istiyorsanız

## Vercel Ücretsiz Plan Limitleri

### Hobby Plan (Ücretsiz)
- ✅ Sınırsız proje
- ✅ 100 GB bandwidth/ay
- ✅ 100 build/ay
- ✅ Otomatik SSL
- ✅ Preview deployments
- ✅ Sınırsız deployment

**4-5 Kişilik Ekip için:**
- ✅ **KESINLIKLE YETERLİ!**
- Günde 3-4 build yapsanız bile ayda ~100 build
- 4-5 kişi için bandwidth çok düşük olacak
- Ücretsiz plan fazlasıyla yeterli

**1000+ Kullanıcılı Proje için:**
- ⚠️ **Pro Plan gerekebilir** ($20/ay)
- 100 GB bandwidth aşılabilir
- Daha fazla build gerekebilir
- Analytics ve monitoring özellikleri

### Pro Plan ($20/ay) Ne Zaman Gerekli?

**Ücretsiz plan yeterli:**
- ✅ 4-5 kişilik ekip (bu proje)
- ✅ Düşük-orta trafik
- ✅ Ayda <100 build
- ✅ Ayda <100 GB bandwidth

**Pro plan gerekli:**
- ⚠️ 1000+ aktif kullanıcı (eski proje)
- ⚠️ Yüksek trafik
- ⚠️ Ayda >100 build
- ⚠️ Ayda >100 GB bandwidth
- ⚠️ Advanced analytics gerekli

## Proje Ayırma Stratejisi

### Senaryo 1: Aynı Hesap (Önerilen)
```
Vercel Hesabı
├── Eski Proje
└── Arhaval Denetim Merkezi  ← Yeni
```

**Avantajlar:**
- Tek yerden yönetim
- Kolay geçiş
- Daha az karmaşıklık

### Senaryo 2: Yeni Hesap
```
Hesap 1: Eski Projeler
Hesap 2: Arhaval Denetim Merkezi
```

**Ne zaman tercih edilmeli:**
- Farklı ekipler
- Farklı ödeme yöntemleri
- Tamamen ayrı yönetim istiyorsanız

## Deployment Adımları (Aynı Hesap)

1. **Vercel Dashboard'a girin**
   - Mevcut hesabınızla giriş yapın

2. **"Add New Project" tıklayın**
   - Yeni proje ekleyin
   - Eski projeleriniz etkilenmez

3. **Repository seçin**
   - GitHub'dan `arhaval-denetim-merkezi` repository'sini seçin

4. **Environment Variables ekleyin**
   - Bu projeye özel variables
   - Diğer projelerin variables'ları görünmez

5. **Deploy edin**
   - Her proje kendi URL'ine sahip olur
   - Örnek: `arhaval-denetim-xyz123.vercel.app`

## Domain Yönetimi

### Aynı Hesapta Farklı Domainler

```
Proje 1: eski-proje.com
Proje 2: arhaval-denetim.com  ← Yeni domain
```

Her proje kendi domain'ine sahip olabilir, sorun olmaz!

## Öneri

**Aynı hesabı kullanın!** 
- Daha pratik
- Daha kolay yönetim
- Gereksiz karmaşıklık yok
- Ücretsiz plan genelde yeterli

Sadece farklı ekipler veya özel gereksinimler varsa yeni hesap açın.

