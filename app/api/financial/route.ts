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

    // Finansal kayıtları getir
    const records = await prisma.financialRecord.findMany({
      where: whereClause,
      include: {
        streamer: true,
        teamMember: true,
      },
      orderBy: { date: 'asc' },
    }).catch(() => [])

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

    // Ödenen seslendirmen metinlerini getir
    const paidVoiceoverScripts = await prisma.voiceoverScript.findMany({
      where: {
        status: 'paid',
        ...(filter === 'monthly' && monthStart && monthEnd ? {
          updatedAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        } : {}),
      },
      include: {
        voiceActor: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { updatedAt: 'asc' },
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

    // Seslendirmen ödemelerini FinancialRecord formatına çevir
    const voiceoverRecords = paidVoiceoverScripts.map((script) => ({
      id: `voiceover-${script.id}`,
      type: 'expense' as const,
      category: 'Seslendirme',
      amount: script.price,
      description: script.title + (script.voiceActor ? ` - ${script.voiceActor.name}` : ''),
      date: script.updatedAt,
      streamer: null,
      streamerId: null,
      teamMember: null,
      teamMemberId: null,
      voiceActor: script.voiceActor,
      voiceActorId: script.voiceActorId,
      contentCreator: script.creator,
      contentCreatorId: script.creatorId,
      isPayment: true,
      paidAt: script.updatedAt,
      createdAt: script.createdAt,
      updatedAt: script.updatedAt,
    }))

    // Tüm kayıtları birleştir
    const allRecords = [...records, ...paymentRecords, ...teamPaymentRecords, ...voiceoverRecords]

    return NextResponse.json(allRecords)
  } catch (error) {
    console.error('Error fetching financial records:', error)
    return NextResponse.json([], { status: 200 }) // Boş array döndür
  }
}

export async function POST(request: NextRequest) {
  try {
    // Request body'yi bir kez oku ve sakla
    const data = await request.json()
    
    // Veri doğrulama
    if (!data.type || !data.category || !data.amount || !data.date) {
      return NextResponse.json(
        { error: 'Tip, kategori, tutar ve tarih gereklidir' },
        { status: 400 }
      )
    }

    // Prisma data objesi oluştur
    const prismaData: any = {
      type: data.type,
      category: data.category,
      amount: parseFloat(data.amount),
      description: data.description || null,
      date: new Date(data.date),
      streamerId: data.streamerId || null,
      streamId: null, // streamId opsiyonel
    }

    // teamMemberId varsa ekle
    if (data.teamMemberId) {
      prismaData.teamMemberId = data.teamMemberId
    }

    console.log('Creating financial record with data:', {
      type: prismaData.type,
      category: prismaData.category,
      amount: prismaData.amount,
      date: prismaData.date,
      streamerId: prismaData.streamerId,
      teamMemberId: prismaData.teamMemberId,
    })

    try {
      const record = await prisma.financialRecord.create({
        data: prismaData,
        include: {
          streamer: true,
          teamMember: data.teamMemberId ? true : undefined,
        },
      })
      
      console.log('Financial record created successfully:', record.id)
      return NextResponse.json(record)
    } catch (prismaError: any) {
      console.error('Prisma create error:', {
        message: prismaError.message,
        code: prismaError.code,
        meta: prismaError.meta,
        stack: prismaError.stack,
      })
      
      // Prisma hata kodlarına göre mesaj
      if (prismaError.code === 'P2003') {
        return NextResponse.json(
          { error: 'Geçersiz yayıncı ID\'si' },
          { status: 400 }
        )
      }
      
      if (prismaError.code === 'P2002') {
        return NextResponse.json(
          { error: 'Bu kayıt zaten mevcut' },
          { status: 400 }
        )
      }
      
      // Genel Prisma hatası
      return NextResponse.json(
        { 
          error: `Finansal kayıt oluşturulamadı: ${prismaError.message || 'Veritabanı hatası'}`,
          details: process.env.NODE_ENV === 'development' ? {
            message: prismaError.message,
            code: prismaError.code,
            meta: prismaError.meta,
          } : undefined
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error creating financial record:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    })
    
    // Body okuma hatası
    if (error.message?.includes('body has already been read') || error.message?.includes('body')) {
      return NextResponse.json(
        { error: 'Request body okunamadı. Lütfen tekrar deneyin.' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: `Finansal kayıt oluşturulamadı: ${error.message || 'Bilinmeyen hata'}` },
      { status: 500 }
    )
  }
}
