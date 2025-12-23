import { prisma } from '../lib/prisma'

/**
 * Finansal kayıtları temizleme scripti
 * 
 * Kullanım:
 * npm run cleanup-financial-records
 * 
 * Belirli bir tarihten önceki kayıtları silmek için:
 * npm run cleanup-financial-records -- --before=2024-01-01
 * 
 * Belirli bir açıklama içeren kayıtları silmek için:
 * npm run cleanup-financial-records -- --description=test
 */

async function main() {
  const args = process.argv.slice(2)
  const beforeDateArg = args.find(arg => arg.startsWith('--before='))
  const descriptionArg = args.find(arg => arg.startsWith('--description='))
  
  const beforeDate = beforeDateArg ? new Date(beforeDateArg.split('=')[1]) : null
  const descriptionFilter = descriptionArg ? descriptionArg.split('=')[1].toLowerCase() : null

  console.log('🔍 Finansal kayıtlar kontrol ediliyor...\n')

  // Önce tüm finansal kayıtları listele
  const allRecords = await prisma.financialRecord.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      type: true,
      category: true,
      amount: true,
      description: true,
      occurredAt: true,
      createdAt: true,
      entryType: true,
      direction: true,
      streamerId: true,
      teamMemberId: true,
      contentCreatorId: true,
      voiceActorId: true,
    },
    take: 50, // Son 50 kaydı göster
  })

  if (allRecords.length === 0) {
    console.log('❌ Hiç finansal kayıt bulunamadı!')
    await prisma.$disconnect()
    return
  }

  console.log(`📊 Son ${allRecords.length} finansal kayıt:\n`)
  
  allRecords.forEach((record, index) => {
    const recipient = record.streamerId ? 'Yayıncı' 
      : record.teamMemberId ? 'Ekip Üyesi'
      : record.contentCreatorId ? 'İçerik Üreticisi'
      : record.voiceActorId ? 'Seslendirmen'
      : 'Genel'
    
    console.log(`${index + 1}. ${record.description || 'Açıklama yok'}`)
    console.log(`   Kategori: ${record.category}`)
    console.log(`   Tip: ${record.type} | ${record.entryType} | ${record.direction}`)
    console.log(`   Tutar: ${record.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}`)
    console.log(`   Tarih: ${record.occurredAt.toISOString().split('T')[0]}`)
    console.log(`   Oluşturulma: ${record.createdAt.toISOString().split('T')[0]}`)
    console.log(`   Alıcı: ${recipient}`)
    console.log('')
  })

  // Toplam kayıt sayısı
  const totalCount = await prisma.financialRecord.count()
  console.log(`📊 Toplam ${totalCount} finansal kayıt var\n`)

  // Filtre oluştur
  const whereClause: any = {}
  
  if (beforeDate) {
    whereClause.createdAt = { lt: beforeDate }
    console.log(`📅 ${beforeDate.toISOString().split('T')[0]} tarihinden önceki kayıtlar silinecek\n`)
  }

  if (descriptionFilter) {
    whereClause.description = {
      contains: descriptionFilter,
      mode: 'insensitive',
    }
    console.log(`🔍 "${descriptionFilter}" içeren kayıtlar silinecek\n`)
  }

  // Silinecek kayıtları kontrol et
  const recordsToDelete = await prisma.financialRecord.findMany({
    where: whereClause,
    select: {
      id: true,
      description: true,
      amount: true,
      createdAt: true,
    },
  })

  if (recordsToDelete.length === 0) {
    console.log('✅ Silinecek kayıt bulunamadı!')
    await prisma.$disconnect()
    return
  }

  const totalAmount = recordsToDelete.reduce((sum, r) => sum + r.amount, 0)

  console.log(`⚠️  ${recordsToDelete.length} finansal kayıt silinecek`)
  console.log(`💰 Toplam tutar: ${totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}\n`)

  // İlk 10 kaydı göster
  console.log('📋 Silinecek kayıtlar (ilk 10):')
  recordsToDelete.slice(0, 10).forEach((record, index) => {
    console.log(`   ${index + 1}. ${record.description || 'Açıklama yok'} - ${record.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} (${record.createdAt.toISOString().split('T')[0]})`)
  })
  if (recordsToDelete.length > 10) {
    console.log(`   ... ve ${recordsToDelete.length - 10} kayıt daha`)
  }

  console.log('\n❓ Devam etmek istiyor musunuz? (Evet için ENTER, İptal için Ctrl+C)')

  try {
    // Kısa bir bekleme (gerçek uygulamada readline kullanılabilir)
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log('\n🧹 Silme işlemi başlıyor...\n')

    const result = await prisma.financialRecord.deleteMany({
      where: whereClause,
    })

    console.log(`✅ ${result.count} finansal kayıt başarıyla silindi!`)
    console.log(`💰 Toplam silinen tutar: ${totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}`)

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

