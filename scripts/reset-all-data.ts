import { prisma } from '../lib/prisma'

async function main() {
  console.log('🚀 Yayın, ödeme ve finansal veriler sıfırlanıyor...')
  console.log('⚠️  Kullanıcı verileri (yayıncılar, içerik üreticileri, seslendirmenler) korunacak!\n')

  try {
    // 1. Tüm yayınları sil
    console.log('📺 Yayınlar siliniyor...')
    const deletedStreams = await prisma.stream.deleteMany({})
    console.log(`✅ ${deletedStreams.count} yayın silindi`)

    // 2. Tüm ödemeleri sil
    console.log('💰 Ödemeler siliniyor...')
    const deletedPayments = await prisma.payment.deleteMany({})
    console.log(`✅ ${deletedPayments.count} ödeme silindi`)

    // 3. Tüm finansal kayıtları sil
    console.log('💵 Finansal kayıtlar siliniyor...')
    const deletedFinancialRecords = await prisma.financialRecord.deleteMany({})
    console.log(`✅ ${deletedFinancialRecords.count} finansal kayıt silindi`)

    // 4. Tüm seslendirme metinlerini sil
    console.log('🎤 Seslendirme metinleri siliniyor...')
    const deletedScripts = await prisma.voiceoverScript.deleteMany({})
    console.log(`✅ ${deletedScripts.count} seslendirme metni silindi`)

    // 5. Tüm dış yayınları sil
    console.log('🌐 Dış yayınlar siliniyor...')
    const deletedExternalStreams = await prisma.externalStream.deleteMany({})
    console.log(`✅ ${deletedExternalStreams.count} dış yayın silindi`)

    // NOT: İçerikler, sosyal medya istatistikleri ve kullanıcılar korunuyor
    console.log('\n📌 Korunan veriler:')
    console.log('   - Yayıncılar (Streamer)')
    console.log('   - İçerik Üreticileri (ContentCreator)')
    console.log('   - Seslendirmenler (VoiceActor)')
    console.log('   - Ekip Üyeleri (TeamMember)')
    console.log('   - İçerikler (Content)')
    console.log('   - Sosyal Medya İstatistikleri')

    console.log('\n✨ Yayın, ödeme ve finansal veriler başarıyla sıfırlandı!')
    console.log('\n📋 Özet:')
    console.log(`   - ${deletedStreams.count} yayın silindi`)
    console.log(`   - ${deletedPayments.count} ödeme silindi`)
    console.log(`   - ${deletedFinancialRecords.count} finansal kayıt silindi`)
    console.log(`   - ${deletedScripts.count} seslendirme metni silindi`)
    console.log(`   - ${deletedExternalStreams.count} dış yayın silindi`)
  } catch (error) {
    console.error('❌ Hata oluştu:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error('❌ Script hatası:', e)
    process.exit(1)
  })

