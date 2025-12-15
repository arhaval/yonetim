import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// İçerik sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    
    // İçeriği bul
    const content = await prisma.content.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!content) {
      return NextResponse.json(
        { error: 'İçerik bulunamadı' },
        { status: 404 }
      )
    }

    // İçeriği sil
    await prisma.content.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({
      message: 'İçerik başarıyla silindi',
    })
  } catch (error: any) {
    console.error('Error deleting content:', error)
    return NextResponse.json(
      { error: `İçerik silinemedi: ${error.message}` },
      { status: 500 }
    )
  }
}

