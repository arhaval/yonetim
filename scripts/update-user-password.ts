import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  const password = process.argv[3]

  if (!email || !password) {
    console.error('Kullanım: tsx scripts/update-user-password.ts <email> <password>')
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  // Önce kullanıcıyı bul
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (!existingUser) {
    console.error(`Kullanıcı bulunamadı: ${email}`)
    process.exit(1)
  }

  // Şifreyi güncelle
  const user = await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
    },
  })

  console.log(`✅ Kullanıcı şifresi güncellendi: ${user.email}`)
  console.log(`   Email: ${user.email}`)
  console.log(`   İsim: ${user.name}`)
  console.log(`   Rol: ${user.role}`)
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

