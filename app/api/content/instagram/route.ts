import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Instagram URL'den shortcode çıkarır
 */
function extractShortcodeFromUrl(url: string): { shortcode: string; type: 'reel' | 'post' } | null {
  const urlMatch = url.match(/instagram\.com\/(p|reel)\/([A-Za-z0-9_-]+)/)
  if (!urlMatch) return null
  
  const contentType = urlMatch[1] // 'p' veya 'reel'
  const shortcode = urlMatch[2]
  
  return {
    shortcode,
    type: contentType === 'reel' ? 'reel' : 'post',
  }
}

/**
 * Instagram Graph API ile media bilgilerini çeker
 */
async function fetchInstagramMediaData(shortcode: string, accessToken: string) {
  try {
    // Instagram Graph API'de shortcode ile media bulmak için
    // Önce oEmbed API kullanabiliriz veya Business Account ID ile tüm medyaları çekip eşleştirebiliriz
    
    // Alternatif: Instagram oEmbed API (public, rate limit var)
    const oembedUrl = `https://api.instagram.com/oembed?url=https://www.instagram.com/p/${shortcode}/`
    
    try {
      const oembedResponse = await fetch(oembedUrl)
      if (!oembedResponse.ok) {
        throw new Error('oEmbed API hatası')
      }
      const oembedData = await oembedResponse.json()
      
      // oEmbed'den sadece temel bilgiler gelir, istatistikler için Graph API gerekli
      // Şimdilik oEmbed'den gelen bilgileri kullanıyoruz
      return {
        title: oembedData.title || '',
        thumbnail: oembedData.thumbnail_url || null,
        author: oembedData.author_name || '',
      }
    } catch (oembedError) {
      console.log('oEmbed API çalışmadı, Graph API deneniyor...')
    }

    // Instagram Graph API kullanarak media bilgilerini çek
    // Not: Bu için Business Account ve media ID gerekli
    // Shortcode'dan media ID'ye çevirmek için ek bir adım gerekebilir
    
    return null
  } catch (error: any) {
    console.error('Error fetching Instagram media data:', error)
    throw error
  }
}

/**
 * Instagram URL'den tek bir içerik çeker
 */
async function fetchSingleInstagramContent(url: string) {
  try {
    const urlInfo = extractShortcodeFromUrl(url)
    if (!urlInfo) {
      return NextResponse.json(
        { error: 'Geçersiz Instagram URL formatı. Örnek: https://www.instagram.com/p/ABC123/ veya https://www.instagram.com/reel/ABC123/' },
        { status: 400 }
      )
    }

    const { shortcode, type } = urlInfo

    // Mevcut içeriği kontrol et
    const existingContent = await prisma.content.findFirst({
      where: { url: url.trim() },
    })

    if (existingContent) {
      return NextResponse.json({
        message: 'Bu içerik zaten mevcut',
        content: existingContent,
      })
    }

    const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN
    const INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID

    // Eğer token ve account ID varsa, Graph API ile çek
    if (INSTAGRAM_ACCESS_TOKEN && INSTAGRAM_BUSINESS_ACCOUNT_ID) {
      try {
        // Business Account'tan tüm medyaları çek
        const mediaUrl = `https://graph.instagram.com/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&access_token=${INSTAGRAM_ACCESS_TOKEN}`
        
        const mediaResponse = await fetch(mediaUrl)
        const mediaData = await mediaResponse.json()

        if (mediaData.error) {
          console.error('Instagram Graph API hatası:', mediaData.error)
          throw new Error(mediaData.error.message || 'Instagram API hatası')
        }

        // Shortcode'u URL'den çıkar ve eşleştir
        const targetUrl = url.trim().split('?')[0] // Query parametrelerini temizle
        
        // Medyalar arasında shortcode ile eşleşeni bul
        let matchedMedia = null
        if (mediaData.data && Array.isArray(mediaData.data)) {
          for (const media of mediaData.data) {
            if (media.permalink && media.permalink.includes(shortcode)) {
              matchedMedia = media
              break
            }
          }
        }

        if (matchedMedia) {
          // Media tipini kontrol et
          const isReel = matchedMedia.media_type === 'REELS' || type === 'reel'
          const isPost = matchedMedia.media_type === 'IMAGE' || matchedMedia.media_type === 'CAROUSEL_ALBUM' || type === 'post'

          if ((isReel && type === 'reel') || (isPost && type === 'post')) {
            const content = await prisma.content.create({
              data: {
                title: matchedMedia.caption ? matchedMedia.caption.substring(0, 200) : `Instagram ${type === 'reel' ? 'Reels' : 'Gönderi'}`,
                type: type,
                platform: 'Instagram',
                url: matchedMedia.permalink || url.trim(),
                publishDate: new Date(matchedMedia.timestamp),
                views: 0, // Instagram API'de views yok
                likes: parseInt(matchedMedia.like_count || '0'),
                comments: parseInt(matchedMedia.comments_count || '0'),
                shares: 0, // Instagram API'de shares yok
                saves: 0, // Instagram API'de saves yok (ancak bazı endpoint'lerde var)
              },
            })

            return NextResponse.json({
              message: 'Instagram içeriği başarıyla çekildi',
              content: content,
              created: true,
            })
          }
        }

        // Eşleşen media bulunamadı, yeni içerik oluştur
        console.log('Instagram Graph API\'de eşleşen media bulunamadı, temel içerik oluşturuluyor')
      } catch (apiError: any) {
        console.error('Instagram Graph API hatası:', apiError)
        // API hatası olsa bile içeriği kaydet
      }
    }

    // Token yoksa veya API hatası varsa, sadece URL'yi kaydet
    const content = await prisma.content.create({
      data: {
        title: `Instagram ${type === 'reel' ? 'Reels' : 'Gönderi'}`,
        type: type,
        platform: 'Instagram',
        url: url.trim(),
        publishDate: new Date(),
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
      },
    })

    return NextResponse.json({
      message: INSTAGRAM_ACCESS_TOKEN 
        ? 'İçerik eklendi. Instagram Graph API\'de eşleşen media bulunamadı. İstatistikleri manuel olarak girebilirsiniz.'
        : 'İçerik eklendi. Instagram API entegrasyonu için access token gerekli. İstatistikleri manuel olarak girebilirsiniz.',
      content: content,
      created: true,
    })
  } catch (error: any) {
    console.error('Error fetching Instagram content from URL:', error)
    return NextResponse.json(
      { error: `Instagram içeriği çekilemedi: ${error.message}` },
      { status: 500 }
    )
  }
}

/**
 * Instagram API'den içerikleri çeker ve veritabanına kaydeder
 * 
 * Kullanım:
 * POST /api/content/instagram
 * Body: { accountId: string, type: 'reel' | 'post' }
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { url, accountId, type = 'reel' } = data

    // Eğer URL verilmişse, URL'den içerik çek
    if (url) {
      return await fetchSingleInstagramContent(url)
    }

    if (!accountId) {
      return NextResponse.json(
        { error: 'URL veya Account ID gerekli' },
        { status: 400 }
      )
    }

    const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN
    const INSTAGRAM_BUSINESS_ACCOUNT_ID = accountId || process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID

    if (!INSTAGRAM_ACCESS_TOKEN || !INSTAGRAM_BUSINESS_ACCOUNT_ID) {
      return NextResponse.json(
        { error: 'Instagram API access token ve Business Account ID gerekli. Lütfen .env dosyasına INSTAGRAM_ACCESS_TOKEN ve INSTAGRAM_BUSINESS_ACCOUNT_ID ekleyin.' },
        { status: 500 }
      )
    }

    try {
      // Instagram Graph API ile tüm medyaları çek
      const mediaUrl = `https://graph.instagram.com/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&access_token=${INSTAGRAM_ACCESS_TOKEN}&limit=100`
      
      const mediaResponse = await fetch(mediaUrl)
      const mediaData = await mediaResponse.json()

      if (mediaData.error) {
        return NextResponse.json(
          { error: `Instagram API hatası: ${mediaData.error.message}` },
          { status: 500 }
        )
      }

      if (!mediaData.data || !Array.isArray(mediaData.data)) {
        return NextResponse.json({
          message: 'Instagram içerikleri bulunamadı',
          count: 0,
        })
      }

      let createdCount = 0
      let skippedCount = 0

      // Her içerik için veritabanına kaydet
      for (const item of mediaData.data) {
        // Reels veya Post filtresi
        if (type === 'reel' && item.media_type !== 'REELS') {
          skippedCount++
          continue
        }
        if (type === 'post' && item.media_type !== 'IMAGE' && item.media_type !== 'CAROUSEL_ALBUM') {
          skippedCount++
          continue
        }

        // Mevcut içeriği kontrol et
        const existingContent = await prisma.content.findFirst({
          where: { url: item.permalink },
        })

        if (existingContent) {
          skippedCount++
          continue
        }

        try {
          await prisma.content.create({
            data: {
              title: item.caption ? item.caption.substring(0, 200) : `Instagram ${type === 'reel' ? 'Reels' : 'Gönderi'}`,
              type: type === 'reel' ? 'reel' : 'post',
              platform: 'Instagram',
              url: item.permalink,
              publishDate: new Date(item.timestamp),
              views: 0, // Instagram API'de views yok
              likes: parseInt(item.like_count || '0'),
              comments: parseInt(item.comments_count || '0'),
              shares: 0,
              saves: 0,
            },
          })
          createdCount++
        } catch (error: any) {
          console.error(`İçerik kaydedilirken hata (${item.id}):`, error)
          skippedCount++
        }
      }

      return NextResponse.json({
        message: `${createdCount} Instagram içeriği başarıyla çekildi`,
        created: createdCount,
        skipped: skippedCount,
        total: mediaData.data.length,
      })
    } catch (error: any) {
      console.error('Error fetching Instagram content:', error)
      return NextResponse.json(
        { error: `Instagram içerikleri çekilemedi: ${error.message}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error fetching Instagram content:', error)
    return NextResponse.json(
      { error: 'Instagram içerikleri çekilemedi' },
      { status: 500 }
    )
  }
}

/**
 * Instagram içeriklerini senkronize eder (mevcut içerikleri günceller)
 * 
 * Kullanım:
 * PUT /api/content/instagram
 * Body: { contentId: string }
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

    // İçeriği bul
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    })

    if (!content || content.platform !== 'Instagram') {
      return NextResponse.json(
        { error: 'İçerik bulunamadı veya Instagram içeriği değil' },
        { status: 404 }
      )
    }

    if (!content.url) {
      return NextResponse.json(
        { error: 'İçerik URL\'si bulunamadı' },
        { status: 400 }
      )
    }

    const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN

    if (!INSTAGRAM_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Instagram API access token bulunamadı. Lütfen .env dosyasına INSTAGRAM_ACCESS_TOKEN ekleyin.' },
        { status: 500 }
      )
    }

    // URL'den shortcode çıkar
    const urlInfo = extractShortcodeFromUrl(content.url)
    if (!urlInfo) {
      return NextResponse.json(
        { error: 'Geçersiz Instagram URL formatı' },
        { status: 400 }
      )
    }

    const INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID

    if (!INSTAGRAM_BUSINESS_ACCOUNT_ID) {
      return NextResponse.json(
        { error: 'Instagram Business Account ID bulunamadı. Lütfen .env dosyasına INSTAGRAM_BUSINESS_ACCOUNT_ID ekleyin.' },
        { status: 500 }
      )
    }

    try {
      // Business Account'tan tüm medyaları çek
      const mediaUrl = `https://graph.instagram.com/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&access_token=${INSTAGRAM_ACCESS_TOKEN}&limit=100`
      
      const mediaResponse = await fetch(mediaUrl)
      const mediaData = await mediaResponse.json()

      if (mediaData.error) {
        return NextResponse.json(
          { error: `Instagram API hatası: ${mediaData.error.message}` },
          { status: 500 }
        )
      }

      // Shortcode ile eşleşen media'yı bul
      let matchedMedia = null
      if (mediaData.data && Array.isArray(mediaData.data)) {
        for (const media of mediaData.data) {
          if (media.permalink && media.permalink.includes(urlInfo.shortcode)) {
            matchedMedia = media
            break
          }
        }
      }

      if (!matchedMedia) {
        return NextResponse.json(
          { error: 'Instagram API\'de bu içerik bulunamadı' },
          { status: 404 }
        )
      }

      // Veritabanını güncelle
      const updatedContent = await prisma.content.update({
        where: { id: contentId },
        data: {
          title: matchedMedia.caption ? matchedMedia.caption.substring(0, 200) : content.title,
          likes: parseInt(matchedMedia.like_count || '0'),
          comments: parseInt(matchedMedia.comments_count || '0'),
          updatedAt: new Date(),
        },
      })

      return NextResponse.json({
        message: 'İçerik başarıyla güncellendi',
        content: updatedContent,
      })
    } catch (error: any) {
      console.error('Error updating Instagram content:', error)
      return NextResponse.json(
        { error: `İçerik güncellenemedi: ${error.message}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error updating Instagram content:', error)
    return NextResponse.json(
      { error: `İçerik güncellenemedi: ${error.message}` },
      { status: 500 }
    )
  }
}


