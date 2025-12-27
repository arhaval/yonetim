import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { createAuditLog } from '@/lib/audit-log'
import { generateEditPackToken } from '@/lib/edit-pack-token'

// Admin metni onaylar ve ücreti girer
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    // Admin kontrolü
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { price } = body

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

    // Kural 1: producerApproved = true olmalı
    if (!script.producerApproved) {
      return NextResponse.json(
        { error: 'Admin onayı için önce producer (içerik üreticisi) onayı gereklidir.' },
        { status: 400 }
      )
    }

    // Kural 2: price dolu olmalı
    const finalPrice = price || script.price
    if (!finalPrice || finalPrice <= 0) {
      return NextResponse.json(
        { error: 'Admin onayı için geçerli bir ücret girilmelidir.' },
        { status: 400 }
      )
    }

    // Eski değerleri kaydet (audit log için)
    const oldValue = {
      status: script.status,
      price: script.price,
      adminApproved: script.adminApproved,
      adminApprovedAt: script.adminApprovedAt,
      adminApprovedBy: script.adminApprovedBy,
    }

    // Admin onayını ver ve ücreti güncelle
    const updatedScript = await prisma.voiceoverScript.update({
      where: { id: params.id },
      data: {
        status: 'APPROVED',
        price: finalPrice,
        adminApproved: true,
        adminApprovedAt: new Date(),
        adminApprovedBy: userId,
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

    // EditPack oluştur (idempotent - varsa tekrar oluşturma)
    const existingEditPack = await prisma.editPack.findUnique({
      where: { voiceoverId: params.id },
    })

    if (!existingEditPack) {
      const token = generateEditPackToken()
      const createdAt = new Date()
      const expiresAt = new Date(createdAt)
      expiresAt.setDate(expiresAt.getDate() + 7) // +7 gün

      await prisma.editPack.create({
        data: {
          voiceoverId: params.id,
          token,
          createdAt,
          expiresAt,
        },
      })
    }

    // Finansal kayıt oluştur (gider olarak) - Sadece voice actor için
    // Creator maaş alıyor, script ücretinden pay almıyor
    let financialRecordId = null
    if (updatedScript.voiceActorId && finalPrice > 0) {
      try {
        const now = new Date()
        const financialRecord = await prisma.financialRecord.create({
          data: {
            type: 'expense',
            category: 'voiceover',
            amount: finalPrice,
            description: `Seslendirme: ${updatedScript.title} - ${updatedScript.voiceActor?.name || 'Bilinmeyen'}`,
            date: now,
            occurredAt: now,
            entryType: 'expense',
            direction: 'OUT',
            voiceActorId: updatedScript.voiceActorId,
            // contentCreatorId kaldırıldı - creator maaş alıyor
          },
        })
        financialRecordId = financialRecord.id
        console.log('Finansal kayıt oluşturuldu:', financialRecord)
      } catch (financialError: any) {
        console.error('Finansal kayıt oluşturma hatası:', financialError)
        console.error('Hata detayı:', JSON.stringify(financialError, null, 2))
        // Finansal kayıt oluşturulamasa bile metin onaylanmış olarak kalmalı
      }
    }

    // Audit log kaydet
    await createAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'script_approved',
      entityType: 'VoiceoverScript',
      entityId: params.id,
      oldValue,
      newValue: {
        status: updatedScript.status,
        price: updatedScript.price,
        adminApproved: updatedScript.adminApproved,
        adminApprovedAt: updatedScript.adminApprovedAt,
        adminApprovedBy: updatedScript.adminApprovedBy,
      },
      details: {
        title: updatedScript.title,
        voiceActorId: updatedScript.voiceActorId,
        voiceActorName: updatedScript.voiceActor?.name,
        creatorId: updatedScript.creatorId,
        creatorName: updatedScript.creator?.name,
        financialRecordId,
      },
    })

    return NextResponse.json({
      message: 'Metin başarıyla onaylandı ve finansal kayıt oluşturuldu',
    })
  } catch (error: any) {
    console.error('Error approving script:', error)
    return NextResponse.json(
      { error: error.message || 'Metin onaylanamadı' },
      { status: 500 }
    )
  }
}



