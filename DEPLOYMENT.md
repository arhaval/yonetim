# 🚀 Production Deployment Rehberi

Bu rehber, Arhaval Denetim Merkezi uygulamasını production ortamına geçirmek için gerekli tüm adımları içerir.

## 📋 İçindekiler

1. [Hızlı Başlangıç (Vercel - Önerilen)](#1-hızlı-başlangıç-vercel---önerilen)
2. [Alternatif: Kendi Sunucunuzda](#2-alternatif-kendi-sunucunuzda)
3. [Database Migration (SQLite → PostgreSQL)](#3-database-migration-sqlite--postgresql)
4. [Environment Variables](#4-environment-variables)
5. [Domain ve SSL](#5-domain-ve-ssl)
6. [Güvenlik Kontrolleri](#6-güvenlik-kontrolleri)
7. [Yedekleme Stratejisi](#7-yedekleme-stratejisi)

---

## 1. Hızlı Başlangıç (Vercel - Önerilen)

Vercel, Next.js uygulamaları için en kolay ve optimize edilmiş deployment platformudur.

### Adım 1: Vercel Hesabı Oluşturma

1. [vercel.com](https://vercel.com) adresine gidin
2. GitHub, GitLab veya Bitbucket hesabınızla giriş yapın
3. Ücretsiz plan yeterli (ekip için)

### Adım 2: Projeyi GitHub'a Yükleme

```bash
# Git repository oluştur (eğer yoksa)
git init
git add .
git commit -m "Initial commit"

# GitHub'da yeni repository oluştur, sonra:
git remote add origin https://github.com/KULLANICI_ADI/arhaval-denetim-merkezi.git
git branch -M main
git push -u origin main
```

### Adım 3: PostgreSQL Database Oluşturma

**Seçenek 1: Vercel Postgres (Önerilen)**
- Vercel dashboard'da "Storage" → "Create Database" → "Postgres"
- Ücretsiz plan: 256 MB, yeterli başlangıç için

**Seçenek 2: Supabase (Ücretsiz)**
- [supabase.com](https://supabase.com) → Yeni proje oluştur
- Settings → Database → Connection String'i kopyala

**Seçenek 3: Railway (Ücretsiz)**
- [railway.app](https://railway.app) → New Project → PostgreSQL
- Connection string'i kopyala

### Adım 4: Database Schema'yı Güncelleme

1. `prisma/schema.prisma` dosyasını düzenle:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Migration oluştur ve uygula:

```bash
# Prisma client'ı generate et
npx prisma generate

# Migration oluştur
npx prisma migrate dev --name init

# Production'da çalıştırılacak:
# npx prisma migrate deploy
```

### Adım 5: Vercel'de Proje Oluşturma

1. Vercel dashboard → "Add New" → "Project"
2. GitHub repository'nizi seçin
3. **Environment Variables** ekleyin:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
NEXTAUTH_SECRET=rastgele-güvenli-string-buraya
NEXTAUTH_URL=https://your-domain.vercel.app
INSTAGRAM_ACCESS_TOKEN=your-instagram-token (opsiyonel)
INSTAGRAM_BUSINESS_ACCOUNT_ID=your-account-id (opsiyonel)
```

4. **Build Settings:**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. "Deploy" butonuna tıklayın

### Adım 6: İlk Admin Kullanıcısını Oluşturma

Deployment sonrası, Vercel'de "Functions" → "Terminal" açın veya local'de:

```bash
# DATABASE_URL'i production database URL'i ile değiştirin
export DATABASE_URL="postgresql://..."
npm run create-user
```

---

## 2. Alternatif: Kendi Sunucunuzda

### Gereksinimler

- Ubuntu 20.04+ veya benzeri Linux
- Node.js 18+
- PostgreSQL 14+
- Nginx (reverse proxy için)
- PM2 (process manager)

### Adım 1: Sunucu Kurulumu

```bash
# Node.js kurulumu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL kurulumu
sudo apt-get install postgresql postgresql-contrib

# PM2 kurulumu
sudo npm install -g pm2

# Nginx kurulumu
sudo apt-get install nginx
```

### Adım 2: PostgreSQL Database Oluşturma

```bash
sudo -u postgres psql

# PostgreSQL içinde:
CREATE DATABASE arhaval_denetim;
CREATE USER arhaval_user WITH PASSWORD 'güvenli-şifre';
GRANT ALL PRIVILEGES ON DATABASE arhaval_denetim TO arhaval_user;
\q
```

### Adım 3: Projeyi Sunucuya Yükleme

```bash
# Sunucuda
cd /var/www
git clone https://github.com/KULLANICI_ADI/arhaval-denetim-merkezi.git
cd arhaval-denetim-merkezi

# Dependencies yükle
npm install

# Environment variables oluştur
nano .env
```

`.env` dosyası:
```
DATABASE_URL=postgresql://arhaval_user:güvenli-şifre@localhost:5432/arhaval_denetim
NEXTAUTH_SECRET=rastgele-güvenli-string
NEXTAUTH_URL=https://your-domain.com
PORT=3001
```

### Adım 4: Database Migration

```bash
# Prisma generate
npx prisma generate

# Migration uygula
npx prisma migrate deploy

# İlk admin kullanıcısı oluştur
npm run create-user
```

### Adım 5: PM2 ile Çalıştırma

```bash
# PM2 ecosystem dosyası oluştur
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'arhaval-denetim',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/arhaval-denetim-merkezi',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
EOF

# PM2 ile başlat
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Adım 6: Nginx Yapılandırması

```bash
sudo nano /etc/nginx/sites-available/arhaval-denetim
```

İçerik:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Symlink oluştur
sudo ln -s /etc/nginx/sites-available/arhaval-denetim /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Adım 7: SSL Sertifikası (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 3. Database Migration (SQLite → PostgreSQL)

### Adım 1: Schema Güncelleme

`prisma/schema.prisma` dosyasında:

```prisma
datasource db {
  provider = "postgresql"  // "sqlite" yerine
  url      = env("DATABASE_URL")
}
```

### Adım 2: Migration

```bash
# Yeni migration oluştur
npx prisma migrate dev --name migrate_to_postgresql

# Production'da:
npx prisma migrate deploy
```

### Adım 3: Veri Transferi (Opsiyonel)

Eğer mevcut SQLite verilerinizi taşımak istiyorsanız:

```bash
# SQLite verilerini export et
sqlite3 prisma/dev.db .dump > backup.sql

# PostgreSQL'e import et (gerekirse düzenle)
psql -U arhaval_user -d arhaval_denetim < backup.sql
```

---

## 4. Environment Variables

### Production için Gerekli Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Next.js
NODE_ENV=production
NEXTAUTH_SECRET=rastgele-32-karakter-string
NEXTAUTH_URL=https://your-domain.com

# Instagram API (Opsiyonel)
INSTAGRAM_ACCESS_TOKEN=your-token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your-account-id

# Port (kendi sunucunuzda)
PORT=3001
```

### Güvenli Secret Oluşturma

```bash
# Terminal'de:
openssl rand -base64 32
```

---

## 5. Domain ve SSL

### Domain Satın Alma

- [Namecheap](https://namecheap.com)
- [GoDaddy](https://godaddy.com)
- [Google Domains](https://domains.google)

### DNS Ayarları

**Vercel için:**
- Vercel dashboard → Project → Settings → Domains
- Domain ekleyin
- DNS kayıtlarını domain sağlayıcınızda yapın:
  - A Record: `@` → Vercel IP
  - CNAME: `www` → `cname.vercel-dns.com`

**Kendi sunucunuz için:**
- A Record: `@` → Sunucu IP adresi
- A Record: `www` → Sunucu IP adresi

### SSL Sertifikası

- **Vercel**: Otomatik (Let's Encrypt)
- **Kendi sunucu**: Let's Encrypt (yukarıda anlatıldı)

---

## 6. Güvenlik Kontrolleri

### ✅ Yapılması Gerekenler

1. **Environment Variables**
   - `.env` dosyasını `.gitignore`'a ekleyin
   - Production'da güvenli şekilde saklayın

2. **Admin Şifreleri**
   - İlk deployment sonrası tüm şifreleri değiştirin
   - Güçlü şifreler kullanın (min 12 karakter)

3. **HTTPS**
   - Tüm trafik HTTPS üzerinden olmalı
   - HTTP → HTTPS yönlendirmesi yapın

4. **Rate Limiting**
   - API endpoint'lerine rate limiting ekleyin (opsiyonel)

5. **CORS Ayarları**
   - Sadece gerekli domain'lere izin verin

### 🔒 Güvenlik Checklist

- [ ] `.env` dosyası `.gitignore`'da
- [ ] Production database şifresi güçlü
- [ ] `NEXTAUTH_SECRET` güvenli ve rastgele
- [ ] HTTPS aktif
- [ ] Admin şifreleri değiştirildi
- [ ] Gereksiz API endpoint'leri kapatıldı (opsiyonel)

---

## 7. Yedekleme Stratejisi

### Otomatik Yedekleme (Önerilen)

**Vercel + Supabase:**
- Supabase otomatik daily backup yapar

**Kendi sunucunuzda:**

```bash
# Yedekleme scripti oluştur
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/arhaval-denetim"
mkdir -p $BACKUP_DIR

# PostgreSQL backup
pg_dump -U arhaval_user arhaval_denetim > $BACKUP_DIR/db_$DATE.sql

# Eski yedekleri sil (30 günden eski)
find $BACKUP_DIR -name "db_*.sql" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/backup-db.sh

# Cron job ekle (her gün saat 02:00'de)
crontab -e
# Şunu ekle:
0 2 * * * /usr/local/bin/backup-db.sh
```

### Manuel Yedekleme

```bash
# Database
pg_dump -U arhaval_user arhaval_denetim > backup.sql

# Uploads klasörü
tar -czf uploads_backup.tar.gz public/uploads/
```

---

## 🎯 Hızlı Deployment Özeti (Vercel)

1. ✅ GitHub'a push yap
2. ✅ Vercel hesabı oluştur
3. ✅ PostgreSQL database oluştur (Vercel Postgres veya Supabase)
4. ✅ `prisma/schema.prisma` → PostgreSQL'e çevir
5. ✅ Vercel'de proje oluştur, environment variables ekle
6. ✅ Deploy et
7. ✅ İlk admin kullanıcısı oluştur
8. ✅ Domain ekle
9. ✅ Test et!

---

## 📞 Sorun Giderme

### Database Connection Error

```bash
# Connection string'i kontrol et
echo $DATABASE_URL

# Prisma client'ı yeniden generate et
npx prisma generate
```

### Build Hatası

```bash
# Local'de test et
npm run build

# Hataları düzelt, tekrar push yap
```

### Port Çakışması

```bash
# Farklı port kullan
PORT=3002 npm start
```

---

## 🚀 Sonraki Adımlar

1. **Monitoring**: Vercel Analytics veya Sentry ekleyin
2. **Logging**: Winston veya Pino ile logging
3. **Email**: Şifre sıfırlama için email servisi (SendGrid, Resend)
4. **2FA**: İki faktörlü kimlik doğrulama (opsiyonel)

---

**Sorularınız için:** GitHub Issues veya ekip iletişim kanallarını kullanın.

