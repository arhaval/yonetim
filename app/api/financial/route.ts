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
        teamMember: true,
      },
      orderBy: { date: 'asc' },
    }).catch(() => [])

    // Payment ve TeamPayment kayıtlarını da ekle
    const payments = await prisma.payment.findMany({
      where: filter === 'monthly' ? {
        paidAt: {
          gte: parse(monthParam, 'yyyy-MM', new Date()),
          lte: endOfMonth(parse(monthParam, 'yyyy-MM', new Date())),
        },
      } : {},
      include: {
        streamer: true,
      },
      orderBy: { createdAt: 'asc' },
    }).catch(() => [])

    const teamPayments = await prisma.teamPayment.findMany({
      where: filter === 'monthly' ? {
        paidAt: {
          gte: parse(monthParam, 'yyyy-MM', new Date()),
          lte: endOfMonth(parse(monthParam, 'yyyy-MM', new Date())),
        },
      } : {},
      include: {
        teamMember: true,
      },
      orderBy: { createdAt: 'asc' },
    }).catch(() => [])

    // Payment'ları FinancialRecord formatına çevir
    const paymentRecords = payments.map((p) => ({
      id: `payment-${p.id}`,
      type: 'expense' as const,
      category: 'Maaş - Yayıncı',
      amount: p.amount,
      description: `${p.type} - ${p.period}${p.description ? ` - ${p.description}` : ''}`,
      date: p.paidAt || p.createdAt,
      streamer: p.streamer,
      streamerId: p.streamerId,
      teamMember: null,
      teamMemberId: null,
      isPayment: true,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }))

    // TeamPayment'ları FinancialRecord formatına çevir
    const teamPaymentRecords = teamPayments.map((tp) => ({
      id: `team-payment-${tp.id}`,
      type: 'expense' as const,
      category: 'Maaş - Ekip',
      amount: tp.amount,
      description: `${tp.type} - ${tp.period}${tp.description ? ` - ${tp.description}` : ''}`,
      date: tp.paidAt || tp.createdAt,
      streamer: null,
      streamerId: null,
      teamMember: tp.teamMember,
      teamMemberId: tp.teamMemberId,
      isPayment: true,
      paidAt: tp.paidAt,
      createdAt: tp.createdAt,
      updatedAt: tp.updatedAt,
    }))

    // Tüm kayıtları birleştir
    const allRecords = [...records, ...paymentRecords, ...teamPaymentRecords]

    return NextResponse.json(allRecords)
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
        teamMemberId: data.teamMemberId || null,
      },
      include: {
        streamer: true,
        teamMember: true,
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
