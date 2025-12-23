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

    // Kaydı bul
    const record = await prisma.financialRecord.findUnique({
      where: { id },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Kayıt bulunamadı' },
        { status: 404 }
      )
    }

    // Kaydı sil
    await prisma.financialRecord.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Finansal kayıt başarıyla silindi',
    })
  } catch (error) {
    console.error('Error deleting financial record:', error)
    return NextResponse.json(
      { error: 'Finansal kayıt silinemedi' },
      { status: 500 }
    )
  }
}

