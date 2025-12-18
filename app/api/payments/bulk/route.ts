import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Toplu ödeme yap
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
    const { type, month, items } = body

    if (type === 'streamers') {
      // Yayıncı ödemeleri için
      for (const item of items) {
        // O ay için bu yayıncının tüm bekleyen yayınlarını ödendi olarak işaretle
        const [year, monthNum] = month.split('-').map(Number)
        const startDate = new Date(year, monthNum - 1, 1)
        const endDate = new Date(year, monthNum, 0, 23, 59, 59)

        await prisma.stream.updateMany({
          where: {
            streamerId: item.id,
            status: 'approved',
            paymentStatus: 'pending',
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          data: {
            paymentStatus: 'paid',
          },
        })

        // Payment kaydı oluştur
        await prisma.payment.create({
          data: {
            streamerId: item.id,
            amount: item.amount,
            type: 'salary',
            period: month,
            description: `${month} ayı yayın ödemesi`,
            paidAt: new Date(),
          },
        })
      }
    } else if (type === 'team') {
      // Ekip üyesi ödemeleri için
      for (const item of items) {
        await prisma.teamPayment.update({
          where: { id: item.id },
          data: {
            paidAt: new Date(),
          },
        })
      }
    }

    return NextResponse.json({
      message: 'Toplu ödeme başarıyla yapıldı',
    })
  } catch (error: any) {
    console.error('Error processing bulk payment:', error)
    return NextResponse.json(
      { error: error.message || 'Ödeme işlemi başarısız' },
      { status: 500 }
    )
  }
}













