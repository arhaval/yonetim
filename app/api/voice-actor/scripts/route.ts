import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { getVoiceoverScriptLastActivityAt } from '@/lib/lastActivityAt'

export const dynamic = 'force-dynamic'

// Seslendirmenin görebileceği tüm seslendirme metinlerini getir
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const voiceActorId = cookieStore.get('voice-actor-id')?.value

    if (!voiceActorId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    // Tüm metinleri getir (henüz atanmamış veya bu seslendirmene atanmış)
    const scripts = await prisma.voiceoverScript.findMany({
      where: {
        OR: [
          { voiceActorId: null }, // Henüz atanmamış
          { voiceActorId: voiceActorId }, // Bu seslendirmene atanmış
        ],
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        voiceActor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' }, // Eski → Yeni sıralama
    })

    // lastActivityAt'e göre sıralama
    const scriptsWithLastActivity = scripts.map(script => ({
      ...script,
      lastActivityAt: getVoiceoverScriptLastActivityAt(script),
    }))
    
    scriptsWithLastActivity.sort((a, b) => {
      return b.lastActivityAt.getTime() - a.lastActivityAt.getTime() // DESC
    })
    
    // Dashboard'un beklediği formata dönüştür
    const formattedScripts = scriptsWithLastActivity.map(({ lastActivityAt, ...script }) => ({
      ...script,
      voicePrice: script.price || 0,
      voicePaid: script.adminApproved && script.producerApproved, // Her iki onay da varsa ödendi sayılır
    }))

    return NextResponse.json(formattedScripts)
  } catch (error) {
    console.error('Error fetching scripts:', error)
    return NextResponse.json(
      { error: 'Metinler getirilemedi' },
      { status: 500 }
    )
  }
}

