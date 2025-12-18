# 🔍 Connection String Nerede?

## ✅ Doğru Yerdesiniz!

**Connection pooling configuration** sayfasındasınız - bu doğru yer! 

## 📍 Connection String'i Bulun

### 1. Sayfayı Aşağı Kaydırın

Connection pooling configuration sayfasında:
- **"Pool Size"** ve **"Max Client Connections"** gördünüz ✅
- Şimdi **sayfayı daha aşağı kaydırın** ⬇️

### 2. "Connection string" Bölümünü Arayın

Aşağıda şunları göreceksiniz:
- **"Connection string"** başlığı
- Veya **"Connection parameters"**
- Veya **"Database URL"**

### 3. URI Sekmesine Tıklayın

Connection string bölümünde birkaç sekme olacak:
- **URI** ← Buna tıklayın!
- JDBC
- Node.js
- Python
- etc.

### 4. URL'i Kopyalayın

**URI** sekmesinde şuna benzer bir URL göreceksiniz:

```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

veya

```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

## 🔍 Alternatif: Farklı Bir Bölüm

Eğer aşağıda görmüyorsanız:

1. **Sol menüden Settings'e gidin** (⚙️)
2. **"Database"** sekmesine tıklayın
3. **"Connection string"** bölümünü arayın (genelde sayfanın ortasında)

## 📸 Görsel İpucu

Connection pooling sayfasında şunları görmelisiniz:

```
Connection pooling configuration
├── Pool Size: 15
├── Max Client Connections: 200
└── [Aşağı kaydır]
    └── Connection string ← BURADA!
        ├── URI ← Buna tıklayın
        ├── JDBC
        └── ...
```

## ⚠️ Önemli Not

URL'de `[YOUR-PASSWORD]` yazıyorsa:
- Bunu proje oluştururken girdiğiniz şifre ile değiştirmelisiniz!
- Örnek: `postgresql://postgres:myPassword123@db.xxxxx.supabase.co:5432/postgres`

---

**Hala görmüyorsanız:** Sayfayı tamamen aşağı kaydırın veya "Connection string" kelimesini sayfada arayın (Ctrl+F)!










