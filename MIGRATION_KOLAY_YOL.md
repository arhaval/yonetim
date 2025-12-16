# 🚀 Migration Yapmak İçin EN KOLAY YOL

## Adım 1: Tarayıcı Console'u Açın

1. Vercel sitesine gidin: https://arhaval-denetim-merkezi.vercel.app
2. **F12** tuşuna basın (veya sağ tık > "İncele" / "Inspect")
3. **Console** sekmesine tıklayın

## Adım 2: Bu Kodu Yapıştırın ve Enter'a Basın

Aşağıdaki kodu kopyalayıp Console'a yapıştırın ve Enter'a basın:

```javascript
fetch('https://arhaval-denetim-merkezi.vercel.app/api/migrate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer arhaval-migration-2024'
  }
})
.then(res => res.json())
.then(data => {
  console.log('✅ Migration başarılı!', data);
  alert('Migration başarıyla tamamlandı! IBAN kolonları eklendi.');
})
.catch(err => {
  console.error('❌ Hata:', err);
  alert('Hata oluştu: ' + err.message);
});
```

## Adım 3: Sonucu Kontrol Edin

- Eğer "Migration başarıyla tamamlandı" mesajı görürseniz, işlem başarılıdır! ✅
- Eğer "Kolonlar zaten mevcut" mesajı görürseniz, zaten eklenmiş demektir, sorun yok! ✅
- Eğer hata görürseniz, hata mesajını not edin ve bana bildirin.

## 🎉 Tamamlandı!

Artık:
- ✅ İçerik üreticisi eklerken IBAN alanı çalışacak
- ✅ Seslendirmen eklerken IBAN alanı çalışacak  
- ✅ Detay sayfalarında IBAN görünecek
- ✅ Görsel yükleme çalışacak (base64 encoding ile)

## ⚠️ Not

Eğer "Yetkisiz erişim" hatası alırsanız:
1. Vercel Dashboard'a gidin
2. Settings > Environment Variables
3. `MIGRATION_SECRET` adında bir değişken ekleyin
4. Değer olarak `arhaval-migration-2024` yazın
5. Tekrar deneyin

