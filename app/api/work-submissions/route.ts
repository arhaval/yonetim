import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const voiceActorId = cookieStore.get('voice-actor-id')?.value
    const teamMemberId = cookieStore.get('team-member-id')?.value

    // Kullanıcı kontrolü
    if (!voiceActorId && !teamMemberId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { workType, workName, description } = body

    if (!workName?.trim()) {
      return NextResponse.json(
        { error: 'İş ismi gereklidir' },
        { status: 400 }
      )
    }

    // İş tipine göre ContentRegistry'e kaydet
    const isVoiceWork = !!voiceActorId
    
    // Status belirleme
    let status = 'EDITING' // Default editör için
    if (isVoiceWork) {
      status = 'VOICE_READY' // Seslendirmen için
    }

    const registry = await prisma.contentRegistry.create({
      data: {
        title: workName,
        description: description || null,
        contentType: workType,
        status: status,
        voiceActorId: voiceActorId || null,
        editorId: teamMemberId || null,
        // Fiyatlar admin tarafından girilecek
        voicePrice: null,
        editPrice: null,
        voicePaid: false,
        editPaid: false,
      },
      include: {
        voiceActor: {
          select: {
            id: true,
            name: true,
          },
        },
        editor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'İş başarıyla kaydedildi',
      registry,
    })
  } catch (error: any) {
    console.error('Error creating work submission:', error)
    return NextResponse.json(
      { error: error.message || 'İş kaydedilemedi' },
      { status: 500 }
    )
  }
}

// Kullanıcının kendi işlerini getir
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const voiceActorId = cookieStore.get('voice-actor-id')?.value
    const teamMemberId = cookieStore.get('team-member-id')?.value

    if (!voiceActorId && !teamMemberId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    // Kullanıcı tipine göre filtrele
    const whereClause: any = {}
    if (voiceActorId) {
      whereClause.voiceActorId = voiceActorId
    } else if (teamMemberId) {
      whereClause.editorId = teamMemberId
    }

    const registries = await prisma.contentRegistry.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        contentType: true,
        status: true,
        voicePrice: true,
        editPrice: true,
        voicePaid: true,
        editPaid: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(registries)
  } catch (error) {
    console.error('Error fetching work submissions:', error)
    return NextResponse.json(
      { error: 'İşler getirilemedi' },
      { status: 500 }
    )
  }
}
