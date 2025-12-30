import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, parse } from 'date-fns'

// Cache GET requests for 30 seconds
export const revalidate = 30

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') || 'total'
    const monthParam = searchParams.get('month') || new Date().toISOString().slice(0, 7)
    const platform = searchParams.get('platform')
    const type = searchParams.get('type')

    let whereClause: any = {}

    // Tüm içerikleri göster (creatorId filtresi kaldırıldı)
    // Artık hem admin tarafından manuel eklenen hem de creator tarafından eklenen içerikler gözükecek

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

    // Optimize edilmiş sorgu - sadece gerekli alanları çek
    const contents = await prisma.content.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        type: true,
        platform: true,
        url: true,
        publishDate: true,
        views: true,
        likes: true,
        comments: true,
        shares: true,
        saves: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { publishDate: 'desc' }, // En son yüklenen → Eski (Yeni → Eski)
      take: 500, // Limit to 500 for performance
    }).catch((err) => {
      console.error('Error fetching contents:', err)
      return []
    })

    // publishDate'e göre sıralama zaten yapıldı (desc: yeni → eski)
    const sortedContents = contents

    const stats = {
      total: sortedContents.length,
      totalViews: (sortedContents || []).reduce((sum, c) => sum + (c.views || 0), 0),
      totalLikes: (sortedContents || []).reduce((sum, c) => sum + (c.likes || 0), 0),
      totalEngagement: (sortedContents || []).reduce(
        (sum, c) => sum + (c.likes || 0) + (c.comments || 0) + (c.shares || 0) + (c.saves || 0),
        0
      ),
    }

    return NextResponse.json({ contents: sortedContents || [], stats })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { contents: [], stats: { total: 0, totalViews: 0, totalLikes: 0, totalEngagement: 0 } },
      { status: 200 }
    ) // Varsayılan değerler döndür
  }
}


