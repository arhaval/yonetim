import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const allHistory = searchParams.get('allHistory') === 'true' // Tüm tarihsel veriler için
    const latest = searchParams.get('latest') === 'true' // Son kayıtlar için

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
          lastEntry: platformStats[platformStats.length - 1]?.updatedAt || platformStats[platformStats.length - 1]?.createdAt || null,
          previousEntry: platformStats[platformStats.length - 2]?.updatedAt || platformStats[platformStats.length - 2]?.createdAt || null,
        }
      })
      
      return NextResponse.json({ 
        allStats,
        platformLastDates 
      })
    }

    if (latest) {
      // Her platform için en son kayıtları getir
      const platforms = ['Instagram', 'YouTube', 'X', 'Twitch', 'TikTok']
      const latestStats: any[] = []
      const previousStats: any[] = []
      const platformLastDates: Record<string, { lastEntry: Date | null; previousEntry: Date | null }> = {}
      
      for (const platform of platforms) {
        const platformStats = await prisma.socialMediaStats.findMany({
          where: { platform },
          orderBy: { updatedAt: 'desc' }, // En son güncellenen en üstte
          take: 2,
        })
        
        if (platformStats.length > 0) {
          latestStats.push(platformStats[0])
        }
        if (platformStats.length > 1) {
          previousStats.push(platformStats[1])
        }
        
        platformLastDates[platform] = {
          lastEntry: platformStats[0]?.updatedAt || platformStats[0]?.createdAt || null,
          previousEntry: platformStats[1]?.updatedAt || platformStats[1]?.createdAt || null,
        }
      }

      return NextResponse.json({
        latestStats,
        previousStats,
        platformLastDates,
      })
    }

    // Varsayılan: Son kayıtları getir
    const platforms = ['Instagram', 'YouTube', 'X', 'Twitch', 'TikTok']
    const latestStats: any[] = []
    const previousStats: any[] = []
    const platformLastDates: Record<string, { lastEntry: Date | null; previousEntry: Date | null }> = {}
    
    for (const platform of platforms) {
      const platformStats = await prisma.socialMediaStats.findMany({
        where: { platform },
        orderBy: { updatedAt: 'desc' }, // En son güncellenen en üstte
        take: 2,
      })
      
      if (platformStats.length > 0) {
        latestStats.push(platformStats[0])
      }
      if (platformStats.length > 1) {
        previousStats.push(platformStats[1])
      }
      
      platformLastDates[platform] = {
        lastEntry: platformStats[0]?.updatedAt || platformStats[0]?.createdAt || null,
        previousEntry: platformStats[1]?.updatedAt || platformStats[1]?.createdAt || null,
      }
    }

    return NextResponse.json({
      latestStats,
      previousStats,
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
    
    // Her kayıt için yeni bir kayıt oluştur (tarih bazlı)
    const stats = await Promise.all(
      data.stats.map((stat: any) =>
        prisma.socialMediaStats.create({
          data: {
            month: null,
            week: null,
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












