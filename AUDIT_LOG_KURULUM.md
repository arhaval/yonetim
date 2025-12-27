# ✅ Audit Log Sistemi Kuruldu

## 📋 Yapılanlar

### 1. ✅ Veritabanı Modeli
- `AuditLog` modeli Prisma schema'ya eklendi
- Migration dosyası oluşturuldu: `prisma/migrations/add_audit_log/migration.sql`
- **Not:** Migration'ı çalıştırmak için Supabase'de SQL'i çalıştırın

### 2. ✅ Utility Fonksiyonları
- `lib/audit-log.ts` oluşturuldu
- `createAuditLog()` - Ana audit log kaydetme fonksiyonu
- `logAction()` - Hızlı işlem kaydetme
- `logEntityChange()` - Entity değişikliği kaydetme

### 3. ✅ Entegrasyonlar
Aşağıdaki endpoint'lere audit log eklendi:

#### Ödeme İşlemleri
- ✅ `app/api/payments/make/route.ts`
  - Streamer ödemesi → `payment_created`
  - Team member ödemesi → `payment_created`
  - Voice actor ödemesi → `payment_created`

#### Finansal Kayıtlar
- ✅ `app/api/financial/route.ts`
  - Finansal kayıt oluşturma → `financial_record_created`
- ✅ `app/api/financial-records/[id]/route.ts`
  - Finansal kayıt silme → `financial_record_deleted`

#### Script Onayları
- ✅ `app/api/voiceover-scripts/[id]/approve/route.ts`
  - Admin script onayı → `script_approved`
- ✅ `app/api/voiceover-scripts/[id]/creator-approve/route.ts`
  - Creator script onayı → `script_creator_approved`

### 4. ✅ API Endpoint
- ✅ `app/api/audit-logs/route.ts`
  - GET: Audit logları listeleme
  - Filtreleme: action, entityType, userId, startDate, endDate
  - Sayfalama: page, limit

### 5. ✅ Görüntüleme Sayfası
- ✅ `app/audit-logs/page.tsx`
  - Tüm audit logları görüntüleme
  - Filtreleme ve arama
  - Sayfalama
  - Detaylı bilgi görüntüleme

---

## 🚀 Kullanım

### 1. Migration'ı Çalıştırın

Supabase SQL Editor'de şu SQL'i çalıştırın:

```sql
-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT,
    "userRole" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "AuditLog_userRole_idx" ON "AuditLog"("userRole");
```

### 2. Audit Log Sayfasına Erişin

- URL: `/audit-logs`
- Sadece admin kullanıcılar erişebilir

### 3. Yeni Endpoint'lere Audit Log Ekleyin

```typescript
import { createAuditLog } from '@/lib/audit-log'

// Basit kullanım
await createAuditLog({
  action: 'payment_created',
  details: { amount: 5000, recipient: 'Mehmet' },
})

// Detaylı kullanım
await createAuditLog({
  userId: user.id,
  userName: user.name,
  userRole: user.role,
  action: 'financial_record_deleted',
  entityType: 'FinancialRecord',
  entityId: record.id,
  oldValue: { amount: 1000 },
  details: { reason: 'Hatalı kayıt' },
})
```

---

## 📊 Kaydedilen İşlemler

### Finansal İşlemler
- ✅ Ödeme oluşturuldu
- ✅ Finansal kayıt eklendi
- ✅ Finansal kayıt silindi

### Onay İşlemleri
- ✅ Script admin tarafından onaylandı
- ✅ Script creator tarafından onaylandı

### Gelecekte Eklenecekler
- ⏳ Stream oluşturuldu/güncellendi/silindi
- ⏳ Kullanıcı oluşturuldu/güncellendi/silindi
- ⏳ Login/Logout işlemleri
- ⏳ Diğer önemli işlemler

---

## 🔍 Audit Log Sayfası Özellikleri

### Filtreleme
- İşlem tipi (action)
- Entity tipi (Payment, FinancialRecord, vb.)
- Tarih aralığı (başlangıç/bitiş)
- Kullanıcı arama

### Görüntüleme
- Tarih/saat
- Kullanıcı bilgileri (ad, rol)
- İşlem tipi (renkli badge)
- Entity bilgileri
- Detaylı bilgiler (JSON formatında)

### Sayfalama
- Sayfa başına 50 kayıt
- Önceki/Sonraki butonları
- Toplam kayıt sayısı

---

## ✅ Sonuç

Audit log sistemi başarıyla kuruldu! Artık sistemdeki önemli işlemler otomatik olarak kaydediliyor.

**Not:** Migration'ı Supabase'de çalıştırmayı unutmayın!

