import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, parse } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') || 'total'
    const monthParam = searchParams.get('month') || new Date().toISOString().slice(0, 7)
    const platform = searchParams.get('platform')
    const type = searchParams.get('type')

    let whereClause: any = {}

    // Platform filtresi - büyük/küçük harf duyarsız eşleşme
    if (platform) {
      // "YouTube" veya "youtube" -> "YouTube"
      if (platform.toLowerCase() === 'youtube') {
        whereClause.platform = 'YouTube'
      } else if (platform.toLowerCase() === 'instagram') {
        whereClause.platform = 'Instagram'
      } else {
        whereClause.platform = platform
      }
    }
    
    // Tip filtresi - küçük harfe çevir
    if (type) {
      // "reels" -> "reel", "post" -> "post", "video" -> "video", "shorts" -> "shorts"
      const normalizedType = type.toLowerCase()
      whereClause.type = normalizedType === 'reels' ? 'reel' : normalizedType
    }

    // Tarih filtresi sadece "monthly" seçiliyse uygula
    if (filter === 'monthly') {
      const monthDate = parse(monthParam, 'yyyy-MM', new Date())
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)
      whereClause.publishDate = {
        gte: monthStart,
        lte: monthEnd,
      }
    }

    console.log('Content list query:', JSON.stringify(whereClause, null, 2))

    const contents = await prisma.content.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { publishDate: 'desc' },
    }).catch(() => [])

    console.log(`Found ${contents.length} contents matching filters`)

    const stats = {
      total: contents.length,
      totalViews: (contents || []).reduce((sum, c) => sum + (c.views || 0), 0),
      totalLikes: (contents || []).reduce((sum, c) => sum + (c.likes || 0), 0),
      totalEngagement: (contents || []).reduce(
        (sum, c) => sum + (c.likes || 0) + (c.comments || 0) + (c.shares || 0) + (c.saves || 0),
        0
      ),
    }

    return NextResponse.json({ contents: contents || [], stats })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { contents: [], stats: { total: 0, totalViews: 0, totalLikes: 0, totalEngagement: 0 } },
      { status: 200 }
    ) // Varsayılan değerler döndür
  }
}


