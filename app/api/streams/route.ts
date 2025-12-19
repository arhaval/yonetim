import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // SADECE onaylanmış yayınları göster (status: 'approved')
    const streams = await prisma.stream.findMany({
      where: { 
        status: 'approved' // Sadece onaylanmış yayınlar
      },
      include: {
        streamer: true,
      },
      orderBy: { date: 'desc' },
    })
    
    return NextResponse.json(streams)
  } catch (error: any) {
    console.error('Error fetching streams:', error)
    // Eğer status alanı henüz tanınmıyorsa, boş array döndür
    if (error.message?.includes('status') || error.message?.includes('Unknown argument')) {
      console.warn('Status alanı henüz tanınmıyor. Boş liste döndürülüyor.')
      return NextResponse.json([])
    }
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

