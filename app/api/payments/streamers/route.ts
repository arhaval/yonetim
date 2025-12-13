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

    // O ay için yapılan ödemeleri getir
    const paymentsMade = await prisma.payment.findMany({
      where: {
        period: month,
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
      acc[streamerId].totalAmount += stream.streamerEarning
      if (stream.paymentStatus === 'paid') {
        acc[streamerId].paidAmount += stream.streamerEarning
      } else {
        acc[streamerId].pendingAmount += stream.streamerEarning
      }
      return acc
    }, {})

    // Ödemeleri yayıncı bazında topla
    const paymentsByStreamer = paymentsMade.reduce((acc: any, payment) => {
      if (!acc[payment.streamerId]) {
        acc[payment.streamerId] = 0
      }
      acc[payment.streamerId] += payment.amount
      return acc
    }, {})

    // Ödenen tutarları güncelle (kısmi ödemeler dahil)
    const payments = Object.values(groupedByStreamer).map((payment: any) => {
      const paidFromPayments = paymentsByStreamer[payment.streamerId] || 0
      // Ödenen tutar: ya tam ödenmiş yayınlar ya da kısmi ödemeler
      const actualPaid = Math.max(payment.paidAmount, paidFromPayments)
      const actualPending = payment.totalAmount - actualPaid
      
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
        paidAmount: actualPaid,
        pendingAmount: Math.max(0, actualPending),
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

