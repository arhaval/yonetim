# Instagram İstatistik Scripti - Hızlı Başlangıç

## ✅ Python Kuruldu!

Python 3.14.2 başarıyla yüklendi.

## 🚀 Scripti Çalıştırma

### Yöntem 1: Otomatik (Önerilen)
1. **`CALISTIR.bat`** dosyasına çift tıklayın
2. Otomatik olarak:
   - Paketler yüklenecek
   - Script çalışacak
   - Sonuçlar `sonuc.json` dosyasına kaydedilecek

### Yöntem 2: Manuel
Terminal/CMD'de:
```cmd
cd "C:\Users\Casper\Desktop\Arhaval Denetim Merkezi"
python -m pip install instagrapi python-dotenv
python instagram_stats.py
```

## 📋 Kontrol Listesi

- [x] Python yüklü (3.14.2)
- [ ] Paketler yüklü (instagrapi, python-dotenv)
- [ ] .env dosyası hazır (INSTAGRAM_USERNAME ve INSTAGRAM_PASSWORD)
- [ ] Script çalıştırıldı
- [ ] sonuc.json dosyası oluşturuldu

## 🔄 Otomatik Çalıştırma

Scripti otomatik çalıştırmak için:
1. **`TASK_SCHEDULER_HIZLI_KURULUM.bat`** dosyasına çift tıklayın
2. Veya **`OTOMATIK_KURULUM_REHBERI.md`** dosyasındaki adımları takip edin

## 📁 Dosyalar

- `instagram_stats.py` - Ana script
- `CALISTIR.bat` - Otomatik çalıştırma scripti
- `sonuc.json` - Sonuçlar (script çalıştıktan sonra oluşur)
- `.env` - Instagram bilgileri (güvenlik için gizli)

## ⚠️ Sorun Giderme

### "ModuleNotFoundError: No module named 'dotenv'"
**Çözüm:** Paketleri yükleyin:
```cmd
python -m pip install instagrapi python-dotenv
```

### "Python bulunamadı"
**Çözüm:** Bilgisayarı yeniden başlatın (PATH güncellemesi için)

### Instagram giriş hatası
**Çözüm:** 
- 2FA aktifse geçici olarak kapatın
- Veya Instagram uygulamasından giriş yapıp tekrar deneyin

## 📞 Yardım

Detaylı bilgi için:
- `INSTAGRAM_SCRIPT_README.md` - Genel kullanım
- `OTOMATIK_KURULUM_REHBERI.md` - Otomatik çalıştırma

