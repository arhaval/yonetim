import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

// Yayıncının ödeme bilgilerini ve geçmişini getir
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

    // Streamer'ı kontrol et
    const streamer = await prisma.streamer.findUnique({
      where: { id: streamerId },
    })

    if (!streamer || !streamer.isActive) {
      return NextResponse.json(
        { error: 'Yayıncı bulunamadı veya aktif değil' },
        { status: 404 }
      )
    }

    // Ödeme istatistikleri hesapla
    let unpaidStreams = { _sum: { streamerEarning: null as number | null } }
    let paidStreams = { _sum: { streamerEarning: null as number | null } }
    
    try {
      [unpaidStreams, paidStreams] = await Promise.all([
        prisma.stream.aggregate({
          where: {
            streamerId,
            paymentStatus: 'pending',
          },
          _sum: { streamerEarning: true },
        }),
        prisma.stream.aggregate({
          where: {
            streamerId,
            paymentStatus: 'paid',
          },
          _sum: { streamerEarning: true },
        }),
      ])
    } catch (error: any) {
      // Eğer paymentStatus alanı henüz tanınmıyorsa, varsayılan değerler kullan
      if (error.message?.includes('paymentStatus') || error.message?.includes('Unknown argument')) {
        console.warn('PaymentStatus alanı henüz tanınmıyor. Varsayılan değerler kullanılıyor.')
        unpaidStreams = { _sum: { streamerEarning: null } }
        paidStreams = { _sum: { streamerEarning: null } }
      } else {
        throw error
      }
    }

    const [unpaidPayments, paidPayments, totalEarning] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          streamerId,
          paidAt: null,
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          streamerId,
          paidAt: { not: null },
        },
        _sum: { amount: true },
      }),
      prisma.stream.aggregate({
        where: { streamerId },
        _sum: { streamerEarning: true },
      }),
    ])

    // Toplam hesaplamalar
    const totalUnpaid = (unpaidStreams._sum.streamerEarning || 0) + (unpaidPayments._sum.amount || 0)
    const totalPaid = (paidStreams._sum.streamerEarning || 0) + (paidPayments._sum.amount || 0)
    const totalDue = totalUnpaid + totalPaid

    // Ödeme geçmişi - yapılan ödemeleri getir
    const paymentHistory = await prisma.payment.findMany({
      where: {
        streamerId,
        paidAt: { not: null },
      },
      orderBy: { paidAt: 'asc' },
      take: 50, // Son 50 ödemeyi getir
    })

    return NextResponse.json({
      totalDue,
      totalPaid,
      totalUnpaid,
      streamUnpaid: unpaidStreams._sum.streamerEarning || 0,
      streamPaid: paidStreams._sum.streamerEarning || 0,
      paymentUnpaid: unpaidPayments._sum.amount || 0,
      paymentPaid: paidPayments._sum.amount || 0,
      paymentHistory: paymentHistory.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        type: payment.type,
        period: payment.period,
        description: payment.description,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching payment info:', error)
    return NextResponse.json(
      { error: 'Ödeme bilgileri getirilemedi' },
      { status: 500 }
    )
  }
}

