#!/bin/bash

# Production Deployment Script
# Kullanım: ./scripts/deploy.sh

set -e

echo "🚀 Production Deployment Başlatılıyor..."

# Environment variables kontrolü
if [ -z "$DATABASE_URL" ]; then
  echo "❌ HATA: DATABASE_URL environment variable tanımlı değil!"
  exit 1
fi

# Dependencies yükle
echo "📦 Dependencies yükleniyor..."
npm install

# Prisma client generate
echo "🔧 Prisma client generate ediliyor..."
npx prisma generate

# Database migration
echo "🗄️  Database migration uygulanıyor..."
npx prisma migrate deploy

# Build
echo "🏗️  Production build oluşturuluyor..."
npm run build

echo "✅ Deployment hazır!"
echo ""
echo "📝 Sonraki adımlar:"
echo "1. İlk admin kullanıcısını oluşturun: npm run create-user"
echo "2. Uygulamayı başlatın: npm start (veya PM2: pm2 start ecosystem.config.js)"
echo "3. Tarayıcıda test edin: http://localhost:3001"

