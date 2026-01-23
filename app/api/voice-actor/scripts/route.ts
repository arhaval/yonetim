import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Seslendirmenin kendi işlerini getir
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

    // ContentRegistry'den seslendirme işlerini getir
    const works = await prisma.contentRegistry.findMany({
      where: {
        voiceActorId: voiceActorId,
      },
      include: {
        voiceActor: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Dashboard'un beklediği formata dönüştür
    const formattedWorks = works.map(work => ({
      id: work.id,
      title: work.title,
      description: work.description,
      contentType: work.contentType,
      voicePrice: work.voicePrice || 0,
      voicePaid: work.voicePaid || false,
      status: work.status,
      createdAt: work.createdAt.toISOString(),
    }))

    return NextResponse.json(formattedWorks)
  } catch (error) {
    console.error('Error fetching voice actor works:', error)
    return NextResponse.json(
      { error: 'İşler getirilemedi' },
      { status: 500 }
    )
  }
}
