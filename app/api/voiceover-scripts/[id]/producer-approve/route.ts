import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { createAuditLog } from '@/lib/audit-log'

// İçerik üreticisi (producer) ses linkini onaylar
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params)
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
      where: { id },
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

    // Kural: voiceLink dolu olmalı
    const voiceLink = script.voiceLink || script.audioFile // Backward compatibility
    if (!voiceLink) {
      return NextResponse.json(
        { error: 'Ses linki eklenmemiş. Producer onayı için ses linki gereklidir.' },
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
      producerApproved: script.producerApproved,
      producerApprovedAt: script.producerApprovedAt,
      producerApprovedBy: script.producerApprovedBy,
    }

    // Producer onayını ver
    const updatedScript = await prisma.voiceoverScript.update({
      where: { id },
      data: {
        producerApproved: true,
        producerApprovedAt: new Date(),
        producerApprovedBy: null, // Creator User tablosunda değil, ContentCreator tablosunda
        // Status'u VOICE_UPLOADED yap (ses linki var, admin onayı bekliyor)
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
      userId: creatorId,
      userName: creator?.name || 'Unknown',
      userRole: 'content_creator',
      action: 'script_producer_approved',
      entityType: 'VoiceoverScript',
      entityId: id,
      oldValue,
      newValue: {
        producerApproved: updatedScript.producerApproved,
        producerApprovedAt: updatedScript.producerApprovedAt,
        producerApprovedBy: updatedScript.producerApprovedBy,
      },
      details: {
        title: updatedScript.title,
        voiceLink: voiceLink,
      },
    })

    return NextResponse.json({
      message: 'Producer onayı başarıyla verildi',
      script: updatedScript,
    })
  } catch (error: any) {
    console.error('Error approving script as producer:', error)
    return NextResponse.json(
      { error: error.message || 'Producer onayı verilemedi' },
      { status: 500 }
    )
  }
}

