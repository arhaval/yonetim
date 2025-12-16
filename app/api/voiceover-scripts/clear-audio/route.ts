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

    // Önce tüm script'leri getir ve audioFile'ı olanları bul
    const allScripts = await prisma.voiceoverScript.findMany({
      select: {
        id: true,
        audioFile: true,
      },
    })

    // audioFile'ı null olmayan ve boş string olmayan script'leri filtrele
    const scriptsWithAudio = allScripts.filter(
      (script) => script.audioFile && script.audioFile.trim() !== ''
    )

    console.log(`Found ${scriptsWithAudio.length} scripts with audio files out of ${allScripts.length} total`)

    // Her bir script'i güncelle
    let clearedCount = 0
    for (const script of scriptsWithAudio) {
      try {
        await prisma.voiceoverScript.update({
          where: { id: script.id },
          data: { audioFile: null },
        })
        clearedCount++
      } catch (error) {
        console.error(`Error clearing audio for script ${script.id}:`, error)
      }
    }

    console.log(`Cleared ${clearedCount} audio files`)

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

