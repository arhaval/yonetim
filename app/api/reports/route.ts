import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, parse } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') || 'monthly'
    const monthParam = searchParams.get('month') || new Date().toISOString().slice(0, 7)

    let monthStart: Date | null = null
    let monthEnd: Date | null = null

    if (filter === 'monthly') {
      const monthDate = parse(monthParam, 'yyyy-MM', new Date())
      monthStart = startOfMonth(monthDate)
      monthEnd = endOfMonth(monthDate)
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
      prisma.stream.count({ where: whereClause }),
      prisma.externalStream.count({ where: whereClause }),
      prisma.content.count({ where: contentWhereClause }),
      prisma.financialRecord.aggregate({
        where: {
          type: 'income',
          ...financialWhereClause,
        },
        _sum: { amount: true },
      }),
      prisma.financialRecord.aggregate({
        where: {
          type: 'expense',
          ...financialWhereClause,
        },
        _sum: { amount: true },
      }),
      prisma.stream.aggregate({
        where: whereClause,
        _sum: { cost: true },
      }),
      prisma.streamer.findMany({
        include: {
          streams: {
            where: whereClause,
          },
        },
        orderBy: {
          streams: {
            _count: 'desc',
          },
        },
        take: 5,
      }),
      prisma.content.findMany({
        where: contentWhereClause,
        orderBy: {
          likes: 'desc',
        },
        take: 5,
      }),
      prisma.content.findMany({
        where: contentWhereClause,
      }),
    ])

    // İçerik istatistikleri
    const contentStats = {
      totalViews: allContents.reduce((sum, c) => sum + c.views, 0),
      totalLikes: allContents.reduce((sum, c) => sum + c.likes, 0),
      totalComments: allContents.reduce((sum, c) => sum + c.comments, 0),
      totalShares: allContents.reduce((sum, c) => sum + c.shares, 0),
      totalSaves: allContents.reduce((sum, c) => sum + c.saves, 0),
      totalEngagement: allContents.reduce(
        (sum, c) => sum + c.likes + c.comments + c.shares + c.saves,
        0
      ),
    }

    // En çok görüntülenen içerikler
    const topContentByViews = allContents
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)

    // Platform bazlı dağılım
    const platformMap = new Map<string, number>()
    allContents.forEach((content) => {
      const count = platformMap.get(content.platform) || 0
      platformMap.set(content.platform, count + 1)
    })
    const contentByPlatform = Array.from(platformMap.entries())
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count)

    // İçerik türü bazlı dağılım
    const typeMap = new Map<string, number>()
    allContents.forEach((content) => {
      const count = typeMap.get(content.type) || 0
      typeMap.set(content.type, count + 1)
    })
    const contentByType = Array.from(typeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      stats: {
        streamCount,
        externalStreamCount,
        contentCount,
        income: income._sum.amount || 0,
        expense: expense._sum.amount || 0,
        streamCost: streamCost._sum.cost || 0,
      },
      contentStats,
      topStreamers: streamers.map((s) => ({
        id: s.id,
        name: s.name,
        platform: s.platform,
        streamCount: s.streams.length,
      })),
      topContent: contents,
      topContentByViews,
      contentByPlatform,
      contentByType,
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Raporlar getirilemedi' },
      { status: 500 }
    )
  }
}
