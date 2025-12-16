import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Yayıncı sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    
    // Yayıncıyı bul
    const streamer = await prisma.streamer.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!streamer) {
      return NextResponse.json(
        { error: 'Yayıncı bulunamadı' },
        { status: 404 }
      )
    }
    
    // Yayıncıyı sil (ilişkili yayınlar, ödemeler cascade ile silinecek)
    await prisma.streamer.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({
      message: 'Yayıncı başarıyla silindi',
    })
  } catch (error: any) {
    console.error('Error deleting streamer:', error)
    return NextResponse.json(
      { error: `Yayıncı silinemedi: ${error.message}` },
      { status: 500 }
    )
  }
}
