# 💻 Git Komutları Nasıl Çalıştırılır?

## ✅ Evet, Terminal'de Yazıyorsunuz!

Bu komutları **Terminal** (veya **Command Prompt** / **PowerShell**) içinde çalıştırıyorsunuz.

---

## 📋 Adım Adım

### Adım 1: Terminal'i Açın

**Windows:**
- `Win + R` tuşlarına basın
- `cmd` yazın ve Enter'a basın
- VEYA PowerShell açın

**VS Code/Cursor:**
- `Ctrl + `` (backtick) tuşlarına basın
- Terminal açılır

### Adım 2: Proje Klasörüne Gidin

Terminal'de şu komutu yazın:

```bash
cd "C:\Users\Casper\Desktop\Arhaval Denetim Merkezi"
```

**VEYA** VS Code/Cursor'da zaten proje klasöründesiniz, bu adımı atlayabilirsiniz.

### Adım 3: Git Komutlarını Çalıştırın

Sırayla şu komutları yazın (her birinden sonra Enter'a basın):

```bash
git add .
```

```bash
git commit -m "Fix cron job authorization header for Vercel"
```

```bash
git push
```

---

## 🎯 Tam Örnek (Terminal'de)

```bash
C:\Users\Casper\Desktop\Arhaval Denetim Merkezi> git add .

C:\Users\Casper\Desktop\Arhaval Denetim Merkezi> git commit -m "Fix cron job authorization header for Vercel"

C:\Users\Casper\Desktop\Arhaval Denetim Merkezi> git push
```

---

## ⚠️ Önemli Notlar

1. **Her komuttan sonra Enter'a basın**
2. **Sırayla yazın** (önce `git add`, sonra `git commit`, sonra `git push`)
3. **Hata alırsanız** hata mesajını paylaşın

---

## 🔍 Kontrol

`git push` komutundan sonra:
- GitHub'a push edilir
- Vercel otomatik deploy başlar
- Birkaç dakika sonra deploy tamamlanır

---

## 📚 Daha Fazla Bilgi

- **Git Nedir?** → Versiyon kontrol sistemi
- **git add** → Değişiklikleri ekle
- **git commit** → Değişiklikleri kaydet
- **git push** → GitHub'a gönder

