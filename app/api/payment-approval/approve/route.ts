import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Seçilen öğeleri ödendi olarak işaretle
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    // Admin kontrolü
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { personType, personId, streamIds = [], scriptIds = [], teamPaymentIds = [] } = body

    if (!personType || !personId) {
      return NextResponse.json(
        { error: 'Kişi tipi ve ID gereklidir' },
        { status: 400 }
      )
    }

    if (streamIds.length === 0 && scriptIds.length === 0 && teamPaymentIds.length === 0) {
      return NextResponse.json(
        { error: 'En az bir öğe seçilmelidir' },
        { status: 400 }
      )
    }

    const results: any = {
      streamsUpdated: 0,
      scriptsUpdated: 0,
      teamPaymentsUpdated: 0,
      totalAmount: 0,
    }

    // Yayınları ödendi olarak işaretle
    if (streamIds.length > 0 && personType === 'streamer') {
      // Önce yayınları kontrol et ve tutarları hesapla
      const streams = await prisma.stream.findMany({
        where: {
          id: { in: streamIds },
          streamerId: personId,
          status: 'approved',
        },
        select: {
          id: true,
          streamerEarning: true,
          paymentStatus: true,
        },
      })

      let totalStreamAmount = 0
      const validStreamIds: string[] = []

      for (const stream of streams) {
        if (stream.paymentStatus !== 'paid') {
          totalStreamAmount += stream.streamerEarning || 0
          validStreamIds.push(stream.id)
        }
      }

      if (validStreamIds.length > 0) {
        await prisma.stream.updateMany({
          where: {
            id: { in: validStreamIds },
            streamerId: personId,
          },
          data: {
            paymentStatus: 'paid',
          },
        })

        results.streamsUpdated = validStreamIds.length
        results.totalAmount += totalStreamAmount

        // Payment kaydı oluştur
        const month = new Date().toISOString().slice(0, 7) // YYYY-MM
        const payment = await prisma.payment.create({
          data: {
            streamerId: personId,
            amount: totalStreamAmount,
            type: 'salary',
            period: month,
            description: `${validStreamIds.length} yayın için ödeme onayı`,
            paidAt: new Date(),
          },
        })

        // Finansal kayıt oluştur - relatedPaymentId ile bağla
        await prisma.financialRecord.create({
          data: {
            type: 'expense',
            category: 'salary',
            amount: totalStreamAmount,
            description: `${validStreamIds.length} yayın için ödeme onayı`,
            date: new Date(),
            occurredAt: new Date(),
            entryType: 'payout',
            direction: 'OUT',
            streamerId: personId,
            relatedPaymentId: payment.id,
          },
        })
      }
    }

    // Seslendirme metinlerini ödendi olarak işaretle
    if (scriptIds.length > 0) {
      // Önce metinleri kontrol et ve tutarları hesapla
      const whereClause: any = {
        id: { in: scriptIds },
        status: 'APPROVED',
      }

      if (personType === 'voiceActor') {
        whereClause.voiceActorId = personId
      } else if (personType === 'contentCreator') {
        whereClause.creatorId = personId
      }

      const scripts = await prisma.voiceoverScript.findMany({
        where: whereClause,
        select: {
          id: true,
          price: true,
          status: true,
        },
      })

      let totalScriptAmount = 0
      const validScriptIds: string[] = []

      for (const script of scripts) {
        if (script.status !== 'PAID') {
          totalScriptAmount += script.price || 0
          validScriptIds.push(script.id)
        }
      }

      if (validScriptIds.length > 0) {
        await prisma.voiceoverScript.updateMany({
          where: {
            id: { in: validScriptIds },
          },
          data: {
            status: 'PAID',
          },
        })

        results.scriptsUpdated = validScriptIds.length
        results.totalAmount += totalScriptAmount

        // Finansal kayıt oluştur
        const financialData: any = {
          type: 'expense',
          category: 'content',
          amount: totalScriptAmount,
          description: `${validScriptIds.length} seslendirme metni için ödeme onayı`,
          date: new Date(),
          occurredAt: new Date(),
          entryType: 'payout',
          direction: 'OUT',
        }

        if (personType === 'voiceActor') {
          financialData.voiceActorId = personId
        } else if (personType === 'contentCreator') {
          financialData.contentCreatorId = personId
        }

        await prisma.financialRecord.create({
          data: financialData,
        })
      }
    }

    // Ekip üyesi ödemelerini ödendi olarak işaretle
    if (teamPaymentIds.length > 0 && personType === 'teamMember') {
      // Önce ödemeleri kontrol et ve tutarları hesapla
      const teamPayments = await prisma.teamPayment.findMany({
        where: {
          id: { in: teamPaymentIds },
          teamMemberId: personId,
          paidAt: null, // Sadece ödenmemiş olanlar
        },
        select: {
          id: true,
          amount: true,
        },
      })

      let totalTeamPaymentAmount = 0
      const validTeamPaymentIds: string[] = []

      for (const payment of teamPayments) {
        totalTeamPaymentAmount += payment.amount || 0
        validTeamPaymentIds.push(payment.id)
      }

      if (validTeamPaymentIds.length > 0) {
        await prisma.teamPayment.updateMany({
          where: {
            id: { in: validTeamPaymentIds },
            teamMemberId: personId,
          },
          data: {
            paidAt: new Date(),
          },
        })

        results.teamPaymentsUpdated = validTeamPaymentIds.length
        results.totalAmount += totalTeamPaymentAmount

        // Finansal kayıt oluştur
        await prisma.financialRecord.create({
          data: {
            type: 'expense',
            category: 'salary',
            amount: totalTeamPaymentAmount,
            description: `${validTeamPaymentIds.length} ekip üyesi ödemesi için ödeme onayı`,
            date: new Date(),
            occurredAt: new Date(),
            entryType: 'payout',
            direction: 'OUT',
            teamMemberId: personId,
          },
        })
      }
    }

    const messageParts = []
    if (results.streamsUpdated > 0) messageParts.push(`${results.streamsUpdated} yayın`)
    if (results.scriptsUpdated > 0) messageParts.push(`${results.scriptsUpdated} metin`)
    if (results.teamPaymentsUpdated > 0) messageParts.push(`${results.teamPaymentsUpdated} ekip ödemesi`)

    return NextResponse.json({
      success: true,
      message: `${messageParts.join(', ')} ödendi olarak işaretlendi`,
      ...results,
    })
  } catch (error: any) {
    console.error('Error approving payments:', error)
    return NextResponse.json(
      { error: error.message || 'Ödeme onayı yapılamadı' },
      { status: 500 }
    )
  }
}

