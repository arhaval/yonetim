import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Yayın detaylarını getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const stream = await prisma.stream.findUnique({
      where: { id: resolvedParams.id },
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
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const data = await request.json()
    const { streamerEarning } = data

    // Mevcut yayını bul
    const existingStream = await prisma.stream.findUnique({
      where: { id: resolvedParams.id },
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
      where: { streamId: resolvedParams.id },
    })

    // Yayını güncelle (sadece yayıncı ödemesi güncellenir)
    const updatedStream = await prisma.stream.update({
      where: { id: resolvedParams.id },
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
          streamId: resolvedParams.id,
        },
      })
    }

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

// Yayın sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    
    // Yayını bul
    const stream = await prisma.stream.findUnique({
      where: { id: resolvedParams.id },
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

    // İlgili finansal kayıtları sil
    await prisma.financialRecord.deleteMany({
      where: { streamId: resolvedParams.id },
    })

    // Yayını sil
    await prisma.stream.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({
      message: 'Yayın başarıyla silindi',
    })
  } catch (error: any) {
    console.error('Error deleting stream:', error)
    return NextResponse.json(
      { error: `Yayın silinemedi: ${error.message}` },
      { status: 500 }
    )
  }
}
