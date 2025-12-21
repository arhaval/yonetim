import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, parse } from 'date-fns'

// searchParams kullandığı için dynamic olmalı
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') || 'monthly'
    const monthParam = searchParams.get('month') || new Date().toISOString().slice(0, 7)

    let whereClause: any = {}

    if (filter === 'monthly') {
      const monthDate = parse(monthParam, 'yyyy-MM', new Date())
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)
      whereClause = {
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      }
    }

    // Tüm yayınları göster (yayıncılar yayınları girince direkt onaylanır)
    const streams = await prisma.stream.findMany({
      where: {
        ...whereClause,
        // Status filtresi kaldırıldı - tüm yayınlar gösterilir
      },
      select: {
        id: true,
        streamerId: true,
        date: true,
        duration: true,
        matchInfo: true,
        teamName: true,
        totalRevenue: true,
        streamerEarning: true,
        arhavalProfit: true,
        status: true,
        paymentStatus: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        streamer: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            isActive: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    })

    const response = NextResponse.json(streams || [])
    // Cache için header ekle (1 dakika)
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
    return response
  } catch (error) {
    console.error('Error fetching streams:', error)
    return NextResponse.json([], { status: 200 }) // Boş array döndür
  }
}



