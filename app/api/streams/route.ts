import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Önce approved yayınları göster, eğer status alanı yoksa tüm yayınları göster
    let streams: any[] = []
    try {
      // Önce approved olanları çek
      const approvedStreams = await prisma.stream.findMany({
        where: { 
          status: 'approved'
        },
        include: {
          streamer: true,
        },
        orderBy: { date: 'desc' },
      })
      
      // Status null olanları da çek (eski yayınlar) - Prisma'da null kontrolü için is: null kullan
      const nullStatusStreams = await prisma.stream.findMany({
        where: { 
          status: { is: null }
        },
        include: {
          streamer: true,
        },
        orderBy: { date: 'desc' },
      })
      
      // İkisini birleştir ve tarihe göre sırala
      streams = [...approvedStreams, ...nullStatusStreams].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
    } catch (error: any) {
      // Eğer status alanı henüz tanınmıyorsa, tüm yayınları göster
      if (error.message?.includes('status') || error.message?.includes('Unknown argument')) {
        console.warn('Status alanı henüz tanınmıyor. Tüm yayınlar gösteriliyor.')
        streams = await prisma.stream.findMany({
          include: {
            streamer: true,
          },
          orderBy: { date: 'desc' },
        })
      } else {
        // Başka bir hata varsa, tüm yayınları göster
        console.warn('Status kontrolü başarısız, tüm yayınlar gösteriliyor:', error.message)
        streams = await prisma.stream.findMany({
          include: {
            streamer: true,
          },
          orderBy: { date: 'desc' },
        })
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

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Stream oluştur - status: "pending" olarak başlar (admin onaylayacak)
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
        status: 'pending', // Admin onaylayacak
      },
    })

    // Eğer yayıncı maliyet girdiyse finansal kayıt oluştur
    // Ama genelde admin onay sayfasından girilecek
    if (data.streamerEarning > 0) {
      await prisma.financialRecord.create({
        data: {
          type: 'expense',
          amount: data.streamerEarning,
          description: `Yayıncı ödemesi - ${data.matchInfo || 'Yayın'} (${data.duration} saat) - ${data.teamName || ''}`,
          date: new Date(data.date),
          category: 'stream',
          streamerId: data.streamerId,
          streamId: stream.id,
        },
      })
    }

    // Arhaval karı için otomatik gelir kaydı oluşturulmuyor
    // Toplu ödemeler Finansal Kayıtlar sayfasından manuel olarak gelir olarak eklenebilir

    return NextResponse.json(stream)
  } catch (error) {
    console.error('Error creating stream:', error)
    return NextResponse.json(
      { error: 'Yayın oluşturulamadı' },
      { status: 500 }
    )
  }
}

