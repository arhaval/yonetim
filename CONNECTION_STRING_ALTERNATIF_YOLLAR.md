# 🔍 Connection String Bulma - Alternatif Yollar

## Yöntem 1: Settings → API Sekmesi

1. **Settings** (⚙️) → **"API"** sekmesine gidin
2. **"Project URL"** ve **"anon key"** göreceksiniz
3. Bu database URL değil ama proje bilgileriniz burada

## Yöntem 2: Connection String'i Manuel Oluşturma

Supabase'den bilgileri toplayıp kendiniz oluşturabilirsiniz:

### Adım 1: Project Reference Bulma

1. **Settings** → **"General"** sekmesine gidin
2. **"Reference ID"** veya **"Project ID"** bulun
3. Şuna benzer: `abcdefghijklmnop` (16 karakter)

### Adım 2: Region Bulma

1. **Settings** → **"General"** sekmesinde
2. **"Region"** bilgisini bulun
3. Örnek: `eu-west-1`, `us-east-1`, etc.

### Adım 3: Database Şifresini Hatırlayın

Proje oluştururken girdiğiniz şifreyi kullanın.

### Adım 4: URL'i Oluşturun

Format:
```
postgresql://postgres:[ŞİFRENİZ]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Örnek:**
- Project Reference: `abcdefghijklmnop`
- Şifre: `myPassword123`
- URL: `postgresql://postgres:myPassword123@db.abcdefghijklmnop.supabase.co:5432/postgres`

## Yöntem 3: SQL Editor'den Test

1. Sol menüden **"SQL Editor"** tıklayın
2. Yeni bir query açın
3. Connection bilgileri orada görünebilir

## Yöntem 4: Database → Connection Info

1. Sol menüden **"Database"** (Settings değil)
2. **"Connection info"** veya **"Connection parameters"** arayın
3. Farklı bir yerde olabilir

## Yöntem 5: Project Settings → Database (Farklı Görünüm)

1. **Settings** → **"Database"** sekmesine gidin
2. Sayfanın **üst kısmında** veya **sağ tarafta** olabilir
3. **"Show connection string"** veya **"Copy"** butonu arayın

## Yöntem 6: Supabase CLI Kullanma (Gelişmiş)

Eğer Supabase CLI kuruluysa:
```bash
supabase status
```

## 🎯 En Kolay Çözüm: Manuel Oluşturma

**Settings → General** sekmesinden:
1. **Reference ID**'yi kopyalayın
2. Proje oluştururken girdiğiniz **şifreyi** hatırlayın
3. Şu formatta URL oluşturun:

```
postgresql://postgres:[ŞİFRENİZ]@db.[REFERENCE-ID].supabase.co:5432/postgres
```

**Örnek:**
```
postgresql://postgres:Arhaval2024!@db.abcdefghijklmnop.supabase.co:5432/postgres
```

## 📸 Yardım İçin

Eğer hala bulamıyorsanız:
1. **Settings → General** sekmesinin ekran görüntüsünü paylaşın
2. **Reference ID**'yi görebiliriz
3. URL'i birlikte oluşturabiliriz

---

**Hızlı Test:** Settings → General → Reference ID'yi bulun ve paylaşın, ben URL'i oluşturayım! 🚀







