import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seslendirme metinlerindeki ses dosyaları temizleniyor...')
  
  const result = await prisma.voiceoverScript.updateMany({
    where: {
      audioFile: {
        not: null,
      },
    },
    data: {
      audioFile: null,
    },
  })

  console.log(`${result.count} ses dosyası temizlendi.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

