# 🔐 Basit Secret (Güvenlik Önemli Değilse)

Siteyi kimse bilmiyorsa, çok karmaşık bir secret'a gerek yok.

## ✅ Basit Secret Örnekleri

Vercel'de `CRON_SECRET` için şunlardan birini kullanabilirsiniz:

```
arhaval123
backup2024
secret123
mysecret
```

**Veya hiç secret kullanmayın:**

Eğer gerçekten güvenlik önemli değilse, cron job'ı secret olmadan da çalıştırabiliriz.

---

## 🚀 Hızlı Kurulum

### Seçenek 1: Basit Secret (Önerilen)

Vercel Dashboard → Settings → Environment Variables:
- **Key:** `CRON_SECRET`
- **Value:** `arhaval123` (veya istediğiniz basit bir kelime)
- **Environment:** Production

### Seçenek 2: Secret Olmadan

Cron job'ı secret kontrolü olmadan çalıştırabiliriz. İsterseniz kodu güncelleyebilirim.

---

## 📝 Not

Siteyi kimse bilmiyorsa bu yeterli. İleride daha fazla kullanıcı olursa güvenliği artırabilirsiniz.

