import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TeamPayment kayıtlarını getir (video editör işleri)
    const payments = await prisma.teamPayment.findMany({
      where: { teamMemberId: params.id },
      orderBy: { createdAt: 'desc' },
    })

    // Dashboard'un beklediği formata dönüştür
    const works = payments.map(payment => ({
      id: payment.id,
      title: payment.description || payment.type,
      editPrice: payment.amount,
      editPaid: payment.paidAt !== null,
      status: payment.paidAt ? 'COMPLETED' : 'PENDING',
      createdAt: payment.createdAt.toISOString(),
    }))

    return NextResponse.json(works)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Görevler getirilemedi' },
      { status: 500 }
    )
  }
}


















