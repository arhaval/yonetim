import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const scriptId = 'cmj7o0mug0001yz755sc1ou35'
  
  try {
    // Önce metni kontrol et
    const script = await prisma.voiceoverScript.findUnique({
      where: { id: scriptId },
    })

    if (!script) {
      console.log('Metin bulunamadı')
      return
    }

    console.log('Silinecek metin:', script.title)

    // Metni sil
    await prisma.voiceoverScript.delete({
      where: { id: scriptId },
    })

    console.log('Metin başarıyla silindi')
  } catch (error) {
    console.error('Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

