import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Ekip üyesi sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    
    // Ekip üyesini bul
    const member = await prisma.teamMember.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Ekip üyesi bulunamadı' },
        { status: 404 }
      )
    }
    
    // Ekip üyesini sil (ilişkili görevler ve ödemeler cascade ile silinecek)
    await prisma.teamMember.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({
      message: 'Ekip üyesi başarıyla silindi',
    })
  } catch (error: any) {
    console.error('Error deleting team member:', error)
    return NextResponse.json(
      { error: `Ekip üyesi silinemedi: ${error.message}` },
      { status: 500 }
    )
  }
}
