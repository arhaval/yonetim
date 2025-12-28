import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Admin metni ödendi olarak işaretler ve giderlere ekler
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
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

    // Metni kontrol et
    const script = await prisma.voiceoverScript.findUnique({
      where: { id: resolvedParams.id },
      include: {
        voiceActor: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!script) {
      return NextResponse.json(
        { error: 'Metin bulunamadı' },
        { status: 404 }
      )
    }

    if (script.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Metin önce onaylanmalı' },
        { status: 400 }
      )
    }

    if (!script.price || script.price <= 0) {
      return NextResponse.json(
        { error: 'Metin için ücret girilmemiş' },
        { status: 400 }
      )
    }

    // Metni ödendi olarak işaretle
    await prisma.voiceoverScript.update({
      where: { id: resolvedParams.id },
      data: {
        status: 'PAID',
      },
    })

    // Finansal kayıt oluştur (gider) - Sadece voice actor için
    // Creator maaş alıyor, script ücretinden pay almıyor
    // script.price null kontrolü yukarıda yapıldı, burada kesinlikle number
    const scriptPrice = script.price!
    await prisma.financialRecord.create({
      data: {
        type: 'expense',
        category: 'voiceover',
        amount: scriptPrice,
        description: `Seslendirme ücreti - ${script.title}${script.voiceActor ? ` (${script.voiceActor.name})` : ''}`,
        date: new Date(),
        voiceActorId: script.voiceActorId || null,
        // contentCreatorId kaldırıldı - creator maaş alıyor
      },
    })

    return NextResponse.json({
      message: 'Metin ödendi olarak işaretlendi ve giderlere eklendi',
    })
  } catch (error: any) {
    console.error('Error marking script as paid:', error)
    return NextResponse.json(
      { error: error.message || 'İşlem başarısız' },
      { status: 500 }
    )
  }
}



















