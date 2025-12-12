import { PrismaClient } from '@prisma/client'
import { verifyPassword, getContentCreatorByEmail } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('=== Creator Login Test ===\n')

  // 1. Tüm creator'ları listele
  console.log('1. Veritabanındaki tüm creator\'lar:')
  const allCreators = await prisma.contentCreator.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      isActive: true,
    },
  })
  
  if (allCreators.length === 0) {
    console.log('   ❌ Hiç creator yok! Önce bir creator oluşturun.\n')
    return
  }

  allCreators.forEach((c, i) => {
    console.log(`   ${i + 1}. ${c.name}`)
    console.log(`      Email: ${c.email || '(yok)'}`)
    console.log(`      Şifre: ${c.password ? 'Var' : 'YOK'}`)
    console.log(`      Aktif: ${c.isActive ? 'Evet' : 'Hayır'}`)
    console.log(`      ID: ${c.id}`)
    console.log('')
  })

  // 2. Test email'i ile arama yap
  const testEmail = 'tugi@hotmail.com'
  console.log(`2. "${testEmail}" ile arama yapılıyor...`)
  
  const normalizedEmail = testEmail.toLowerCase().trim()
  console.log(`   Normalize edilmiş email: "${normalizedEmail}"`)
  
  const creator = await getContentCreatorByEmail(normalizedEmail)
  
  if (!creator) {
    console.log('   ❌ Creator bulunamadı!')
    console.log('   Tüm email\'ler:')
    allCreators.forEach(c => {
      if (c.email) {
        console.log(`      - "${c.email}" (normalize: "${c.email.toLowerCase().trim()}")`)
      }
    })
    return
  }

  console.log(`   ✅ Creator bulundu: ${creator.name}`)
  console.log(`   Email: ${creator.email}`)
  console.log(`   Şifre var: ${creator.password ? 'Evet' : 'HAYIR'}`)
  console.log(`   Aktif: ${creator.isActive ? 'Evet' : 'Hayır'}`)

  // 3. Şifre kontrolü
  if (!creator.password) {
    console.log('\n   ❌ Creator\'ın şifresi yok! Şifre ayarlanmalı.')
    return
  }

  const testPassword = 'tugi123'
  console.log(`\n3. Şifre kontrolü yapılıyor: "${testPassword}"`)
  
  const isValid = await verifyPassword(testPassword, creator.password)
  
  if (isValid) {
    console.log('   ✅ Şifre doğru!')
    console.log('\n✅ Login başarılı olmalı!')
  } else {
    console.log('   ❌ Şifre yanlış!')
    console.log(`   Hash'lenmiş şifre: ${creator.password.substring(0, 20)}...`)
  }

  // 4. Manuel email kontrolü
  console.log('\n4. Manuel email kontrolü:')
  const exactMatch = await prisma.contentCreator.findUnique({
    where: { email: normalizedEmail },
  })
  console.log(`   Exact match: ${exactMatch ? 'Bulundu' : 'Bulunamadı'}`)
  
  const allWithEmail = await prisma.contentCreator.findMany({
    where: { email: { not: null } },
  })
  console.log(`   Email'i olan creator sayısı: ${allWithEmail.length}`)
  
  const foundInArray = allWithEmail.find(
    c => c.email && c.email.toLowerCase().trim() === normalizedEmail
  )
  console.log(`   Array'de bulundu: ${foundInArray ? 'Evet' : 'Hayır'}`)
}

main()
  .catch((e) => {
    console.error('Hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

