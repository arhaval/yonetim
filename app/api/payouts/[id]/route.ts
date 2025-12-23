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

    // Payout kaydını bul (FinancialRecord tablosunda)
    const payout = await prisma.financialRecord.findFirst({
      where: {
        id,
        entryType: 'payout',
        direction: 'OUT',
      },
    })

    if (!payout) {
      return NextResponse.json(
        { error: 'Ödeme kaydı bulunamadı' },
        { status: 404 }
      )
    }

    // Payout kaydını sil
    await prisma.financialRecord.delete({
      where: { id },
    })

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

