import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Tüm metinleri getir (admin için)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value
    const creatorId = cookieStore.get('creator-id')?.value

    // Admin veya içerik üreticisi kontrolü
    if (!userId && !creatorId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const scripts = await prisma.voiceoverScript.findMany({
      where: creatorId ? { creatorId } : {}, // İçerik üreticisi sadece kendi metinlerini görür
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
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(scripts)
  } catch (error) {
    console.error('Error fetching scripts:', error)
    return NextResponse.json(
      { error: 'Metinler getirilemedi' },
      { status: 500 }
    )
  }
}

// Yeni metin oluştur (admin veya içerik üreticisi)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value
    const creatorId = cookieStore.get('creator-id')?.value

    if (!userId && !creatorId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, text, contentType } = body

    if (!title || !text) {
      return NextResponse.json(
        { error: 'Başlık ve metin gereklidir' },
        { status: 400 }
      )
    }

    const script = await prisma.voiceoverScript.create({
      data: {
        title,
        text,
        contentType: contentType || null, // uzun, kısa, reels
        creatorId: creatorId || null, // Admin ise null, içerik üreticisi ise ID
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Metin başarıyla oluşturuldu',
      script,
    })
  } catch (error: any) {
    console.error('Error creating script:', error)
    return NextResponse.json(
      { error: error.message || 'Metin oluşturulamadı' },
      { status: 500 }
    )
  }
}



