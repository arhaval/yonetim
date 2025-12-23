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
    const stat = await prisma.socialMediaStats.findUnique({
      where: { id },
    })

    if (!stat) {
      return NextResponse.json(
        { error: 'Kayıt bulunamadı' },
        { status: 404 }
      )
    }

    // Kaydı sil
    await prisma.socialMediaStats.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Kayıt başarıyla silindi',
    })
  } catch (error) {
    console.error('Error deleting social media stat:', error)
    return NextResponse.json(
      { error: 'Kayıt silinemedi' },
      { status: 500 }
    )
  }
}

