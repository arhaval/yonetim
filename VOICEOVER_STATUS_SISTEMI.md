# 🎯 Seslendirme Status/State Sistemi

## ✅ Tamamlandı

Yeni status enum sistemi başarıyla eklendi ve tüm sistem güncellendi.

---

## 📋 Status ENUM

```typescript
enum VoiceoverScriptStatus {
  WAITING_VOICE    // Ses bekleniyor
  VOICE_UPLOADED   // Ses geldi - onay bekliyor
  APPROVED         // Onaylandı
  REJECTED         // Düzeltme istendi
  PAID             // Ödemesi yapıldı
  ARCHIVED         // Tamamlandı, aktif akıştan çıktı
}
```

---

## 🔄 Status Akışı

```
WAITING_VOICE → (ses yüklendiğinde) → VOICE_UPLOADED → (admin onayladı) → APPROVED → (ödeme yapıldı) → PAID
                                    ↓
                              (reddedildi) → REJECTED → (düzeltme sonrası) → WAITING_VOICE
```

---

## 📊 Default Sıralama

1. **VOICE_UPLOADED** (en üstte - acil işlem gerekiyor)
2. **WAITING_VOICE** (ses bekleniyor)
3. **REJECTED** (düzeltme gerekiyor)
4. **APPROVED** (onaylandı)
5. **PAID** (ödendi)

**ARCHIVED** varsayılan olarak gösterilmez (toggle ile açılabilir)

---

## 🎨 UI Özellikleri

### Status Badge'ler
- **Tek renk + icon** (gradient yok)
- **WAITING_VOICE**: Sarı + FileText icon
- **VOICE_UPLOADED**: Mor + Mic icon
- **APPROVED**: Mavi + CheckCircle icon
- **REJECTED**: Kırmızı + XCircle icon (hover'da rejectionReason tooltip)
- **PAID**: Yeşil + CheckCircle icon
- **ARCHIVED**: Gri + Archive icon

### Filtreleme
- Durum filtresi (dropdown)
- Seslendiren filtresi
- Tarih aralığı
- Arama (başlık/metin)
- **Arşiv toggle**: Arşivlenmiş kayıtları göster/gizle

---

## 🔧 Backend Değişiklikleri

### 1. Prisma Schema
- ✅ `VoiceoverScriptStatus` enum eklendi
- ✅ `rejectionReason` field eklendi
- ✅ Status field enum'a çevrildi

### 2. Migration
- ✅ Eski kayıtlar yeni status'lere çevrildi:
  - Ses dosyası varsa → `VOICE_UPLOADED`
  - Onaylıysa → `APPROVED`
  - Ödenmişse → `PAID`
  - Diğerleri → `WAITING_VOICE`

### 3. API Endpoints
- ✅ `/api/voiceover-scripts` - Filtreleme ve sıralama güncellendi
- ✅ `/api/voiceover-scripts/[id]/approve` - `VOICE_UPLOADED` → `APPROVED`
- ✅ `/api/voiceover-scripts/[id]/reject` - Yeni endpoint (rejectionReason ile)
- ✅ `/api/voiceover-scripts/[id]/archive` - `ARCHIVED` status
- ✅ `/api/voiceover-scripts/[id]/creator-approve` - `WAITING_VOICE` → `VOICE_UPLOADED`
- ✅ `/api/voiceover-scripts/[id]/pay` - `APPROVED` → `PAID`
- ✅ `/api/voiceover-scripts/[id]` - PUT endpoint güncellendi (ses yüklendiğinde otomatik `VOICE_UPLOADED`)

---

## 📝 Migration Çalıştırma

**ÖNEMLİ:** Migration'ı çalıştırmadan önce database'i yedekleyin!

```sql
-- Supabase SQL Editor'de çalıştırın:
-- prisma/migrations/migrate_voiceover_status/migration.sql dosyasındaki SQL'i kopyalayıp çalıştırın
```

Veya Prisma Migrate kullanarak:
```bash
npx prisma migrate dev --name migrate_voiceover_status
```

---

## 🎯 Kullanım

### Ses Yüklendiğinde
- Seslendirmen ses dosyası yüklediğinde → Otomatik `WAITING_VOICE` → `VOICE_UPLOADED`

### Creator Onayı
- Creator sesi onayladığında → `VOICE_UPLOADED` (zaten bu durumda)

### Admin Onayı
- Admin fiyat girip onayladığında → `VOICE_UPLOADED` → `APPROVED`

### Reddetme
- Admin reddettiğinde → `REJECTED` (rejectionReason ile)
- Reddetme nedeni tooltip'te gösterilir

### Ödeme
- Admin ödeme yaptığında → `APPROVED` → `PAID` (manuel)

### Arşivleme
- Herhangi bir durumdan → `ARCHIVED` (aktif akıştan çıkar)

---

## ✅ Tamamlanan Özellikler

- ✅ Status enum sistemi
- ✅ Migration script
- ✅ API route güncellemeleri
- ✅ Frontend badge'ler
- ✅ Filtreleme ve sıralama
- ✅ Arşiv toggle
- ✅ Rejection reason
- ✅ Drawer güncellemeleri
- ✅ Audit log entegrasyonu

---

## 🚀 Deploy Durumu

- ✅ Değişiklikler commit edildi
- ✅ GitHub'a push edildi
- ✅ Vercel otomatik deploy başlatacak

**ÖNEMLİ:** Migration'ı Supabase'de çalıştırmayı unutmayın!

---

## 📌 Notlar

1. **Migration**: Eski kayıtlar otomatik olarak yeni status'lere çevrilecek
2. **Backward Compatibility**: Eski status değerleri artık kullanılmıyor
3. **Rejection Reason**: REJECTED durumunda neden reddedildiği kaydediliyor
4. **Arşiv**: ARCHIVED kayıtlar varsayılan olarak gösterilmiyor

---

**Sistem hazır! Migration'ı çalıştırdıktan sonra test edebilirsiniz.** 🎉

