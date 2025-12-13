import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Prisma Client güncellenene kadar geçici çözüm
    let pendingStreams: any[] = []
    try {
      pendingStreams = await prisma.stream.findMany({
        where: { status: 'pending' },
        include: {
          streamer: true,
        },
        orderBy: { createdAt: 'asc' },
      })
    } catch (error: any) {
      // Eğer status alanı henüz tanınmıyorsa, tüm yayınları göster
      if (error.message?.includes('status') || error.message?.includes('Unknown argument')) {
        console.warn('Status alanı henüz tanınmıyor. Tüm yayınlar gösteriliyor.')
        pendingStreams = await prisma.stream.findMany({
          include: {
            streamer: true,
          },
          orderBy: { createdAt: 'asc' },
          take: 10,
        })
      } else {
        throw error
      }
    }

    return NextResponse.json(pendingStreams)
  } catch (error) {
    console.error('Error fetching pending streams:', error)
    return NextResponse.json(
      { error: 'Onay bekleyen yayınlar getirilemedi' },
      { status: 500 }
    )
  }
}



