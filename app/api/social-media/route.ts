import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month') || format(new Date(), 'yyyy-MM')

    const stats = await prisma.socialMediaStats.findMany({
      where: { month },
      orderBy: { platform: 'asc' },
    })

    // Önceki ayın son değerlerini al
    const previousMonth = format(subMonths(new Date(month + '-01'), 1), 'yyyy-MM')
    const previousStats = await prisma.socialMediaStats.findMany({
      where: { month: previousMonth },
      orderBy: { platform: 'asc' },
    })

    return NextResponse.json({
      currentMonth: stats,
      previousMonth: previousStats,
    })
  } catch (error) {
    console.error('Error fetching social media stats:', error)
    return NextResponse.json(
      { error: 'Sosyal medya istatistikleri getirilemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Upsert işlemi - varsa güncelle, yoksa oluştur
    const stats = await Promise.all(
      data.stats.map((stat: any) =>
        prisma.socialMediaStats.upsert({
          where: {
            month_platform: {
              month: stat.month,
              platform: stat.platform,
            },
          },
          update: {
            followerCount: stat.followerCount,
            target: stat.target || null,
          },
          create: {
            month: stat.month,
            platform: stat.platform,
            followerCount: stat.followerCount,
            target: stat.target || null,
          },
        })
      )
    )

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error saving social media stats:', error)
    return NextResponse.json(
      { error: 'Sosyal medya istatistikleri kaydedilemedi' },
      { status: 500 }
    )
  }
}









