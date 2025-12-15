import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// İçerik üreticisi sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    
    // İçerik üreticisini bul
    const creator = await prisma.contentCreator.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!creator) {
      return NextResponse.json(
        { error: 'İçerik üreticisi bulunamadı' },
        { status: 404 }
      )
    }

    // İçerik üreticisini sil (ilişkili içerikler ve metinler cascade ile silinecek veya SetNull olacak)
    await prisma.contentCreator.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({
      message: 'İçerik üreticisi başarıyla silindi',
    })
  } catch (error: any) {
    console.error('Error deleting content creator:', error)
    return NextResponse.json(
      { error: `İçerik üreticisi silinemedi: ${error.message}` },
      { status: 500 }
    )
  }
}

