# 🚀 Supabase'de Tabloları Oluşturma - SQL

## ❌ Sorun

Local'den database'e bağlanamıyoruz. Supabase SQL Editor'den direkt tabloları oluşturalım.

---

## ✅ Çözüm: SQL Editor'den Tabloları Oluştur

Supabase SQL Editor'de **sırayla** şu SQL'leri çalıştırın:

---

### 1️⃣ User Tablosu

```sql
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### 2️⃣ Streamer Tablosu

```sql
CREATE TABLE IF NOT EXISTS "Streamer" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "profilePhoto" TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  iban TEXT,
  password TEXT,
  "loginToken" TEXT UNIQUE,
  platform TEXT NOT NULL DEFAULT 'Twitch',
  "channelUrl" TEXT,
  "hourlyRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### 3️⃣ Stream Tablosu

```sql
CREATE TABLE IF NOT EXISTS "Stream" (
  id TEXT PRIMARY KEY,
  "streamerId" TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  duration INTEGER NOT NULL,
  "matchInfo" TEXT,
  "teamName" TEXT,
  "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "streamerEarning" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "arhavalProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
  teams TEXT,
  cost DOUBLE PRECISION NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("streamerId") REFERENCES "Streamer"(id) ON DELETE CASCADE
);
```

---

### 4️⃣ ContentCreator Tablosu

```sql
CREATE TABLE IF NOT EXISTS "ContentCreator" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "profilePhoto" TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  password TEXT,
  "loginToken" TEXT UNIQUE,
  platform TEXT,
  "channelUrl" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### 5️⃣ Content Tablosu

```sql
CREATE TABLE IF NOT EXISTS "Content" (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  platform TEXT NOT NULL,
  url TEXT,
  "publishDate" TIMESTAMP NOT NULL,
  "creatorId" TEXT,
  "creatorName" TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  saves INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("creatorId") REFERENCES "ContentCreator"(id) ON DELETE SET NULL
);
```

---

### 6️⃣ VoiceActor Tablosu

```sql
CREATE TABLE IF NOT EXISTS "VoiceActor" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "profilePhoto" TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  password TEXT,
  "loginToken" TEXT UNIQUE,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### 7️⃣ VoiceoverScript Tablosu

```sql
CREATE TABLE IF NOT EXISTS "VoiceoverScript" (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  "creatorId" TEXT,
  "voiceActorId" TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  "audioFile" TEXT,
  price DOUBLE PRECISION NOT NULL DEFAULT 0,
  "contentType" TEXT,
  notes TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("creatorId") REFERENCES "ContentCreator"(id) ON DELETE SET NULL,
  FOREIGN KEY ("voiceActorId") REFERENCES "VoiceActor"(id) ON DELETE SET NULL
);
```

---

### 8️⃣ Admin Kullanıcısı Oluştur

Tüm tablolar oluşturulduktan sonra:

```sql
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@arhaval.com',
  '$2a$10$uzOHWqiaCU9qOHq9fGYC8egjlfCK1s2E7o98x9of/ZYPwEotEcYsu',
  'Admin',
  'admin',
  NOW(),
  NOW()
);
```

---

## 🎯 Hızlı Yöntem: Tümünü Tek Seferde

Tüm SQL'leri tek seferde çalıştırmak için, Supabase SQL Editor'de **hepsini birlikte** yapıştırın ve "Run" butonuna tıklayın.

---

**Supabase SQL Editor'de yukarıdaki SQL'leri sırayla çalıştırın!** 🚀

