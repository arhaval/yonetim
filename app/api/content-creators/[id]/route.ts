import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// İçerik üreticisi getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    
    const creator = await prisma.contentCreator.findUnique({
      where: { id: resolvedParams.id },
      include: {
        contents: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!creator) {
      return NextResponse.json(
        { error: 'İçerik üreticisi bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(creator)
  } catch (error: any) {
    console.error('Error fetching content creator:', error)
    return NextResponse.json(
      { error: `İçerik üreticisi getirilemedi: ${error.message}` },
      { status: 500 }
    )
  }
}

// İçerik üreticisi güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const data = await request.json()
    
    // İçerik üreticisini bul
    const creator = await prisma.contentCreator.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!creator) {
      return NextResponse.json(
        { error: 'İçerik üreticisi bulunamadı' },
        { status: 404 }
      )
    }

    // Güncelle
    const updated = await prisma.contentCreator.update({
      where: { id: resolvedParams.id },
      data: {
        name: data.name || creator.name,
        email: data.email || creator.email,
        phone: data.phone !== undefined ? data.phone : creator.phone,
        iban: data.iban !== undefined ? data.iban : creator.iban,
        profilePhoto: data.profilePhoto !== undefined ? data.profilePhoto : creator.profilePhoto,
        isActive: data.isActive !== undefined ? data.isActive : creator.isActive,
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating content creator:', error)
    return NextResponse.json(
      { error: `İçerik üreticisi güncellenemedi: ${error.message}` },
      { status: 500 }
    )
  }
}

// İçerik üreticisi sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    
    // İçerik üreticisini bul
    const creator = await prisma.contentCreator.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!creator) {
      return NextResponse.json(
        { error: 'İçerik üreticisi bulunamadı' },
        { status: 404 }
      )
    }

    // İçerik üreticisini sil (ilişkili içerikler ve metinler cascade ile silinecek veya SetNull olacak)
    await prisma.contentCreator.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({
      message: 'İçerik üreticisi başarıyla silindi',
    })
  } catch (error: any) {
    console.error('Error deleting content creator:', error)
    return NextResponse.json(
      { error: `İçerik üreticisi silinemedi: ${error.message}` },
      { status: 500 }
    )
  }
}

