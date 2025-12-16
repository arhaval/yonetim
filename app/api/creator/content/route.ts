import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// İçerik üreticisinin kendi içeriklerini getir
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const creatorId = cookieStore.get('creator-id')?.value

    if (!creatorId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    // Tüm içerikleri getir (sadece creator'a ait olanlar değil)
    const contents = await prisma.content.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { publishDate: 'desc' },
    })

    return NextResponse.json(contents)
  } catch (error) {
    console.error('Error fetching creator content:', error)
    return NextResponse.json(
      { error: 'İçerikler getirilemedi' },
      { status: 500 }
    )
  }
}

// İçerik üreticisi yeni içerik ekle
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const creatorId = cookieStore.get('creator-id')?.value

    if (!creatorId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const creator = await prisma.contentCreator.findUnique({
      where: { id: creatorId },
    })

    if (!creator || !creator.isActive) {
      return NextResponse.json(
        { error: 'Hesabınız aktif değil' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, type, platform, url, publishDate, views, likes, comments, shares, saves } = body

    if (!title || !type || !platform || !publishDate) {
      return NextResponse.json(
        { error: 'Başlık, tip, platform ve yayın tarihi gereklidir' },
        { status: 400 }
      )
    }

    // İçerik verileri - istatistikler otomatik 0 olacak
    const contentData: any = {
      title,
      type,
      platform,
      url: url || null,
      publishDate: new Date(publishDate),
      creatorId,
      creatorName: creator.name,
      views: views || 0,
      likes: likes || 0,
      comments: comments || 0,
      shares: shares || 0,
      saves: saves || 0,
    }

    const content = await prisma.content.create({
      data: contentData,
    })

    return NextResponse.json({
      message: 'İçerik başarıyla eklendi',
      content,
    })
  } catch (error: any) {
    console.error('Error creating content:', error)
    return NextResponse.json(
      { error: error.message || 'İçerik eklenemedi' },
      { status: 500 }
    )
  }
}

