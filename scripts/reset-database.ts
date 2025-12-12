import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Veritabanı temizleniyor...')

  // İlişkili kayıtları önce sil (foreign key constraint'leri için)
  await prisma.voiceoverScript.deleteMany({})
  console.log('✓ Seslendirme metinleri silindi')

  await prisma.content.deleteMany({})
  console.log('✓ İçerikler silindi')

  await prisma.payment.deleteMany({})
  console.log('✓ Ödemeler silindi')

  await prisma.teamPayment.deleteMany({})
  console.log('✓ Ekip ödemeleri silindi')

  await prisma.task.deleteMany({})
  console.log('✓ Görevler silindi')

  await prisma.stream.deleteMany({})
  console.log('✓ Yayınlar silindi')

  await prisma.externalStream.deleteMany({})
  console.log('✓ Dış yayınlar silindi')

  await prisma.financialRecord.deleteMany({})
  console.log('✓ Finansal kayıtlar silindi')

  await prisma.streamerTeamRate.deleteMany({})
  console.log('✓ Takım ücretleri silindi')

  // Ana tabloları temizle
  await prisma.contentCreator.deleteMany({})
  console.log('✓ İçerik üreticileri silindi')

  await prisma.voiceActor.deleteMany({})
  console.log('✓ Seslendirmenler silindi')

  await prisma.teamMember.deleteMany({})
  console.log('✓ Ekip üyeleri silindi')

  await prisma.streamer.deleteMany({})
  console.log('✓ Yayıncılar silindi')

  // User tablosunu temizleme (admin kullanıcıları korumak için)
  // Eğer admin kullanıcılarını da silmek isterseniz aşağıdaki satırı açın:
  // await prisma.user.deleteMany({})
  // console.log('✓ Kullanıcılar silindi')

  console.log('\n✅ Veritabanı başarıyla temizlendi!')
  console.log('Artık sıfırdan başlayabilirsiniz.')
}

main()
  .catch((e) => {
    console.error('Hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

