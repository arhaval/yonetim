# 🔍 Session Pooler URL'i Bulma

## ❌ Sorun:
"View parameters" butonu sadece direkt connection gösteriyor, Session Pooler URL'i yok.

## ✅ ÇÖZÜM: Connection Pooling Bölümünü Bul

### ADIM 1: Connection Pooling Bölümüne Git

1. **Supabase Dashboard** → **Settings → Database**
2. Sayfayı **aşağı kaydır**
3. **"Connection Pooling"** bölümünü bul (ayrı bir bölüm olmalı)
4. Bu bölümde **"Connection string"** veya **"Connection Pooler"** yazısı olmalı

### ADIM 2: Session Pooler URL'ini Kopyala

**Connection Pooling** bölümünde:
1. **"Connection string"** → **"URI"** formatını seç
2. **"Show password"** veya **"Reveal"** butonuna tıkla
3. **Port 6543** olan URL'i kopyala

**Format:**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:[ŞİFRE]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## 🔍 Alternatif: Region'u Bul ve Manuel Oluştur

Eğer Connection Pooling bölümünü bulamazsanız:

### ADIM 1: Region'u Bul
1. **Settings → General** sekmesine git
2. **"Region"** bilgisini not al
3. Genellikle: `eu-central-1`, `us-east-1`, `us-west-1`, vb.

### ADIM 2: URL'i Manuel Oluştur

**Format:**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:S1e0r1t1a89c@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Örnek (eu-central-1 için):**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:S1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Örnek (us-east-1 için):**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:S1e0r1t1a89c@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## 📋 Kontrol Listesi:

- ✅ Settings → Database sayfasında **"Connection Pooling"** bölümü var mı?
- ✅ Region bilgisini buldunuz mu? (Settings → General)
- ✅ URL formatı doğru mu? (port 6543, pooler.supabase.com)

---

**ÖNCE CONNECTION POOLING BÖLÜMÜNÜ BUL, BULAMAZSAN REGION'U BUL VE MANUEL OLUŞTUR!**

