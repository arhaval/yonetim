# 🚀 Hızlı Deployment Rehberi

## En Kolay Yol: Vercel (5 Dakika)

> **Not:** Vercel'de zaten başka projeleriniz varsa sorun olmaz! Aynı hesapta istediğiniz kadar proje olabilir. Her proje bağımsız çalışır.

### 1. GitHub'a Yükle
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/KULLANICI_ADI/arhaval-denetim-merkezi.git
git push -u origin main
```

### 2. Vercel'de Deploy Et
1. [vercel.com](https://vercel.com) → GitHub ile giriş yap
2. "Add New Project" → Repository seç
3. **Environment Variables ekle:**
   - `DATABASE_URL` → PostgreSQL connection string (Vercel Postgres veya Supabase)
   - `NEXTAUTH_SECRET` → `openssl rand -base64 32` ile oluştur
   - `NEXTAUTH_URL` → `https://your-app.vercel.app`

### 3. Database Hazırla
**Seçenek A: Vercel Postgres (Önerilen)**
- Vercel Dashboard → Storage → Create Database → Postgres

**Seçenek B: Supabase (Ücretsiz)**
- [supabase.com](https://supabase.com) → New Project
- Settings → Database → Connection String

### 4. Schema'yı PostgreSQL'e Çevir
`prisma/schema.prisma` dosyasında:
```prisma
datasource db {
  provider = "postgresql"  // "sqlite" yerine
  url      = env("DATABASE_URL")
}
```

Sonra:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Deploy!
Vercel otomatik deploy edecek. Bitince:
- Vercel Terminal'de veya local'de:
```bash
export DATABASE_URL="your-production-database-url"
npm run create-user
```

## Kendi Sunucunuzda (Ubuntu)

### Hızlı Kurulum
```bash
# 1. Node.js ve PostgreSQL
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql

# 2. Database oluştur
sudo -u postgres psql
CREATE DATABASE arhaval_denetim;
CREATE USER arhaval_user WITH PASSWORD 'güvenli-şifre';
GRANT ALL PRIVILEGES ON DATABASE arhaval_denetim TO arhaval_user;
\q

# 3. Projeyi klonla
cd /var/www
git clone YOUR_REPO_URL
cd arhaval-denetim-merkezi

# 4. Environment variables
cp .env.example .env
nano .env  # DATABASE_URL ve diğerlerini düzenle

# 5. Deploy
chmod +x scripts/deploy.sh
./scripts/deploy.sh

# 6. PM2 ile çalıştır
sudo npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Nginx + SSL
```bash
# Nginx kurulumu ve yapılandırması
sudo apt-get install nginx certbot python3-certbot-nginx

# Nginx config (DEPLOYMENT.md'de detaylı)
sudo nano /etc/nginx/sites-available/arhaval-denetim

# SSL
sudo certbot --nginx -d your-domain.com
```

## ⚠️ Önemli Notlar

1. **SQLite → PostgreSQL**: Production'da mutlaka PostgreSQL kullanın
2. **Environment Variables**: `.env` dosyasını asla commit etmeyin
3. **İlk Admin**: Deployment sonrası mutlaka admin kullanıcısı oluşturun
4. **HTTPS**: Production'da mutlaka SSL kullanın
5. **Yedekleme**: Düzenli database yedekleri alın

## 📚 Detaylı Rehber

Tüm detaylar için `DEPLOYMENT.md` dosyasına bakın.

## 🆘 Sorun mu var?

- Build hatası: `npm run build` local'de test edin
- Database hatası: Connection string'i kontrol edin
- Port hatası: `PORT` environment variable'ı ayarlayın

