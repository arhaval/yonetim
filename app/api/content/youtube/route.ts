import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

/**
 * YouTube API'den içerikleri çeker ve veritabanına kaydeder
 * 
 * Kullanım:
 * POST /api/content/youtube
 * Body: { url?: string, channelId?: string } 
 * - url: Tek bir video URL'i (opsiyonel)
 * - channelId: Channel ID, Handle (@username) veya Channel URL (opsiyonel)
 * 
 * Eğer channelId verilirse, tüm kanal çekilir
 * Eğer url verilirse, sadece o video çekilir
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { url, channelId } = data

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

    if (!YOUTUBE_API_KEY) {
      return NextResponse.json(
        { error: 'YouTube API key bulunamadı. Lütfen .env dosyasına YOUTUBE_API_KEY ekleyin.' },
        { status: 500 }
      )
    }

    // Creator ID'yi cookie'den al
    const cookieStore = await cookies()
    const creatorId = cookieStore.get('creator-id')?.value || null

    // Eğer URL verilmişse, tek video çek
    if (url) {
      return await fetchSingleVideo(url, YOUTUBE_API_KEY, creatorId)
    }

    // Eğer channelId verilmişse, tüm kanalı çek
    if (channelId) {
      return await fetchChannelVideos(channelId, YOUTUBE_API_KEY, creatorId)
    }

    return NextResponse.json(
      { error: 'URL veya Channel ID gerekli' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error fetching YouTube content:', error)
    return NextResponse.json(
      { error: `YouTube içerikleri çekilemedi: ${error.message}` },
      { status: 500 }
    )
  }
}

// Tek video çekme fonksiyonu
async function fetchSingleVideo(url: string, apiKey: string, creatorId?: string | null) {
  // URL'den video ID'yi çıkar
  let videoId: string | null = null
  
  // Farklı YouTube URL formatlarını destekle
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      videoId = match[1]
      break
    }
  }

  if (!videoId) {
    return NextResponse.json(
      { error: 'Geçersiz YouTube URL formatı. Örnek: https://www.youtube.com/watch?v=VIDEO_ID veya https://youtu.be/VIDEO_ID' },
      { status: 400 }
    )
  }

  // Video detaylarını çek
  const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${videoId}&key=${apiKey}`
  const detailsResponse = await fetch(detailsUrl)
  const detailsData = await detailsResponse.json()

  if (detailsData.error) {
    return NextResponse.json(
      { error: `YouTube API hatası: ${detailsData.error.message}` },
      { status: 400 }
    )
  }

  if (!detailsData.items || detailsData.items.length === 0) {
    return NextResponse.json(
      { error: 'Video bulunamadı' },
      { status: 404 }
    )
  }

  const video = detailsData.items[0]

  // Video süresini parse et (ISO 8601 format: PT1M30S)
  const duration = video.contentDetails.duration
  const durationMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  let durationSeconds = 0
  if (durationMatch) {
    const hours = parseInt(durationMatch[1] || '0')
    const minutes = parseInt(durationMatch[2] || '0')
    const seconds = parseInt(durationMatch[3] || '0')
    durationSeconds = hours * 3600 + minutes * 60 + seconds
  }

  // Shorts kontrolü: 60 saniye veya daha kısa
  const isShorts = durationSeconds > 0 && durationSeconds <= 60
  const videoType = isShorts ? 'shorts' : 'video'

  // Video URL'ini oluştur
  const videoUrl = url.includes('youtube.com') ? url : `https://www.youtube.com/watch?v=${videoId}`

  // Video zaten var mı kontrol et
  const existing = await prisma.content.findFirst({
    where: { url: videoUrl },
  })

  if (existing) {
    // Mevcut içeriği güncelle
    const updated = await prisma.content.update({
      where: { id: existing.id },
      data: {
        title: video.snippet.title,
        views: parseInt(video.statistics.viewCount || '0'),
        likes: parseInt(video.statistics.likeCount || '0'),
        comments: parseInt(video.statistics.commentCount || '0'),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'İçerik başarıyla güncellendi',
      content: updated,
      created: false,
    })
  }

  // Yeni içerik oluştur
  const content = await prisma.content.create({
    data: {
      title: video.snippet.title,
      type: videoType,
      platform: 'YouTube',
      url: videoUrl,
      publishDate: new Date(video.snippet.publishedAt),
      creatorName: video.snippet.channelTitle,
      creatorId: creatorId || null,
      views: parseInt(video.statistics.viewCount || '0'),
      likes: parseInt(video.statistics.likeCount || '0'),
      comments: parseInt(video.statistics.commentCount || '0'),
      shares: 0,
      saves: 0,
    },
  })

  return NextResponse.json({
    message: 'İçerik başarıyla çekildi ve kaydedildi',
    content: content,
    created: true,
  })
}

// Tüm kanalı çekme fonksiyonu
async function fetchChannelVideos(channelId: string, apiKey: string, creatorId?: string | null) {
  // Channel ID'yi temizle (URL'den veya sadece ID olarak gelebilir)
  let cleanChannelId = channelId.trim()
  
  if (cleanChannelId.includes('youtube.com')) {
    // URL'den channel ID çıkar
    const channelMatch = cleanChannelId.match(/channel\/([a-zA-Z0-9_-]+)/)
    const handleMatch = cleanChannelId.match(/@([a-zA-Z0-9_-]+)/)
    
    if (channelMatch) {
      cleanChannelId = channelMatch[1]
    } else if (handleMatch) {
      cleanChannelId = handleMatch[1]
    }
  }
  
  // Handle (@username) formatı için channel ID'yi al
  if (cleanChannelId.startsWith('@')) {
    const handle = cleanChannelId.replace('@', '')
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${handle}&key=${apiKey}`
    )
    const channelData = await channelResponse.json()
    
    if (channelData.error) {
      return NextResponse.json(
        { error: `YouTube API hatası: ${channelData.error.message}` },
        { status: 400 }
      )
    }
    
    if (channelData.items && channelData.items.length > 0) {
      cleanChannelId = channelData.items[0].id
    } else {
      return NextResponse.json(
        { error: 'Channel bulunamadı' },
        { status: 404 }
      )
    }
  }

  // Channel'dan video listesini çek
  let allVideoIds: string[] = []
  let nextPageToken: string | undefined = undefined

  do {
    const searchUrl: string = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${cleanChannelId}&type=video&maxResults=50&order=date&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`
    
    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()

    if (searchData.error) {
      return NextResponse.json(
        { error: `YouTube API hatası: ${searchData.error.message}` },
        { status: 400 }
      )
    }

    if (searchData.items) {
      allVideoIds.push(...searchData.items.map((item: any) => item.id.videoId))
    }

    nextPageToken = searchData.nextPageToken
  } while (nextPageToken)

  if (allVideoIds.length === 0) {
    return NextResponse.json(
      { error: 'Bu channel\'da video bulunamadı' },
      { status: 404 }
    )
  }

  // Video detaylarını toplu olarak çek (50'şer 50'şer)
  const createdContents: any[] = []
  const updatedContents: any[] = []
  const errors: string[] = []

  for (let i = 0; i < allVideoIds.length; i += 50) {
    const videoIdsBatch = allVideoIds.slice(i, i + 50)
    const videoIdsString = videoIdsBatch.join(',')

    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${videoIdsString}&key=${apiKey}`
    
    const detailsResponse = await fetch(detailsUrl)
    const detailsData = await detailsResponse.json()

    if (detailsData.error) {
      errors.push(`Video detayları çekilirken hata: ${detailsData.error.message}`)
      continue
    }

    if (!detailsData.items) continue

    for (const video of detailsData.items) {
      try {
        // Video süresini parse et (ISO 8601 format: PT1M30S)
        const duration = video.contentDetails.duration
        const durationMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
        let durationSeconds = 0
        if (durationMatch) {
          const hours = parseInt(durationMatch[1] || '0')
          const minutes = parseInt(durationMatch[2] || '0')
          const seconds = parseInt(durationMatch[3] || '0')
          durationSeconds = hours * 3600 + minutes * 60 + seconds
        }

        // Shorts kontrolü: 60 saniye veya daha kısa
        const isShorts = durationSeconds > 0 && durationSeconds <= 60
        const videoType = isShorts ? 'shorts' : 'video'

        // Video URL'ini oluştur
        const videoUrl = `https://www.youtube.com/watch?v=${video.id}`
        
        // Video zaten var mı kontrol et
        const existing = await prisma.content.findFirst({
          where: { url: videoUrl },
        })

        if (existing) {
          // Mevcut içeriği güncelle
          await prisma.content.update({
            where: { id: existing.id },
            data: {
              title: video.snippet.title,
              views: parseInt(video.statistics.viewCount || '0'),
              likes: parseInt(video.statistics.likeCount || '0'),
              comments: parseInt(video.statistics.commentCount || '0'),
              updatedAt: new Date(),
            },
          })
          updatedContents.push(video.id)
          continue
        }

        // Yeni içerik oluştur
        const content = await prisma.content.create({
          data: {
            title: video.snippet.title,
            type: videoType,
            platform: 'YouTube',
            url: videoUrl,
            publishDate: new Date(video.snippet.publishedAt),
            creatorName: video.snippet.channelTitle,
            creatorId: creatorId || null,
            views: parseInt(video.statistics.viewCount || '0'),
            likes: parseInt(video.statistics.likeCount || '0'),
            comments: parseInt(video.statistics.commentCount || '0'),
            shares: 0,
            saves: 0,
          },
        })

        createdContents.push(content)
      } catch (error: any) {
        console.error(`Video kaydedilirken hata (${video.id}):`, error)
        errors.push(`Video ${video.id}: ${error.message}`)
      }
    }

    // Rate limit'i aşmamak için kısa bir bekleme
    if (i + 50 < allVideoIds.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return NextResponse.json({
    message: `${createdContents.length} yeni içerik eklendi, ${updatedContents.length} içerik güncellendi`,
    created: createdContents.length,
    updated: updatedContents.length,
    total: allVideoIds.length,
    errors: errors.length > 0 ? errors : undefined,
  })
}

/**
 * YouTube içeriklerini senkronize eder (mevcut içerikleri günceller)
 */
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { contentId } = data

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID gerekli' },
        { status: 400 }
      )
    }

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

    if (!YOUTUBE_API_KEY) {
      return NextResponse.json(
        { error: 'YouTube API key bulunamadı' },
        { status: 500 }
      )
    }

    // İçeriği bul
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    })

    if (!content || content.platform !== 'YouTube') {
      return NextResponse.json(
        { error: 'İçerik bulunamadı veya YouTube içeriği değil' },
        { status: 404 }
      )
    }

    // URL'den video ID'yi çıkar
    const videoIdMatch = content.url?.match(/[?&]v=([a-zA-Z0-9_-]+)/)
    if (!videoIdMatch) {
      return NextResponse.json(
        { error: 'Geçersiz YouTube URL' },
        { status: 400 }
      )
    }

    const videoId = videoIdMatch[1]

    // Video detaylarını çek
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
    const detailsResponse = await fetch(detailsUrl)
    const detailsData = await detailsResponse.json()

    if (detailsData.error || !detailsData.items || detailsData.items.length === 0) {
      return NextResponse.json(
        { error: 'Video bulunamadı' },
        { status: 404 }
      )
    }

    const video = detailsData.items[0]

    // İçeriği güncelle
    const updated = await prisma.content.update({
      where: { id: contentId },
      data: {
        title: video.snippet.title,
        views: parseInt(video.statistics.viewCount || '0'),
        likes: parseInt(video.statistics.likeCount || '0'),
        comments: parseInt(video.statistics.commentCount || '0'),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'İçerik başarıyla güncellendi',
      content: updated,
    })
  } catch (error: any) {
    console.error('Error updating YouTube content:', error)
    return NextResponse.json(
      { error: `İçerik güncellenemedi: ${error.message}` },
      { status: 500 }
    )
  }
}
