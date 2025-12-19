import dotenv from 'dotenv'

dotenv.config()

console.log('🔍 Supabase Database Durum Kontrolü\n')
console.log('=' .repeat(50))

const dbUrl = process.env.DATABASE_URL

if (!dbUrl) {
  console.error('❌ DATABASE_URL bulunamadı!')
  console.log('\n📝 .env dosyanızda DATABASE_URL tanımlı olmalı.')
  process.exit(1)
}

// URL'i parse et
const urlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)

if (!urlMatch) {
  console.error('❌ DATABASE_URL formatı geçersiz!')
  console.log('\n📋 Doğru format:')
  console.log('postgresql://postgres:[ŞİFRE]@db.kwrbcwspdjlgixjkplzq.supabase.co:5432/postgres')
  process.exit(1)
}

const [, username, password, host, port, database] = urlMatch

console.log('📋 Mevcut Ayarlar:')
console.log(`   Host: ${host}`)
console.log(`   Port: ${port}`)
console.log(`   Database: ${database}`)
console.log(`   Username: ${username}`)
console.log(`   Password: ${password ? '****' : 'YOK'}`)
console.log('')

// Kontroller
console.log('🔍 Kontroller:\n')

// Port kontrolü
if (port === '5432') {
  console.log('⚠️  Port 5432 kullanılıyor (normal database)')
  console.log('   IP kısıtlaması olmamalı!')
} else if (port === '6543') {
  console.log('✅ Port 6543 kullanılıyor (Connection Pooler)')
} else {
  console.log(`⚠️  Port ${port} kullanılıyor (beklenmeyen port)`)
}

// Host kontrolü
if (host.includes('pooler')) {
  console.log('✅ Connection Pooler URL kullanılıyor')
} else if (host.includes('supabase.co')) {
  console.log('⚠️  Normal database URL kullanılıyor')
  console.log('   IP kısıtlaması olmamalı!')
} else {
  console.log(`⚠️  Beklenmeyen host: ${host}`)
}

// Username kontrolü
if (username.includes('.')) {
  console.log('✅ Username formatı doğru (proje referansı ile)')
} else {
  console.log('⚠️  Username formatı: postgres (Connection Pooler için postgres.PROJECT_REF olmalı)')
}

console.log('\n' + '='.repeat(50))
console.log('\n📋 YAPILACAKLAR:')
console.log('1. Supabase Dashboard → Settings → Database')
console.log('2. "Network Restrictions" → Tüm kısıtlamaları kaldır')
console.log('3. Database aktif mi kontrol et (pause edilmiş olabilir)')
console.log('4. Database şifresini kontrol et (Reset database password)')
console.log('5. Connection string\'i direkt kopyala (Settings → Database → Connection string → URI)')
console.log('\n✅ Kontroller tamamlandı!')

