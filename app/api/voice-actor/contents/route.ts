import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Seslendirmenin atandığı scriptlerin creator'larının içeriklerini getir
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

    // Seslendirmenin atandığı scriptleri getir
    const scripts = await prisma.voiceoverScript.findMany({
      where: {
        voiceActorId: voiceActorId,
      },
      select: {
        creatorId: true,
      },
    })

    // Unique creator ID'leri al
    const creatorIds = [...new Set(scripts.map(s => s.creatorId).filter(Boolean))]

    if (creatorIds.length === 0) {
      return NextResponse.json([])
    }

    // Bu creator'ların içeriklerini getir
    const contents = await prisma.content.findMany({
      where: {
        creatorId: {
          in: creatorIds,
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { publishDate: 'desc' },
    })

    return NextResponse.json(contents)
  } catch (error) {
    console.error('Error fetching voice actor contents:', error)
    return NextResponse.json(
      { error: 'İçerikler getirilemedi' },
      { status: 500 }
    )
  }
}

