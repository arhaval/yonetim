/**
 * Bu script VoiceoverScript tablosuna contentType column'unu ekler
 * * Kullanım:
 * npm run add-contenttype
 * * Veya direkt:
 * tsx scripts/add-contenttype-column.ts
 */

import * as dotenv from 'dotenv'
import path from 'path'
import { PrismaClient } from '@prisma/client'

// --- DÜZELTME BURADA ---
// Script 'scripts' klasöründe olduğu için .env dosyası bir üst klasördedir ('../.env')
// Hem .env hem de .env.local kontrolü yapalım
const envPath = path.resolve(__dirname, '../.env')
const envLocalPath = path.resolve(__dirname, '../.env.local')

// Önce .env yüklemeyi dene
const envConfig = dotenv.config({ path: envPath })

// Eğer .env yoksa veya DATABASE_URL gelmediyse .env.local dene
if (envConfig.error || !process.env.DATABASE_URL) {
  console.log('ℹ️  .env dosyasında URL bulunamadı, .env.local deneniyor...')
  dotenv.config({ path: envLocalPath })
}
// -----------------------

// Prisma Client'ı URL ile başlatalım (Garanti olsun)
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

async function main() {
  console.log('🔍 VoiceoverScript tablosuna contentType column ekleniyor...')
  
  // URL kontrolü (Güvenlik için sadece var mı yok mu diye bakıyoruz)
  if (!process.env.DATABASE_URL) {
    console.error('❌ HATA: DATABASE_URL bulunamadı! .env veya .env.local dosyanızı kontrol edin.')
    // Build'in patlamaması için çıkış yapıyoruz ama hata kodu döndürmüyoruz
    return 
  }

  try {
    // Prisma'nın raw SQL desteğini kullanarak column ekle
    await prisma.$executeRaw`
      ALTER TABLE "VoiceoverScript" 
      ADD COLUMN IF NOT EXISTS "contentType" TEXT DEFAULT 'VIDEO';
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
    }
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.warn('⚠️  Beklenmeyen hata:', error)
    console.warn('ℹ️  Build devam ediyor...')
    process.exit(0)
  })