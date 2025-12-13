# 🚀 Git Bash Hızlı Başlangıç

## 📍 Git Bash Açıldığında Nereye Gider?

Git Bash açıldığında genellikle şu klasöre gider:
```
C:\Users\Casper
```
(Yani kullanıcı adınızın home klasörü)

---

## 🎯 Proje Klasörüne Gitme

### Yöntem 1: cd Komutu ile (Önerilen)

Git Bash'i açtıktan sonra:

```bash
cd Desktop/Arhaval\ Denetim\ Merkezi
```

**VEYA** (tırnak işareti ile):

```bash
cd "Desktop/Arhaval Denetim Merkezi"
```

**VEYA** (tam yol ile):

```bash
cd /c/Users/Casper/Desktop/Arhaval\ Denetim\ Merkezi
```

---

### Yöntem 2: Sağ Tık ile (En Kolay!)

1. **Windows Explorer'da** proje klasörüne gidin:
   ```
   C:\Users\Casper\Desktop\Arhaval Denetim Merkezi
   ```

2. **Klasörün içinde boş bir yere sağ tıklayın**

3. **"Git Bash Here"** seçeneğine tıklayın
   - Eğer görmüyorsanız, "Open in Terminal" veya "Open in Git Bash" olabilir

4. ✅ **Direkt proje klasöründe açılacak!**

---

### Yöntem 3: Git Bash'te Direkt Açma

Git Bash açıkken:

```bash
# Önce home klasörüne gidin (zaten oradasınız)
cd ~

# Sonra proje klasörüne
cd Desktop/Arhaval\ Denetim\ Merkezi
```

---

## 🔍 Hangi Klasörde Olduğunuzu Kontrol Etme

```bash
pwd
```

Bu komut size tam yolu gösterir:
```
/c/Users/Casper/Desktop/Arhaval Denetim Merkezi
```

---

## 📝 Hızlı Komutlar

### Proje Klasörüne Git
```bash
cd ~/Desktop/Arhaval\ Denetim\ Merkezi
```

### Git Durumunu Kontrol Et
```bash
git status
```

### Dosyaları Göster
```bash
ls
# veya
ls -la  # gizli dosyalar dahil
```

### Git Bash'i Kapatmadan Başka Klasöre Git
```bash
cd ..              # Bir üst klasöre
cd ~               # Home klasörüne
cd Desktop         # Desktop'a
```

---

## ⚡ Hızlı Başlangıç Script'i

Git Bash'i her açtığınızda otomatik proje klasörüne gitmek için:

### Windows'ta .bashrc Dosyası Oluştur

1. Git Bash'te:
```bash
cd ~
nano .bashrc
```

2. Şunu ekleyin:
```bash
# Otomatik proje klasörüne git
cd ~/Desktop/Arhaval\ Denetim\ Merkezi 2>/dev/null || true
```

3. Kaydedin: `Ctrl+X`, sonra `Y`, sonra `Enter`

4. Git Bash'i kapatıp tekrar açın
5. ✅ Artık her açılışta proje klasörüne gidecek!

---

## 🎯 Özet: En Kolay Yol

**Windows Explorer'da:**
1. Proje klasörüne gidin
2. Sağ tık → "Git Bash Here"
3. ✅ Hazırsınız!

**VEYA Git Bash'te:**
```bash
cd ~/Desktop/Arhaval\ Denetim\ Merkezi
```

---

## 📋 Sık Kullanılan Komutlar

```bash
# Proje klasörüne git
cd ~/Desktop/Arhaval\ Denetim\ Merkezi

# Git durumu
git status

# Değişiklikleri göster
git diff

# Commit yap
git add .
git commit -m "Mesaj"

# Push et
git push origin main

# Pull yap
git pull origin main
```

---

**Artık Git Bash'te rahatça çalışabilirsiniz!** 🚀

