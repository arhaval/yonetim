import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-check'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Admin kontrolü
    const adminCheck = await requireAdmin()
    if (adminCheck) {
      return adminCheck
    }

    const { id } = await Promise.resolve(params)

    console.log('Deleting payout with ID:', id)

    // Önce Payout tablosunda kontrol et
    const payoutRecord = await prisma.payout.findUnique({
      where: { id },
    })

    if (payoutRecord) {
      // Payout tablosundan sil
      await prisma.payout.delete({
        where: { id },
      })

      // İlgili FinancialRecord'u da sil (varsa)
      await prisma.financialRecord.deleteMany({
        where: {
          relatedPaymentId: id,
          entryType: 'payout',
        },
      })

      console.log('Payout deleted successfully')
      return NextResponse.json({
        success: true,
        message: 'Ödeme kaydı başarıyla silindi',
      })
    }

    // Eğer Payout tablosunda yoksa, FinancialRecord tablosunda ara
    const financialRecord = await prisma.financialRecord.findFirst({
      where: {
        id,
        entryType: 'payout',
        direction: 'OUT',
      },
    })

    if (financialRecord) {
      // FinancialRecord'dan sil
      await prisma.financialRecord.delete({
        where: { id },
      })

      // İlgili Payout kaydını da sil (varsa)
      if (financialRecord.relatedPaymentId) {
        await prisma.payout.deleteMany({
          where: { id: financialRecord.relatedPaymentId },
        })
      }

      console.log('FinancialRecord payout deleted successfully')
      return NextResponse.json({
        success: true,
        message: 'Ödeme kaydı başarıyla silindi',
      })
    }

    return NextResponse.json(
      { error: 'Ödeme kaydı bulunamadı' },
      { status: 404 }
    )

    return NextResponse.json({
      success: true,
      message: 'Ödeme kaydı başarıyla silindi',
    })
  } catch (error) {
    console.error('Error deleting payout:', error)
    return NextResponse.json(
      { error: 'Ödeme kaydı silinemedi' },
      { status: 500 }
    )
  }
}

