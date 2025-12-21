import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Ekip üyeleri için aylık ödeme özeti
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7) // YYYY-MM

    // Ayın başlangıç ve bitiş tarihleri
    const [year, monthNum] = month.split('-').map(Number)
    const startDate = new Date(year, monthNum - 1, 1)
    const endDate = new Date(year, monthNum, 0, 23, 59, 59)

    // O ay için ödeme kayıtlarını getir
    // period alanına göre VEYA paidAt tarihine göre filtrele
    // Ayrıca paidAt null olmayan kayıtları da göster (finansal sayfadan yapılan ödemeler)
    const payments = await prisma.teamPayment.findMany({
      where: {
        OR: [
          { period: month },
          {
            paidAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            // Finansal sayfadan yapılan ödemeler için: paidAt varsa ve o ay içindeyse
            AND: [
              { paidAt: { not: null } },
              {
                paidAt: {
                  gte: startDate,
                  lte: endDate,
                },
              },
            ],
          },
        ],
      },
      include: {
        teamMember: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
    
    console.log(`[Payments Team API] Found ${payments.length} payments for month ${month}`, {
      startDate,
      endDate,
      payments: payments.map(p => ({
        id: p.id,
        teamMemberId: p.teamMemberId,
        amount: p.amount,
        period: p.period,
        paidAt: p.paidAt,
      })),
    })

    // Her ekip üyesi için tamamlanmış görevleri de getir
    const result = await Promise.all(payments.map(async (payment) => {
      // Bu ekip üyesinin o ay içinde tamamlanmış görevlerini getir
      const completedTasks = await prisma.task.findMany({
        where: {
          teamMemberId: payment.teamMemberId,
          status: 'completed',
          completedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          completedAt: 'asc',
        },
      })

      return {
        id: payment.id,
        teamMemberId: payment.teamMemberId,
        teamMemberName: payment.teamMember.name,
        amount: payment.amount,
        type: payment.type,
        period: payment.period,
        description: payment.description,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
        tasks: completedTasks.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          completedAt: t.completedAt,
          priority: t.priority,
        })),
      }
    }))

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error fetching team payments:', error)
    return NextResponse.json(
      { error: error.message || 'Ödeme bilgileri getirilemedi' },
      { status: 500 }
    )
  }
}



