import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { format, subMonths } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const { targetMonth } = await request.json()
    
    if (!targetMonth) {
      return NextResponse.json(
        { error: 'Hedef ay belirtilmedi' },
        { status: 400 }
      )
    }

    // Önceki ayın verilerini al
    const previousMonth = format(subMonths(new Date(targetMonth + '-01'), 1), 'yyyy-MM')
    const previousStats = await prisma.socialMediaStats.findMany({
      where: { month: previousMonth },
      orderBy: { platform: 'asc' },
    })

    if (previousStats.length === 0) {
      return NextResponse.json(
        { error: 'Önceki ay için veri bulunamadı' },
        { status: 404 }
      )
    }

    // Yeni ay için verileri kopyala (followerCount'u kopyala, target'ı null yap)
    const newStats = await Promise.all(
      previousStats.map((stat) =>
        prisma.socialMediaStats.upsert({
          where: {
            month_platform: {
              month: targetMonth,
              platform: stat.platform,
            },
          },
          update: {
            followerCount: stat.followerCount,
            // Target'ı güncelleme, mevcut varsa koru
          },
          create: {
            month: targetMonth,
            platform: stat.platform,
            followerCount: stat.followerCount,
            target: null, // Yeni ay için target'ı null yap
          },
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: `${previousMonth} ayı verileri ${targetMonth} ayına kopyalandı`,
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









