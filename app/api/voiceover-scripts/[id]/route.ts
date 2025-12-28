import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Metin detayını getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params)
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

    // Admin kontrolü - hem cookie'den hem de veritabanından kontrol et
    let isAdmin = false
    const userRoleCookie = cookieStore.get('user-role')?.value
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      })
      // Hem cookie'den hem de veritabanından kontrol et
      isAdmin = 
        (user?.role === 'admin' || user?.role === 'ADMIN') ||
        (userRoleCookie === 'admin' || userRoleCookie === 'ADMIN')
    } else if (userRoleCookie === 'admin' || userRoleCookie === 'ADMIN') {
      // Sadece cookie'den admin kontrolü (fallback)
      isAdmin = true
    }

    const script = await prisma.voiceoverScript.findUnique({
      where: { id },
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

    // Admin tüm metinleri görebilir
    if (isAdmin) {
      return NextResponse.json(script)
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

// Metni güncelle (ses upload, onay, ücret, metin düzenleme)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params)
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value
    const voiceActorId = cookieStore.get('voice-actor-id')?.value

    if (!userId && !voiceActorId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { audioFile, voiceLink, price, status, title, text, rejectionReason } = body

    // Mevcut metni kontrol et
    const existingScript = await prisma.voiceoverScript.findUnique({
      where: { id },
    })

    if (!existingScript) {
      return NextResponse.json(
        { error: 'Metin bulunamadı' },
        { status: 404 }
      )
    }

    // Admin kontrolü
    let isAdmin = false
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })
      isAdmin = user?.role === 'admin'
    }

    const updateData: any = {}

    // Admin metin içeriğini düzenleyebilir
    if (isAdmin) {
      if (title !== undefined) updateData.title = title
      if (text !== undefined) updateData.text = text
      if (price !== undefined) updateData.price = price
      if (status !== undefined) updateData.status = status
      if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason
    }

    // Seslendirmen sadece ses linki ekleyebilir/güncelleyebilir
    if (voiceActorId) {
      if (existingScript.voiceActorId !== voiceActorId) {
        return NextResponse.json(
          { error: 'Bu metin size atanmamış' },
          { status: 403 }
        )
      }
      // voiceLink veya audioFile (backward compatibility)
      if (voiceLink !== undefined) {
        updateData.voiceLink = voiceLink
        // Ses linki eklendiğinde status'u VOICE_UPLOADED yap
        if (voiceLink && existingScript.status === 'WAITING_VOICE') {
          updateData.status = 'VOICE_UPLOADED'
        }
      } else if (audioFile !== undefined) {
        // Backward compatibility: audioFile -> voiceLink
        updateData.voiceLink = audioFile
        if (audioFile && existingScript.status === 'WAITING_VOICE') {
          updateData.status = 'VOICE_UPLOADED'
        }
      }
    }

    const script = await prisma.voiceoverScript.update({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params)
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
      where: { id },
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

