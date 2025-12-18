# 🔍 Supabase Database URL Bulma - Adım Adım

## Adım 1: Supabase Dashboard'a Giriş

1. **https://supabase.com** adresine gidin
2. Giriş yapın (GitHub ile)
3. **Organization'ınızı** seçin (pick-em için olan)

## Adım 2: Projeye Giriş

1. **"arhaval-denetim"** projesine tıklayın (veya oluşturduğunuz proje adı)
2. Proje dashboard'una gireceksiniz

## Adım 3: Settings'e Gitme

**Sol menüden:**
1. En altta **"Settings"** (⚙️ ikonu) tıklayın
2. Veya URL'den: `https://supabase.com/dashboard/project/[PROJECT-ID]/settings`

## Adım 4: Database Sekmesine Gitme

1. Settings sayfasında **"Database"** sekmesine tıklayın
2. (Genelde sol menüde veya üstte sekme olarak görünür)

## Adım 5: Connection String Bulma

1. **"Connection string"** veya **"Connection pooling"** bölümüne scroll edin
2. Birkaç seçenek göreceksiniz:
   - **URI**
   - **JDBC**
   - **Golang**
   - **Node.js**
   - **Python**
   - **etc.**

3. **"URI"** sekmesine tıklayın (veya zaten açıksa orada)

4. Şuna benzer bir URL göreceksiniz:

```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

veya

```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

## Adım 6: Şifreyi URL'ye Ekleme

**ÖNEMLİ:** URL'de `[YOUR-PASSWORD]` yazıyorsa, bunu proje oluştururken girdiğiniz şifre ile değiştirmelisiniz!

**Örnek:**
```
postgresql://postgres:mySecurePassword123@db.abcdefghijklmnop.supabase.co:5432/postgres
```

## Alternatif Yol: Connection Pooling

Eğer yukarıdaki yolu bulamazsanız:

1. Settings → Database
2. **"Connection pooling"** bölümüne bakın
3. **"Session mode"** veya **"Transaction mode"** seçin
4. **"Connection string"** kopyalayın

## Eğer Hala Bulamıyorsanız

### Yöntem 1: Project Settings → API

1. Settings → **"API"** sekmesine gidin
2. **"Project URL"** ve **"anon key"** göreceksiniz
3. Ama bu database URL değil, API URL

### Yöntem 2: Database → Connection Info

1. Sol menüden **"Database"** tıklayın (Settings değil)
2. **"Connection info"** veya **"Connection string"** arayın

### Yöntem 3: Project Settings → Database

1. Settings → **"Database"** sekmesi
2. **"Connection string"** veya **"Connection parameters"** bölümü
3. **"Show connection string"** veya **"Copy"** butonuna tıklayın

## URL Formatı

Supabase database URL'i şu formatta olmalı:

```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

veya (pooler ile):

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

## Şifreyi Unuttuysanız

1. Settings → Database
2. **"Reset database password"** butonuna tıklayın
3. Yeni şifre oluşturun
4. URL'yi güncelleyin

## Ekran Görüntüsü Yerleri

**Settings → Database sayfasında şunları arayın:**
- ✅ Connection string
- ✅ Connection parameters
- ✅ Database URL
- ✅ Connection info
- ✅ URI connection string

**Genelde sayfanın ortasında veya altında bulunur.**

---

## Hızlı Test

URL'yi bulduktan sonra, şu formatta olmalı:

```
postgresql://postgres:ŞİFRENİZ@db.xxxxx.supabase.co:5432/postgres
```

Eğer bu formatta değilse veya `[YOUR-PASSWORD]` yazıyorsa, şifreyi manuel olarak eklemeniz gerekir.

---

**Hala bulamıyorsanız:** Supabase ekran görüntüsü paylaşın, daha spesifik yardımcı olabilirim! 📸










