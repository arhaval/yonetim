# 🚀 GitHub Kurulum Adımları (Adım Adım)

## Adım 1: Git Repository Başlatma

Terminal'de şu komutları çalıştırın:

```bash
git init
git add .
git commit -m "Initial commit - Arhaval Denetim Merkezi"
```

## Adım 2: GitHub'da Repository Oluşturma

1. **GitHub.com'a gidin** ve giriş yapın
2. Sağ üstteki **"+"** butonuna tıklayın
3. **"New repository"** seçin
4. **Repository adı:** `arhaval-denetim-merkezi` (veya istediğiniz isim)
5. **Description (opsiyonel):** "Arhaval Denetim Merkezi - Yayıncı ve İçerik Yönetim Sistemi"
6. **Public** veya **Private** seçin (önerilen: Private)
7. **"Create repository"** butonuna tıklayın

## Adım 3: GitHub Repository'ye Bağlama

GitHub'da repository oluşturduktan sonra, size bir URL verecek. Şuna benzer:

```
https://github.com/KULLANICI_ADINIZ/arhaval-denetim-merkezi.git
```

Terminal'de şu komutları çalıştırın (URL'yi kendi URL'nizle değiştirin):

```bash
git remote add origin https://github.com/KULLANICI_ADINIZ/arhaval-denetim-merkezi.git
git branch -M main
git push -u origin main
```

## Adım 4: Kimlik Doğrulama

İlk push'ta GitHub kullanıcı adı ve şifre isteyebilir. Eğer 2FA (iki faktörlü doğrulama) aktifse, Personal Access Token kullanmanız gerekebilir.

**Personal Access Token oluşturma:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" → "Generate new token (classic)"
3. Note: "Arhaval Denetim" yazın
4. Expiration: 90 days (veya istediğiniz süre)
5. Scopes: `repo` seçin
6. "Generate token" → Token'ı kopyalayın
7. Push yaparken şifre yerine bu token'ı kullanın

## Tam Komut Listesi (Kopyala-Yapıştır)

```bash
# 1. Git başlat
git init

# 2. Tüm dosyaları ekle
git add .

# 3. İlk commit
git commit -m "Initial commit - Arhaval Denetim Merkezi"

# 4. GitHub repository URL'ini ekle (KULLANICI_ADINIZ'ı değiştirin)
git remote add origin https://github.com/KULLANICI_ADINIZ/arhaval-denetim-merkezi.git

# 5. Branch adını main yap
git branch -M main

# 6. GitHub'a push et
git push -u origin main
```

## Sorun Giderme

### Hata: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/KULLANICI_ADINIZ/arhaval-denetim-merkezi.git
```

### Hata: "Authentication failed"
- Personal Access Token kullanın (yukarıda anlatıldı)
- Veya GitHub Desktop kullanın

### Hata: "Large files"
- `.gitignore` dosyası zaten var, büyük dosyalar ignore edilir
- Eğer hala sorun varsa: `git rm --cached dosya-adi`

## Sonraki Adım: Vercel'e Bağlama

GitHub'a yükledikten sonra:
1. Vercel.com'a gidin
2. "Add New Project"
3. GitHub repository'nizi seçin
4. Deploy edin!

---

**Yardım gerekirse:** Her adımda sorun yaşarsanız haber verin! 🚀

