import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Aralık 2024 başlangıç değerleri
const initialValues = [
  { platform: 'Instagram', followerCount: 2741 },
  { platform: 'YouTube', followerCount: 19032 },
  { platform: 'X', followerCount: 5819 },
  { platform: 'Twitch', followerCount: 10300 },
  { platform: 'TikTok', followerCount: 772 },
]

export async function POST(request: NextRequest) {
  try {
    const { month, week } = await request.json()
    const targetMonth = month || null
    const targetWeek = week || null

    if (!targetMonth && !targetWeek) {
      return NextResponse.json(
        { error: 'Ay veya hafta belirtilmedi' },
        { status: 400 }
      )
    }

    const stats = await Promise.all(
      initialValues.map((value) =>
        prisma.socialMediaStats.upsert({
          where: {
            month_week_platform: {
              month: targetMonth,
              week: targetWeek,
              platform: value.platform,
            },
          },
          update: {
            followerCount: value.followerCount,
          },
          create: {
            month: targetMonth,
            week: targetWeek,
            platform: value.platform,
            followerCount: value.followerCount,
            target: null,
          },
        })
      )
    )

    const periodLabel = targetMonth || targetWeek
    return NextResponse.json({
      success: true,
      message: `${periodLabel} ${targetMonth ? 'ayı' : 'haftası'} için başlangıç değerleri eklendi`,
      stats,
    })
  } catch (error) {
    console.error('Error initializing social media stats:', error)
    return NextResponse.json(
      { error: 'Başlangıç değerleri eklenemedi' },
      { status: 500 }
    )
  }
}












