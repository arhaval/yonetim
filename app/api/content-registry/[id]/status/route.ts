import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Durum geçişleri için izin verilen akışlar
const STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['SCRIPT_READY', 'ARCHIVED'],
  SCRIPT_READY: ['VOICE_READY', 'DRAFT', 'ARCHIVED'],
  VOICE_READY: ['EDITING', 'SCRIPT_READY', 'ARCHIVED'],
  EDITING: ['REVIEW', 'VOICE_READY', 'ARCHIVED'],
  REVIEW: ['PUBLISHED', 'EDITING', 'ARCHIVED'],
  PUBLISHED: ['ARCHIVED'],
  ARCHIVED: ['DRAFT'], // Arşivden geri çıkarılabilir
}

// İçerik kaydının durumunu güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const { id } = resolvedParams

    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value
    const creatorId = cookieStore.get('creator-id')?.value
    const voiceActorId = cookieStore.get('voice-actor-id')?.value
    const teamMemberId = cookieStore.get('team-member-id')?.value

    if (!userId && !creatorId && !voiceActorId && !teamMemberId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const existingRegistry = await prisma.contentRegistry.findUnique({
      where: { id },
    })

    if (!existingRegistry) {
      return NextResponse.json(
        { error: 'İçerik kaydı bulunamadı' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { status: newStatus } = body

    if (!newStatus) {
      return NextResponse.json(
        { error: 'Yeni durum gereklidir' },
        { status: 400 }
      )
    }

    // Geçerli durum geçişi kontrolü
    const currentStatus = existingRegistry.status
    const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || []

    // Admin her duruma geçebilir
    if (!userId && !allowedTransitions.includes(newStatus)) {
      return NextResponse.json(
        { 
          error: `${currentStatus} durumundan ${newStatus} durumuna geçiş yapılamaz`,
          allowedTransitions 
        },
        { status: 400 }
      )
    }

    // Rol bazlı durum değişikliği kontrolü
    if (!userId) {
      // İçerik üreticisi: DRAFT -> SCRIPT_READY
      if (creatorId) {
        if (existingRegistry.creatorId !== creatorId) {
          return NextResponse.json(
            { error: 'Bu kaydın durumunu değiştirme yetkiniz yok' },
            { status: 403 }
          )
        }
        if (newStatus !== 'SCRIPT_READY' && newStatus !== 'DRAFT') {
          return NextResponse.json(
            { error: 'İçerik üreticisi sadece DRAFT ve SCRIPT_READY durumlarını ayarlayabilir' },
            { status: 403 }
          )
        }
      }

      // Seslendirmen: SCRIPT_READY -> VOICE_READY
      if (voiceActorId) {
        if (existingRegistry.voiceActorId !== voiceActorId) {
          return NextResponse.json(
            { error: 'Bu kaydın durumunu değiştirme yetkiniz yok' },
            { status: 403 }
          )
        }
        if (newStatus !== 'VOICE_READY' && newStatus !== 'SCRIPT_READY') {
          return NextResponse.json(
            { error: 'Seslendirmen sadece SCRIPT_READY ve VOICE_READY durumlarını ayarlayabilir' },
            { status: 403 }
          )
        }
      }

      // Editör: VOICE_READY -> EDITING -> REVIEW
      if (teamMemberId) {
        if (existingRegistry.editorId !== teamMemberId) {
          return NextResponse.json(
            { error: 'Bu kaydın durumunu değiştirme yetkiniz yok' },
            { status: 403 }
          )
        }
        if (!['EDITING', 'REVIEW', 'VOICE_READY'].includes(newStatus)) {
          return NextResponse.json(
            { error: 'Editör sadece VOICE_READY, EDITING ve REVIEW durumlarını ayarlayabilir' },
            { status: 403 }
          )
        }
      }
    }

    const registry = await prisma.contentRegistry.update({
      where: { id },
      data: { status: newStatus },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
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
      message: `Durum ${newStatus} olarak güncellendi`,
      registry,
    })
  } catch (error: any) {
    console.error('Error updating content registry status:', error)
    return NextResponse.json(
      { error: error.message || 'Durum güncellenemedi' },
      { status: 500 }
    )
  }
}

