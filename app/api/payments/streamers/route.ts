import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Yayıncılar için aylık ödeme özeti
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7) // YYYY-MM

    // Ayın başlangıç ve bitiş tarihleri
    const [year, monthNum] = month.split('-').map(Number)
    const startDate = new Date(year, monthNum - 1, 1)
    const endDate = new Date(year, monthNum, 0, 23, 59, 59)

    // O ay için onaylanmış yayınları getir
    const streams = await prisma.stream.findMany({
      where: {
        status: 'approved',
        date: {
          gte: startDate,
          lte: endDate,
        },
        streamerEarning: {
          gt: 0,
        },
      },
      include: {
        streamer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Yayıncı bazında grupla
    const groupedByStreamer = streams.reduce((acc: any, stream) => {
      const streamerId = stream.streamerId
      if (!acc[streamerId]) {
        acc[streamerId] = {
          streamerId,
          streamerName: stream.streamer.name,
          totalStreams: 0,
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
        }
      }
      acc[streamerId].totalStreams++
      acc[streamerId].totalAmount += stream.streamerEarning || 0
      // paymentStatus kontrolü - null/undefined durumlarını da pending olarak kabul et
      if (stream.paymentStatus === 'paid') {
        acc[streamerId].paidAmount += stream.streamerEarning || 0
      } else {
        // pending, null, undefined veya başka bir değer -> pendingAmount'a ekle
        acc[streamerId].pendingAmount += stream.streamerEarning || 0
      }
      return acc
    }, {})

    // Ödenen tutarları hesapla - sadece paymentStatus'a göre
    const payments = Object.values(groupedByStreamer).map((payment: any) => {
      // Bu yayıncıya ait onaylanmış yayınları getir
      const streamerStreams = streams
        .filter(s => s.streamerId === payment.streamerId)
        .map(s => ({
          id: s.id,
          date: s.date,
          duration: s.duration,
          teamName: s.teamName,
          matchInfo: s.matchInfo,
          streamerEarning: s.streamerEarning,
          paymentStatus: s.paymentStatus,
          status: s.status,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
      return {
        ...payment,
        // paidAmount ve pendingAmount zaten doğru hesaplanmış (paymentStatus'a göre)
        streams: streamerStreams, // Detaylı yayın listesi
      }
    })

    return NextResponse.json(payments)
  } catch (error: any) {
    console.error('Error fetching streamer payments:', error)
    return NextResponse.json(
      { error: error.message || 'Ödeme bilgileri getirilemedi' },
      { status: 500 }
    )
  }
}

