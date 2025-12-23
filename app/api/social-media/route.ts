import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { format, subMonths, subWeeks, getWeek, getYear, startOfMonth, endOfMonth } from 'date-fns'

// Hafta formatını oluştur (2024-W01 gibi)
function getWeekString(date: Date): string {
  const year = getYear(date)
  const week = getWeek(date, { weekStartsOn: 1 })
  return `${year}-W${week.toString().padStart(2, '0')}`
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const periodType = searchParams.get('periodType') || 'month' // 'month' veya 'week'
    const period = searchParams.get('period') || (periodType === 'week' ? getWeekString(new Date()) : format(new Date(), 'yyyy-MM'))
    const allHistory = searchParams.get('allHistory') === 'true' // Tüm tarihsel veriler için

    if (allHistory) {
      // Tüm tarihsel verileri getir (tablo görünümü için) - tarihe göre sırala (en eski en üstte)
      const allStats = await prisma.socialMediaStats.findMany({
        orderBy: [
          { createdAt: 'asc' },
          { platform: 'asc' },
        ],
      })
      
      // Her platform için son girilen tarihleri hesapla
      const platformLastDates: Record<string, { lastEntry: Date | null; previousEntry: Date | null }> = {}
      
      const platforms = ['Instagram', 'YouTube', 'X', 'Twitch', 'TikTok']
      platforms.forEach(platform => {
        const platformStats = allStats.filter(s => s.platform === platform)
        platformLastDates[platform] = {
          lastEntry: platformStats[0]?.updatedAt || platformStats[0]?.createdAt || null,
          previousEntry: platformStats[1]?.updatedAt || platformStats[1]?.createdAt || null,
        }
      })
      
      return NextResponse.json({ 
        allStats,
        platformLastDates 
      })
    }

    // Mevcut dönem verilerini al
    const whereClause = periodType === 'week' 
      ? { week: period, month: null }
      : { month: period, week: null }

    const stats = await prisma.socialMediaStats.findMany({
      where: whereClause,
      orderBy: { platform: 'asc' },
    })

    // Önceki dönemin son değerlerini al
    let previousPeriod: string
    if (periodType === 'week') {
      const currentDate = new Date()
      // Hafta string'ini parse et
      const [year, week] = period.split('-W').map(Number)
      const date = new Date(year, 0, 1 + (week - 1) * 7)
      previousPeriod = getWeekString(subWeeks(date, 1))
    } else {
      previousPeriod = format(subMonths(new Date(period + '-01'), 1), 'yyyy-MM')
    }

    const previousWhereClause = periodType === 'week'
      ? { week: previousPeriod, month: null }
      : { month: previousPeriod, week: null }

    const previousStats = await prisma.socialMediaStats.findMany({
      where: previousWhereClause,
      orderBy: { platform: 'asc' },
    })

    // Her platform için son girilen tarihleri hesapla
    const platformLastDates: Record<string, { lastEntry: Date | null; previousEntry: Date | null }> = {}
    const platforms = ['Instagram', 'YouTube', 'X', 'Twitch', 'TikTok']
    
    for (const platform of platforms) {
      const platformStats = await prisma.socialMediaStats.findMany({
        where: { platform },
        orderBy: { updatedAt: 'desc' },
        take: 2,
      })
      
      platformLastDates[platform] = {
        lastEntry: platformStats[0]?.updatedAt || platformStats[0]?.createdAt || null,
        previousEntry: platformStats[1]?.updatedAt || platformStats[1]?.createdAt || null,
      }
    }

    return NextResponse.json({
      currentPeriod: stats,
      previousPeriod: previousStats,
      platformLastDates,
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
            month_week_platform: {
              month: stat.month || null,
              week: stat.week || null,
              platform: stat.platform,
            },
          },
          update: {
            followerCount: stat.followerCount,
            target: stat.target || null,
          },
          create: {
            month: stat.month || null,
            week: stat.week || null,
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












