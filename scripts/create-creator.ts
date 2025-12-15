import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  const password = process.argv[3]
  const name = process.argv[4]

  if (!email || !password || !name) {
    console.error('❌ Kullanım: npm run create-creator <email> <şifre> <isim>')
    console.error('Örnek: npm run create-creator tugi@hotmail.com tugi123 Tugi')
    process.exit(1)
  }

  console.log('📝 Creator oluşturuluyor...')
  console.log(`📧 Email: ${email}`)
  console.log(`🔐 Şifre: ${password}`)
  console.log(`👤 İsim: ${name}`)

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
    console.log(`   Mevcut ID: ${existingCreator.id}`)
    console.log(`   Mevcut İsim: ${existingCreator.name}`)
    
    const updated = await prisma.contentCreator.update({
      where: { id: existingCreator.id },
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        isActive: true,
      },
    })
    console.log('\n✅ Creator güncellendi!')
    console.log(`   ID: ${updated.id}`)
    console.log(`   Email: ${updated.email}`)
    console.log(`   İsim: ${updated.name}`)
    console.log(`   Şifre: Hash'lenmiş (${hashedPassword.substring(0, 20)}...)`)
    console.log(`   Aktif: ${updated.isActive ? 'Evet' : 'Hayır'}`)
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
    console.log(`   ID: ${creator.id}`)
    console.log(`   Email: ${creator.email}`)
    console.log(`   İsim: ${creator.name}`)
    console.log(`   Şifre: Hash'lenmiş (${hashedPassword.substring(0, 20)}...)`)
    console.log(`   Aktif: ${creator.isActive ? 'Evet' : 'Hayır'}`)
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
    console.log(`   Şifre var: ${testCreator.password ? 'Evet ✅' : 'HAYIR ❌'}`)
    console.log('\n🎉 Creator başarıyla oluşturuldu ve giriş yapabilir!')
    console.log(`   Giriş URL: /creator-login`)
    console.log(`   Email: ${testCreator.email}`)
    console.log(`   Şifre: ${password}`)
  } else {
    console.log('❌ Creator veritabanında bulunamadı!')
    console.log('   Lütfen tekrar deneyin veya admin ile iletişime geçin.')
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

