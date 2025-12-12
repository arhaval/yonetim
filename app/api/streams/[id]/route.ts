import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Yayın detaylarını getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stream = await prisma.stream.findUnique({
      where: { id: params.id },
      include: {
        streamer: true,
      },
    })

    if (!stream) {
      return NextResponse.json(
        { error: 'Yayın bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(stream)
  } catch (error) {
    console.error('Error fetching stream:', error)
    return NextResponse.json(
      { error: 'Yayın getirilemedi' },
      { status: 500 }
    )
  }
}

// Yayın güncelle (maliyet bilgileri)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const { streamerEarning } = data

    // Mevcut yayını bul
    const existingStream = await prisma.stream.findUnique({
      where: { id: params.id },
      include: {
        streamer: true,
      },
    })

    if (!existingStream) {
      return NextResponse.json(
        { error: 'Yayın bulunamadı' },
        { status: 404 }
      )
    }

    // Eski finansal kayıtları sil (varsa)
    await prisma.financialRecord.deleteMany({
      where: { streamId: params.id },
    })

    // Yayını güncelle (sadece yayıncı ödemesi güncellenir)
    const updatedStream = await prisma.stream.update({
      where: { id: params.id },
      data: {
        streamerEarning: parseFloat(streamerEarning) || 0,
        arhavalProfit: 0, // Artık kullanılmıyor
      },
    })

    // Sadece yayıncı ödemesini gider olarak kaydet
    if (parseFloat(streamerEarning) > 0) {
      await prisma.financialRecord.create({
        data: {
          type: 'expense',
          amount: parseFloat(streamerEarning),
          description: `Yayıncı ödemesi - ${existingStream.matchInfo || 'Yayın'} (${existingStream.duration} saat) - ${existingStream.teamName || ''}`,
          date: existingStream.date,
          category: 'stream',
          streamerId: existingStream.streamerId,
          streamId: params.id,
        },
      })
    }

    // Arhaval karı için otomatik gelir kaydı oluşturulmuyor
    // Toplu ödemeler Finansal Kayıtlar sayfasından manuel olarak gelir olarak eklenebilir

    return NextResponse.json({
      message: 'Yayın maliyet bilgileri güncellendi',
      stream: updatedStream,
    })
  } catch (error: any) {
    console.error('Error updating stream:', error)
    return NextResponse.json(
      { error: `Yayın güncellenemedi: ${error.message}` },
      { status: 500 }
    )
  }
}
