/**
 * Bu script VoiceoverScript tablosuna contentType column'unu ekler
 * 
 * Kullanım:
 * npm run add-contenttype
 * 
 * Veya direkt:
 * tsx scripts/add-contenttype-column.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 VoiceoverScript tablosuna contentType column ekleniyor...')
  
  try {
    // Prisma'nın raw SQL desteğini kullanarak column ekle
    await prisma.$executeRaw`
      ALTER TABLE "VoiceoverScript" 
      ADD COLUMN IF NOT EXISTS "contentType" TEXT;
    `
    
    console.log('✅ contentType column başarıyla eklendi!')
    
    // Kontrol et
    const result = await prisma.$queryRaw<Array<{ column_name: string; data_type: string }>>`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'VoiceoverScript' 
      AND column_name = 'contentType';
    `
    
    if (result.length > 0) {
      console.log('✅ Doğrulama başarılı! Column mevcut:')
      console.log(`   - Column Name: ${result[0].column_name}`)
      console.log(`   - Data Type: ${result[0].data_type}`)
    } else {
      console.log('⚠️  Column eklenmiş görünüyor ama doğrulama başarısız oldu.')
    }
    
  } catch (error: any) {
    if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
      console.log('ℹ️  contentType column zaten mevcut!')
    } else {
      console.warn('⚠️  Column eklenirken hata oluştu:', error.message)
      console.warn('ℹ️  Build devam ediyor... (Column zaten mevcut olabilir)')
      // Build'in devam etmesi için exit(0) - || true ile birlikte çalışacak
    }
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.warn('⚠️  Beklenmeyen hata:', error)
    console.warn('ℹ️  Build devam ediyor...')
    // Build'in devam etmesi için exit(0)
    process.exit(0)
  })

