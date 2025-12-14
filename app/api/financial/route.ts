import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, parse } from 'date-fns'

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

    const records = await prisma.financialRecord.findMany({
      where: whereClause,
      include: {
        streamer: true,
      },
      orderBy: { date: 'asc' },
    }).catch(() => [])

    return NextResponse.json(records)
  } catch (error) {
    console.error('Error fetching financial records:', error)
    return NextResponse.json([], { status: 200 }) // Boş array döndür
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const record = await prisma.financialRecord.create({
      data: {
        type: data.type,
        category: data.category,
        amount: data.amount,
        description: data.description || null,
        date: new Date(data.date),
        streamerId: data.streamerId || null,
      },
      include: {
        streamer: true,
      },
    })
    return NextResponse.json(record)
  } catch (error) {
    console.error('Error creating financial record:', error)
    return NextResponse.json(
      { error: 'Finansal kayıt oluşturulamadı' },
      { status: 500 }
    )
  }
}
