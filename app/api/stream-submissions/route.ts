import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

/**
 * Yayın gönderme endpoint'i
 * Yayıncılar yaptıkları yayınları buradan gönderir
 * Admin onayladığında ödeme listesine eklenir
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const streamerId = cookieStore.get('streamer-id')?.value

    if (!streamerId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { date, duration, matchInfo, teamName } = body

    if (!date || !duration) {
      return NextResponse.json(
        { error: 'Tarih ve süre gereklidir' },
        { status: 400 }
      )
    }

    // Yayıncıyı kontrol et
    const streamer = await prisma.streamer.findUnique({
      where: { id: streamerId },
      select: { id: true, name: true, hourlyRate: true, commissionRate: true },
    })

    if (!streamer) {
      return NextResponse.json(
        { error: 'Yayıncı bulunamadı' },
        { status: 404 }
      )
    }

    // Yayın oluştur (status: pending, admin onayı bekliyor)
    const stream = await prisma.stream.create({
      data: {
        streamerId: streamerId,
        date: new Date(date),
        duration: parseInt(duration),
        matchInfo: matchInfo || null,
        teamName: teamName || null,
        status: 'pending', // Admin onayı bekliyor
        paymentStatus: 'pending',
        totalRevenue: 0, // Admin dolduracak
        streamerEarning: 0, // Admin dolduracak
        arhavalProfit: 0, // Admin dolduracak
        cost: 0,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Yayın gönderildi! Admin onayladığında ödeme listesine eklenecek.',
      stream,
    })
  } catch (error: any) {
    console.error('Error submitting stream:', error)
    return NextResponse.json(
      { error: error.message || 'Yayın gönderilemedi' },
      { status: 500 }
    )
  }
}

