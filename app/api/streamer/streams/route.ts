import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

// Yayıncının kendi yayınlarını getir
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const streamerId = cookieStore.get('streamer-id')?.value

    if (!streamerId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    // URL'den streamerId parametresini al (güvenlik için cookie'deki ile eşleştir)
    const { searchParams } = new URL(request.url)
    const requestedStreamerId = searchParams.get('streamerId')

    if (requestedStreamerId !== streamerId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      )
    }

    // Yayıncı kendi yayınlarını görür (onaylanmış ve bekleyen)
    let streams: any[] = []
    try {
      // Önce approved ve pending olanları çek
      const approvedStreams = await prisma.stream.findMany({
        where: { 
          streamerId,
          status: 'approved'
        },
        orderBy: { date: 'desc' },
      })
      
      const pendingStreams = await prisma.stream.findMany({
        where: { 
          streamerId,
          status: 'pending'
        },
        orderBy: { date: 'desc' },
      })
      
      // Status null olanları da çek (eski yayınlar)
      const nullStatusStreams = await prisma.stream.findMany({
        where: { 
          streamerId,
          status: { is: null }
        },
        orderBy: { date: 'desc' },
      })
      
      // Hepsini birleştir ve tarihe göre sırala
      streams = [...approvedStreams, ...pendingStreams, ...nullStatusStreams].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
    } catch (error: any) {
      // Eğer status alanı henüz tanınmıyorsa, tüm yayınları göster
      if (error.message?.includes('status') || error.message?.includes('Unknown argument')) {
        console.warn('Status alanı henüz tanınmıyor. Tüm yayınlar gösteriliyor.')
        streams = await prisma.stream.findMany({
          where: { streamerId },
          orderBy: { date: 'desc' },
        })
      } else {
        throw error
      }
    }

    return NextResponse.json(streams)
  } catch (error) {
    console.error('Error fetching streams:', error)
    return NextResponse.json(
      { error: 'Yayınlar getirilemedi' },
      { status: 500 }
    )
  }
}

// Yayıncı yeni yayın ekler
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const streamerId = cookieStore.get('streamer-id')?.value

    if (!streamerId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    // Yayıncıyı kontrol et
    const streamer = await prisma.streamer.findUnique({
      where: { id: streamerId },
      include: { teamRates: true },
    })

    if (!streamer || !streamer.isActive) {
      return NextResponse.json(
        { error: 'Yayıncı bulunamadı veya aktif değil' },
        { status: 404 }
      )
    }

    const data = await request.json()
    const { date, duration, matchInfo, teamName } = data

    if (!date || !duration || !matchInfo || !teamName) {
      return NextResponse.json(
        { error: 'Tüm alanlar gereklidir' },
        { status: 400 }
      )
    }

    // Yayıncılar sadece temel bilgileri girer, finansal hesaplamalar admin tarafından yapılacak
    // Stream oluştur (status: pending - admin onaylayacak)
    const stream = await prisma.stream.create({
      data: {
        streamerId,
        date: new Date(date),
        duration: parseInt(duration),
        matchInfo,
        teamName,
        totalRevenue: 0, // Admin tarafından girilecek
        streamerEarning: 0, // Admin tarafından girilecek
        arhavalProfit: 0, // Admin tarafından girilecek
        status: 'pending', // Onay bekliyor
      },
    })

    return NextResponse.json({
      message: 'Yayın başarıyla eklendi. Admin onayı bekleniyor.',
      stream,
    })
  } catch (error: any) {
    console.error('Error creating stream:', error)
    return NextResponse.json(
      { error: `Yayın oluşturulamadı: ${error.message}` },
      { status: 500 }
    )
  }
}

