import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const contents = await prisma.content.findMany({
      orderBy: { publishDate: 'asc' },
    })
    return NextResponse.json(contents)
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { error: 'İçerikler getirilemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validasyon
    if (!data.title || data.title.trim() === '') {
      return NextResponse.json(
        { error: 'Başlık gereklidir' },
        { status: 400 }
      )
    }
    
    if (!data.platform) {
      return NextResponse.json(
        { error: 'Platform gereklidir' },
        { status: 400 }
      )
    }
    
    if (!data.type) {
      return NextResponse.json(
        { error: 'Tip gereklidir' },
        { status: 400 }
      )
    }

    const content = await prisma.content.create({
      data: {
        title: data.title.trim(),
        type: data.type,
        platform: data.platform,
        url: data.url || null,
        publishDate: new Date(data.publishDate),
        creatorName: data.creatorName || null,
        views: data.views || 0,
        likes: data.likes || 0,
        comments: data.comments || 0,
        shares: data.shares || 0,
        saves: data.saves || 0,
        notes: data.notes || null,
      },
    })
    
    return NextResponse.json({
      message: 'İçerik başarıyla oluşturuldu',
      content: content,
    })
  } catch (error: any) {
    console.error('Error creating content:', error)
    return NextResponse.json(
      { 
        error: 'İçerik oluşturulamadı',
        details: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}




