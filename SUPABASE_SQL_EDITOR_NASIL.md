# 📝 Supabase SQL Editor Nasıl Kullanılır?

## 🎯 SQL Komutlarını Nereye Yazacağız?

**Cevap: Supabase Dashboard → SQL Editor**

---

## 📋 Adım Adım: Supabase SQL Editor'e Gitme

### 1️⃣ Supabase Dashboard'a Giriş

1. Tarayıcınızda şu adrese gidin:
   ```
   https://supabase.com/dashboard
   ```

2. **Giriş yapın** (eğer yapmadıysanız)

---

### 2️⃣ Projenizi Seçin

1. Dashboard'da **projelerinizin listesi** görünecek
2. **"Arhaval Denetim Merkezi"** veya ilgili projeyi **tıklayın**
3. Proje sayfasına yönlendirileceksiniz

---

### 3️⃣ SQL Editor'ü Açın

**Yöntem 1: Sol Menüden**

1. Sol tarafta **menü** görünecek
2. **"SQL Editor"** seçeneğini **tıklayın**
   - İkon: </> (code) veya "SQL Editor" yazısı
   - Genellikle "Database" bölümü altında

**Yöntem 2: Üst Menüden**

1. Üst menüde **"SQL Editor"** sekmesine tıklayın

---

### 4️⃣ SQL Editor Ekranı

SQL Editor açıldığında göreceksiniz:

```
┌─────────────────────────────────────────┐
│  SQL Editor                              │
├─────────────────────────────────────────┤
│                                          │
│  [Büyük bir metin kutusu - SQL yazılacak]│
│                                          │
│                                          │
├─────────────────────────────────────────┤
│  [New query]  [Run]  [Save]             │
└─────────────────────────────────────────┘
```

---

### 5️⃣ SQL Yazma ve Çalıştırma

**Adım 1: Yeni Query Oluştur**

1. **"New query"** butonuna tıklayın (veya zaten boş bir alan var)
2. Büyük metin kutusuna SQL yazın

**Adım 2: SQL'i Yazın**

Örneğin, tabloları listelemek için:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Adım 3: Çalıştır**

1. **"Run"** butonuna tıklayın
   - Veya klavye kısayolu: `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

**Adım 4: Sonuçları Görün**

- Sonuçlar altta görünecek
- Tablo formatında gösterilir

---

## 🎯 İlk Yapılacak: Tabloları Listele

SQL Editor'de şu SQL'i yazın ve **"Run"** butonuna tıklayın:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Sonuç:** Tüm tabloları göreceksiniz!

---

## 📸 Görsel Rehber

### Supabase Dashboard Görünümü:

```
┌─────────────────────────────────────┐
│  Supabase Logo    [Proje Adı]       │
├─────────────────────────────────────┤
│  [Sol Menü]      │  [Ana İçerik]   │
│                  │                  │
│  ☰ Database      │                  │
│    📊 Tables     │                  │
│    </> SQL Editor│  ← BURAYA TIKLA │
│    🔐 Auth       │                  │
│    ⚙️ Settings   │                  │
│                  │                  │
└─────────────────────────────────────┘
```

---

## ✅ Kontrol Listesi

- [ ] https://supabase.com/dashboard adresine gittim
- [ ] Giriş yaptım
- [ ] Projemi seçtim
- [ ] Sol menüden "SQL Editor" seçeneğine tıkladım
- [ ] SQL Editor açıldı
- [ ] SQL yazdım
- [ ] "Run" butonuna tıkladım
- [ ] Sonuçları gördüm

---

## 🆘 Sorun Giderme

### "SQL Editor" bulamıyorum

- Sol menüde "Database" bölümünü genişletin
- Veya üst menüde "SQL Editor" sekmesine bakın
- Veya arama kutusuna "SQL" yazın

### "Run" butonu çalışmıyor

- SQL syntax'ını kontrol edin
- Noktalı virgül (;) kullandınız mı?
- Tırnak işaretlerini kontrol edin

### Sonuç görünmüyor

- SQL başarılı mı? (yeşil tik görünmeli)
- Hata mesajı var mı? (kırmızı uyarı)
- Sonuçlar altta, aşağı kaydırın

---

**SQL Editor'ü buldunuz mu? Tabloları listeleyin ve sonucu paylaşın!** 🚀

