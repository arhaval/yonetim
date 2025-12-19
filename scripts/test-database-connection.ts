import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// .env dosyasını yükle
dotenv.config()

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

async function testConnection() {
  console.log('🔍 Database bağlantısı test ediliyor...\n')
  
  // DATABASE_URL'i göster (şifreyi gizle)
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error('❌ HATA: DATABASE_URL environment variable bulunamadı!')
    console.log('\n📝 .env dosyanızda DATABASE_URL tanımlı olmalı.')
    process.exit(1)
  }

  // Şifreyi gizle
  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@')
  console.log('📋 DATABASE_URL:', maskedUrl)
  console.log('')

  // URL formatını kontrol et
  if (dbUrl.includes(':5432/')) {
    console.warn('⚠️  UYARI: Port 5432 kullanılıyor (normal database)')
    console.warn('   Connection Pooler için port 6543 kullanılmalı!')
    console.warn('   Format: ...pooler.supabase.com:6543/postgres?pgbouncer=true\n')
  }

  if (dbUrl.includes(':6543/') && dbUrl.includes('pooler')) {
    console.log('✅ Connection Pooler URL formatı doğru görünüyor\n')
  }

  try {
    console.log('🔄 Bağlantı deneniyor...')
    
    // Basit bir sorgu yap
    const result = await prisma.$queryRaw`SELECT 1 as test`
    
    console.log('✅ BAŞARILI! Database bağlantısı çalışıyor.')
    console.log('📊 Test sonucu:', result)
    
  } catch (error: any) {
    console.error('\n❌ BAĞLANTI HATASI!')
    console.error('Hata mesajı:', error.message)
    
    if (error.message.includes('Can\'t reach database server')) {
      console.error('\n🔧 ÇÖZÜM ÖNERİLERİ:')
      console.error('1. Supabase Dashboard → Settings → Database → Connection Pooling')
      console.error('2. Connection string → URI formatını kopyala (port 6543)')
      console.error('3. .env dosyasındaki DATABASE_URL\'i güncelle')
      console.error('4. Format: postgresql://postgres.PROJECT_REF:[ŞİFRE]@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true')
    }
    
    if (error.message.includes('Tenant or user not found')) {
      console.error('\n🔧 ÇÖZÜM:')
      console.error('"Tenant or user not found" hatası alıyorsunuz.')
      console.error('\n📋 Kontrol listesi:')
      
      // URL'i parse et
      try {
        const url = new URL(dbUrl)
        const username = url.username
        const hostname = url.hostname
        const port = url.port
        
        console.error(`\n1. Username: ${username}`)
        console.error(`   ✅ Doğru format: postgres.kwrbcwspdjlgixjkplzq`)
        console.error(`   ${username === 'postgres.kwrbcwspdjlgixjkplzq' ? '✅' : '❌'} Format kontrolü`)
        
        console.error(`\n2. Hostname: ${hostname}`)
        console.error(`   ✅ Doğru format: aws-0-eu-north-1.pooler.supabase.com (Stockholm)`)
        console.error(`   ${hostname.includes('eu-north-1') ? '✅' : '❌'} Region kontrolü`)
        
        console.error(`\n3. Port: ${port}`)
        console.error(`   ✅ Doğru port: 6543 (Pooler)`)
        console.error(`   ${port === '6543' ? '✅' : '❌'} Port kontrolü`)
        
        console.error(`\n4. Şifre kontrolü:`)
        console.error(`   - Supabase Dashboard → Settings → Database → Database password`)
        console.error(`   - Şifrenin doğru olduğundan emin olun`)
        console.error(`   - Şifre büyük/küçük harf duyarlıdır!`)
        
        console.error(`\n5. Region kontrolü:`)
        console.error(`   - Supabase Dashboard → Settings → General → Region`)
        console.error(`   - Region: Stockholm (eu-north-1) olmalı`)
        console.error(`   - Pooler host: aws-0-eu-north-1.pooler.supabase.com olmalı`)
        
      } catch (e) {
        console.error('URL parse edilemedi')
      }
      
      console.error('\n💡 ÖNERİLER:')
      console.error('1. Supabase Dashboard\'dan Connection String\'i tekrar kopyalayın')
      console.error('2. Session Pooler (port 6543) seçeneğini kullanın')
      console.error('3. Şifreyi reset edip tekrar deneyin')
      console.error('4. Region\'un Stockholm (eu-north-1) olduğundan emin olun')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()

