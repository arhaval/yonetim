# 📋 URI Format Kullanımı - Port Seçimi Yok

## ✅ ÇÖZÜM: Normal URI Formatını Kullan

Supabase Dashboard'da URI formatında port seçeneği yok. Bu normaldir. Şu adımları izleyin:

### ADIM 1: Normal URI Formatını Kopyala

1. **Supabase Dashboard** → **Settings → Database**
2. **"Connection string"** bölümünü bul
3. **"URI"** sekmesine tıkla
4. **"Show password"** veya **"Reveal"** butonuna tıkla
5. **Tam URL'i kopyala** (port 5432 olacak - bu normal)

**Örnek format:**
```
postgresql://postgres:S1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
```

### ADIM 2: .env Dosyasını Güncelle

1. `.env` dosyasını aç
2. `DATABASE_URL` satırını bul
3. **Kopyaladığın URL'i yapıştır**
4. Dosyayı kaydet

### ADIM 3: Test Et

```bash
npm run test-db
```

---

## 🔄 EĞER HALA ÇALIŞMIYORSA: Connection Pooling'den Al

### Alternatif: Connection Pooling URL'i

1. **Settings → Database → "Connection Pooling"** bölümüne git
2. **"Connection string"** → **"URI"** formatını seç
3. Burada **port 6543** olan URL'i göreceksin
4. **"Show password"** butonuna tıkla
5. **Tam URL'i kopyala**

**Format:**
```
postgresql://postgres.kwrbcwspdjlgixjkplzq:[ŞİFRE]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## ⚠️ ÖNEMLİ:

- **Normal URI formatı** → Port 5432 (direkt database)
- **Connection Pooling URI formatı** → Port 6543 (pooler)

**IP kısıtlaması kaldırıldığına göre, normal URI formatı (port 5432) çalışmalı!**

---

**ÖNCE NORMAL URI FORMATINI KULLAN, ÇALIŞMAZSA CONNECTION POOLING'DEN AL!**

