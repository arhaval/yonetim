import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Otomatik periyodik içerik güncelleme endpoint'i
 * 
 * Bu endpoint, sadece son 30 günlük içerikleri günceller (API rate limit'ini korumak için)
 * 
 * Vercel Cron Jobs ile kullanım için vercel.json'a ekleyin:
 * {
 *   "crons": [{
 *     "path": "/api/cron/sync-content",
 *     "schedule": "0 */3 * * *"  // Her 3 saatte bir
 *   }]
 * }
 * 
 * Veya manuel olarak çağrılabilir veya external cron servisleri (UptimeRobot, EasyCron, vb.) ile kullanılabilir
 * 
 * Authorization: Bu endpoint'i korumak için Vercel'de CRON_SECRET environment variable kullanabilirsiniz
 */
export async function GET(request: NextRequest) {
  try {
    // Güvenlik: Vercel Cron Jobs için secret kontrolü
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Eğer CRON_SECRET ayarlıysa kontrol et
      // Vercel Cron Jobs otomatik olarak bu header'ı göndermez,
      // bu yüzden opsiyonel olarak bırakıyoruz
      // Manuel çağrılar için: ?secret=YOUR_SECRET parametresi kullanın
      const url = new URL(request.url)
      const secret = url.searchParams.get('secret')
      
      if (secret !== cronSecret) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    // Son 30 günlük içerikleri güncelle
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Güncellenecek içerikleri bul (sadece son 30 günlük)
    const contents = await prisma.content.findMany({
      where: {
        publishDate: { gte: thirtyDaysAgo },
      },
      orderBy: { publishDate: 'desc' },
    })

    if (contents.length === 0) {
      return NextResponse.json({
        message: 'Güncellenecek içerik bulunamadı',
        updated: 0,
        timestamp: new Date().toISOString(),
      })
    }

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

    let updatedCount = 0
    let errorCount = 0

    // İçerikleri platform'a göre grupla
    const youtubeContents = contents.filter((c) => c.platform === 'YouTube' && c.url)

    // YouTube içeriklerini güncelle
    if (youtubeContents.length > 0) {
      if (!YOUTUBE_API_KEY) {
        return NextResponse.json({
          message: 'YouTube API key bulunamadı',
          updated: 0,
          errors: youtubeContents.length,
          timestamp: new Date().toISOString(),
        })
      }

      // Batch'ler halinde işle (50'şer 50'şer)
      for (let i = 0; i < youtubeContents.length; i += 50) {
        const batch = youtubeContents.slice(i, i + 50)

        try {
          // Video ID'lerini çıkar
          const videoIds: string[] = []
          const contentMap = new Map<string, typeof batch[0]>()

          for (const content of batch) {
            if (!content.url) continue

            const patterns = [
              /[?&]v=([a-zA-Z0-9_-]+)/,
              /youtu\.be\/([a-zA-Z0-9_-]+)/,
              /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
            ]

            for (const pattern of patterns) {
              const match = content.url.match(pattern)
              if (match) {
                videoIds.push(match[1])
                contentMap.set(match[1], content)
                break
              }
            }
          }

          if (videoIds.length === 0) continue

          // Video detaylarını toplu olarak çek
          const videoIdsString = videoIds.join(',')
          const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${videoIdsString}&key=${YOUTUBE_API_KEY}`

          const detailsResponse = await fetch(detailsUrl)
          const detailsData = await detailsResponse.json()

          if (detailsData.error) {
            console.error('YouTube API hatası:', detailsData.error)
            errorCount += batch.length
            continue
          }

          if (!detailsData.items) continue

          // Her video için veritabanını güncelle
          for (const video of detailsData.items) {
            const content = contentMap.get(video.id)
            if (!content) continue

            try {
              await prisma.content.update({
                where: { id: content.id },
                data: {
                  title: video.snippet.title,
                  views: parseInt(video.statistics.viewCount || '0'),
                  likes: parseInt(video.statistics.likeCount || '0'),
                  comments: parseInt(video.statistics.commentCount || '0'),
                  updatedAt: new Date(),
                },
              })
              updatedCount++
            } catch (error: any) {
              console.error(`Content güncellenirken hata (${content.id}):`, error)
              errorCount++
            }
          }

          // Rate limit'i aşmamak için kısa bekleme
          if (i + 50 < youtubeContents.length) {
            await new Promise((resolve) => setTimeout(resolve, 100))
          }
        } catch (error: any) {
          console.error(`Batch işlenirken hata:`, error)
          errorCount += batch.length
        }
      }
    }

    // Instagram içerikleri için (henüz implement edilmedi)
    const instagramContents = contents.filter((c) => c.platform === 'Instagram')
    if (instagramContents.length > 0) {
      console.log(`${instagramContents.length} Instagram içeriği bulundu ancak güncelleme henüz implement edilmedi`)
    }

    return NextResponse.json({
      message: `Otomatik güncelleme tamamlandı`,
      updated: updatedCount,
      errors: errorCount,
      total: contents.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error in cron sync:', error)
    return NextResponse.json(
      {
        error: `Otomatik güncelleme sırasında hata: ${error.message}`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

