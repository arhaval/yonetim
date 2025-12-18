-- Admin kullanıcısı oluşturma SQL komutu
-- Supabase SQL Editor'de çalıştırın

-- Önce mevcut kullanıcıyı kontrol edin (varsa silin)
DELETE FROM "User" WHERE email = 'hamitkulya3@icloud.com';

-- Yeni admin kullanıcısı oluştur
-- Şifre: S1e0r1t1a89c
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'hamitkulya3@icloud.com',
  '$2a$10$vLsmK7ceK6j5RDWiGISqXOoL69LtKB/LwfL6.klHpRCmCGznXvQhW',
  'Admin',
  'admin',
  NOW(),
  NOW()
);

