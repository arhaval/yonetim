import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Tüm ContentRegistry kayıtlarını getir
    const allRegistries = await prisma.contentRegistry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        status: true,
        contentType: true,
        voiceActorId: true,
        editorId: true,
        voicePrice: true,
        editPrice: true,
        voicePaid: true,
        editPaid: true,
        createdAt: true,
        voiceActor: {
          select: { name: true }
        },
        editor: {
          select: { name: true }
        }
      }
    })

    // Sadece voice veya edit işlerini filtrele
    const voiceWorks = allRegistries.filter(r => r.voiceActorId !== null)
    const editWorks = allRegistries.filter(r => r.editorId !== null)

    return NextResponse.json({
      total: allRegistries.length,
      voiceWorksCount: voiceWorks.length,
      editWorksCount: editWorks.length,
      allRegistries,
      voiceWorks,
      editWorks
    })
  } catch (error: any) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

