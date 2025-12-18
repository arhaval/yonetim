# 🔍 Supabase Connection String - API Sekmesi

## ✅ Doğru Yer: Settings → API → Database Sekmesi

Supabase Dashboard'da:

1. **Settings** → **API** sekmesine gidin
2. **API Keys** sekmesi değil, **Database** sekmesine bakın
3. **Database** sekmesinde **Connection string** veya **Connection pooling** kısmını bulun

---

## 📍 Database Sekmesinde Ne Var?

**Database** sekmesinde şunlar olmalı:

- ✅ **Connection string** (direkt database bağlantısı)
- ✅ **Connection pooling** (pooler bağlantısı - önerilen)
- ✅ **Session mode** / **Transaction mode** seçenekleri
- ✅ **URI** formatında connection string

---

## 🚀 Adımlar

1. **Supabase Dashboard** → Projeniz → **Settings → API**
2. Üstteki sekmelerden **"Database"** sekmesine tıklayın (API Keys değil!)
3. **Connection pooling** kısmını bulun
4. **Session mode** seçin
5. **Connection string**'i kopyalayın (URI formatında)
6. **Vercel Dashboard** → Projeniz → **Settings → Environment Variables**
7. `DATABASE_URL` değişkenini bulun
8. **Edit** → Eski URL'i silin → Yeni URL'i yapıştırın
9. **Save** → **Redeploy**

---

## ⚠️ Önemli

- **API Keys** sekmesinde connection string yok!
- **Database** sekmesinde connection string var!
- Connection string **URI formatında** olacak (postgresql:// ile başlar)

---

## 🔄 Alternatif: Manuel Oluşturma

Eğer Database sekmesinde connection string bulamazsanız:

**Pooler URL:**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:[DATABASE-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Normal Database URL:**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:[DATABASE-PASSWORD]@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
```

`[DATABASE-PASSWORD]` yerine Settings → Database → Database password kısmından aldığınız şifreyi yazın.

---

**Önemli:** API Keys değil, **Database** sekmesine bakın! 🔍

