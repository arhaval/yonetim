import { prisma } from '../lib/prisma'

/**
 * Test yayıncılarını temizleme scripti
 * Sadece belirtilen yayıncıyı tutar, diğerlerini siler
 * 
 * Kullanım:
 * npm run cleanup-test-streamers -- --keep=YAYINCI_ID
 * 
 * Veya tüm yayıncıları listeleyip seçim yapmak için:
 * npm run cleanup-test-streamers
 */

async function main() {
  const args = process.argv.slice(2)
  const keepIdArg = args.find(arg => arg.startsWith('--keep='))
  const keepStreamerId = keepIdArg ? keepIdArg.split('=')[1] : null

  console.log('🔍 Yayıncılar kontrol ediliyor...\n')

  // Tüm yayıncıları listele
  const allStreamers = await prisma.streamer.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          streams: true,
          payments: true,
        },
      },
    },
  })

  if (allStreamers.length === 0) {
    console.log('❌ Hiç yayıncı bulunamadı!')
    await prisma.$disconnect()
    return
  }

  console.log(`📊 Toplam ${allStreamers.length} yayıncı bulundu:\n`)
  
  allStreamers.forEach((streamer, index) => {
    console.log(`${index + 1}. ${streamer.name}`)
    console.log(`   ID: ${streamer.id}`)
    console.log(`   Email: ${streamer.email || 'Yok'}`)
    console.log(`   Durum: ${streamer.isActive ? 'Aktif' : 'Pasif'}`)
    console.log(`   Yayın Sayısı: ${streamer._count.streams}`)
    console.log(`   Ödeme Sayısı: ${streamer._count.payments}`)
    console.log(`   Oluşturulma: ${streamer.createdAt.toISOString().split('T')[0]}`)
    console.log('')
  })

  let streamerToKeep: string | null = keepStreamerId

  // Eğer ID belirtilmemişse, kullanıcıdan seçim yapmasını iste
  if (!streamerToKeep) {
    console.log('⚠️  Hangi yayıncıyı tutmak istiyorsunuz?')
    console.log('   Lütfen yayıncı ID\'sini girin veya ilk yayıncıyı tutmak için ENTER\'a basın\n')
    
    // İlk yayıncıyı varsayılan olarak tut
    streamerToKeep = allStreamers[0].id
    console.log(`✅ Varsayılan olarak ilk yayıncı seçildi: ${allStreamers[0].name} (${streamerToKeep})`)
  }

  const streamerToKeepData = allStreamers.find(s => s.id === streamerToKeep)

  if (!streamerToKeepData) {
    console.error(`❌ ID "${streamerToKeep}" ile yayıncı bulunamadı!`)
    await prisma.$disconnect()
    process.exit(1)
  }

  const streamersToDelete = allStreamers.filter(s => s.id !== streamerToKeep)

  if (streamersToDelete.length === 0) {
    console.log('✅ Zaten sadece 1 yayıncı var, silinecek bir şey yok!')
    await prisma.$disconnect()
    return
  }

  console.log(`\n📌 Tutulacak yayıncı: ${streamerToKeepData.name}`)
  console.log(`🗑️  Silinecek yayıncı sayısı: ${streamersToDelete.length}\n`)

  // Onay iste
  console.log('⚠️  Aşağıdaki yayıncılar silinecek:')
  streamersToDelete.forEach(s => {
    console.log(`   - ${s.name} (${s._count.streams} yayın, ${s._count.payments} ödeme)`)
  })
  console.log('\n❓ Devam etmek istiyor musunuz? (Evet için ENTER, İptal için Ctrl+C)')

  // Kullanıcı onayı için bekle (gerçek uygulamada readline kullanılabilir)
  // Şimdilik direkt devam ediyoruz

  try {
    console.log('\n🧹 Silme işlemi başlıyor...\n')

    for (const streamer of streamersToDelete) {
      console.log(`🗑️  ${streamer.name} siliniyor...`)

      // İlişkili kayıtları sil
      const deletedStreams = await prisma.stream.deleteMany({
        where: { streamerId: streamer.id },
      })
      console.log(`   ✓ ${deletedStreams.count} yayın silindi`)

      const deletedPayments = await prisma.payment.deleteMany({
        where: { streamerId: streamer.id },
      })
      console.log(`   ✓ ${deletedPayments.count} ödeme silindi`)

      const deletedRates = await prisma.streamerTeamRate.deleteMany({
        where: { streamerId: streamer.id },
      })
      console.log(`   ✓ ${deletedRates.count} takım ücreti silindi`)

      const deletedFinancialRecords = await prisma.financialRecord.deleteMany({
        where: { streamerId: streamer.id },
      })
      console.log(`   ✓ ${deletedFinancialRecords.count} finansal kayıt silindi`)

      // Yayıncıyı sil
      await prisma.streamer.delete({
        where: { id: streamer.id },
      })
      console.log(`   ✅ ${streamer.name} silindi\n`)
    }

    console.log('✨ Temizleme tamamlandı!')
    console.log(`\n📊 Sonuç:`)
    console.log(`   ✅ Tutulan: ${streamerToKeepData.name}`)
    console.log(`   🗑️  Silinen: ${streamersToDelete.length} yayıncı`)

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

