# 🛠️ Teknoloji Stack ve cPanel Uyumluluğu

## 📋 Projenin Kullandığı Teknolojiler

### Frontend & Framework
- **Next.js 14** (App Router) - React framework
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - CSS framework

### Backend & Database
- **Node.js** - Runtime environment
- **Prisma ORM** - Database ORM
- **SQLite** (Development) / **PostgreSQL** (Production)
- **bcryptjs** - Password hashing

### Diğer Kütüphaneler
- **date-fns** - Date formatting
- **lucide-react** - Icons
- **recharts** - Charts/graphs
- **zod** - Schema validation

---

## ❌ cPanel'e Direkt Yükleme: UYGUN DEĞİL

### Neden cPanel'e Uygun Değil?

#### 1. Node.js Gereksinimi
```
Next.js → Node.js runtime gerektirir
cPanel Shared Hosting → Genelde Node.js desteği YOK veya çok sınırlı
```

**Sorun:**
- cPanel shared hosting genelde sadece PHP, Python (sınırlı), static dosyalar destekler
- Next.js bir **Node.js uygulaması**dır
- Build işlemi ve production server gerektirir

#### 2. Build İşlemi
```
npm run build → .next klasörü oluşturur
npm start → Production server başlatır
```

**Sorun:**
- cPanel'de terminal erişimi sınırlı
- `npm install`, `npm run build` komutlarını çalıştırmak zor
- Production server'ı sürekli çalıştırmak gerekir

#### 3. Database Bağlantısı
```
Prisma ORM → PostgreSQL/SQLite gerektirir
cPanel → MySQL genelde var, PostgreSQL nadiren
```

**Sorun:**
- Prisma PostgreSQL kullanıyor (production)
- cPanel'de PostgreSQL desteği nadir
- Migration işlemleri terminal gerektirir

#### 4. Environment Variables
```
.env dosyası → Production'da güvenli saklanmalı
cPanel → File manager ile manuel ekleme
```

**Sorun:**
- `.env` dosyası güvenlik riski
- Environment variables yönetimi zor

---

## ✅ Alternatif Çözümler

### Seçenek 1: Vercel (ÖNERİLEN - En Kolay)

**Avantajlar:**
- ✅ Next.js için optimize edilmiş
- ✅ Otomatik build ve deploy
- ✅ Ücretsiz plan yeterli (4-5 kişi için)
- ✅ Otomatik SSL
- ✅ Kolay kurulum

**Maliyet:** $0/ay (Hobby plan)

**Kurulum:** 5 dakika
1. GitHub'a push
2. Vercel'e bağla
3. Environment variables ekle
4. Deploy!

---

### Seçenek 2: cPanel + VPS (Node.js Desteği Varsa)

**Gereksinimler:**
- cPanel VPS hosting (Node.js desteği olan)
- SSH erişimi
- PM2 veya benzeri process manager

**Adımlar:**
1. SSH ile sunucuya bağlan
2. Node.js kur (eğer yoksa)
3. Projeyi klonla
4. `npm install && npm run build`
5. PM2 ile çalıştır
6. Nginx reverse proxy kur

**Maliyet:** $10-30/ay (VPS)

**Zorluk:** ⚠️ Orta-İleri seviye teknik bilgi gerekir

---

### Seçenek 3: DigitalOcean / Linode / AWS

**Avantajlar:**
- ✅ Tam kontrol
- ✅ Node.js desteği
- ✅ Ölçeklenebilir

**Maliyet:** $5-20/ay

**Zorluk:** ⚠️ İleri seviye teknik bilgi gerekir

---

### Seçenek 4: Railway / Render

**Avantajlar:**
- ✅ Kolay kurulum (Vercel gibi)
- ✅ Otomatik build
- ✅ Ücretsiz plan var

**Maliyet:** $0-20/ay

**Kurulum:** Vercel'e benzer

---

## 🔄 cPanel'de Çalıştırmak İçin Gereksinimler

Eğer mutlaka cPanel kullanmak istiyorsanız:

### Minimum Gereksinimler:
1. **VPS Hosting** (Shared hosting değil)
2. **Node.js 18+** kurulu olmalı
3. **SSH erişimi** olmalı
4. **PM2** veya benzeri process manager
5. **Nginx** reverse proxy (opsiyonel ama önerilen)
6. **PostgreSQL** database (cPanel'de nadiren var)

### Kurulum Adımları (cPanel VPS):

```bash
# 1. SSH ile bağlan
ssh user@your-server.com

# 2. Node.js kontrol et
node --version  # 18+ olmalı

# 3. Projeyi klonla
cd /home/user/public_html
git clone YOUR_REPO_URL arhaval-denetim
cd arhaval-denetim

# 4. Dependencies yükle
npm install

# 5. Environment variables
nano .env
# DATABASE_URL, NEXTAUTH_SECRET, vs. ekle

# 6. Prisma setup
npx prisma generate
npx prisma migrate deploy

# 7. Build
npm run build

# 8. PM2 ile çalıştır
npm install -g pm2
pm2 start npm --name "arhaval-denetim" -- start
pm2 save
pm2 startup
```

**Sorunlar:**
- ⚠️ cPanel'de PostgreSQL nadiren var (MySQL var)
- ⚠️ Database migration zor
- ⚠️ Sürekli bakım gerekir
- ⚠️ SSL sertifikası manuel kurulum

---

## 📊 Karşılaştırma Tablosu

| Özellik | cPanel Shared | cPanel VPS | Vercel | Railway |
|---------|---------------|------------|--------|---------|
| **Node.js Desteği** | ❌ Yok | ✅ Var | ✅ Var | ✅ Var |
| **Kurulum Kolaylığı** | ❌ Çok Zor | ⚠️ Orta | ✅ Çok Kolay | ✅ Kolay |
| **Otomatik Build** | ❌ Yok | ❌ Yok | ✅ Var | ✅ Var |
| **SSL Sertifikası** | ✅ Var | ⚠️ Manuel | ✅ Otomatik | ✅ Otomatik |
| **Database** | ⚠️ MySQL | ⚠️ MySQL | ✅ Postgres | ✅ Postgres |
| **Maliyet** | $5-10/ay | $20-50/ay | $0/ay | $0-20/ay |
| **Bakım** | ⚠️ Zor | ⚠️ Orta | ✅ Otomatik | ✅ Otomatik |
| **Önerilen mi?** | ❌ Hayır | ⚠️ Mümkün | ✅ **EVET** | ✅ Evet |

---

## 🎯 Sonuç ve Öneri

### ❌ cPanel Shared Hosting: UYGUN DEĞİL
- Node.js desteği yok
- Build işlemi yapılamaz
- Production server çalıştırılamaz

### ⚠️ cPanel VPS: MÜMKÜN AMA ZOR
- Node.js kurulumu gerekir
- SSH erişimi gerekir
- Manuel kurulum ve bakım
- PostgreSQL desteği nadir

### ✅ ÖNERİLEN: Vercel
- Next.js için optimize
- Ücretsiz plan yeterli
- 5 dakikada kurulum
- Otomatik SSL ve build
- **4-5 kişilik ekip için ideal!**

---

## 🚀 Hızlı Başlangıç (Vercel)

```bash
# 1. GitHub'a push
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main

# 2. Vercel'de deploy
# - vercel.com → GitHub ile giriş
# - "Add New Project" → Repository seç
# - Environment variables ekle
# - Deploy!

# 3. Database (Supabase - Ücretsiz)
# - supabase.com → Yeni proje
# - Connection string'i kopyala
# - Vercel'e environment variable olarak ekle
```

**Toplam süre:** 10 dakika
**Maliyet:** $0/ay
**Zorluk:** ⭐ Kolay

---

## 📝 Özet

**Proje Teknolojileri:**
- Next.js 14 + TypeScript + React
- Node.js runtime
- Prisma ORM + PostgreSQL
- Tailwind CSS

**cPanel Uyumluluğu:**
- ❌ Shared hosting: Uygun değil
- ⚠️ VPS: Mümkün ama zor
- ✅ **Vercel önerilir!**

**Neden Vercel?**
- Next.js için optimize
- Ücretsiz plan yeterli
- Kolay kurulum
- Otomatik bakım

---

**Sonuç:** cPanel'e direkt yükleme uygun değil. Vercel kullanmanızı şiddetle öneririm! 🚀

