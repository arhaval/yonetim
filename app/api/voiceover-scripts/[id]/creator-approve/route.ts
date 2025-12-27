import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { createAuditLog } from '@/lib/audit-log'

// İçerik üreticisi sesi onaylar
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const creatorId = cookieStore.get('creator-id')?.value

    if (!creatorId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    // Metni kontrol et
    const script = await prisma.voiceoverScript.findUnique({
      where: { id: params.id },
    })

    if (!script) {
      return NextResponse.json(
        { error: 'Metin bulunamadı' },
        { status: 404 }
      )
    }

    // Sadece kendi metinlerini onaylayabilir
    if (script.creatorId !== creatorId) {
      return NextResponse.json(
        { error: 'Bu metin size ait değil' },
        { status: 403 }
      )
    }

    // Ses dosyası yüklenmiş olmalı
    if (!script.audioFile) {
      return NextResponse.json(
        { error: 'Ses dosyası henüz yüklenmemiş' },
        { status: 400 }
      )
    }

    // Status WAITING_VOICE veya VOICE_UPLOADED olabilir (ses yüklenmiş olmalı)
    if (!script.audioFile) {
      return NextResponse.json(
        { error: 'Ses dosyası henüz yüklenmemiş' },
        { status: 400 }
      )
    }
    
    // Eğer WAITING_VOICE ise VOICE_UPLOADED'a çevir (creator onayı)
    // Eğer zaten VOICE_UPLOADED ise hata verme (tekrar onaylanabilir)
    if (script.status !== 'WAITING_VOICE' && script.status !== 'VOICE_UPLOADED') {
      return NextResponse.json(
        { error: 'Bu metin zaten işlenmiş' },
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
    }

    // Creator onayını ver (status: VOICE_UPLOADED - ses yüklendi, admin onayı bekliyor)
    const updatedScript = await prisma.voiceoverScript.update({
      where: { id: params.id },
      data: {
        status: 'VOICE_UPLOADED',
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
      entityId: params.id,
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

