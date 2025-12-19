import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Yayın durumunu güncelle (onayla/reddet)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const { status } = data

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Geçersiz durum' },
        { status: 400 }
      )
    }

    // Stream'i güncelle
    let updatedStream
    try {
      updatedStream = await prisma.stream.update({
        where: { id: params.id },
        data: { status },
        include: {
          streamer: true,
        },
      })
      console.log('Stream status updated:', { id: params.id, status, updatedStream })
    } catch (error: any) {
      console.error('Error updating stream status:', error)
      // Eğer status alanı henüz tanınmıyorsa, raw SQL kullan
      if (error.message?.includes('status') || error.message?.includes('Unknown argument')) {
        console.warn('Status alanı henüz tanınmıyor, raw SQL kullanılıyor')
        // PostgreSQL için raw query
        await prisma.$executeRawUnsafe(
          `UPDATE "Stream" SET status = $1, "updatedAt" = NOW() WHERE id = $2`,
          status,
          params.id
        )
        
        // Güncellenmiş stream'i çek
        updatedStream = await prisma.stream.findUnique({
          where: { id: params.id },
          include: {
            streamer: true,
          },
        })
        
        if (!updatedStream) {
          throw new Error('Yayın bulunamadı')
        }
      } else {
        throw error
      }
    }

    return NextResponse.json({
      message: `Yayın ${status === 'approved' ? 'onaylandı' : status === 'rejected' ? 'reddedildi' : 'beklemede'}`,
      stream: updatedStream,
    })
  } catch (error: any) {
    console.error('Error updating stream status:', error)
    return NextResponse.json(
      { error: `Yayın durumu güncellenemedi: ${error.message}` },
      { status: 500 }
    )
  }
}

