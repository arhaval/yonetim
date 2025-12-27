# 🗄️ Database Kurulum Rehberi

Bu rehber PostgreSQL database kurulumu için gerekli adımları içerir.

## 📋 Supabase Kurulumu

### 1. Supabase Projesi Oluştur
1. Supabase.com'a git
2. Yeni proje oluştur
3. Region seç (yakın olanı)

### 2. Connection String Al
1. Settings → Database
2. Connection string'i kopyala
3. Connection pooler URL'i kullan (production için)

### 3. Environment Variable Ekle
```env
DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true"
```

### 4. Migration Çalıştır
```bash
npx prisma db push
npx prisma generate
```

## 🔧 Sorun Giderme

### Connection Error
- IP whitelist kontrolü yap
- Connection pooler URL kullan
- SSL mode kontrol et

### Migration Hatası
- Schema'yı kontrol et
- Database permissions kontrol et
- Connection string doğru mu kontrol et

## 📚 Daha Fazla Bilgi

- [Supabase Dokümantasyonu](https://supabase.com/docs)
- [Prisma Dokümantasyonu](https://www.prisma.io/docs)

