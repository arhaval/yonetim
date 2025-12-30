import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, parse, format } from 'date-fns'
import { createAuditLog } from '@/lib/audit-log'
import { cookies } from 'next/headers'
import { getFinancialRecordLastActivityAt, getPaymentLastActivityAt, getTeamPaymentLastActivityAt, getVoiceoverScriptLastActivityAt } from '@/lib/lastActivityAt'

// Cache GET requests for 30 seconds
export const revalidate = 30

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') || 'monthly'
    const monthParam = searchParams.get('month') || new Date().toISOString().slice(0, 7)
    const voiceActorId = searchParams.get('voiceActorId')
    const teamMemberId = searchParams.get('teamMemberId')
    const streamerId = searchParams.get('streamerId')
    const contentCreatorId = searchParams.get('contentCreatorId')

    let whereClause: any = {}

    // Monthly filter için occurredAt kullan (date deprecated)
    const monthStart = filter === 'monthly' ? startOfMonth(parse(monthParam, 'yyyy-MM', new Date())) : null
    const monthEnd = filter === 'monthly' ? endOfMonth(parse(monthParam, 'yyyy-MM', new Date())) : null
    
    if (filter === 'monthly' && monthStart && monthEnd) {
      // occurredAt kullan (date deprecated) - index optimize edildi
      whereClause.occurredAt = {
        gte: monthStart,
        lte: monthEnd,
      }
    }

    // Role-based filtering
    if (voiceActorId) {
      whereClause.voiceActorId = voiceActorId
    }
    if (teamMemberId) {
      whereClause.teamMemberId = teamMemberId
    }
    if (streamerId) {
      whereClause.streamerId = streamerId
    }
    if (contentCreatorId) {
      whereClause.contentCreatorId = contentCreatorId
    }

    // Finansal kayıtları getir - date ASC ile (eski → yeni) - Optimize: sadece gerekli field'lar
    const records = await prisma.financialRecord.findMany({
      where: whereClause,
      select: {
        id: true,
        type: true,
        amount: true,
        date: true,
        description: true,
        streamerId: true,
        teamMemberId: true,
        contentCreatorId: true,
        voiceActorId: true,
        entryType: true,
        direction: true,
        occurredAt: true,
        streamer: {
          select: {
            id: true,
            name: true,
          },
        },
        teamMember: {
          select: {
            id: true,
            name: true,
          },
        },
        contentCreator: {
          select: {
            id: true,
            name: true,
          },
        },
        voiceActor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { occurredAt: 'asc' }, // Eski → Yeni sıralama (occurredAt index'li)
    }).catch(() => [])

    // Tarih bazlı sıralama zaten yapıldı (occurredAt: 'asc')
    const sortedRecords = records

    const payments = await prisma.payment.findMany({
      where: filter === 'monthly' && monthStart && monthEnd ? {
        OR: [
          { paidAt: { gte: monthStart, lte: monthEnd } },
          { createdAt: { gte: monthStart, lte: monthEnd } },
        ],
      } : {},
      select: {
        id: true,
        amount: true,
        type: true,
        period: true,
        description: true,
        paidAt: true,
        createdAt: true,
        updatedAt: true,
        streamerId: true,
        streamer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' }, // Eski → Yeni sıralama
    }).catch(() => [])

    // Tarih bazlı sıralama zaten yapıldı (createdAt: 'asc')
    const sortedPayments = payments

    // TeamPayment query optimize edildi - index kullanımı
    const teamPayments = await prisma.teamPayment.findMany({
      where: filter === 'monthly' && monthStart && monthEnd ? {
        OR: [
          { paidAt: { gte: monthStart, lte: monthEnd } }, // paidAt index'li
          { createdAt: { gte: monthStart, lte: monthEnd } },
        ],
      } : {},
      select: {
        id: true,
        amount: true,
        type: true,
        period: true,
        description: true,
        paidAt: true,
        createdAt: true,
        updatedAt: true,
        teamMemberId: true,
        teamMember: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' }, // Eski → Yeni sıralama
    }).catch(() => [])

    // Tarih bazlı sıralama zaten yapıldı (createdAt: 'asc')
    const sortedTeamPayments = teamPayments

    // Ödenen seslendirmen metinlerini getir
    let voiceoverScriptsWhere: any = {
      status: 'PAID',
    }
    
    if (filter === 'monthly' && monthStart && monthEnd) {
      voiceoverScriptsWhere.updatedAt = {
        gte: monthStart,
        lte: monthEnd,
      }
    }
    
    if (voiceActorId) {
      voiceoverScriptsWhere.voiceActorId = voiceActorId
    }
    
    const paidVoiceoverScripts = await prisma.voiceoverScript.findMany({
      where: voiceoverScriptsWhere,
      select: {
        id: true,
        title: true,
        price: true,
        status: true,
        updatedAt: true,
        createdAt: true,
        voiceActorId: true,
        creatorId: true,
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
      orderBy: { createdAt: 'asc' }, // Eski → Yeni sıralama
    }).catch(() => [])

    // Tarih bazlı sıralama zaten yapıldı (createdAt: 'asc')
    const sortedPaidVoiceoverScripts = paidVoiceoverScripts

    // Payment'ları FinancialRecord formatına çevir
    const paymentRecords = sortedPayments.map((p) => ({
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
    const teamPaymentRecords = sortedTeamPayments.map((tp) => ({
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
    const voiceoverRecords = sortedPaidVoiceoverScripts.map((script) => ({
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
    let allRecords: any[] = [...sortedRecords, ...paymentRecords, ...teamPaymentRecords, ...voiceoverRecords]
    
    // Son bir kez updatedAt'e göre sırala (tüm kayıtlar için) - en son güncellenen en üstte
    allRecords.sort((a, b) => {
      // updatedAt öncelikli, yoksa occurredAt, yoksa paidAt, yoksa createdAt
      const dateA = new Date(a.updatedAt || a.occurredAt || a.paidAt || a.date || a.createdAt || 0).getTime()
      const dateB = new Date(b.updatedAt || b.occurredAt || b.paidAt || b.date || b.createdAt || 0).getTime()
      return dateB - dateA // DESC - en yeni en üstte
    })

    // Role-based filtering for combined records
    if (voiceActorId) {
      allRecords = allRecords.filter((r: any) => r.voiceActorId === voiceActorId)
    }
    if (teamMemberId) {
      allRecords = allRecords.filter((r: any) => r.teamMemberId === teamMemberId)
    }
    if (streamerId) {
      allRecords = allRecords.filter((r: any) => r.streamerId === streamerId)
    }
    if (contentCreatorId) {
      allRecords = allRecords.filter((r: any) => r.contentCreatorId === contentCreatorId)
    }

    // Eğer role-based filter varsa { records: [...] } formatında döndür, yoksa direkt array
    if (voiceActorId || teamMemberId || streamerId || contentCreatorId) {
      return NextResponse.json({ records: allRecords })
    }

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

    // Debug: Gelen veriyi logla
    console.log(`[Financial API] Received data:`, {
      type: data.type,
      category: data.category,
      amount: data.amount,
      date: data.date,
      teamMemberId: data.teamMemberId,
      streamerId: data.streamerId,
      contentCreatorId: data.contentCreatorId,
      voiceActorId: data.voiceActorId,
    })

    // Prisma data objesi oluştur
    // Boş string'leri null'a çevir
    const rawAmount = parseFloat(data.amount)
    const positiveAmount = Math.abs(rawAmount) // Her zaman pozitif
    
    // entryType ve direction belirleme
    let entryType = data.entryType || 'expense'
    let direction = data.direction || 'OUT'
    
    // Eğer type='expense' ve bir kişiye ödeme yapılıyorsa, payout olarak işaretle
    const hasRecipient = !!(data.streamerId || data.teamMemberId || data.contentCreatorId || data.voiceActorId)
    const categoryLower = (data.category || '').toLowerCase()
    const isSalaryCategory = categoryLower === 'salary' || categoryLower === 'maaş' || categoryLower.includes('maaş') || categoryLower.includes('ödeme')
    
    if (data.type === 'expense' && hasRecipient && isSalaryCategory) {
      entryType = 'payout'
      direction = 'OUT'
    } else if (data.type === 'income') {
      entryType = 'income'
      direction = 'IN'
    } else if (data.type === 'expense') {
      entryType = 'expense'
      direction = 'OUT'
    }
    
    const occurredAt = data.occurredAt ? new Date(data.occurredAt) : new Date(data.date)
    
    const prismaData: any = {
      type: data.type, // Deprecated ama geriye uyumluluk için
      category: data.category,
      amount: positiveAmount, // Her zaman pozitif
      description: data.description || null,
      date: new Date(data.date), // Deprecated ama geriye uyumluluk için
      occurredAt: occurredAt, // Yeni standart tarih alanı
      entryType: entryType,
      direction: direction,
      streamerId: (data.streamerId && data.streamerId.trim() !== '') ? data.streamerId : null,
      teamMemberId: (data.teamMemberId && data.teamMemberId.trim() !== '') ? data.teamMemberId : null,
      contentCreatorId: (data.contentCreatorId && data.contentCreatorId.trim() !== '') ? data.contentCreatorId : null,
      voiceActorId: (data.voiceActorId && data.voiceActorId.trim() !== '') ? data.voiceActorId : null,
      streamId: null, // streamId opsiyonel
      relatedPaymentId: data.relatedPaymentId || null,
    }
    
    console.log(`[Financial API] Prisma data prepared:`, {
      entryType: prismaData.entryType,
      direction: prismaData.direction,
      amount: prismaData.amount,
      occurredAt: prismaData.occurredAt,
      teamMemberId: prismaData.teamMemberId,
      streamerId: prismaData.streamerId,
      contentCreatorId: prismaData.contentCreatorId,
      voiceActorId: prismaData.voiceActorId,
    })

    try {
      const record = await prisma.financialRecord.create({
        data: prismaData,
        include: {
          streamer: true,
          teamMember: data.teamMemberId ? true : undefined,
          contentCreator: data.contentCreatorId ? true : undefined,
          voiceActor: data.voiceActorId ? true : undefined,
        },
      })
      
      console.log(`[Financial API] ✅ Created financial record:`, {
        id: record.id,
        type: record.type,
        category: record.category,
        amount: record.amount,
        streamerId: record.streamerId,
        teamMemberId: record.teamMemberId,
        contentCreatorId: record.contentCreatorId,
        voiceActorId: record.voiceActorId,
        date: record.date,
      })

      // Audit log kaydet
      const cookieStore = await cookies()
      const userId = cookieStore.get('user-id')?.value
      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, role: true },
        })
        if (user) {
          await createAuditLog({
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            action: 'financial_record_created',
            entityType: 'FinancialRecord',
            entityId: record.id,
            details: {
              type: record.type,
              category: record.category,
              amount: record.amount,
              date: record.date.toISOString(),
              description: record.description,
              streamerId: record.streamerId,
              teamMemberId: record.teamMemberId,
              contentCreatorId: record.contentCreatorId,
              voiceActorId: record.voiceActorId,
            },
          })
        }
      }
      
      // Eğer streamerId varsa, streamer'ın profil sayfasını revalidate et
      if (record.streamerId) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/revalidate?path=/streamers/${record.streamerId}`, {
            method: 'POST',
          }).catch(() => {}) // Revalidate hatası finansal kaydı etkilemesin
        } catch (e) {
          // Ignore
        }
      }
      
      // Eğer teamMemberId varsa, ekip üyesinin profil sayfasını revalidate et
      if (record.teamMemberId) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/revalidate?path=/team/${record.teamMemberId}`, {
            method: 'POST',
          }).catch(() => {}) // Revalidate hatası finansal kaydı etkilemesin
        } catch (e) {
          // Ignore
        }
      }
      
      // Eğer contentCreatorId varsa, içerik üreticisinin profil sayfasını revalidate et
      if (record.contentCreatorId) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/revalidate?path=/content-creators/${record.contentCreatorId}`, {
            method: 'POST',
          }).catch(() => {}) // Revalidate hatası finansal kaydı etkilemesin
        } catch (e) {
          // Ignore
        }
      }
      
      // Eğer voiceActorId varsa, seslendirmenin profil sayfasını revalidate et
      if (record.voiceActorId) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/revalidate?path=/team/${record.voiceActorId}`, {
            method: 'POST',
          }).catch(() => {}) // Revalidate hatası finansal kaydı etkilemesin
        } catch (e) {
          // Ignore
        }
      }
      
      // Eğer ekip üyesine ödeme yapıldıysa (expense + salary), TeamPayment kaydı da oluştur
      // Kontrol: teamMemberId var mı, type expense mi, category salary mi?
      const categoryLowerForPayment = (data.category || '').toLowerCase()
      const isSalaryCategoryForPayment = categoryLowerForPayment === 'salary' || categoryLowerForPayment === 'maaş' || categoryLowerForPayment.includes('maaş')
      
      const shouldCreateTeamPayment = !!(
        data.teamMemberId && 
        data.type === 'expense' && 
        isSalaryCategoryForPayment
      )
      
      console.log(`[Financial API] TeamPayment creation check:`, {
        teamMemberId: data.teamMemberId,
        type: data.type,
        category: data.category,
        shouldCreate: shouldCreateTeamPayment,
        conditions: {
          hasTeamMemberId: !!data.teamMemberId,
          isExpense: data.type === 'expense',
          isSalary: isSalaryCategoryForPayment,
        },
      })
      
      if (shouldCreateTeamPayment) {
        const paymentDate = new Date(data.date)
        const month = format(paymentDate, 'yyyy-MM')
        
        console.log(`[Financial API] Attempting to create TeamPayment:`, {
          teamMemberId: data.teamMemberId,
          type: data.type,
          category: data.category,
          amount: parseFloat(data.amount),
          date: paymentDate,
          month: month,
        })
        
        try {
          const teamPayment = await prisma.teamPayment.create({
            data: {
              teamMemberId: data.teamMemberId,
              amount: parseFloat(data.amount),
              type: 'salary',
              period: month,
              description: data.description || `${month} ayı ekip üyesi ödemesi`,
              paidAt: paymentDate,
            },
          })
          console.log(`[Financial API] ✅ Created TeamPayment for team member ${data.teamMemberId}:`, {
            id: teamPayment.id,
            amount: teamPayment.amount,
            period: teamPayment.period,
            paidAt: teamPayment.paidAt,
          })
        } catch (teamPaymentError: any) {
          // TeamPayment oluşturma hatası finansal kaydı etkilemesin
          console.error('❌ Error creating TeamPayment:', {
            error: teamPaymentError.message,
            code: teamPaymentError.code,
            meta: teamPaymentError.meta,
            teamMemberId: data.teamMemberId,
          })
        }
      } else {
        const categoryLowerForSkip = (data.category || '').toLowerCase()
        const isSalaryCategoryForSkip = categoryLowerForSkip === 'salary' || categoryLowerForSkip === 'maaş' || categoryLowerForSkip.includes('maaş')
        
        console.log(`[Financial API] Skipping TeamPayment creation:`, {
          teamMemberId: data.teamMemberId,
          type: data.type,
          category: data.category,
          condition: !(data.teamMemberId && data.type === 'expense' && isSalaryCategoryForSkip),
        })
      }
      
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
