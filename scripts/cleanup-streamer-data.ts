import { prisma } from '../lib/prisma'

/**
 * Yayıncının eski kayıtlarını temizleme scripti
 * Yayıncı korunur, sadece yayınlar, ödemeler vb. silinir
 * 
 * Kullanım:
 * npm run cleanup-streamer-data
 * 
 * Belirli bir tarihten önceki kayıtları silmek için:
 * npm run cleanup-streamer-data -- --before=2024-01-01
 */

async function main() {
  const args = process.argv.slice(2)
  const beforeDateArg = args.find(arg => arg.startsWith('--before='))
  const beforeDate = beforeDateArg ? new Date(beforeDateArg.split('=')[1]) : null

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
    console.log('')
  })

  if (beforeDate) {
    console.log(`📅 ${beforeDate.toISOString().split('T')[0]} tarihinden önceki kayıtlar silinecek\n`)
  } else {
    console.log('⚠️  Tüm yayıncı kayıtları (yayınlar, ödemeler) silinecek\n')
    console.log('✅ Yayıncılar korunacak!\n')
  }

  try {
    const whereClause = beforeDate 
      ? { createdAt: { lt: beforeDate } }
      : {}

    let totalDeleted = {
      streams: 0,
      payments: 0,
      financialRecords: 0,
      teamRates: 0,
    }

    // Her yayıncı için kayıtları temizle
    for (const streamer of allStreamers) {
      console.log(`🧹 ${streamer.name} için kayıtlar temizleniyor...`)

      // Yayınları sil
      const streamWhere = beforeDate
        ? { streamerId: streamer.id, createdAt: { lt: beforeDate } }
        : { streamerId: streamer.id }
      
      const deletedStreams = await prisma.stream.deleteMany(streamWhere)
      totalDeleted.streams += deletedStreams.count
      if (deletedStreams.count > 0) {
        console.log(`   ✓ ${deletedStreams.count} yayın silindi`)
      }

      // Ödemeleri sil
      const paymentWhere = beforeDate
        ? { streamerId: streamer.id, createdAt: { lt: beforeDate } }
        : { streamerId: streamer.id }
      
      const deletedPayments = await prisma.payment.deleteMany(paymentWhere)
      totalDeleted.payments += deletedPayments.count
      if (deletedPayments.count > 0) {
        console.log(`   ✓ ${deletedPayments.count} ödeme silindi`)
      }

      // Finansal kayıtları sil
      const financialWhere = beforeDate
        ? { streamerId: streamer.id, createdAt: { lt: beforeDate } }
        : { streamerId: streamer.id }
      
      const deletedFinancial = await prisma.financialRecord.deleteMany(financialWhere)
      totalDeleted.financialRecords += deletedFinancial.count
      if (deletedFinancial.count > 0) {
        console.log(`   ✓ ${deletedFinancial.count} finansal kayıt silindi`)
      }

      // Takım ücretlerini sil (eğer tarih filtresi varsa)
      if (beforeDate) {
        const deletedRates = await prisma.streamerTeamRate.deleteMany({
          where: { streamerId: streamer.id, createdAt: { lt: beforeDate } },
        })
        totalDeleted.teamRates += deletedRates.count
        if (deletedRates.count > 0) {
          console.log(`   ✓ ${deletedRates.count} takım ücreti silindi`)
        }
      }

      console.log(`   ✅ ${streamer.name} için temizleme tamamlandı\n`)
    }

    console.log('✨ Temizleme tamamlandı!')
    console.log('\n📊 Özet:')
    console.log(`   ✅ Yayıncılar korundu: ${allStreamers.length}`)
    console.log(`   🗑️  Silinen kayıtlar:`)
    console.log(`      - ${totalDeleted.streams} yayın`)
    console.log(`      - ${totalDeleted.payments} ödeme`)
    console.log(`      - ${totalDeleted.financialRecords} finansal kayıt`)
    if (beforeDate) {
      console.log(`      - ${totalDeleted.teamRates} takım ücreti`)
    }

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

