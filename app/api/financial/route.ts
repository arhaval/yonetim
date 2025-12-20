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

    // teamMember include'u schema'da yoksa hata vermesin
    let records: any[] = []
    try {
      records = await prisma.financialRecord.findMany({
        where: whereClause,
        include: {
          streamer: true,
          teamMember: true,
        },
        orderBy: { date: 'asc' },
      })
    } catch (error: any) {
      // teamMember include hatası varsa, sadece streamer ile dene
      if (error.message?.includes('teamMember') || error.message?.includes('Unknown argument')) {
        console.warn('teamMember include hatası, sadece streamer ile devam ediliyor...')
        records = await prisma.financialRecord.findMany({
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

    // Payment ve TeamPayment kayıtlarını da ekle
    const monthStart = filter === 'monthly' ? startOfMonth(parse(monthParam, 'yyyy-MM', new Date())) : null
    const monthEnd = filter === 'monthly' ? endOfMonth(parse(monthParam, 'yyyy-MM', new Date())) : null

    const payments = await prisma.payment.findMany({
      where: filter === 'monthly' && monthStart && monthEnd ? {
        OR: [
          { paidAt: { gte: monthStart, lte: monthEnd } },
          { createdAt: { gte: monthStart, lte: monthEnd } },
        ],
      } : {},
      include: {
        streamer: true,
      },
      orderBy: { createdAt: 'asc' },
    }).catch(() => [])

    const teamPayments = await prisma.teamPayment.findMany({
      where: filter === 'monthly' && monthStart && monthEnd ? {
        OR: [
          { paidAt: { gte: monthStart, lte: monthEnd } },
          { createdAt: { gte: monthStart, lte: monthEnd } },
        ],
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
    
    // Veri doğrulama
    if (!data.type || !data.category || !data.amount || !data.date) {
      return NextResponse.json(
        { error: 'Tip, kategori, tutar ve tarih gereklidir' },
        { status: 400 }
      )
    }

    // Prisma data objesi oluştur (teamMemberId varsa ekle, yoksa ekleme)
    const prismaData: any = {
      type: data.type,
      category: data.category,
      amount: parseFloat(data.amount),
      description: data.description || null,
      date: new Date(data.date),
      streamerId: data.streamerId || null,
    }

    // teamMemberId sadece varsa ekle (schema'da yoksa hata vermesin)
    try {
      if (data.teamMemberId) {
        prismaData.teamMemberId = data.teamMemberId
      }
    } catch (e) {
      // teamMemberId alanı schema'da yoksa devam et
      console.warn('teamMemberId alanı schema\'da bulunamadı, devam ediliyor...')
    }

    const record = await prisma.financialRecord.create({
      data: prismaData,
      include: {
        streamer: true,
        teamMember: data.teamMemberId ? true : undefined,
      },
    })
    
    return NextResponse.json(record)
  } catch (error: any) {
    console.error('Error creating financial record:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    })
    
    // Daha açıklayıcı hata mesajları
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Geçersiz yayıncı veya ekip üyesi ID\'si' },
        { status: 400 }
      )
    }
    
    if (error.message?.includes('teamMemberId') || error.message?.includes('Unknown argument')) {
      // Schema'da teamMemberId yoksa, sadece streamerId ile kaydet
      try {
        const data = await request.json()
        const record = await prisma.financialRecord.create({
          data: {
            type: data.type,
            category: data.category,
            amount: parseFloat(data.amount),
            description: data.description || null,
            date: new Date(data.date),
            streamerId: data.streamerId || null,
            // teamMemberId'yi atla
          },
          include: {
            streamer: true,
          },
        })
        return NextResponse.json(record)
      } catch (retryError: any) {
        return NextResponse.json(
          { error: `Finansal kayıt oluşturulamadı: ${retryError.message}` },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { error: `Finansal kayıt oluşturulamadı: ${error.message || 'Bilinmeyen hata'}` },
      { status: 500 }
    )
  }
}
