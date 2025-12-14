import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  const password = process.argv[3]
  const name = process.argv[4]
  const phone = process.argv[5] || null
  const iban = process.argv[6] || null
  const platform = process.argv[7] || 'Twitch'
  const hourlyRate = process.argv[8] ? parseFloat(process.argv[8]) : 0

  if (!email || !password || !name) {
    console.error('Kullanım: npm run create-streamer <email> <password> <name> [phone] [iban] [platform] [hourlyRate]')
    console.error('Örnek: npm run create-streamer yayinci@example.com sifre123 "Yayıncı Adı" "5551234567" "TR123456789012345678901234" "Twitch" 300')
    process.exit(1)
  }

  console.log('Yayıncı oluşturuluyor...')
  console.log(`Email: ${email}`)
  console.log(`Şifre: ${password}`)
  console.log(`İsim: ${name}`)
  console.log(`Telefon: ${phone || 'Belirtilmedi'}`)
  console.log(`IBAN: ${iban || 'Belirtilmedi'}`)
  console.log(`Platform: ${platform}`)
  console.log(`Saatlik Ücret: ${hourlyRate}₺`)

  // Email'i normalize et
  const normalizedEmail = email.toLowerCase().trim()

  // Şifreyi hash'le
  const hashedPassword = await hashPassword(password)

  // Mevcut yayıncı var mı kontrol et
  const existingStreamer = await prisma.streamer.findUnique({
    where: { email: normalizedEmail },
  })

  if (existingStreamer) {
    console.log('\n⚠️  Bu email ile zaten bir yayıncı var. Güncelleniyor...')
    const updated = await prisma.streamer.update({
      where: { id: existingStreamer.id },
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || null,
        iban: iban || null,
        platform,
        hourlyRate,
        isActive: true,
      },
    })
    console.log('✅ Yayıncı güncellendi!')
    console.log(`ID: ${updated.id}`)
    console.log(`Email: ${updated.email}`)
    console.log(`Şifre: Hash'lenmiş`)
  } else {
    const streamer = await prisma.streamer.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || null,
        iban: iban || null,
        platform,
        hourlyRate,
        isActive: true,
      },
    })

    console.log('\n✅ Yayıncı oluşturuldu!')
    console.log(`ID: ${streamer.id}`)
    console.log(`Email: ${streamer.email}`)
    console.log(`Şifre: Hash'lenmiş`)
  }

  // Test et
  console.log('\n🔍 Test ediliyor...')
  const testStreamer = await prisma.streamer.findUnique({
    where: { email: normalizedEmail },
  })

  if (testStreamer) {
    console.log('✅ Yayıncı veritabanında bulundu!')
    console.log(`   İsim: ${testStreamer.name}`)
    console.log(`   Email: ${testStreamer.email}`)
    console.log(`   Platform: ${testStreamer.platform}`)
    console.log(`   Saatlik Ücret: ${testStreamer.hourlyRate}₺`)
    console.log(`   Aktif: ${testStreamer.isActive}`)
    console.log(`   Şifre var: ${testStreamer.password ? 'Evet' : 'HAYIR'}`)
    console.log('\n📝 Giriş bilgileri:')
    console.log(`   URL: /streamer-login`)
    console.log(`   Email: ${testStreamer.email}`)
    console.log(`   Şifre: ${password}`)
  } else {
    console.log('❌ Yayıncı veritabanında bulunamadı!')
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

