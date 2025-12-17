# 📋 Supabase Tablo İsimlerini Kontrol Et

## Tabloları Listele

Supabase SQL Editor'de şu query'yi çalıştırın:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Bu, tüm tabloları gösterecek. `VoiceoverScript` yerine başka bir isimle kayıtlı olabilir (örneğin `voiceover_script` veya `VoiceoverScript`).

---

## Alternatif: Doğrudan Kontrol

Şu query ile VoiceoverScript tablosunu arayın:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name LIKE '%script%' OR table_name LIKE '%voice%'
ORDER BY table_name, ordinal_position;
```

Bu, script veya voice içeren tüm tabloları ve kolonlarını gösterecek.






