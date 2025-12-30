import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { getContentLastActivityAt } from '@/lib/lastActivityAt'

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

    // Tüm içerikleri getir (sadece atandığı scriptlerin creator'larının içerikleri değil)
    const contents = await prisma.content.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { publishDate: 'asc' }, // Eski → Yeni sıralama
    })

    // lastActivityAt'e göre sıralama
    const contentsWithLastActivity = contents.map(content => ({
      ...content,
      lastActivityAt: getContentLastActivityAt(content),
    }))
    
    contentsWithLastActivity.sort((a, b) => {
      return b.lastActivityAt.getTime() - a.lastActivityAt.getTime() // DESC
    })
    
    // lastActivityAt'i response'dan kaldır
    const sortedContents = contentsWithLastActivity.map(({ lastActivityAt, ...content }) => content)

    return NextResponse.json(sortedContents)
  } catch (error) {
    console.error('Error fetching voice actor contents:', error)
    return NextResponse.json(
      { error: 'İçerikler getirilemedi' },
      { status: 500 }
    )
  }
}

