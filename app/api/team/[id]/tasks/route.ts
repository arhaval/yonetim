import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ContentRegistry'den video edit işlerini getir
    const works = await prisma.contentRegistry.findMany({
      where: { editorId: params.id },
      include: {
        editor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Dashboard'un beklediği formata dönüştür
    const formattedWorks = works.map(work => ({
      id: work.id,
      title: work.title,
      description: work.description,
      contentType: work.contentType,
      editPrice: work.editPrice || 0,
      editPaid: work.editPaid || false,
      status: work.status,
      createdAt: work.createdAt.toISOString(),
    }))

    return NextResponse.json(formattedWorks)
  } catch (error) {
    console.error('Error fetching editor tasks:', error)
    return NextResponse.json(
      { error: 'Görevler getirilemedi' },
      { status: 500 }
    )
  }
}
