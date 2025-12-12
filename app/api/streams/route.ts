import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const streams = await prisma.stream.findMany({
      include: {
        streamer: true,
      },
      orderBy: { date: 'asc' },
    })
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
    
    // Stream oluştur
    const stream = await prisma.stream.create({
      data: {
        streamerId: data.streamerId,
        date: new Date(data.date),
        duration: data.duration, // Tam saat (Int)
        matchInfo: data.matchInfo || null,
        teamName: data.teamName || null,
        totalRevenue: data.totalRevenue || 0,
        streamerEarning: data.streamerEarning || 0,
        arhavalProfit: data.arhavalProfit || 0,
        teams: data.teams || null, // Eski sistem için
        cost: data.cost || 0, // Eski sistem için
        notes: data.notes || null,
      },
    })

    // Yayıncıya ödenecek ücreti gider olarak ekle
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

