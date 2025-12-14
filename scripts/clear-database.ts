import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearDatabase() {
  try {
    console.log('Veritabanı temizleniyor...')

    // Tüm tabloları sırayla temizle (foreign key constraint'leri dikkate alarak)
    await prisma.payment.deleteMany()
    await prisma.financialRecord.deleteMany()
    await prisma.externalStream.deleteMany()
    await prisma.stream.deleteMany()
    await prisma.streamerTeamRate.deleteMany()
    await prisma.streamer.deleteMany()
    await prisma.content.deleteMany()
    await prisma.teamPayment.deleteMany()
    await prisma.task.deleteMany()
    await prisma.teamMember.deleteMany()
    await prisma.monthlyPlan.deleteMany()
    await prisma.yearlyGoal.deleteMany()
    await prisma.socialMediaStats.deleteMany()
    // User tablosunu silmiyoruz (giriş için gerekli)

    console.log('✅ Tüm veriler başarıyla silindi!')
    console.log('📝 Veritabanı yapısı korundu, yeni veriler ekleyebilirsiniz.')
  } catch (error) {
    console.error('❌ Hata:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

clearDatabase()








