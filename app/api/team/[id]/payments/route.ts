import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Birleşik ödemeler endpoint'i - hem TeamPayment hem FinancialRecord payout'larını döndürür
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const startTime = Date.now()
    const resolvedParams = await Promise.resolve(params)
    const teamMemberId = resolvedParams.id
    
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 1. TeamPayment kayıtlarını çek
    const teamPayments = await prisma.teamPayment.findMany({
      where: { teamMemberId },
      select: {
        id: true,
        amount: true,
        type: true,
        period: true,
        description: true,
        paidAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    // 2. FinancialRecord'dan payout kayıtlarını çek
    const financialPayouts = await prisma.financialRecord.findMany({
      where: {
        teamMemberId,
        entryType: 'payout',
        direction: 'OUT',
      },
      select: {
        id: true,
        amount: true,
        category: true,
        description: true,
        occurredAt: true,
        createdAt: true,
      },
      orderBy: { occurredAt: 'desc' },
      take: limit,
      skip: offset,
    })

    // 3. İki kaynağı birleştir ve normalize et
    const allPayments = [
      ...teamPayments.map(tp => ({
        id: `team-payment-${tp.id}`,
        source: 'team-payment' as const,
        title: `${tp.type} - ${tp.period}`,
        description: tp.description || `${tp.period} ayı ${tp.type} ödemesi`,
        amount: tp.amount,
        occurredAt: tp.paidAt || tp.createdAt,
        status: tp.paidAt ? 'paid' as const : 'unpaid' as const,
        createdAt: tp.createdAt,
        period: tp.period,
      })),
      ...financialPayouts.map(fr => ({
        id: `financial-${fr.id}`,
        source: 'financial' as const,
        title: fr.category || 'Finansal Ödeme',
        description: fr.description || `${fr.category} ödemesi`,
        amount: fr.amount,
        occurredAt: fr.occurredAt,
        status: 'paid' as const,
        createdAt: fr.createdAt,
      })),
    ]

    // occurredAt'e göre sırala (en yeni önce)
    allPayments.sort((a, b) => {
      const dateA = new Date(a.occurredAt).getTime()
      const dateB = new Date(b.occurredAt).getTime()
      return dateB - dateA
    })

    // Pagination uygula
    const paginatedPayments = allPayments.slice(offset, offset + limit)

    const duration = Date.now() - startTime
    console.log(`[Team Payments API] Fetched ${paginatedPayments.length} payments in ${duration}ms for teamMemberId: ${teamMemberId}`)

    return NextResponse.json({
      payments: paginatedPayments,
      total: allPayments.length,
      limit,
      offset,
      hasMore: offset + limit < allPayments.length,
    })
  } catch (error: any) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Ödemeler getirilemedi', details: error.message },
      { status: 500 }
    )
  }
}


















