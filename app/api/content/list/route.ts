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
      const normalizedPlatform = platform.toLowerCase()
      if (normalizedPlatform === 'youtube') {
        whereClause.platform = 'YouTube'
      } else if (normalizedPlatform === 'instagram') {
        whereClause.platform = 'Instagram'
      } else {
        // Eğer bilinmeyen bir platform ise, olduğu gibi kullan
        whereClause.platform = platform
      }
    }
    
    // Tip filtresi - küçük harfe çevir ve esnek eşleştir
    if (type) {
      // "reels" -> "reel", "post" -> "post", "video" -> "video", "shorts" -> "shorts"
      const normalizedType = type.toLowerCase()
      const mappedType = normalizedType === 'reels' ? 'reel' : normalizedType
      whereClause.type = mappedType
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

    // Önce tüm içerikleri say (debug için)
    const allContents = await prisma.content.findMany({
      select: { id: true, platform: true, type: true, publishDate: true },
    }).catch(() => [])
    console.log(`Total contents in DB: ${allContents.length}`)
    console.log('Sample contents:', allContents.slice(0, 5).map(c => ({ platform: c.platform, type: c.type })))

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
    }).catch((err) => {
      console.error('Error fetching contents:', err)
      return []
    })

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


