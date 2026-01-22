// Database connection checker
// Bu dosya DATABASE_URL'in doğru olup olmadığını kontrol eder

export function checkDatabaseUrl() {
  const dbUrl = process.env.DATABASE_URL

  if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined!')
  }

  // Pooler connection kontrolü
  if (!dbUrl.includes('pooler.supabase.com')) {
    console.error('❌ HATA: DATABASE_URL pooler kullanmıyor!')
    console.error('Mevcut:', dbUrl)
    console.error('Olması gereken: postgresql://postgres.kwrbcwspdjlgixjkplzq:***@aws-1-eu-north-1.pooler.supabase.com:5432/postgres')
    throw new Error('DATABASE_URL must use pooler.supabase.com!')
  }

  // Port kontrolü
  if (!dbUrl.includes(':5432/')) {
    console.error('❌ HATA: DATABASE_URL yanlış port kullanıyor!')
    console.error('Mevcut:', dbUrl)
    console.error('Port 5432 olmalı (6543 değil)!')
    throw new Error('DATABASE_URL must use port 5432!')
  }

  console.log('✅ Database URL kontrolü başarılı')
  return true
}

