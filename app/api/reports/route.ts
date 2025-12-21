import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, parse } from 'date-fns'

// Cache GET requests for 30 seconds (searchParams cache key'e dahil edilir)
export const revalidate = 30

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') || 'monthly'
    const monthParam = searchParams.get('month') || new Date().toISOString().slice(0, 7)

    let monthStart: Date | null = null
    let monthEnd: Date | null = null

    try {
      if (filter === 'monthly') {
        const monthDate = parse(monthParam, 'yyyy-MM', new Date())
        monthStart = startOfMonth(monthDate)
        monthEnd = endOfMonth(monthDate)
      }
    } catch (dateError) {
      console.error('Date parsing error:', dateError)
      // Date parsing hatası olsa bile devam et
    }

    const whereClause = filter === 'monthly' && monthStart && monthEnd
      ? {
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        }
      : {}

    const contentWhereClause = filter === 'monthly' && monthStart && monthEnd
      ? {
          publishDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        }
      : {}

    const financialWhereClause = filter === 'monthly' && monthStart && monthEnd
      ? {
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        }
      : {}

    const [
      streamCount,
      externalStreamCount,
      contentCount,
      income,
      expense,
      streamCost,
      streamers,
      contents,
      allContents,
    ] = await Promise.all([
      prisma.stream.count({ where: whereClause }).catch(() => 0),
      prisma.externalStream.count({ where: whereClause }).catch(() => 0),
      prisma.content.count({ where: contentWhereClause }).catch(() => 0),
      prisma.financialRecord.aggregate({
        where: {
          type: 'income',
          ...financialWhereClause,
        },
        _sum: { amount: true },
      }).catch(() => ({ _sum: { amount: null } })),
      prisma.financialRecord.aggregate({
        where: {
          type: 'expense',
          ...financialWhereClause,
        },
        _sum: { amount: true },
      }).catch(() => ({ _sum: { amount: null } })),
      prisma.stream.aggregate({
        where: whereClause,
        _sum: { cost: true },
      }).catch(() => ({ _sum: { cost: null } })),
      prisma.streamer.findMany({
        select: {
          id: true,
          name: true,
          profilePhoto: true,
          isActive: true,
          _count: {
            select: {
              streams: true,
            },
          },
        },
        take: 5,
      }).then(streamers => 
        streamers.sort((a, b) => (b._count?.streams || 0) - (a._count?.streams || 0))
      ).catch(() => []),
      prisma.content.findMany({
        where: contentWhereClause,
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
          creatorName: true,
        },
        orderBy: {
          likes: 'desc',
        },
        take: 5,
      }).catch(() => []),
      prisma.content.findMany({
        where: contentWhereClause,
        select: {
          views: true,
          likes: true,
          comments: true,
          shares: true,
          saves: true,
          platform: true,
          type: true,
        },
      }).catch(() => []),
    ])

    // İçerik istatistikleri
    const contentStats = {
      totalViews: (allContents || []).reduce((sum, c) => sum + (c.views || 0), 0),
      totalLikes: (allContents || []).reduce((sum, c) => sum + (c.likes || 0), 0),
      totalComments: (allContents || []).reduce((sum, c) => sum + (c.comments || 0), 0),
      totalShares: (allContents || []).reduce((sum, c) => sum + (c.shares || 0), 0),
      totalSaves: (allContents || []).reduce((sum, c) => sum + (c.saves || 0), 0),
      totalEngagement: (allContents || []).reduce(
        (sum, c) => sum + (c.likes || 0) + (c.comments || 0) + (c.shares || 0) + (c.saves || 0),
        0
      ),
    }

    // En çok görüntülenen içerikler
    const topContentByViews = (allContents || [])
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)

    // Platform bazlı dağılım
    const platformMap = new Map<string, number>();
    const allContentsArray = allContents || [];
    allContentsArray.forEach((content) => {
      if (content.platform) {
        const count = platformMap.get(content.platform) || 0;
        platformMap.set(content.platform, count + 1);
      }
    });
    const contentByPlatform = Array.from(platformMap.entries())
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count)

    // İçerik türü bazlı dağılım
    const typeMap = new Map<string, number>();
    allContentsArray.forEach((content) => {
      if (content.type) {
        const count = typeMap.get(content.type) || 0;
        typeMap.set(content.type, count + 1);
      }
    });
    const contentByType = Array.from(typeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)

    const response = NextResponse.json({
      stats: {
        streamCount,
        externalStreamCount,
        contentCount,
        income: income._sum.amount || 0,
        expense: expense._sum.amount || 0,
        streamCost: streamCost._sum.cost || 0,
      },
      contentStats,
      topStreamers: (streamers || []).map((s) => ({
        id: s.id,
        name: s.name,
        // platform: s.platform, // BU SATIR SİLİNDİ (Veritabanında yoksa hata verir)
        streamCount: s.streams?.length || s._count?.streams || 0,
      })),
      topContent: contents,
      topContentByViews,
      contentByPlatform,
      contentByType,
    })
    // Cache için header ekle (2 dakika)
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=240')
    return response
  } catch (error: any) {
    console.error('Error fetching reports:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    })
    
    // Hata durumunda bile varsayılan değerler döndür (200 status ile)
    return NextResponse.json({
      stats: {
        streamCount: 0,
        externalStreamCount: 0,
        contentCount: 0,
        income: 0,
        expense: 0,
        streamCost: 0,
      },
      contentStats: {
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalSaves: 0,
        totalEngagement: 0,
      },
      topStreamers: [],
      topContent: [],
      topContentByViews: [],
      contentByPlatform: [],
      contentByType: [],
    }, { status: 200 }) // 200 döndür ki frontend çökmesin
  }
}