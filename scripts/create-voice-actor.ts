import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2] || 'seslendirmen@example.com'
  const password = process.argv[3] || 'seslendirmen123'
  const name = process.argv[4] || 'Seslendirmen'

  console.log('Seslendirmen oluşturuluyor...')
  console.log(`Email: ${email}`)
  console.log(`Şifre: ${password}`)
  console.log(`İsim: ${name}`)

  // Email'i normalize et
  const normalizedEmail = email.toLowerCase().trim()

  // Şifreyi hash'le
  const hashedPassword = await hashPassword(password)

  // Mevcut seslendirmen var mı kontrol et
  const existingVoiceActors = await prisma.voiceActor.findMany({
    where: { email: { not: null } },
  })

  const existingVoiceActor = existingVoiceActors.find(
    va => va.email && va.email.toLowerCase().trim() === normalizedEmail
  )

  if (existingVoiceActor) {
    console.log('\n⚠️  Bu email ile zaten bir seslendirmen var. Güncelleniyor...')
    const updated = await prisma.voiceActor.update({
      where: { id: existingVoiceActor.id },
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        isActive: true,
      },
    })
    console.log('✅ Seslendirmen güncellendi!')
    console.log(`ID: ${updated.id}`)
    console.log(`Email: ${updated.email}`)
    console.log(`Şifre: Hash'lenmiş (${hashedPassword.substring(0, 20)}...)`)
  } else {
    const voiceActor = await prisma.voiceActor.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        isActive: true,
      },
    })

    console.log('\n✅ Seslendirmen oluşturuldu!')
    console.log(`ID: ${voiceActor.id}`)
    console.log(`Email: ${voiceActor.email}`)
    console.log(`Şifre: Hash'lenmiş (${hashedPassword.substring(0, 20)}...)`)
  }

  // Test et
  console.log('\n🔍 Test ediliyor...')
  const testVoiceActor = await prisma.voiceActor.findUnique({
    where: { email: normalizedEmail },
  })

  if (testVoiceActor) {
    console.log('✅ Seslendirmen veritabanında bulundu!')
    console.log(`   İsim: ${testVoiceActor.name}`)
    console.log(`   Email: ${testVoiceActor.email}`)
    console.log(`   Aktif: ${testVoiceActor.isActive}`)
    console.log(`   Şifre var: ${testVoiceActor.password ? 'Evet' : 'HAYIR'}`)
    console.log('\n📝 Giriş bilgileri:')
    console.log(`   URL: /voice-actor-login`)
    console.log(`   Email: ${testVoiceActor.email}`)
    console.log(`   Şifre: ${password}`)
  } else {
    console.log('❌ Seslendirmen veritabanında bulunamadı!')
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

