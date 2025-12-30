import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { createAuditLog } from '@/lib/audit-log'
import { canProducerApprove } from '@/lib/voiceover-permissions'
import { generateEditPackToken } from '@/lib/edit-pack-token'
import { createEditPackUrl } from '@/lib/edit-pack-url'

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

    // TEK TRANSACTION İÇİNDE: Producer onayı ve EditPack oluşturma
    const updatedScript = await prisma.$transaction(async (tx) => {
      // 1. Producer onayını ver (status: VOICE_UPLOADED - ses linki var, admin onayı bekliyor)
      const updated = await tx.voiceoverScript.update({
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
          editPack: true, // EditPack'i de dahil et
        },
      })

      // 2. EditPack kontrolü ve oluşturma (eğer yoksa)
      let editPack = updated.editPack
      
      if (!editPack) {
        // Token'un unique olduğundan emin olmak için retry mekanizması
        let token: string
        let attempts = 0
        const maxAttempts = 10

        while (attempts < maxAttempts) {
          token = generateEditPackToken()
          
          // Token'un unique olduğunu kontrol et
          const existingToken = await tx.editPack.findUnique({
            where: { token },
          })

          if (!existingToken) {
            // Unique token bulundu, EditPack oluştur
            const createdAt = new Date()
            const expiresAt = new Date(createdAt)
            expiresAt.setDate(expiresAt.getDate() + 7) // +7 gün

            editPack = await tx.editPack.create({
              data: {
                voiceoverId: resolvedParams.id,
                token,
                createdAt,
                expiresAt,
              },
            })
            break
          }

          attempts++
          if (attempts >= maxAttempts) {
            throw new Error('EditPack token oluşturulamadı: unique token bulunamadı')
          }
        }
      }

      // Updated script'i editPack ile birlikte döndür
      return {
        ...updated,
        editPack,
      }
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

    // Response'da script objesini ve editPack bilgisini dön
    const editPackUrl = createEditPackUrl(updatedScript.editPack?.token)

    return NextResponse.json({
      message: 'Metin onaylandı, admin fiyat girip onaylayacak',
      script: {
        ...updatedScript,
        editPack: updatedScript.editPack ? {
          id: updatedScript.editPack.id,
          token: updatedScript.editPack.token,
          expiresAt: updatedScript.editPack.expiresAt,
          url: editPackUrl,
        } : null,
      },
    })
  } catch (error: any) {
    console.error('Error approving script by creator:', error)
    return NextResponse.json(
      { error: error.message || 'Ses onaylanamadı' },
      { status: 500 }
    )
  }
}

