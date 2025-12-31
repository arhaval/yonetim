import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Prisma Client'ı yeniden generate et
    console.log('Prisma Client generating...')
    
    // Manuel olarak notes sütununu eklemek için raw SQL kullan
    console.log('Adding notes column to Todo table...')
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Todo" 
      ADD COLUMN IF NOT EXISTS "notes" TEXT;
    `)
    
    console.log('✅ Notes column added successfully!')
  } catch (error: any) {
    // Eğer sütun zaten varsa hata vermez (IF NOT EXISTS sayesinde)
    if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
      console.log('✅ Notes column already exists, skipping...')
    } else {
      console.error('❌ Error:', error.message)
      throw error
    }
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })

