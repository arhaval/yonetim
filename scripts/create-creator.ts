import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2] || 'tugi@hotmail.com'
  const password = process.argv[3] || 'tugi123'
  const name = process.argv[4] || 'Tugi'

  console.log('Creator oluşturuluyor...')
  console.log(`Email: ${email}`)
  console.log(`Şifre: ${password}`)
  console.log(`İsim: ${name}`)

  // Email'i normalize et
  const normalizedEmail = email.toLowerCase().trim()

  // Şifreyi hash'le
  const hashedPassword = await hashPassword(password)

  // Mevcut creator var mı kontrol et
  const existingCreators = await prisma.contentCreator.findMany({
    where: { email: { not: null } },
  })

  const existingCreator = existingCreators.find(
    c => c.email && c.email.toLowerCase().trim() === normalizedEmail
  )

  if (existingCreator) {
    console.log('\n⚠️  Bu email ile zaten bir creator var. Güncelleniyor...')
    const updated = await prisma.contentCreator.update({
      where: { id: existingCreator.id },
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        isActive: true,
      },
    })
    console.log('✅ Creator güncellendi!')
    console.log(`ID: ${updated.id}`)
    console.log(`Email: ${updated.email}`)
    console.log(`Şifre: Hash'lenmiş (${hashedPassword.substring(0, 20)}...)`)
  } else {
    const creator = await prisma.contentCreator.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        isActive: true,
      },
    })

    console.log('\n✅ Creator oluşturuldu!')
    console.log(`ID: ${creator.id}`)
    console.log(`Email: ${creator.email}`)
    console.log(`Şifre: Hash'lenmiş (${hashedPassword.substring(0, 20)}...)`)
  }

  // Test et
  console.log('\n🔍 Test ediliyor...')
  const testCreator = await prisma.contentCreator.findUnique({
    where: { email: normalizedEmail },
  })

  if (testCreator) {
    console.log('✅ Creator veritabanında bulundu!')
    console.log(`   İsim: ${testCreator.name}`)
    console.log(`   Email: ${testCreator.email}`)
    console.log(`   Aktif: ${testCreator.isActive}`)
    console.log(`   Şifre var: ${testCreator.password ? 'Evet' : 'HAYIR'}`)
  } else {
    console.log('❌ Creator veritabanında bulunamadı!')
  }
}

main()
  .catch((e) => {
    console.error('Hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

