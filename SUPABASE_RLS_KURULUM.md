# 🔐 Supabase RLS (Row Level Security) Kurulum Rehberi

## 📋 Genel Bakış

Bu rehber, `VoiceoverScript` tablosu için Supabase RLS politikalarının nasıl kurulacağını açıklar.

## 🎯 Hedefler

- ✅ Admin kullanıcılar tüm voiceover kayıtlarını görebilmeli
- ✅ Producer (Content Creator) sadece kendi script'lerini görebilmeli
- ✅ Voice Actor (Seslendiren) sadece kendi script'lerini görebilmeli
- ✅ Admin tüm kolonları güncelleyebilmeli
- ✅ Voice Actor sadece `voiceLink` kolonunu güncelleyebilmeli (uygulama katmanında kontrol)
- ✅ `price` ve `adminApproved` kolonları sadece admin tarafından güncellenebilmeli

## 📝 Önkoşullar

1. Supabase projenizde `VoiceoverScript` tablosu mevcut olmalı
2. Supabase Auth kullanıcılarınızın `raw_user_meta_data` içinde `role='admin'` olarak işaretlenmiş olması gerekir
3. `creatorId` ve `voiceActorId` kolonları Supabase Auth UUID'leri ile eşleşmeli

## 🚀 Kurulum Adımları

### Adım 1: Supabase Dashboard'a Giriş

1. https://supabase.com/dashboard adresine gidin
2. Projenizi seçin
3. Sol menüden **"SQL Editor"** seçeneğine tıklayın

### Adım 2: SQL Script'ini Çalıştır

1. `supabase_rls_voiceover_scripts.sql` dosyasının içeriğini kopyalayın
2. Supabase SQL Editor'e yapıştırın
3. **"Run"** butonuna tıklayın

### Adım 3: Sonuçları Kontrol Et

Script başarıyla çalıştıysa şu mesajları görmelisiniz:
- `CREATE FUNCTION` (is_admin fonksiyonu oluşturuldu)
- `DROP POLICY` (eski policy'ler kaldırıldı - eğer varsa)
- `ALTER TABLE` (RLS etkinleştirildi)
- `CREATE POLICY` (yeni policy'ler oluşturuldu)

## 🧪 Test Sorguları

### Test 1: Admin Kontrolü

```sql
-- Mevcut kullanıcının admin olup olmadığını kontrol et
SELECT is_admin(auth.uid()) AS is_admin_user;
```

**Beklenen Sonuç:**
- Admin kullanıcı için: `true`
- Normal kullanıcı için: `false`

### Test 2: VoiceoverScript Görüntüleme

```sql
-- Mevcut kullanıcının görebileceği script'leri listele
SELECT id, title, "creatorId", "voiceActorId" 
FROM "VoiceoverScript"
ORDER BY "createdAt" DESC
LIMIT 10;
```

**Beklenen Sonuç:**
- Admin: Tüm script'ler görünür
- Producer: Sadece `creatorId = auth.uid()` olanlar görünür
- Voice Actor: Sadece `voiceActorId = auth.uid()` olanlar görünür

### Test 3: Policy'lerin Aktif Olup Olmadığını Kontrol Et

```sql
-- Tüm policy'leri listele
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'VoiceoverScript'
ORDER BY policyname;
```

**Beklenen Sonuç:**
8 adet policy görünmeli:
1. `voiceover_scripts_select_admin`
2. `voiceover_scripts_select_creator`
3. `voiceover_scripts_select_voice_actor`
4. `voiceover_scripts_update_admin`
5. `voiceover_scripts_update_voice_actor`
6. `voiceover_scripts_insert_creator_admin`
7. `voiceover_scripts_delete_admin`

## 📚 Policy Açıklamaları

### SELECT Policies (Görüntüleme)

1. **voiceover_scripts_select_admin**
   - Admin kullanıcılar tüm script'leri görebilir
   - `is_admin(auth.uid())` kontrolü yapar

2. **voiceover_scripts_select_creator**
   - Producer'lar sadece `creatorId = auth.uid()` olanları görebilir

3. **voiceover_scripts_select_voice_actor**
   - Voice Actor'lar sadece `voiceActorId = auth.uid()` olanları görebilir

### UPDATE Policies (Güncelleme)

4. **voiceover_scripts_update_admin**
   - Admin tüm kolonları güncelleyebilir

5. **voiceover_scripts_update_voice_actor**
   - Voice Actor kendi script'lerini güncelleyebilir
   - ⚠️ **Not:** RLS seviyesinde kolon bazlı kontrol yok, bu yüzden uygulama katmanında (API routes) `voiceLink` dışındaki kolonlar için kontrol yapılmalı

### INSERT Policy (Oluşturma)

6. **voiceover_scripts_insert_creator_admin**
   - Admin ve Producer script oluşturabilir

### DELETE Policy (Silme)

7. **voiceover_scripts_delete_admin**
   - Sadece Admin silebilir

## ⚠️ Önemli Notlar

### 1. Admin Rolü Ayarlama

Admin kullanıcıların `raw_user_meta_data` içinde `role='admin'` olarak işaretlenmesi gerekir:

```sql
-- Örnek: Bir kullanıcıyı admin yapmak
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE id = 'USER_UUID_BURAYA';
```

### 2. UUID Eşleştirme

`creatorId` ve `voiceActorId` kolonları Supabase Auth UUID'leri ile eşleşmeli. Eğer farklı bir format kullanıyorsanız (örneğin CUID), script'i buna göre güncellemeniz gerekir.

### 3. Kolon Bazlı UPDATE Kontrolü

PostgreSQL RLS kolon bazlı kontrolü doğrudan desteklemez. Bu yüzden:
- `voiceLink` güncellemesi için uygulama katmanında kontrol yapılmalı
- `price` ve `adminApproved` güncellemesi için uygulama katmanında kontrol yapılmalı

### 4. Güvenlik

- ✅ Herkese açık (public) erişim YOK
- ✅ Admin bypass SADECE admin için geçerli
- ✅ Tüm kontroller `auth.uid()` üzerinden yapılıyor
- ✅ `is_admin()` fonksiyonu `SECURITY DEFINER` ile çalışıyor (güvenli)

## 🔧 Sorun Giderme

### Sorun 1: "function is_admin does not exist"

**Çözüm:** SQL script'ini baştan sona tekrar çalıştırın. Fonksiyon oluşturulmamış olabilir.

### Sorun 2: "permission denied for table VoiceoverScript"

**Çözüm:** RLS etkinleştirilmiş ama policy'ler yok. Script'i tekrar çalıştırın.

### Sorun 3: Admin kullanıcı script'leri göremiyor

**Çözüm:** 
1. `is_admin(auth.uid())` sorgusunu çalıştırın, `true` dönmeli
2. Kullanıcının `raw_user_meta_data` içinde `role='admin'` olduğundan emin olun

### Sorun 4: Producer/Voice Actor script'leri göremiyor

**Çözüm:**
1. `creatorId` veya `voiceActorId` değerlerinin `auth.uid()` ile eşleştiğinden emin olun
2. UUID formatını kontrol edin (TEXT vs UUID)

## 📞 Destek

Sorun yaşarsanız:
1. Supabase SQL Editor'deki hata mesajını kontrol edin
2. Policy'lerin aktif olup olmadığını kontrol edin (Test 3)
3. Admin kontrolünün çalışıp çalışmadığını kontrol edin (Test 1)













