import { prisma } from '../lib/prisma'

async function main() {
  const streamerName = 'Aytekin Uçar' // veya 'aytekin uçar'
  
  console.log(`🔍 "${streamerName}" adlı yayıncı aranıyor...`)

  try {
    // Önce isimle ara (case-insensitive)
    const streamer = await prisma.streamer.findFirst({
      where: {
        name: {
          contains: streamerName,
          mode: 'insensitive',
        },
      },
      include: {
        streams: true,
        payments: true,
        externalStreams: true,
      },
    })

    if (!streamer) {
      console.log('❌ Yayıncı bulunamadı!')
      console.log('\n📋 Tüm yayıncılar:')
      const allStreamers = await prisma.streamer.findMany({
        select: { id: true, name: true, email: true },
      })
      allStreamers.forEach(s => {
        console.log(`   - ${s.name} (${s.email || 'email yok'})`)
      })
      return
    }

    console.log(`✅ Yayıncı bulundu: ${streamer.name}`)
    console.log(`   - ID: ${streamer.id}`)
    console.log(`   - Email: ${streamer.email || 'yok'}`)
    console.log(`   - Yayın sayısı: ${streamer.streams.length}`)
    console.log(`   - Ödeme sayısı: ${streamer.payments.length}`)
    console.log(`   - Dış yayın sayısı: ${streamer.externalStreams.length}`)

    // Onay iste
    console.log('\n⚠️  Bu yayıncı ve tüm ilişkili verileri silinecek!')
    console.log('   Devam etmek için scripti çalıştırın: npm run delete-streamer -- --confirm')

    // Eğer --confirm flag'i varsa sil
    if (process.argv.includes('--confirm')) {
      console.log('\n🗑️  Siliniyor...')
      
      // İlişkili verileri sil (cascade delete zaten yapıyor ama emin olmak için)
      await prisma.stream.deleteMany({
        where: { streamerId: streamer.id },
      })
      
      await prisma.payment.deleteMany({
        where: { streamerId: streamer.id },
      })
      
      await prisma.externalStream.deleteMany({
        where: { streamerId: streamer.id },
      })
      
      await prisma.financialRecord.deleteMany({
        where: { streamerId: streamer.id },
      })

      // Yayıncıyı sil
      await prisma.streamer.delete({
        where: { id: streamer.id },
      })

      console.log('✅ Yayıncı ve tüm ilişkili veriler başarıyla silindi!')
    } else {
      console.log('\n💡 Silmek için şu komutu çalıştırın:')
      console.log('   npm run delete-streamer -- --confirm')
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

