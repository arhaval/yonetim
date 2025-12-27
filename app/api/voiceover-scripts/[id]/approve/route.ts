import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { createAuditLog } from '@/lib/audit-log'

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

    if (!price || price <= 0) {
      return NextResponse.json(
        { error: 'Geçerli bir ücret girin' },
        { status: 400 }
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

    if (!script.audioFile) {
      return NextResponse.json(
        { error: 'Ses dosyası yüklenmemiş' },
        { status: 400 }
      )
    }

    // Sadece creator-approved olanları onaylayabilir
    if (script.status !== 'creator-approved') {
      return NextResponse.json(
        { error: 'Bu metin içerik üreticisi tarafından henüz onaylanmamış' },
        { status: 400 }
      )
    }

    // Eski değerleri kaydet (audit log için)
    const oldValue = {
      status: script.status,
      price: script.price,
    }

    // Metni onayla ve ücreti güncelle
    const updatedScript = await prisma.voiceoverScript.update({
      where: { id: params.id },
      data: {
        status: 'approved',
        price: price,
      },
      include: {
        voiceActor: true,
        creator: true,
      },
    })

    // Finansal kayıt oluştur (gider olarak) - Sadece voice actor için
    // Creator maaş alıyor, script ücretinden pay almıyor
    let financialRecordId = null
    if (updatedScript.voiceActorId) {
      try {
        const financialRecord = await prisma.financialRecord.create({
          data: {
            type: 'expense',
            category: 'voiceover',
            amount: price,
            description: `Seslendirme: ${updatedScript.title} - ${updatedScript.voiceActor?.name || 'Bilinmeyen'}`,
            date: new Date(),
            voiceActorId: updatedScript.voiceActorId || null,
            // contentCreatorId kaldırıldı - creator maaş alıyor
          },
        })
        financialRecordId = financialRecord.id
        console.log('Finansal kayıt oluşturuldu:', financialRecord)
      } catch (financialError: any) {
        console.error('Finansal kayıt oluşturma hatası:', financialError)
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



