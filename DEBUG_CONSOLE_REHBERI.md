# Debug Console Overlay - Kullanım Rehberi

## 🔍 Sorun Tespiti: Neden Console Boş?

### Kontrol Listesi:

1. **Next.js Config Kontrolü**
   - ✅ `next.config.js` dosyasında `removeConsole` ayarı var mı?
   - ✅ Production build'de console.log'lar kaldırılıyor mu?
   - **Çözüm:** `?debug=1` parametresi ile sayfayı açın veya `ENABLE_DEBUG=true` environment variable ekleyin

2. **Chrome DevTools Ayarları**
   - ✅ Console'da "Default levels" seçili mi? (Verbose, Info, Warnings, Errors)
   - ✅ "Preserve log" aktif mi?
   - ✅ "Hide network" kapalı mı?
   - ✅ "Selected context only" kapalı mı?
   - ✅ "Disable cache" aktif mi? (Network tab'ında)

3. **Build Modu**
   - ✅ Development modunda mı çalışıyorsunuz? (`npm run dev`)
   - ✅ Production build'de mi test ediyorsunuz? (`npm run build && npm start`)

4. **Browser Extensions**
   - ✅ AdBlock veya benzeri extension'lar console'u engelliyor olabilir
   - ✅ React DevTools veya Redux DevTools çakışma yapıyor olabilir

5. **Source Maps**
   - ✅ Source maps aktif mi? (Build sonrası `.map` dosyaları var mı?)
   - ✅ Chrome DevTools > Settings > Sources > "Enable JavaScript source maps" aktif mi?

## 🚀 Debug Console Overlay Kullanımı

### Otomatik Aktif Olma Koşulları:

1. **Development Modu:** Otomatik aktif
2. **Production Modu:** `?debug=1` parametresi ile aktif

### Kullanım:

1. **Development'ta:**
   ```
   http://localhost:3001/voice-actor/scripts/[id]
   ```
   - Sağ altta 🐛 ikonu görünecek
   - Tıklayarak açabilirsiniz

2. **Production'da:**
   ```
   https://yourdomain.com/voice-actor/scripts/[id]?debug=1
   ```
   - `?debug=1` parametresi ekleyin
   - Debug console otomatik aktif olacak

### Özellikler:

- ✅ **300 log kapasitesi:** Son 300 log tutulur
- ✅ **Arama filtresi:** Logları filtreleyebilirsiniz
- ✅ **Auto-scroll:** Yeni loglar otomatik scroll eder
- ✅ **Log seviyeleri:** log, info, warn, error, debug
- ✅ **Stack trace:** Hatalarda stack trace gösterilir
- ✅ **Timestamp:** Her log'un zamanı gösterilir
- ✅ **Temizleme:** Tek tıkla tüm logları temizleyebilirsiniz

### Console Monkey-Patch:

- `console.log()` → Hem orijinal console'a hem overlay'e yazılır
- `console.info()` → Hem orijinal console'a hem overlay'e yazılır
- `console.warn()` → Hem orijinal console'a hem overlay'e yazılır
- `console.error()` → Hem orijinal console'a hem overlay'e yazılır
- `console.debug()` → Hem orijinal console'a hem overlay'e yazılır

### Global Error Handlers:

- ✅ `window.onerror` → Yakalanmamış hataları yakalar
- ✅ `unhandledrejection` → Promise rejection'ları yakalar

## 🔧 Config Değişiklikleri

### next.config.js

```javascript
compiler: {
  removeConsole: process.env.NODE_ENV === 'production' && process.env.ENABLE_DEBUG !== 'true' ? {
    exclude: ['error', 'warn'],
  } : false,
}
```

### Environment Variable (Opsiyonel)

Production'da debug modunu açmak için:

```bash
ENABLE_DEBUG=true npm run build
```

## 📝 Chrome DevTools Kontrol Listesi

1. **Console Tab:**
   - ✅ "Default levels" → Tüm seviyeler seçili
   - ✅ "Preserve log" → Aktif
   - ✅ "Hide network" → Kapalı

2. **Network Tab:**
   - ✅ "Disable cache" → Aktif (dev sırasında)

3. **Sources Tab:**
   - ✅ "Enable JavaScript source maps" → Aktif

4. **Settings:**
   - ✅ "Show timestamps" → Aktif
   - ✅ "Show file names" → Aktif

## 🐛 Sorun Giderme

### Console hala boş mu?

1. **Hard refresh yapın:** Ctrl+Shift+R (Windows) veya Cmd+Shift+R (Mac)
2. **Cache temizleyin:** Chrome > Settings > Privacy > Clear browsing data
3. **Incognito modda test edin:** Extension çakışmasını kontrol edin
4. **Debug overlay'i kontrol edin:** Sağ altta 🐛 ikonu görünüyor mu?

### Debug overlay görünmüyor mu?

1. **URL kontrolü:** `?debug=1` parametresi var mı?
2. **Development modu:** `npm run dev` ile çalışıyor musunuz?
3. **Browser console:** Overlay render edildi mi? (F12 > Elements > `debug-console-overlay`)

### Loglar görünmüyor mu?

1. **Console patch çalışıyor mu?** Sayfa yüklendikten sonra console'a `console.log('test')` yazın
2. **Error handler çalışıyor mu?** Console'a `throw new Error('test')` yazın
3. **Overlay açık mı?** 🐛 ikonuna tıklayın

## 📊 Log Formatı

Her log şu formatta gösterilir:

```
[HH:MM:SS.mmm] LEVEL message
  stack trace (varsa)
```

Örnek:
```
[14:23:45.123] ERROR [Uncaught Error] Cannot read properties of null
  at onError (page.tsx:123)
  at Object.a_ (component.js:45)
```

## 🎯 Sonraki Adımlar

1. ✅ Debug overlay aktif
2. ✅ Console monkey-patch çalışıyor
3. ✅ Error handlers aktif
4. ⏭️ İsteğe bağlı: Server-side logging eklenebilir (`/api/client-logs`)

