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

    // Approved ve null status olan yayınları göster
    let approvedStreams: any[] = []
    let nullStatusStreams: any[] = []
    
    try {
      approvedStreams = await prisma.stream.findMany({
        where: {
          ...whereClause,
          status: 'approved',
        },
        include: {
          streamer: true,
        },
        orderBy: { date: 'asc' },
      })
    } catch (error: any) {
      console.warn('Approved streams çekilemedi:', error.message)
    }

    try {
      nullStatusStreams = await prisma.stream.findMany({
        where: {
          ...whereClause,
          status: null as any,
        },
        include: {
          streamer: true,
        },
        orderBy: { date: 'asc' },
      })
    } catch (error: any) {
      // Null kontrolü çalışmazsa, tüm yayınları çek ve filtrele
      const allStreams = await prisma.stream.findMany({
        where: whereClause,
        include: {
          streamer: true,
        },
        orderBy: { date: 'asc' },
      })
      nullStatusStreams = allStreams.filter((s: any) => !s.status || s.status === null)
    }

    // İkisini birleştir ve tarihe göre sırala
    const streams = [...approvedStreams, ...nullStatusStreams].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
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



