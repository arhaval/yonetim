# Instagram İstatistik Otomatik Çalıştırma Rehberi

Bu rehber, Instagram istatistik scriptinin otomatik olarak çalışmasını sağlar.

## Seçenek 1: Windows Task Scheduler (Önerilen) ⭐

Windows'un kendi zamanlayıcısını kullanarak scripti otomatik çalıştırabilirsiniz.

### Adımlar:

1. **Task Scheduler'ı Aç**
   - Windows tuşu + R
   - `taskschd.msc` yaz ve Enter

2. **Yeni Görev Oluştur**
   - Sağ tarafta "Create Basic Task" tıkla
   - İsim: `Instagram İstatistik Çekme`
   - Açıklama: `Instagram hesabından otomatik istatistik çeker`

3. **Zamanlama Ayarla**
   - **Trigger (Tetikleyici):** 
     - Günlük: Her gün belirli saatte (örn: 09:00)
     - Haftalık: Her hafta belirli günde (örn: Pazartesi 09:00)
   - Saati seç (örn: 09:00)

4. **Aksiyon Ayarla**
   - Action: "Start a program"
   - Program/script: `C:\Users\Casper\Desktop\Arhaval Denetim Merkezi\OTOMATIK_CALISTIR.bat`
   - Start in: `C:\Users\Casper\Desktop\Arhaval Denetim Merkezi`

5. **Ayarları Kontrol Et**
   - "Open the Properties dialog..." kutusunu işaretle
   - General sekmesinde:
     - ✅ "Run whether user is logged on or not" seç
     - ✅ "Run with highest privileges" seç
   - Conditions sekmesinde:
     - ✅ "Start the task only if the computer is on AC power" kutusunu kaldır (laptop için)
   - Settings sekmesinde:
     - ✅ "Allow task to be run on demand" seç
     - ✅ "Run task as soon as possible after a scheduled start is missed" seç

6. **Test Et**
   - Task Scheduler'da görevi bul
   - Sağ tıkla → "Run" (Test için)

### Log Dosyası

Tüm çalıştırmalar `instagram_auto_log.txt` dosyasına kaydedilir. Bu dosyadan:
- Ne zaman çalıştığını
- Başarılı olup olmadığını
- Hata varsa ne olduğunu görebilirsiniz.

---

## Seçenek 2: Next.js API Endpoint (Gelişmiş)

Scripti Next.js projenize entegre edip admin panelinden tetikleyebilir veya API endpoint olarak kullanabilirsiniz.

### Avantajlar:
- Admin panelinden manuel tetikleme
- Web arayüzünden sonuçları görme
- Veritabanına otomatik kaydetme
- Diğer sistemlerle entegrasyon

### Kurulum:
1. Python scriptini Next.js API route'una entegre et
2. Admin panelinde bir buton ekle
3. İsteğe bağlı: Veritabanına otomatik kaydet

---

## Seçenek 3: Sürekli Çalışan Servis

Scripti sürekli çalışan bir Windows servisi haline getirebilirsiniz (daha gelişmiş).

---

## Önerilen Zamanlama

- **Günlük:** Her gün sabah 09:00 (günlük rapor için)
- **Haftalık:** Her Pazartesi 09:00 (haftalık özet için)
- **Aylık:** Her ayın 1'i 09:00 (aylık rapor için)

## Sorun Giderme

### Script çalışmıyor
1. `instagram_auto_log.txt` dosyasını kontrol et
2. Python'un PATH'de olduğundan emin ol
3. `.env` dosyasının doğru olduğundan emin

### Task Scheduler çalışmıyor
1. Task Scheduler servisinin çalıştığından emin ol
2. Görevin "Enabled" olduğundan emin ol
3. Kullanıcı izinlerini kontrol et

### Instagram engellemesi
- Çok sık çalıştırırsanız Instagram geçici olarak engelleyebilir
- Günlük 1 kez yeterlidir
- Hata alırsanız birkaç saat bekleyin

