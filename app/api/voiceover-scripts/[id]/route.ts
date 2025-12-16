import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Metin detayını getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value
    const creatorId = cookieStore.get('creator-id')?.value
    const voiceActorId = cookieStore.get('voice-actor-id')?.value

    if (!userId && !creatorId && !voiceActorId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const script = await prisma.voiceoverScript.findUnique({
      where: { id: params.id },
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

    if (!script) {
      return NextResponse.json(
        { error: 'Metin bulunamadı' },
        { status: 404 }
      )
    }

    // İçerik üreticisi sadece kendi metinlerini görebilir
    if (creatorId && script.creatorId !== creatorId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      )
    }

    return NextResponse.json(script)
  } catch (error) {
    console.error('Error fetching script:', error)
    return NextResponse.json(
      { error: 'Metin getirilemedi' },
      { status: 500 }
    )
  }
}

// Metni güncelle (ses upload, onay, ücret)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const voiceActorId = cookieStore.get('voice-actor-id')?.value

    if (!voiceActorId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { audioFile, price, status } = body

    // Mevcut metni kontrol et
    const existingScript = await prisma.voiceoverScript.findUnique({
      where: { id: params.id },
    })

    if (!existingScript) {
      return NextResponse.json(
        { error: 'Metin bulunamadı' },
        { status: 404 }
      )
    }

    // Seslendirmen sadece kendine atanan metinleri güncelleyebilir
    if (existingScript.voiceActorId !== voiceActorId) {
      return NextResponse.json(
        { error: 'Bu metin size atanmamış' },
        { status: 403 }
      )
    }

    const updateData: any = {}
    if (audioFile !== undefined) updateData.audioFile = audioFile
    if (price !== undefined) updateData.price = price
    if (status !== undefined) updateData.status = status

    const script = await prisma.voiceoverScript.update({
      where: { id: params.id },
      data: updateData,
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

    // Seslendirmen sadece ses dosyası yükleyebilir, onay ve ücret admin tarafından yapılır
    // Bu endpoint artık sadece ses dosyası yükleme için kullanılıyor

    return NextResponse.json({
      message: 'Metin başarıyla güncellendi',
      script,
    })
  } catch (error: any) {
    console.error('Error updating script:', error)
    return NextResponse.json(
      { error: error.message || 'Metin güncellenemedi' },
      { status: 500 }
    )
  }
}

// Metni sil (sadece admin)
export async function DELETE(
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

    // Metni sil
    await prisma.voiceoverScript.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Metin başarıyla silindi',
    })
  } catch (error: any) {
    console.error('Error deleting script:', error)
    return NextResponse.json(
      { error: error.message || 'Metin silinemedi' },
      { status: 500 }
    )
  }
}

