# 🔧 "Tenant or user not found" Hatası Çözümü

## ❌ Hata:
```
Error querying the database: FATAL: Tenant or user not found
```

Bu hata, Connection Pooling'in aktif olmadığı veya username formatının yanlış olduğunu gösteriyor.

## ✅ ÇÖZÜM ADIMLARI:

### ADIM 1: Connection Pooling Aktif mi Kontrol Et

1. **Supabase Dashboard** → **Settings → Database**
2. Sayfayı **aşağı kaydır**
3. **"Connection Pooling"** bölümünü bul
4. **"Pool Mode"** veya **"Connection Pooler"** aktif mi kontrol et
5. Eğer aktif değilse → **Aktifleştir**

### ADIM 2: Doğru URL Formatını Kullan

**Connection Pooler URL (Port 6543):**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:S1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Kontrol listesi:**
- ✅ Username: `postgres.kwrbcwspdjlgixjkplzq` (nokta ile, proje referansı dahil)
- ✅ Password: `S1e0r1t1a89c` (büyük S)
- ✅ Host: `aws-0-eu-central-1.pooler.supabase.com` (pooler)
- ✅ Port: `6543` (5432 değil!)
- ✅ Parametre: `?pgbouncer=true` (sonunda)

### ADIM 3: .env Dosyasını Kontrol Et

`.env` dosyanızda şu satırın olduğundan emin olun:
```
DATABASE_URL="postgresql://postgres.kwrbcwspdjlgixjkplzq:S1e0r1t1a89c@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**ÖNEMLİ:** 
- Tırnak işaretleri (`"..."`) olmalı
- Şifre büyük S ile: `S1e0r1t1a89c`
- Username'de nokta var: `postgres.kwrbcwspdjlgixjkplzq`

### ADIM 4: Alternatif - Normal Database URL Dene

Eğer Connection Pooler çalışmazsa, normal database URL'i dene:

```
DATABASE_URL="postgresql://postgres:S1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres"
```

**Farklar:**
- Username: `postgres` (nokta yok)
- Host: `db.kwrbcwspdjlgixjkplzq.supabase.co` (pooler değil)
- Port: `5432` (6543 değil)
- Parametre yok

---

## 🔍 Kontrol Listesi:

- ✅ Connection Pooling aktif mi? (Supabase Dashboard'da kontrol et)
- ✅ Username formatı doğru mu? (`postgres.kwrbcwspdjlgixjkplzq`)
- ✅ Şifre doğru mu? (`S1e0r1t1a89c` - büyük S)
- ✅ Port doğru mu? (`6543` pooler için)
- ✅ Host doğru mu? (`pooler.supabase.com`)

---

## 🚨 HALA ÇALIŞMIYORSA:

### Supabase Support'a Sor

1. **Supabase Dashboard** → **"Help"** veya **"Support"**
2. **"Contact Support"** seçeneğini seç
3. Şunu yaz:
   ```
   I'm getting "Tenant or user not found" error when using Connection Pooler URL.
   Username format: postgres.kwrbcwspdjlgixjkplzq
   URL: postgresql://postgres.kwrbcwspdjlgixjkplzq:[ŞİFRE]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   Connection Pooling is enabled in my project settings.
   How can I fix this?
   ```

---

**ÖNCE CONNECTION POOLING'İN AKTİF OLDUĞUNDAN EMİN OL!**

