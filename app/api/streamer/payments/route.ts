import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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

    // Ödeme geçmişi - yapılan ödemeleri getir (Payment)
    const paymentHistory = await prisma.payment.findMany({
      where: {
        streamerId,
        paidAt: { not: null },
      },
      orderBy: { paidAt: 'asc' }, // Eski → Yeni sıralama
      take: 50, // Son 50 ödemeyi getir
    })

    // Payout kayıtlarını getir
    const payouts = await prisma.payout.findMany({
      where: {
        recipientType: 'streamer',
        recipientId: streamerId,
      },
      orderBy: { createdAt: 'asc' }, // Eski → Yeni sıralama
      take: 50,
    })

    // Payout toplamlarını hesapla
    const payoutUnpaid = await prisma.payout.aggregate({
      where: {
        recipientType: 'streamer',
        recipientId: streamerId,
        status: 'unpaid',
      },
      _sum: { amount: true },
    })

    const payoutPaid = await prisma.payout.aggregate({
      where: {
        recipientType: 'streamer',
        recipientId: streamerId,
        status: 'paid',
      },
      _sum: { amount: true },
    })

    // Birleşik ödeme geçmişi oluştur
    const allPayments = [
      ...paymentHistory.map(payment => ({
        id: `payment-${payment.id}`,
        source: 'payment' as const,
        title: `${payment.type} - ${payment.period}`,
        description: payment.description || `${payment.period} ayı ${payment.type} ödemesi`,
        amount: payment.amount,
        status: 'paid' as const,
        date: payment.paidAt || payment.createdAt,
        createdAt: payment.createdAt,
      })),
      ...payouts.map(payout => ({
        id: `payout-${payout.id}`,
        source: 'payout' as const,
        title: 'Manuel Ödeme',
        description: payout.note || 'Manuel ödeme kaydı',
        amount: payout.amount,
        status: payout.status as 'paid' | 'unpaid' | 'partial',
        date: payout.paidAt || payout.createdAt,
        createdAt: payout.createdAt,
      })),
    ]

    // Tarihe göre sırala (en yeni önce)
    allPayments.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })

    // Toplam hesaplamaları güncelle (payouts dahil)
    const totalUnpaidWithPayouts = totalUnpaid + (payoutUnpaid._sum.amount || 0)
    const totalPaidWithPayouts = totalPaid + (payoutPaid._sum.amount || 0)

    return NextResponse.json({
      totalDue: totalDue + (payoutUnpaid._sum.amount || 0) + (payoutPaid._sum.amount || 0),
      totalPaid: totalPaidWithPayouts,
      totalUnpaid: totalUnpaidWithPayouts,
      streamUnpaid: unpaidStreams._sum.streamerEarning || 0,
      streamPaid: paidStreams._sum.streamerEarning || 0,
      paymentUnpaid: unpaidPayments._sum.amount || 0,
      paymentPaid: paidPayments._sum.amount || 0,
      payoutUnpaid: payoutUnpaid._sum.amount || 0,
      payoutPaid: payoutPaid._sum.amount || 0,
      paymentHistory: allPayments.slice(0, 50), // Birleşik liste
    }, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Error fetching payment info:', error)
    return NextResponse.json(
      { error: 'Ödeme bilgileri getirilemedi' },
      { status: 500 }
    )
  }
}

