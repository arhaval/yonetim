import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Tüm içerikleri veya belirli platform/tip içeriklerini API'den günceller
 * 
 * Kullanım:
 * POST /api/content/sync
 * Body: { 
 *   platform?: 'YouTube' | 'Instagram',  // Opsiyonel: sadece bu platform'u güncelle
 *   onlyRecent?: boolean,  // Sadece son 30 günlük içerikleri güncelle (default: false)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { platform, onlyRecent = false } = data

    // Güncellenecek içerikleri filtrele
    const where: any = {}
    
    if (platform) {
      where.platform = platform
    }

    // Son 30 günlük içerikler filtresi
    if (onlyRecent) {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      where.publishDate = { gte: thirtyDaysAgo }
    }

    // Güncellenecek içerikleri bul
    const contents = await prisma.content.findMany({
      where,
      orderBy: { publishDate: 'desc' },
    })

    if (contents.length === 0) {
      return NextResponse.json({
        message: 'Güncellenecek içerik bulunamadı',
        updated: 0,
        errors: 0,
      })
    }

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
    const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN

    let updatedCount = 0
    let errorCount = 0
    const errors: string[] = []

    // İçerikleri platform'a göre grupla
    const youtubeContents = contents.filter((c) => c.platform === 'YouTube' && c.url)
    const instagramContents = contents.filter((c) => c.platform === 'Instagram' && c.url)

    // YouTube içeriklerini güncelle
    if (youtubeContents.length > 0) {
      if (!YOUTUBE_API_KEY) {
        errors.push('YouTube API key bulunamadı')
        errorCount += youtubeContents.length
      } else {
        // YouTube API rate limit: 10,000 units/gün
        // Her video için ~1-3 unit kullanılır
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
              errors.push(`YouTube API hatası: ${detailsData.error.message}`)
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
                errors.push(`Video ${video.id}: ${error.message}`)
                errorCount++
              }
            }

            // Rate limit'i aşmamak için kısa bekleme
            if (i + 50 < youtubeContents.length) {
              await new Promise((resolve) => setTimeout(resolve, 100))
            }
          } catch (error: any) {
            console.error(`Batch işlenirken hata:`, error)
            errors.push(`Batch ${i}-${i + 50}: ${error.message}`)
            errorCount += batch.length
          }
        }
      }
    }

    // Instagram içeriklerini güncelle
    if (instagramContents.length > 0) {
      if (!INSTAGRAM_ACCESS_TOKEN) {
        errors.push('Instagram API access token bulunamadı')
        errorCount += instagramContents.length
      } else {
        const INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
        
        if (!INSTAGRAM_BUSINESS_ACCOUNT_ID) {
          errors.push('Instagram Business Account ID bulunamadı')
          errorCount += instagramContents.length
        } else {
          try {
            // Business Account'tan tüm medyaları çek
            const mediaUrl = `https://graph.instagram.com/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/media?fields=id,permalink,like_count,comments_count&access_token=${INSTAGRAM_ACCESS_TOKEN}&limit=100`
            
            const mediaResponse = await fetch(mediaUrl)
            const mediaData = await mediaResponse.json()

            if (mediaData.error) {
              errors.push(`Instagram API hatası: ${mediaData.error.message}`)
              errorCount += instagramContents.length
            } else if (mediaData.data && Array.isArray(mediaData.data)) {
              // Media'ları URL'ye göre map'le
              const mediaMap = new Map<string, any>()
              for (const media of mediaData.data) {
                if (media.permalink) {
                  // URL'den shortcode çıkar
                  const urlMatch = media.permalink.match(/instagram\.com\/(p|reel)\/([A-Za-z0-9_-]+)/)
                  if (urlMatch) {
                    mediaMap.set(urlMatch[2], media)
                  }
                }
              }

              // Her içerik için güncelle
              for (const content of instagramContents) {
                if (!content.url) {
                  errorCount++
                  continue
                }

                const urlMatch = content.url.match(/instagram\.com\/(p|reel)\/([A-Za-z0-9_-]+)/)
                if (!urlMatch) {
                  errorCount++
                  continue
                }

                const shortcode = urlMatch[2]
                const matchedMedia = mediaMap.get(shortcode)

                if (matchedMedia) {
                  try {
                    await prisma.content.update({
                      where: { id: content.id },
                      data: {
                        likes: parseInt(matchedMedia.like_count || '0'),
                        comments: parseInt(matchedMedia.comments_count || '0'),
                        updatedAt: new Date(),
                      },
                    })
                    updatedCount++
                  } catch (error: any) {
                    console.error(`Content güncellenirken hata (${content.id}):`, error)
                    errors.push(`İçerik ${content.id}: ${error.message}`)
                    errorCount++
                  }
                } else {
                  errors.push(`İçerik ${content.id}: Instagram API'de bulunamadı`)
                  errorCount++
                }
              }
            }
          } catch (error: any) {
            console.error('Instagram içerikleri güncellenirken hata:', error)
            errors.push(`Instagram güncelleme hatası: ${error.message}`)
            errorCount += instagramContents.length
          }
        }
      }
    }

    return NextResponse.json({
      message: `${updatedCount} içerik başarıyla güncellendi`,
      updated: updatedCount,
      errors: errorCount,
      total: contents.length,
      errorDetails: errors.length > 0 ? errors.slice(0, 10) : undefined, // İlk 10 hatayı göster
    })
  } catch (error: any) {
    console.error('Error syncing content:', error)
    return NextResponse.json(
      { error: `İçerikler güncellenirken hata oluştu: ${error.message}` },
      { status: 500 }
    )
  }
}


