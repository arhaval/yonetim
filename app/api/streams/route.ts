import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cache GET requests for 5 minutes
export const revalidate = 60 // 1 dakika cache
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const startTime = Date.now()
    console.log('[Streams API] Starting fetch...')
    
    // Tüm yayınları göster (yayıncılar yayınları girince direkt onaylanır)
    // Sadece gerekli alanları çek - performans için
    const streams = await prisma.stream.findMany({
      select: {
        id: true,
        date: true,
        duration: true,
        matchInfo: true,
        teamName: true,
        totalRevenue: true,
        streamerEarning: true,
        paymentStatus: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        streamer: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
      },
      orderBy: { date: 'desc' }, // Yeni → Eski sıralama (daha mantıklı)
      take: 200, // Son 200 kayıt
    })
    
    const duration = Date.now() - startTime
    console.log(`[Streams API] Successfully fetched ${streams.length} streams in ${duration}ms`)
    
    return NextResponse.json(streams)
  } catch (error: any) {
    console.error('[Streams API] Error fetching streams:', error)
    console.error('[Streams API] Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    })
    
    return NextResponse.json(
      { 
        error: 'Yayınlar getirilemedi', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Stream oluştur - status: "approved" olarak başlar (yayıncılar yayınları girince direkt onaylanır, admin sonra ücret belirler)
    const stream = await prisma.stream.create({
      data: {
        streamerId: data.streamerId,
        date: new Date(data.date),
        duration: data.duration, // Tam saat (Int)
        matchInfo: data.matchInfo || null,
        teamName: data.teamName || null,
        totalRevenue: data.totalRevenue || 0,
        streamerEarning: data.streamerEarning || 0, // 0 olabilir - admin sonra girecek
        arhavalProfit: data.arhavalProfit || 0,
        teams: data.teams || null, // Eski sistem için
        cost: data.cost || 0, // Eski sistem için
        notes: data.notes || null,
        status: 'approved', // Yayınlar direkt onaylanır, admin sonra ücret belirler
      },
    })

    // NOT: Finansal kayıt yayın girildiğinde OLUŞTURULMAZ
    // Finansal kayıt sadece "Tüm Ödemeler" sayfasından ödeme yapıldığında oluşur
    // Bu sayede çift kayıt sorunu önlenir

    return NextResponse.json(stream)
  } catch (error) {
    console.error('Error creating stream:', error)
    return NextResponse.json(
      { error: 'Yayın oluşturulamadı' },
      { status: 500 }
    )
  }
}

