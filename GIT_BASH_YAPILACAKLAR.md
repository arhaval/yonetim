# 🚀 Git Bash'te Yapılacaklar

## 📍 Git Bash'i Açma

### Yöntem 1: Windows Explorer'dan (En Kolay!)

1. **Windows Explorer'da** proje klasörüne gidin:
   ```
   C:\Users\Casper\Desktop\Arhaval Denetim Merkezi
   ```

2. **Klasörün içinde boş bir yere sağ tıklayın**

3. **"Git Bash Here"** seçeneğine tıklayın
   - ✅ Direkt proje klasöründe açılacak!

---

### Yöntem 2: Git Bash'i Açıp Klasöre Gitme

1. **Git Bash'i açın** (Başlat menüsünden veya masaüstünden)

2. **Proje klasörüne gidin:**
   ```bash
   cd ~/Desktop/Arhaval\ Denetim\ Merkezi
   ```

3. **Hangi klasörde olduğunuzu kontrol edin:**
   ```bash
   pwd
   ```
   Şunu görmelisiniz:
   ```
   /c/Users/Casper/Desktop/Arhaval Denetim Merkezi
   ```

---

## ✅ Git Bash'te Kontrol Komutları

### 1. Git Durumunu Kontrol Et

```bash
git status
```

**Görmeniz gerekenler:**
- `On branch main`
- `Your branch is up to date with 'origin/main'`
- Varsa değişiklikler listelenir

---

### 2. Son Commit'leri Gör

```bash
git log --oneline -5
```

**Görmeniz gerekenler:**
- Son commit'ler listelenir
- En üstte: `Fix: Add contentType column migration to build process`

---

### 3. Remote Repository Kontrol

```bash
git remote -v
```

**Görmeniz gerekenler:**
```
origin  https://github.com/arhaval/yonetim.git (fetch)
origin  https://github.com/arhaval/yonetim.git (push)
```

---

### 4. Değişiklikleri Göster

```bash
git diff
```

Eğer değişiklik varsa gösterir, yoksa boş döner.

---

## 🎯 Şu Anda Yapmanız Gerekenler

### Durum Kontrolü

```bash
# 1. Hangi klasördeyim?
pwd

# 2. Git durumu nedir?
git status

# 3. Son commit ne?
git log --oneline -1

# 4. Remote doğru mu?
git remote -v
```

---

### Eğer Yeni Değişiklik Yaptıysanız

**1. Değişiklikleri Göster:**
```bash
git status
```

**2. Değişiklikleri Ekle:**
```bash
# Tüm değişiklikleri ekle
git add .

# VEYA sadece belirli dosyaları
git add dosya-adi.ts
```

**3. Commit Yap:**
```bash
git commit -m "Açıklayıcı mesaj buraya"
```

**4. Push Et:**
```bash
git push origin main
```

---

### Eğer GitHub'dan Güncelleme Çekmek İsterseniz

```bash
git pull origin main
```

---

## 📋 Sık Kullanılan Komutlar

### Git Komutları

```bash
# Durum kontrol
git status                    # Değişiklikleri göster
git log --oneline            # Commit geçmişi
git diff                     # Değişiklikleri göster

# Dosya ekleme
git add .                    # Tüm değişiklikleri ekle
git add dosya.ts             # Belirli dosyayı ekle

# Commit
git commit -m "Mesaj"        # Commit yap

# Push/Pull
git push origin main         # GitHub'a gönder
git pull origin main         # GitHub'dan çek

# Branch
git branch                   # Branch'leri listele
git checkout branch-adi      # Branch değiştir
```

### Klasör Komutları

```bash
pwd                         # Hangi klasördeyim?
ls                          # Dosyaları listele
ls -la                      # Gizli dosyalar dahil
cd ..                       # Bir üst klasöre
cd ~                        # Home klasörüne
cd Desktop                  # Desktop'a
```

---

## 🆘 Sorun Giderme

### "fatal: not a git repository" hatası

**Çözüm:** Yanlış klasördesiniz!
```bash
# Proje klasörüne gidin
cd ~/Desktop/Arhaval\ Denetim\ Merkezi
```

### "Permission denied" hatası

**Çözüm:** Git kullanıcı bilgilerinizi kontrol edin:
```bash
git config user.name
git config user.email

# Eğer yanlışsa:
git config user.name "Adınız"
git config user.email "email@example.com"
```

### "Everything up-to-date" mesajı

**Çözüm:** ✅ Her şey güncel! Zaten push edilmiş demektir.

---

## ✅ Şu Anda Yapmanız Gerekenler Özeti

**Eğer sadece kontrol etmek istiyorsanız:**

```bash
# 1. Proje klasörüne git
cd ~/Desktop/Arhaval\ Denetim\ Merkezi

# 2. Durum kontrol
git status

# 3. Son commit'i gör
git log --oneline -1
```

**Eğer yeni değişiklik yaptıysanız:**

```bash
# 1. Değişiklikleri ekle
git add .

# 2. Commit yap
git commit -m "Açıklayıcı mesaj"

# 3. Push et
git push origin main
```

---

## 🎯 Hızlı Başlangıç

**Git Bash'i açtıktan sonra:**

```bash
# Proje klasörüne git
cd ~/Desktop/Arhaval\ Denetim\ Merkezi

# Durum kontrol
git status
```

**Eğer "Your branch is up to date" görüyorsanız:**
- ✅ Her şey güncel!
- ✅ GitHub'a push edilmiş
- ✅ Başka bir şey yapmanıza gerek yok!

---

**Git Bash'te rahatça çalışabilirsiniz!** 🚀

