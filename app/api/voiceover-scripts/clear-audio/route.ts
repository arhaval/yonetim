import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Tüm ses dosyalarını temizle (sadece admin)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    // Admin kontrolü
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      )
    }

    // Tüm script'leri getir (null olmayan ve boş string olmayan)
    const allScripts = await prisma.voiceoverScript.findMany({
      select: {
        id: true,
        audioFile: true,
      },
    })

    // audioFile'ı null olmayan ve boş string olmayan script'leri filtrele
    const scriptsWithAudio = allScripts.filter(
      (script) => script.audioFile !== null && script.audioFile !== undefined && script.audioFile.trim() !== ''
    )

    console.log(`Found ${scriptsWithAudio.length} scripts with audio files out of ${allScripts.length} total`)

    if (scriptsWithAudio.length === 0) {
      return NextResponse.json({
        message: 'Temizlenecek ses dosyası bulunamadı',
        count: 0,
      })
    }

    // Tüm ses dosyalarını tek seferde temizle (updateMany kullanarak)
    const scriptIds = scriptsWithAudio.map(s => s.id)
    
    const result = await prisma.voiceoverScript.updateMany({
      where: {
        id: {
          in: scriptIds,
        },
      },
      data: {
        audioFile: null,
      },
    })

    console.log(`Successfully cleared ${result.count} audio files`)

    console.log(`Cleared ${result.count} audio files`)

    return NextResponse.json({
      message: `${result.count} ses dosyası temizlendi`,
      count: result.count,
    })
  } catch (error: any) {
    console.error('Error clearing audio files:', error)
    return NextResponse.json(
      { error: error.message || 'Ses dosyaları temizlenemedi' },
      { status: 500 }
    )
  }
}

