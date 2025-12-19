# 🚀 HIZLI ÇÖZÜM - IP Kısıtlamasını Kaldır

## Adım 1: Supabase'de IP Kısıtlamasını Kaldır

1. **Supabase Dashboard** → Projenizi seçin
2. **Settings → Database** sekmesine git
3. **"Network Restrictions"** bölümünü bul
4. Eğer **"Restrict all access"** aktifse → **KALDIR**
5. Veya **"Add restriction"** ile eklenmiş IP'ler varsa → **SİL**

## Adım 2: Normal Database URL'i Kullan (Geçici)

`.env` dosyanızda:
```
DATABASE_URL="postgresql://postgres:[ŞİFRENİZ]@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres"
```

**NOT:** Bu geçici bir çözüm. Production'da Connection Pooler kullanılmalı.

## Adım 3: Test Et

```bash
npm run test-db
```

Eğer çalışırsa → ✅ Sorun çözüldü (geçici)
Eğer çalışmazsa → Adım 2'ye geç

