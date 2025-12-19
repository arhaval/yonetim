import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

// Tüm olası region'ları test et
const regions = [
  'eu-central-1',    // Avrupa - Frankfurt (en yaygın)
  'us-east-1',      // ABD - Doğu
  'us-west-1',      // ABD - Batı
  'ap-southeast-1', // Asya - Singapur
  'ap-northeast-1', // Asya - Tokyo
]

const projectRef = 'kwrbcwspdjlgixjkplzq'
const password = 'S1e0r1t1a89c' // Şifre: S1e0r1t1a89c (büyük S)

async function testRegion(region: string) {
  const url = `postgresql://postgres.${projectRef}:${password}@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`
  
  console.log(`\n🔄 Testing region: ${region}`)
  console.log(`   URL: postgresql://postgres.${projectRef}:****@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`)
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url,
      },
    },
    log: ['error'],
  })

  try {
    await prisma.$queryRaw`SELECT 1 as test`
    console.log(`   ✅ BAŞARILI! ${region} çalışıyor!`)
    await prisma.$disconnect()
    return { region, success: true, url }
  } catch (error: any) {
    console.log(`   ❌ Başarısız: ${error.message.substring(0, 80)}...`)
    await prisma.$disconnect()
    return { region, success: false }
  }
}

async function testAllRegions() {
  console.log('🔍 Tum regionlari test ediyorum...\n')
  console.log(`📋 Proje Referansı: ${projectRef}`)
  console.log(`🔑 Şifre: ${password ? '****' : 'BULUNAMADI'}\n`)
  
  if (!password || password === 'S1e0r1t1a89c') {
    console.warn('⚠️  UYARI: Şifre .env dosyasından okunamadı!')
    console.warn('   .env dosyanıza şunu ekleyin:')
    console.warn('   DATABASE_PASSWORD=gerçek_şifreniz\n')
  }

  const results = []
  for (const region of regions) {
    const result = await testRegion(region)
    results.push(result)
    
    // İlk başarılı olanı bulduysak dur
    if (result.success) {
      console.log(`\n✅ ÇALIŞAN REGION BULUNDU: ${region}`)
      console.log(`\n📋 .env dosyanıza şunu ekleyin:`)
      console.log(`DATABASE_URL="${result.url}"`)
      console.log(`\n📋 Vercel'de de aynı URL'i kullanın!`)
      return
    }
  }

  console.log('\n❌ Hiçbir region çalışmadı!')
  console.log('\n🔧 ALTERNATİF ÇÖZÜM:')
  console.log('1. Supabase Dashboard → Settings → Database')
  console.log('2. "Network Restrictions" → Tüm kısıtlamaları kaldır')
  console.log('3. Normal database URL kullan:')
  console.log(`   postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`)
}

testAllRegions()

