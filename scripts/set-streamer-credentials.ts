import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const name = process.argv[2]
  const email = process.argv[3]
  const password = process.argv[4]

  if (!name || !email || !password) {
    console.error('Kullanım: npx ts-node scripts/set-streamer-credentials.ts <isim> <email> <şifre>')
    console.error('Örnek: npx ts-node scripts/set-streamer-credentials.ts "Aytekin Uçar" aytekin@hotmail.com aytekin123')
    process.exit(1)
  }

  try {
    // Email'i normalize et
    const normalizedEmail = email.toLowerCase().trim()

    // Yayıncıyı bul (isim ile - case-insensitive)
    const allStreamers = await prisma.streamer.findMany()
    const streamer = allStreamers.find(s => 
      s.name.toLowerCase().includes(name.toLowerCase())
    )

    if (!streamer) {
      console.error(`❌ Yayıncı bulunamadı: ${name}`)
      console.log('\nMevcut yayıncılar:')
      const allStreamers = await prisma.streamer.findMany({
        select: { id: true, name: true, email: true },
      })
      allStreamers.forEach(s => {
        console.log(`  - ${s.name} (${s.email || 'email yok'})`)
      })
      process.exit(1)
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 10)

    // Email ve şifreyi güncelle
    const updated = await prisma.streamer.update({
      where: { id: streamer.id },
      data: {
        email: normalizedEmail,
        password: hashedPassword,
      },
    })

    console.log(`✅ Başarılı!`)
    console.log(`   Yayıncı: ${updated.name}`)
    console.log(`   Email: ${updated.email}`)
    console.log(`   Şifre: ${password} (hash'lendi)`)
    console.log(`\n   Giriş yapmak için: /streamer-login`)
  } catch (error: any) {
    console.error('❌ Hata:', error.message)
    if (error.code === 'P2002') {
      console.error('   Bu email adresi zaten başka bir yayıncı tarafından kullanılıyor.')
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

