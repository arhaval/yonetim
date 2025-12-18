# 🔍 Supabase Connection String Bulma

## 📍 Connection String'i Nerede Bulacaksınız?

Supabase Dashboard'da connection string'i bulmak için:

### Yöntem 1: Project Settings → API

1. **Supabase Dashboard** → Projeniz
2. Sol menüden **Settings** → **API** (veya **Project Settings** → **API**)
3. **Database** sekmesine gidin
4. **Connection string** veya **Connection pooling** kısmını bulun
5. **Session mode** veya **Transaction mode** seçin
6. Connection string'i kopyalayın

### Yöntem 2: Database Settings → Connection Info

1. **Supabase Dashboard** → Projeniz → **Settings → Database**
2. Sayfanın üst kısmında **"Connection info"** veya **"Connection string"** sekmesine bakın
3. Veya **"Connection pooling"** sekmesine tıklayın
4. Connection string'i kopyalayın

### Yöntem 3: SQL Editor'den

1. **Supabase Dashboard** → Projeniz → **SQL Editor**
2. Sağ üstte **"Connection string"** veya **"Copy connection string"** butonuna bakın

---

## ✅ Network Ayarları Kontrolü

Gösterdiğiniz sayfada:
- ✅ **"Your database can be accessed by all IP addresses"** - Bu iyi! IP kısıtlaması yok.
- ✅ Network restrictions yok - Sorun değil.

---

## 🚀 Manuel Oluşturma (Connection String Bulunamazsa)

Eğer connection string'i bulamazsanız, şu formatı kullanın:

### Pooler URL (Önerilen):

```
postgresql://postgres.kwrbcwspdjlgixjkplzq:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Şifreyi değiştirin:** `[YOUR-PASSWORD]` yerine database şifrenizi yazın (gösterdiğiniz sayfada "Database password" kısmından alabilirsiniz).

### Normal Database URL:

```
postgresql://postgres.kwrbcwspdjlgixjkplzq:[YOUR-PASSWORD]@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
```

---

## 📝 Adımlar

1. **Supabase Dashboard** → Projeniz → **Settings → API**
2. **Database** sekmesine gidin
3. **Connection string** veya **Connection pooling** kısmını bulun
4. **Session mode** seçin
5. Connection string'i kopyalayın
6. **Vercel Dashboard** → Projeniz → **Settings → Environment Variables**
7. `DATABASE_URL` değişkenini bulun
8. **Edit** → Eski URL'i silin → Yeni URL'i yapıştırın
9. **Save** → **Redeploy**

---

## ⚠️ Önemli

- Connection string'de şifre **otomatik eklenir** (gizli gösterilir)
- Kopyaladığınızda şifre zaten içinde olur
- Manuel oluşturuyorsanız, şifreyi kendiniz eklemelisiniz

---

**En iyi yöntem:** Settings → API → Database sekmesinden connection string'i almak!
