# 🔗 Supabase Connection String Bulma - Doğru Yol

## ⚠️ ÖNEMLİ: Yanlış Yerde Değilsiniz!

Şu anda **Database → Tables** bölümündesiniz. Connection string'i bulmak için **Settings** sayfasına gitmeniz gerekiyor!

## ✅ Doğru Adımlar

### 1. Sol Menüden Settings'e Gidin

**Sol menüde en altta:**
- ⚙️ **"Settings"** (Ayarlar) ikonuna tıklayın
- **Database → Tables** değil, **Settings** olmalı!

### 2. Settings Sayfasında Database Sekmesi

1. Settings sayfasına girdikten sonra
2. Üstte sekmeler göreceksiniz:
   - General
   - **Database** ← Buna tıklayın!
   - API
   - Auth
   - Storage
   - etc.

### 3. Connection String Bölümü

1. **Database** sekmesine tıkladıktan sonra
2. Sayfada aşağı kaydırın
3. **"Connection string"** veya **"Connection pooling"** bölümünü bulun
4. **"URI"** sekmesine tıklayın

### 4. URL'i Kopyalayın

Şuna benzer bir URL göreceksiniz:

```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

veya

```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

## 📍 Kısa Yol

**URL'den direkt gidebilirsiniz:**
```
https://supabase.com/dashboard/project/[PROJECT-ID]/settings/database
```

`[PROJECT-ID]` kısmını kendi proje ID'nizle değiştirin.

## 🎯 Özet

**Şu an:** Database → Tables (Yanlış yer ❌)
**Gitmeniz gereken:** Settings → Database (Doğru yer ✅)

## 🔍 Görsel İpucu

Sol menüde şunları göreceksiniz:
```
📊 Table Editor
🔍 SQL Editor
📈 Database
   ├── Tables ← Şu an buradasınız
   ├── Functions
   └── ...
⚙️ Settings ← BURAYA GİDİN!
```

**Settings** → **Database** sekmesine gidin, orada Connection String'i bulacaksınız!

---

**Hala bulamıyorsanız:** Settings sayfasının ekran görüntüsünü paylaşın! 📸




