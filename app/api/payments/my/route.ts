import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Birleşik ödemeler endpoint'i - hem Payment/TeamPayment hem FinancialRecord payout'larını döndürür
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const startTime = Date.now()

    // Authentication - hangi kullanıcı tipi login olmuş?
    const cookieStore = await cookies()
    const streamerId = cookieStore.get('streamer-id')?.value
    const teamMemberId = cookieStore.get('team-member-id')?.value
    const creatorId = cookieStore.get('creator-id')?.value
    const voiceActorId = cookieStore.get('voice-actor-id')?.value

    if (!streamerId && !teamMemberId && !creatorId && !voiceActorId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const allPayments: any[] = []

    // 1. Streamer için Payment kayıtlarını çek
    if (streamerId) {
      const payments = await prisma.payment.findMany({
        where: { streamerId },
        select: {
          id: true,
          amount: true,
          type: true,
          period: true,
          description: true,
          paidAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' }, // Eski → Yeni sıralama
        take: limit,
        skip: offset,
      })

      allPayments.push(...payments.map(p => ({
        id: `payment-${p.id}`,
        source: 'payment' as const,
        title: `${p.type} - ${p.period}`,
        description: p.description || `${p.period} ayı ${p.type} ödemesi`,
        amount: p.amount,
        occurredAt: p.paidAt || p.createdAt,
        status: p.paidAt ? 'paid' as const : 'unpaid' as const,
        createdAt: p.createdAt,
        period: p.period,
      })))
    }

    // 2. TeamMember için TeamPayment kayıtlarını çek
    if (teamMemberId) {
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
        orderBy: { createdAt: 'asc' }, // Eski → Yeni sıralama
        take: limit,
        skip: offset,
      })

      allPayments.push(...teamPayments.map(tp => ({
        id: `team-payment-${tp.id}`,
        source: 'team-payment' as const,
        title: `${tp.type} - ${tp.period}`,
        description: tp.description || `${tp.period} ayı ${tp.type} ödemesi`,
        amount: tp.amount,
        occurredAt: tp.paidAt || tp.createdAt,
        status: tp.paidAt ? 'paid' as const : 'unpaid' as const,
        createdAt: tp.createdAt,
        period: tp.period,
      })))
    }

    // 3. FinancialRecord'dan payout kayıtlarını çek
    const financialWhere: any = {
      entryType: 'payout',
      direction: 'OUT',
    }

    if (streamerId) {
      financialWhere.streamerId = streamerId
    } else if (teamMemberId) {
      financialWhere.teamMemberId = teamMemberId
    } else if (creatorId) {
      financialWhere.contentCreatorId = creatorId
    } else if (voiceActorId) {
      financialWhere.voiceActorId = voiceActorId
    }

    const financialPayouts = await prisma.financialRecord.findMany({
      where: financialWhere,
      select: {
        id: true,
        amount: true,
        category: true,
        description: true,
        occurredAt: true,
        createdAt: true,
        entryType: true,
        direction: true,
      },
      orderBy: { occurredAt: 'asc' }, // Eski → Yeni sıralama
      take: limit,
      skip: offset,
    })

    allPayments.push(...financialPayouts.map(fr => ({
      id: `financial-${fr.id}`,
      source: 'financial' as const,
      title: fr.category || 'Finansal Ödeme',
      description: fr.description || `${fr.category} ödemesi`,
      amount: fr.amount,
      occurredAt: fr.occurredAt,
      status: 'paid' as const, // FinancialRecord payout'ları zaten ödenmiş sayılır
      createdAt: fr.createdAt,
    })))

    // Tüm ödemeleri occurredAt'e göre sırala (en yeni önce)
    allPayments.sort((a, b) => {
      const dateA = new Date(a.occurredAt).getTime()
      const dateB = new Date(b.occurredAt).getTime()
      return dateB - dateA
    })

    // Pagination uygula
    const paginatedPayments = allPayments.slice(offset, offset + limit)

    const duration = Date.now() - startTime
    console.log(`[Payments My API] Fetched ${paginatedPayments.length} payments in ${duration}ms for:`, {
      streamerId,
      teamMemberId,
      creatorId,
      voiceActorId,
    })

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

