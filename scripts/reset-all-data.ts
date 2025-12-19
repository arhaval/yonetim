import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Tüm veriler sıfırlanıyor...')

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

    // 4. Tüm içerikleri sil
    console.log('📹 İçerikler siliniyor...')
    const deletedContents = await prisma.content.deleteMany({})
    console.log(`✅ ${deletedContents.count} içerik silindi`)

    // 5. Tüm seslendirme metinlerini sil
    console.log('🎤 Seslendirme metinleri siliniyor...')
    const deletedScripts = await prisma.voiceoverScript.deleteMany({})
    console.log(`✅ ${deletedScripts.count} seslendirme metni silindi`)

    // 6. Tüm dış yayınları sil
    console.log('🌐 Dış yayınlar siliniyor...')
    const deletedExternalStreams = await prisma.externalStream.deleteMany({})
    console.log(`✅ ${deletedExternalStreams.count} dış yayın silindi`)

    // 7. Tüm sosyal medya istatistiklerini sil
    console.log('📱 Sosyal medya istatistikleri siliniyor...')
    const deletedSocialMediaStats = await prisma.socialMediaStats.deleteMany({})
    console.log(`✅ ${deletedSocialMediaStats.count} sosyal medya istatistiği silindi`)

    // 8. Tüm raporları sil (eğer varsa)
    console.log('📊 Raporlar kontrol ediliyor...')
    // Rapor tablosu yoksa hata vermesin

    console.log('\n✨ Tüm veriler başarıyla sıfırlandı!')
    console.log('\n📋 Özet:')
    console.log(`   - ${deletedStreams.count} yayın silindi`)
    console.log(`   - ${deletedPayments.count} ödeme silindi`)
    console.log(`   - ${deletedFinancialRecords.count} finansal kayıt silindi`)
    console.log(`   - ${deletedContents.count} içerik silindi`)
    console.log(`   - ${deletedScripts.count} seslendirme metni silindi`)
    console.log(`   - ${deletedExternalStreams.count} dış yayın silindi`)
    console.log(`   - ${deletedSocialMediaStats.count} sosyal medya istatistiği silindi`)
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

