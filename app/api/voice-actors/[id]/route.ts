import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Seslendirmen sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    
    // Seslendirmeni bul
    const voiceActor = await prisma.voiceActor.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!voiceActor) {
      return NextResponse.json(
        { error: 'Seslendirmen bulunamadı' },
        { status: 404 }
      )
    }

    // Seslendirmeni sil (ilişkili metinler cascade ile silinecek veya SetNull olacak)
    await prisma.voiceActor.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({
      message: 'Seslendirmen başarıyla silindi',
    })
  } catch (error: any) {
    console.error('Error deleting voice actor:', error)
    return NextResponse.json(
      { error: `Seslendirmen silinemedi: ${error.message}` },
      { status: 500 }
    )
  }
}
