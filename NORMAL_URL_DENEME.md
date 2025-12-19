# 🔄 Normal Database URL'i Deneme

## ❌ Durum:
Connection Pooler URL'i çalışmıyor ("Tenant or user not found")

## ✅ ÇÖZÜM: Normal Database URL'i Dene

IP kısıtlaması kaldırıldığına göre, normal database URL'i çalışabilir.

### ADIM 1: Normal Database URL'i Kullan

**Format:**
```
postgresql://postgres:S1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
```

**Farklar:**
- Username: `postgres` (nokta yok, proje referansı yok)
- Host: `db.kwrbcwspdjlgixjkplzq.supabase.co` (pooler değil)
- Port: `5432` (6543 değil)
- Parametre yok (`?pgbouncer=true` yok)

### ADIM 2: .env Dosyasını Güncelle

`.env` dosyanızda:
```
DATABASE_URL="postgresql://postgres:S1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres"
```

### ADIM 3: Test Et

```bash
npm run test-db
```

### ADIM 4: Vercel'de Güncelle

1. **Vercel Dashboard** → **Settings → Environment Variables**
2. **`DATABASE_URL`** → **Edit**
3. **Normal database URL'ini yapıştır:**
   ```
   postgresql://postgres:S1e0r1t1a89c@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres
   ```
4. **Production, Preview, Development** hepsini seç ✅
5. **Save**
6. **Redeploy yap**

---

## 🔍 Neden Normal URL?

- ✅ IP kısıtlaması kaldırıldı
- ✅ Connection Pooling aktif olmayabilir veya yapılandırılmamış olabilir
- ✅ Normal URL daha basit ve direkt
- ✅ IPv4 uyarısı olsa bile çalışabilir (Vercel'de)

---

## ⚠️ IPv4 Uyarısı Hakkında:

"Not IPv4 compatible" uyarısı olsa bile:
- Vercel'in network'ü IPv6 destekliyor olabilir
- IP kısıtlaması kaldırıldığına göre çalışabilir
- Önce normal URL'i dene, çalışmazsa alternatifleri düşün

---

**ÖNCE NORMAL DATABASE URL'İNİ DENE! IP kısıtlaması kaldırıldığına göre çalışabilir!**

