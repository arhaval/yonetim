# 🗄️ Database URL Nasıl Bulunur?

## Seçenek 1: Supabase (ÖNERİLEN - Ücretsiz)

### Adım 1: Supabase Hesabı Oluşturma

1. **https://supabase.com** adresine gidin
2. **"Start your project"** veya **"Sign up"** butonuna tıklayın
3. GitHub hesabınızla giriş yapın (en kolay yol)

### Adım 2: Yeni Proje Oluşturma

1. Dashboard'da **"New Project"** butonuna tıklayın
2. **Organization:** Yeni organization oluşturun (veya mevcut olanı seçin)
3. **Project Name:** `arhaval-denetim` (veya istediğiniz isim)
4. **Database Password:** Güçlü bir şifre oluşturun (kaydedin, unutmayın!)
5. **Region:** En yakın bölgeyi seçin (Türkiye için: `West Europe` veya `Central Europe`)
6. **Pricing Plan:** **Free** seçin (ücretsiz plan yeterli)
7. **"Create new project"** butonuna tıklayın

**Not:** Proje oluşturma 1-2 dakika sürebilir.

### Adım 3: Database URL'ini Bulma

1. Proje oluşturulduktan sonra, sol menüden **"Settings"** (⚙️) tıklayın
2. **"Database"** sekmesine gidin
3. **"Connection string"** bölümüne scroll edin
4. **"URI"** sekmesine tıklayın
5. Şuna benzer bir URL göreceksiniz:

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

6. **`[YOUR-PASSWORD]`** kısmını, proje oluştururken girdiğiniz şifre ile değiştirin

**Örnek:**
```
postgresql://postgres:mySecurePassword123@db.abcdefghijklmnop.supabase.co:5432/postgres
```

7. Bu URL'yi kopyalayın - bu sizin `DATABASE_URL` değeriniz!

### Adım 4: Vercel'e Ekleme

1. Vercel Dashboard → Projeniz → Settings → Environment Variables
2. **"Add New"** butonuna tıklayın
3. **Name:** `DATABASE_URL`
4. **Value:** Kopyaladığınız Supabase URL'ini yapıştırın
5. **Environment:** Production, Preview, Development (hepsini seçin)
6. **"Save"** butonuna tıklayın

---

## Seçenek 2: Vercel Postgres

### Adım 1: Vercel Postgres Oluşturma

1. **Vercel Dashboard**'a gidin
2. Sol menüden **"Storage"** tıklayın
3. **"Create Database"** butonuna tıklayın
4. **"Postgres"** seçin
5. **Database Name:** `arhaval-denetim` (veya istediğiniz isim)
6. **Region:** En yakın bölgeyi seçin
7. **Plan:** **Hobby** (Ücretsiz - 256 MB) seçin
8. **"Create"** butonuna tıklayın

### Adım 2: Database URL'ini Bulma

1. Oluşturduğunuz database'e tıklayın
2. **"Settings"** sekmesine gidin
3. **"Connection string"** bölümünde **"URI"** seçeneğini bulun
4. URL şuna benzer olacak:

```
postgres://default:xxxxx@ep-xxxxx.us-east-1.postgres.vercel-storage.com:5432/verceldb
```

5. Bu URL'yi kopyalayın - bu sizin `DATABASE_URL` değeriniz!

### Adım 3: Vercel'e Ekleme

1. Vercel Dashboard → Projeniz → Settings → Environment Variables
2. **"Add New"** butonuna tıklayın
3. **Name:** `DATABASE_URL`
4. **Value:** Kopyaladığınız Vercel Postgres URL'ini yapıştırın
5. **Environment:** Production, Preview, Development (hepsini seçin)
6. **"Save"** butonuna tıklayın

---

## Diğer Environment Variables

### NEXTAUTH_SECRET

**Nasıl Oluşturulur:**

**Windows (PowerShell veya CMD):**
```bash
# PowerShell'de:
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))

# Veya online: https://generate-secret.vercel.app/32
```

**Mac/Linux:**
```bash
openssl rand -base64 32
```

**Online Tool:**
- https://generate-secret.vercel.app/32
- 32 karakterlik rastgele string oluşturur

**Vercel'e Ekleme:**
- Name: `NEXTAUTH_SECRET`
- Value: Oluşturduğunuz string
- Environment: Production, Preview, Development

### NEXTAUTH_URL

**Değer:**
- İlk başta: `https://your-project.vercel.app` (Vercel'in verdiği URL)
- Domain ekledikten sonra: `https://yonetim.arhaval.com`

**Vercel'e Ekleme:**
- Name: `NEXTAUTH_URL`
- Value: `https://your-project.vercel.app` (veya domain URL'iniz)
- Environment: Production, Preview, Development

---

## Özet: Vercel'e Eklenecek Environment Variables

```
1. DATABASE_URL
   → Supabase veya Vercel Postgres'ten alınan connection string

2. NEXTAUTH_SECRET
   → openssl rand -base64 32 veya online tool ile oluşturulan string

3. NEXTAUTH_URL
   → https://your-project.vercel.app (veya domain URL'iniz)
```

---

## Hızlı Başlangıç (Supabase - Önerilen)

1. ✅ https://supabase.com → Sign up (GitHub ile)
2. ✅ New Project → `arhaval-denetim` → Free plan
3. ✅ Settings → Database → Connection string → URI
4. ✅ Password'ü URL'ye ekle
5. ✅ Vercel → Environment Variables → `DATABASE_URL` ekle
6. ✅ `NEXTAUTH_SECRET` oluştur ve ekle
7. ✅ `NEXTAUTH_URL` ekle
8. ✅ Deploy!

**Toplam süre:** 5-10 dakika

---

## Sorun Giderme

### Database URL'de Şifre Nasıl Değiştirilir?

Supabase URL formatı:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

`[YOUR-PASSWORD]` kısmını proje oluştururken girdiğiniz şifre ile değiştirin.

### Şifreyi Unuttum?

1. Supabase Dashboard → Settings → Database
2. **"Reset database password"** butonuna tıklayın
3. Yeni şifre oluşturun
4. URL'yi güncelleyin

### Connection String Bulamıyorum?

- Supabase: Settings → Database → Connection string → URI
- Vercel Postgres: Database → Settings → Connection string → URI

---

**Öneri:** Supabase kullanın - daha kolay ve ücretsiz plan çok cömert! 🚀



