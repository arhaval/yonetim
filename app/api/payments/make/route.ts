import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Kısmi veya tam ödeme yap
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
    const { type, month, streamerId, teamPaymentId, voiceActorId, amount, note, paidAt } = body

    if (type === 'streamers' && streamerId) {
      // Yayıncı ödemesi
      const [year, monthNum] = month.split('-').map(Number)
      const startDate = new Date(year, monthNum - 1, 1)
      const endDate = new Date(year, monthNum, 0, 23, 59, 59)

      // O ay için bekleyen yayınları getir
      const unpaidStreams = await prisma.stream.findMany({
        where: {
          streamerId,
          status: 'approved',
          paymentStatus: 'pending',
          date: {
            gte: startDate,
            lte: endDate,
          },
          streamerEarning: {
            gt: 0,
          },
        },
        orderBy: {
          date: 'asc',
        },
      })

      let remainingAmount = amount
      
      // Yayınları sırayla ödendi olarak işaretle
      for (const stream of unpaidStreams) {
        if (remainingAmount <= 0) break
        
        if (remainingAmount >= stream.streamerEarning) {
          // Tam ödeme
          await prisma.stream.update({
            where: { id: stream.id },
            data: { paymentStatus: 'paid' },
          })
          remainingAmount -= stream.streamerEarning
        } else {
          // Kısmi ödeme - bu durumda stream'i pending bırak ama ödeme kaydı oluştur
          // (Kısmi ödeme için stream'i pending bırakıyoruz, çünkü tam ödenmemiş)
          break
        }
      }

      // Payment kaydı oluştur
      await prisma.payment.create({
        data: {
          streamerId,
          amount: amount,
          type: 'salary',
          period: month,
          description: note || `${month} ayı yayın ödemesi (kısmi/tam)`,
          paidAt: paidAt ? new Date(paidAt) : new Date(),
        },
      })

      // Finansal kayıt oluştur (gider olarak)
      await prisma.financialRecord.create({
        data: {
          type: 'expense',
          category: 'salary',
          amount: amount,
          description: note || `${month} ayı yayıncı ödemesi`,
          date: paidAt ? new Date(paidAt) : new Date(),
          streamerId: streamerId,
        },
      })
    } else if (type === 'team' && teamPaymentId) {
      // Ekip üyesi ödemesi
      const teamPayment = await prisma.teamPayment.findUnique({
        where: { id: teamPaymentId },
      })

      if (!teamPayment) {
        return NextResponse.json(
          { error: 'Ödeme kaydı bulunamadı' },
          { status: 404 }
        )
      }

      const paymentDate = paidAt ? new Date(paidAt) : new Date()
      
      if (amount >= teamPayment.amount) {
        // Tam ödeme
        await prisma.teamPayment.update({
          where: { id: teamPaymentId },
          data: {
            paidAt: paymentDate,
          },
        })
      } else {
        // Kısmi ödeme - yeni bir ödeme kaydı oluştur
        // Not: TeamPayment modelinde kısmi ödeme için ayrı bir yapı gerekebilir
        // Şimdilik tam ödeme yapıldığında paidAt set ediliyor
        // Kısmi ödeme için yeni bir TeamPayment kaydı oluşturabiliriz
        await prisma.teamPayment.create({
          data: {
            teamMemberId: teamPayment.teamMemberId,
            amount: amount,
            type: teamPayment.type,
            period: teamPayment.period,
            description: note || `${teamPayment.period} ayı kısmi ödeme`,
            paidAt: paymentDate,
          },
        })
      }

      // Finansal kayıt oluştur (gider olarak)
      const financialRecord = await prisma.financialRecord.create({
        data: {
          type: 'expense',
          category: 'salary',
          amount: amount,
          description: note || `${teamPayment.period} ayı ekip üyesi ödemesi`,
          date: paymentDate,
          teamMemberId: teamPayment.teamMemberId,
        },
      })
      
      console.log(`[Payment API] Created financial record for team member ${teamPayment.teamMemberId}:`, {
        id: financialRecord.id,
        amount: financialRecord.amount,
        date: financialRecord.date,
      })
    } else if (type === 'voice-actors' && voiceActorId) {
      // Seslendirmen ödemesi
      const [year, monthNum] = month.split('-').map(Number)
      const startDate = new Date(year, monthNum - 1, 1)
      const endDate = new Date(year, monthNum, 0, 23, 59, 59)

      // O ay için bekleyen onaylanmış metinleri getir
      const pendingScripts = await prisma.voiceoverScript.findMany({
        where: {
          voiceActorId,
          status: 'approved',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          price: {
            gt: 0,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      })

      let remainingAmount = amount
      
      // Metinleri sırayla ödendi olarak işaretle
      for (const script of pendingScripts) {
        if (remainingAmount <= 0) break
        
        if (remainingAmount >= script.price) {
          // Tam ödeme
          await prisma.voiceoverScript.update({
            where: { id: script.id },
            data: { status: 'paid' },
          })
          remainingAmount -= script.price
        } else {
          // Kısmi ödeme - bu durumda script'i approved bırak
          break
        }
      }

      // Finansal kayıt oluştur (gider olarak)
      await prisma.financialRecord.create({
        data: {
          type: 'expense',
          category: 'voiceover',
          amount: amount,
          description: note || `${month} ayı seslendirme ödemesi`,
          date: paidAt ? new Date(paidAt) : new Date(),
          voiceActorId: voiceActorId,
        },
      })
    } else {
      return NextResponse.json(
        { error: 'Geçersiz ödeme tipi' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Ödeme başarıyla yapıldı',
    })
  } catch (error: any) {
    console.error('Error making payment:', error)
    return NextResponse.json(
      { error: error.message || 'Ödeme işlemi başarısız' },
      { status: 500 }
    )
  }
}



