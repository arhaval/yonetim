# Python 3.12 Kurulum Rehberi (Önerilen)

## Sorun
Python 3.14.2 çok yeni bir sürüm ve `instagrapi` paketinin bazı bağımlılıkları (özellikle `pydantic-core`) henüz bu sürüm için hazır değil.

## Çözüm: Python 3.12 Kurulumu

### Adım 1: Python 3.12 İndir
1. https://www.python.org/downloads/release/python-3120/ adresine gidin
2. "Windows installer (64-bit)" dosyasını indirin

### Adım 2: Python 3.12 Kur
1. İndirilen `.exe` dosyasını çalıştırın
2. **ÖNEMLİ:** "Add Python 3.12 to PATH" kutusunu işaretleyin ✅
3. "Install Now" butonuna tıklayın
4. Kurulum bitene kadar bekleyin

### Adım 3: Python 3.12'yi Varsayılan Yap (Opsiyonel)
Eğer hem 3.14 hem 3.12 yüklüyse:
- Python 3.12'yi kullanmak için: `py -3.12` komutunu kullanın
- Veya PATH'te 3.12'yi 3.14'ten önce sıralayın

### Adım 4: Paketleri Yükle
```cmd
py -3.12 -m pip install instagrapi python-dotenv
```

### Adım 5: Scripti Çalıştır
Scripti güncelleyerek Python 3.12 kullanmasını sağlayın veya:
```cmd
py -3.12 instagram_stats.py
```

## Alternatif: Mevcut Python ile Devam

Eğer Python 3.12 kurmak istemiyorsanız:
1. `python-dotenv` paketini yükleyin (bu çalışır)
2. `instagrapi` için alternatif bir yöntem kullanın
3. Veya birkaç hafta bekleyin, paketler güncellenebilir

## Hızlı Test
Python 3.12 kurulduktan sonra:
```cmd
py -3.12 --version
```
Python 3.12.x görünmeli.

