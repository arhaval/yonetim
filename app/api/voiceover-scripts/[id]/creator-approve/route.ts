import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { createAuditLog } from '@/lib/audit-log'
import { canProducerApprove } from '@/lib/voiceover-permissions'

// İçerik üreticisi sesi onaylar
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const cookieStore = await cookies()
    const creatorId = cookieStore.get('creator-id')?.value
    const userId = cookieStore.get('user-id')?.value

    if (!creatorId && !userId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    // Metni kontrol et
    const script = await prisma.voiceoverScript.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!script) {
      return NextResponse.json(
        { error: 'Metin bulunamadı' },
        { status: 404 }
      )
    }

    // Yetki kontrolü
    const canApprove = await canProducerApprove(userId, creatorId, script)
    if (!canApprove) {
      return NextResponse.json(
        { error: 'Bu metni onaylama yetkiniz yok' },
        { status: 403 }
      )
    }

    // Kural: voiceLink dolu olmalı
    const voiceLink = script.voiceLink || script.audioFile // Backward compatibility
    if (!voiceLink) {
      return NextResponse.json(
        { error: 'Ses linki henüz eklenmemiş. Producer onayı için ses linki gereklidir.' },
        { status: 400 }
      )
    }

    // Creator bilgisini al (audit log için)
    const creator = await prisma.contentCreator.findUnique({
      where: { id: creatorId },
      select: { id: true, name: true },
    })

    // Eski değerleri kaydet (audit log için)
    const oldValue = {
      status: script.status,
      producerApproved: script.producerApproved,
      producerApprovedAt: script.producerApprovedAt,
      producerApprovedBy: script.producerApprovedBy,
    }

    // Producer onayını ver (status: VOICE_UPLOADED - ses linki var, admin onayı bekliyor)
    const updatedScript = await prisma.voiceoverScript.update({
      where: { id: resolvedParams.id },
      data: {
        status: 'VOICE_UPLOADED',
        producerApproved: true,
        producerApprovedAt: new Date(),
        producerApprovedBy: null, // Creator User tablosunda değil
      },
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
      },
    })

    // Audit log kaydet
    await createAuditLog({
      userId: creator?.id,
      userName: creator?.name,
      userRole: 'creator',
      action: 'script_creator_approved',
      entityType: 'VoiceoverScript',
      entityId: resolvedParams.id,
      oldValue,
      newValue: {
        status: updatedScript.status,
      },
      details: {
        title: updatedScript.title,
        creatorId: updatedScript.creatorId,
        creatorName: updatedScript.creator?.name,
        voiceActorId: updatedScript.voiceActorId,
        voiceActorName: updatedScript.voiceActor?.name,
      },
    })

    return NextResponse.json({
      message: 'Ses onaylandı, admin onayı bekleniyor',
      script: updatedScript,
    })
  } catch (error: any) {
    console.error('Error approving script by creator:', error)
    return NextResponse.json(
      { error: error.message || 'Ses onaylanamadı' },
      { status: 500 }
    )
  }
}

