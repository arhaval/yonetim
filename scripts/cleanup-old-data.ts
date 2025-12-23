import { prisma } from '../lib/prisma'

/**
 * Eski test kayıtlarını temizleme scripti
 * 
 * Kullanım:
 * npm run cleanup-old-data
 * 
 * Veya belirli bir tarihten önceki kayıtları silmek için:
 * npm run cleanup-old-data -- --before=2024-01-01
 */

async function main() {
  const args = process.argv.slice(2)
  const beforeDateArg = args.find(arg => arg.startsWith('--before='))
  const beforeDate = beforeDateArg ? new Date(beforeDateArg.split('=')[1]) : null

  console.log('🧹 Eski kayıtlar temizleniyor...\n')

  if (beforeDate) {
    console.log(`📅 ${beforeDate.toISOString().split('T')[0]} tarihinden önceki kayıtlar silinecek\n`)
  } else {
    console.log('⚠️  Tüm kayıtlar silinecek (kullanıcılar hariç)\n')
  }

  try {
    // 1. İlişkili kayıtları önce sil
    console.log('📺 Yayınlar siliniyor...')
    const deletedStreams = beforeDate 
      ? await prisma.stream.deleteMany({ where: { createdAt: { lt: beforeDate } } })
      : await prisma.stream.deleteMany({})
    console.log(`✅ ${deletedStreams.count} yayın silindi`)

    console.log('💰 Ödemeler siliniyor...')
    const deletedPayments = beforeDate
      ? await prisma.payment.deleteMany({ where: { createdAt: { lt: beforeDate } } })
      : await prisma.payment.deleteMany({})
    console.log(`✅ ${deletedPayments.count} ödeme silindi`)

    console.log('💼 Ekip ödemeleri siliniyor...')
    const deletedTeamPayments = beforeDate
      ? await prisma.teamPayment.deleteMany({ where: { createdAt: { lt: beforeDate } } })
      : await prisma.teamPayment.deleteMany({})
    console.log(`✅ ${deletedTeamPayments.count} ekip ödemesi silindi`)

    console.log('💵 Finansal kayıtlar siliniyor...')
    const deletedFinancialRecords = beforeDate
      ? await prisma.financialRecord.deleteMany({ where: { createdAt: { lt: beforeDate } } })
      : await prisma.financialRecord.deleteMany({})
    console.log(`✅ ${deletedFinancialRecords.count} finansal kayıt silindi`)

    console.log('🎤 Seslendirme metinleri siliniyor...')
    const deletedScripts = beforeDate
      ? await prisma.voiceoverScript.deleteMany({ where: { createdAt: { lt: beforeDate } } })
      : await prisma.voiceoverScript.deleteMany({})
    console.log(`✅ ${deletedScripts.count} seslendirme metni silindi`)

    console.log('📋 Görevler siliniyor...')
    const deletedTasks = beforeDate
      ? await prisma.task.deleteMany({ where: { createdAt: { lt: beforeDate } } })
      : await prisma.task.deleteMany({})
    console.log(`✅ ${deletedTasks.count} görev silindi`)

    console.log('🌐 Dış yayınlar siliniyor...')
    const deletedExternalStreams = beforeDate
      ? await prisma.externalStream.deleteMany({ where: { createdAt: { lt: beforeDate } } })
      : await prisma.externalStream.deleteMany({})
    console.log(`✅ ${deletedExternalStreams.count} dış yayın silindi`)

    console.log('📊 Sosyal medya istatistikleri siliniyor...')
    const deletedSocialMedia = beforeDate
      ? await prisma.socialMediaStats.deleteMany({ where: { createdAt: { lt: beforeDate } } })
      : await prisma.socialMediaStats.deleteMany({})
    console.log(`✅ ${deletedSocialMedia.count} sosyal medya kaydı silindi`)

    // 2. İçerikleri sil (opsiyonel - yorum satırını kaldırarak aktif edebilirsiniz)
    // console.log('📝 İçerikler siliniyor...')
    // const deletedContent = await prisma.content.deleteMany(whereClause)
    // console.log(`✅ ${deletedContent.count} içerik silindi`)

    // 3. Eğer tüm kayıtlar siliniyorsa, kullanıcıları da kontrol et
    if (!beforeDate) {
      console.log('\n⚠️  Kullanıcı verileri korunuyor:')
      console.log('   - Yayıncılar (Streamer)')
      console.log('   - İçerik Üreticileri (ContentCreator)')
      console.log('   - Seslendirmenler (VoiceActor)')
      console.log('   - Ekip Üyeleri (TeamMember)')
      console.log('   - Admin Kullanıcıları (User)')
    }

    console.log('\n✨ Temizleme tamamlandı!')
    console.log('\n📋 Özet:')
    console.log(`   - ${deletedStreams.count} yayın`)
    console.log(`   - ${deletedPayments.count} ödeme`)
    console.log(`   - ${deletedTeamPayments.count} ekip ödemesi`)
    console.log(`   - ${deletedFinancialRecords.count} finansal kayıt`)
    console.log(`   - ${deletedScripts.count} seslendirme metni`)
    console.log(`   - ${deletedTasks.count} görev`)
    console.log(`   - ${deletedExternalStreams.count} dış yayın`)
    console.log(`   - ${deletedSocialMedia.count} sosyal medya kaydı`)

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

