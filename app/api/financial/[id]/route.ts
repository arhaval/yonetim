import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.financialRecord.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: 'Finansal kayıt başarıyla silindi' })
  } catch (error) {
    console.error('Error deleting financial record:', error)
    return NextResponse.json(
      { error: 'Finansal kayıt silinemedi' },
      { status: 500 }
    )
  }
}










