// Direkt API kullanarak yayıncı ekleme script'i
// Bu script local'de DATABASE_URL olmadan da çalışabilir (production API'yi kullanır)

const streamerData = {
  name: 'Aytekin Uçar',
  email: 'ucaraytekin2009@gmail.com',
  password: 'Aytekin1281.',
  phone: null,
  iban: null,
  teamRates: []
}

console.log('📝 Yayıncı bilgileri:')
console.log(`   İsim: ${streamerData.name}`)
console.log(`   Email: ${streamerData.email}`)
console.log(`   Şifre: ${streamerData.password}`)
console.log("\n⚠️ Bu script production API'yi kullanır.")
console.log('   Vercel deployment URL\'inizi kullanın veya local server çalıştırın.\n')

// Production URL veya local URL
const API_URL = process.env.API_URL || 'http://localhost:3001'

async function addStreamer() {
  try {
    console.log(`🔗 API URL: ${API_URL}/api/streamers`)
    console.log('📤 Yayıncı ekleniyor...\n')
    
    const response = await fetch(`${API_URL}/api/streamers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(streamerData),
    })

    const data = await response.json()

    if (response.ok) {
      console.log('✅ Yayıncı başarıyla eklendi!')
      console.log(`   ID: ${data.streamer?.id || data.id}`)
      console.log(`   İsim: ${data.streamer?.name || data.name}`)
      console.log(`   Email: ${data.streamer?.email || data.email}`)
      console.log('\n📝 Giriş bilgileri:')
      console.log(`   URL: ${API_URL}/streamer-login`)
      console.log(`   Email: ${streamerData.email}`)
      console.log(`   Şifre: ${streamerData.password}`)
    } else {
      console.error('❌ Hata:', data.error || 'Bilinmeyen hata')
      console.error('   Detaylar:', data)
    }
  } catch (error: any) {
    console.error('❌ Bağlantı hatası:', error.message)
    console.error('\n💡 Çözüm:')
    console.error('   1. Local server çalıştırın: npm run dev')
    console.error('   2. Veya API_URL environment variable\'ını ayarlayın')
    console.error('      Örnek: API_URL=https://your-app.vercel.app node scripts/add-streamer-direct.ts')
  }
}

addStreamer()

