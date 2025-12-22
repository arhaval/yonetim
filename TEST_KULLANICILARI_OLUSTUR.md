# Test Kullanıcıları Oluşturma

## Hızlı Yol (Tarayıcı Konsolu)

1. Admin olarak login olun
2. Tarayıcıda F12 tuşuna basın (Developer Tools)
3. Console sekmesine gidin
4. Şu komutu yapıştırın ve Enter'a basın:

```javascript
fetch('/api/test-users/create', { 
  method: 'POST', 
  credentials: 'include' 
})
  .then(r => r.json())
  .then(data => {
    console.log('✅ Test kullanıcıları oluşturuldu!');
    console.log('📋 Kullanıcı Bilgileri:');
    console.table(data.users);
    console.log('🔑 Tüm kullanıcılar için şifre: test123456');
    alert('Test kullanıcıları başarıyla oluşturuldu!\n\nŞifre: test123456');
  })
  .catch(error => {
    console.error('❌ Hata:', error);
    alert('Hata oluştu: ' + error.message);
  });
```

## Oluşturulacak Kullanıcılar

1. **Admin (Salt Okunur)**
   - Email: `test-admin@arhaval.com`
   - Şifre: `test123456`
   - Rol: `viewer` (salt okunur)

2. **Yayıncı**
   - Email: `test-streamer@arhaval.com`
   - Şifre: `test123456`
   - Login: `/streamer-login`

3. **İçerik Üreticisi**
   - Email: `test-creator@arhaval.com`
   - Şifre: `test123456`
   - Login: `/creator-login`

4. **Seslendirmen**
   - Email: `test-voiceactor@arhaval.com`
   - Şifre: `test123456`
   - Login: `/voice-actor-login`

## Notlar

- Tüm kullanıcılar için şifre: `test123456`
- Eğer kullanıcılar zaten varsa, mevcut kullanıcılar güncellenmez
- Sadece admin kullanıcılar bu endpoint'i kullanabilir

