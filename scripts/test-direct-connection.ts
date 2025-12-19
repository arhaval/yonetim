import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

async function testDirectConnection() {
  console.log('🔍 Direct Database Connection Test\n')
  console.log('='.repeat(50))
  
  const dbUrl = process.env.DATABASE_URL
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL bulunamadı!')
    process.exit(1)
  }
  
  // URL'i parse et
  const urlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
  
  if (!urlMatch) {
    console.error('❌ DATABASE_URL formatı geçersiz!')
    process.exit(1)
  }
  
  const [, username, password, host, port, database] = urlMatch
  
  console.log('📋 Connection Details:')
  console.log(`   Host: ${host}`)
  console.log(`   Port: ${port}`)
  console.log(`   Database: ${database}`)
  console.log(`   Username: ${username}`)
  console.log(`   Password: ${password ? '****' : 'YOK'}`)
  console.log('')
  
  // Şifre kontrolü
  if (!password || password === 'YOUR-PASSWORD' || password === '[YOUR-PASSWORD]') {
    console.error('❌ ŞİFRE EKSİK!')
    console.log('\n📝 .env dosyanızda şifre gerçek şifre olmalı:')
    console.log('   DATABASE_URL="postgresql://postgres:GERÇEK_ŞİFRE@..."')
    process.exit(1)
  }
  
  // Host kontrolü
  if (!host.includes('supabase.co')) {
    console.warn('⚠️  Host Supabase değil:', host)
  }
  
  // Port kontrolü
  if (port !== '5432' && port !== '6543') {
    console.warn('⚠️  Beklenmeyen port:', port)
  }
  
  console.log('🔄 Bağlantı deneniyor...\n')
  
  try {
    // Basit bir sorgu
    const result = await prisma.$queryRaw`SELECT 1 as test, NOW() as current_time`
    
    console.log('✅ BAŞARILI! Database bağlantısı çalışıyor!')
    console.log('📊 Test sonucu:', result)
    console.log('\n🎉 Sorun çözüldü!')
    
  } catch (error: any) {
    console.error('\n❌ BAĞLANTI HATASI!')
    console.error('Hata:', error.message)
    
    if (error.message.includes("Can't reach database server")) {
      console.error('\n🔧 ÇÖZÜM ADIMLARI:')
      console.error('1. Supabase Dashboard → Settings → Database')
      console.error('2. "Network Restrictions" → Tüm kısıtlamaları kaldır')
      console.error('3. "Connection string" → URI formatını kopyala')
      console.error('4. Şifrenin URL\'de olduğundan emin ol')
      console.error('5. Database pause edilmiş olabilir → Resume yap')
    }
    
    if (error.message.includes('password authentication failed')) {
      console.error('\n🔧 ŞİFRE HATASI!')
      console.error('1. Supabase Dashboard → Settings → Database')
      console.error('2. "Database password" → Şifreyi görüntüle veya reset et')
      console.error('3. .env dosyasındaki şifreyi güncelle')
    }
    
    if (error.message.includes('Tenant or user not found')) {
      console.error('\n🔧 USERNAME HATASI!')
      console.error('Username formatı yanlış olabilir.')
      console.error('Normal database için: postgres')
      console.error('Connection Pooler için: postgres.kwrbcwspdjlgixjkplzq')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testDirectConnection()

