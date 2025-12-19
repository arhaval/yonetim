import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, parse } from 'date-fns'

// Cache GET requests for 1 minute
export const revalidate = 60

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

    // Prisma Client güncellenene kadar geçici çözüm
    let streams: any[] = []
    try {
      streams = await prisma.stream.findMany({
        where: {
          ...whereClause,
          status: 'approved', // Sadece onaylanmış yayınları göster
        },
        include: {
          streamer: true,
        },
        orderBy: { date: 'asc' },
      })
    } catch (error: any) {
      // Eğer status alanı henüz tanınmıyorsa, tüm yayınları göster
      if (error.message?.includes('status') || error.message?.includes('Unknown argument')) {
        console.warn('Status alanı henüz tanınmıyor. Tüm yayınlar gösteriliyor.')
        streams = await prisma.stream.findMany({
          where: whereClause,
          include: {
            streamer: true,
          },
          orderBy: { date: 'asc' },
        })
      } else {
        throw error
      }
    }

    return NextResponse.json(streams || [])
  } catch (error) {
    console.error('Error fetching streams:', error)
    return NextResponse.json([], { status: 200 }) // Boş array döndür
  }
}



