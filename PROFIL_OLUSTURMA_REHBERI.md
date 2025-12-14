# 👥 Profil Oluşturma Rehberi

Yayıncılar, İçerik Üreticileri ve Seslendirmenler için profil oluşturma rehberi.

---

## 🎯 Kullanılabilir Scriptler

### 1. Yayıncı (Streamer) Oluşturma

```bash
npm run create-streamer <email> <password> <name> [phone] [iban] [platform] [hourlyRate]
```

**Örnek:**
```bash
npm run create-streamer yayinci@example.com sifre123 "Ahmet Yılmaz" "5551234567" "TR123456789012345678901234" "Twitch" 300
```

**Parametreler:**
- `email` (zorunlu): Yayıncının email adresi
- `password` (zorunlu): Giriş şifresi
- `name` (zorunlu): Yayıncının adı
- `phone` (opsiyonel): Telefon numarası
- `iban` (opsiyonel): IBAN bilgisi
- `platform` (opsiyonel): Platform (varsayılan: "Twitch")
- `hourlyRate` (opsiyonel): Saatlik ücret (varsayılan: 0)

**Giriş URL:** `/streamer-login`

---

### 2. İçerik Üreticisi (Content Creator) Oluşturma

```bash
npm run create-creator <email> <password> <name>
```

**Örnek:**
```bash
npm run create-creator creator@example.com sifre123 "Mehmet Demir"
```

**Parametreler:**
- `email` (opsiyonel, varsayılan: "tugi@hotmail.com"): İçerik üreticisinin email adresi
- `password` (opsiyonel, varsayılan: "tugi123"): Giriş şifresi
- `name` (opsiyonel, varsayılan: "Tugi"): İçerik üreticisinin adı

**Giriş URL:** `/creator-login`

---

### 3. Seslendirmen (Voice Actor) Oluşturma

```bash
npm run create-voice-actor <email> <password> <name>
```

**Örnek:**
```bash
npm run create-voice-actor seslendirmen@example.com sifre123 "Ayşe Kaya"
```

**Parametreler:**
- `email` (opsiyonel, varsayılan: "seslendirmen@example.com"): Seslendirmenin email adresi
- `password` (opsiyonel, varsayılan: "seslendirmen123"): Giriş şifresi
- `name` (opsiyonel, varsayılan: "Seslendirmen"): Seslendirmenin adı

**Giriş URL:** `/voice-actor-login`

---

## 📋 Toplu Oluşturma Örneği

### Yayıncılar

```bash
# Yayıncı 1
npm run create-streamer streamer1@example.com sifre123 "Yayıncı 1" "5551111111" "TR111111111111111111111111" "Twitch" 300

# Yayıncı 2
npm run create-streamer streamer2@example.com sifre123 "Yayıncı 2" "5552222222" "TR222222222222222222222222" "Twitch" 350

# Yayıncı 3
npm run create-streamer streamer3@example.com sifre123 "Yayıncı 3" "5553333333" "TR333333333333333333333333" "Twitch" 400
```

### İçerik Üreticileri

```bash
npm run create-creator creator1@example.com sifre123 "İçerik Üreticisi 1"
npm run create-creator creator2@example.com sifre123 "İçerik Üreticisi 2"
npm run create-creator creator3@example.com sifre123 "İçerik Üreticisi 3"
```

### Seslendirmenler

```bash
npm run create-voice-actor voice1@example.com sifre123 "Seslendirmen 1"
npm run create-voice-actor voice2@example.com sifre123 "Seslendirmen 2"
npm run create-voice-actor voice3@example.com sifre123 "Seslendirmen 3"
```

---

## ✅ Kontrol

Oluşturduğunuz profilleri kontrol etmek için:

### Prisma Studio

```bash
npm run db:studio
```

Tarayıcıda açılacak ve tüm tabloları görebilirsiniz:
- `Streamer` tablosu → Yayıncılar
- `ContentCreator` tablosu → İçerik üreticileri
- `VoiceActor` tablosu → Seslendirmenler

---

## 🔐 Şifre Güncelleme

Bir kullanıcının şifresini güncellemek için:

### Admin Kullanıcısı

```bash
npm run update-user-password <email> <newPassword>
```

**Örnek:**
```bash
npm run update-user-password admin@arhaval.com yeniSifre123
```

---

## 📝 Notlar

1. **Email Normalizasyonu:** Tüm email'ler otomatik olarak küçük harfe çevrilir ve boşluklar temizlenir.

2. **Şifre Hash'leme:** Tüm şifreler `bcrypt` ile hash'lenir ve güvenli bir şekilde saklanır.

3. **Mevcut Kullanıcı:** Eğer aynı email ile bir kullanıcı varsa, script mevcut kullanıcıyı günceller (yeni oluşturmaz).

4. **Aktif Durum:** Tüm yeni kullanıcılar varsayılan olarak aktif (`isActive: true`) olarak oluşturulur.

---

## 🚀 Hızlı Başlangıç

1. **Yayıncı oluştur:**
   ```bash
   npm run create-streamer yayinci@example.com sifre123 "Yayıncı Adı"
   ```

2. **İçerik üreticisi oluştur:**
   ```bash
   npm run create-creator creator@example.com sifre123 "İçerik Üreticisi"
   ```

3. **Seslendirmen oluştur:**
   ```bash
   npm run create-voice-actor voice@example.com sifre123 "Seslendirmen"
   ```

4. **Test et:**
   - Yayıncı: http://localhost:3001/streamer-login
   - İçerik Üreticisi: http://localhost:3001/creator-login
   - Seslendirmen: http://localhost:3001/voice-actor-login

---

**TÜM PROFİLLERİ OLUŞTURDUKTAN SONRA GİRİŞ YAPMAYI TEST EDİN!** 🎯

