import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { format, subMonths, subWeeks, getWeek, getYear } from 'date-fns'

// Hafta formatını oluştur (2024-W01 gibi)
function getWeekString(date: Date): string {
  const year = getYear(date)
  const week = getWeek(date, { weekStartsOn: 1 })
  return `${year}-W${week.toString().padStart(2, '0')}`
}

export async function POST(request: NextRequest) {
  try {
    const { targetMonth, targetWeek } = await request.json()
    
    if (!targetMonth && !targetWeek) {
      return NextResponse.json(
        { error: 'Hedef ay veya hafta belirtilmedi' },
        { status: 400 }
      )
    }

    let previousPeriod: string | null = null
    let previousWhereClause: any

    if (targetMonth) {
      // Aylık kopyalama
      previousPeriod = format(subMonths(new Date(targetMonth + '-01'), 1), 'yyyy-MM')
      previousWhereClause = { month: previousPeriod, week: null }
    } else if (targetWeek) {
      // Haftalık kopyalama
      const [year, week] = targetWeek.split('-W').map(Number)
      const date = new Date(year, 0, 1 + (week - 1) * 7)
      previousPeriod = getWeekString(subWeeks(date, 1))
      previousWhereClause = { week: previousPeriod, month: null }
    }

    const previousStats = await prisma.socialMediaStats.findMany({
      where: previousWhereClause,
      orderBy: { platform: 'asc' },
    })

    if (previousStats.length === 0) {
      return NextResponse.json(
        { error: `Önceki ${targetMonth ? 'ay' : 'hafta'} için veri bulunamadı` },
        { status: 404 }
      )
    }

    // Yeni dönem için verileri kopyala
    const newStats = await Promise.all(
      previousStats.map((stat) =>
        prisma.socialMediaStats.upsert({
          where: {
            month_week_platform: {
              month: targetMonth || null,
              week: targetWeek || null,
              platform: stat.platform,
            },
          },
          update: {
            followerCount: stat.followerCount,
            // Target'ı güncelleme, mevcut varsa koru
          },
          create: {
            month: targetMonth || null,
            week: targetWeek || null,
            platform: stat.platform,
            followerCount: stat.followerCount,
            target: null, // Yeni dönem için target'ı null yap
          },
        })
      )
    )

    const periodLabel = targetMonth || targetWeek
    const previousLabel = previousPeriod
    return NextResponse.json({
      success: true,
      message: `${previousLabel} ${targetMonth ? 'ayı' : 'haftası'} verileri ${periodLabel} ${targetMonth ? 'ayına' : 'haftasına'} kopyalandı`,
      stats: newStats,
    })
  } catch (error) {
    console.error('Error copying social media stats:', error)
    return NextResponse.json(
      { error: 'Veriler kopyalanamadı' },
      { status: 500 }
    )
  }
}











