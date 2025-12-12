import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

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

    // Status pending olmalı (henüz creator onaylamamış)
    if (script.status !== 'pending') {
      return NextResponse.json(
        { error: 'Bu metin zaten işlenmiş' },
        { status: 400 }
      )
    }

    // Creator onayını ver (status: creator-approved)
    const updatedScript = await prisma.voiceoverScript.update({
      where: { id: params.id },
      data: {
        status: 'creator-approved',
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

