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
    const { month } = await request.json()
    const targetMonth = month || '2024-12'

    const stats = await Promise.all(
      initialValues.map((value) =>
        prisma.socialMediaStats.upsert({
          where: {
            month_platform: {
              month: targetMonth,
              platform: value.platform,
            },
          },
          update: {
            followerCount: value.followerCount,
          },
          create: {
            month: targetMonth,
            platform: value.platform,
            followerCount: value.followerCount,
            target: null,
          },
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: `${targetMonth} ayı için başlangıç değerleri eklendi`,
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









