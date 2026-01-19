import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Seslendirmen getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    
    const voiceActor = await prisma.voiceActor.findUnique({
      where: { id: resolvedParams.id },
      include: {
        scripts: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!voiceActor) {
      return NextResponse.json(
        { error: 'Seslendirmen bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(voiceActor)
  } catch (error: any) {
    console.error('Error fetching voice actor:', error)
    return NextResponse.json(
      { error: `Seslendirmen getirilemedi: ${error.message}` },
      { status: 500 }
    )
  }
}

// Seslendirmen güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const data = await request.json()
    
    // Seslendirmeni bul
    const voiceActor = await prisma.voiceActor.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!voiceActor) {
      return NextResponse.json(
        { error: 'Seslendirmen bulunamadı' },
        { status: 404 }
      )
    }

    // Güncelle
    const updated = await prisma.voiceActor.update({
      where: { id: resolvedParams.id },
      data: {
        name: data.name || voiceActor.name,
        email: data.email || voiceActor.email,
        phone: data.phone !== undefined ? data.phone : voiceActor.phone,
        iban: data.iban !== undefined ? data.iban : voiceActor.iban,
        profilePhoto: data.profilePhoto !== undefined ? data.profilePhoto : voiceActor.profilePhoto,
        isActive: data.isActive !== undefined ? data.isActive : voiceActor.isActive,
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating voice actor:', error)
    return NextResponse.json(
      { error: `Seslendirmen güncellenemedi: ${error.message}` },
      { status: 500 }
    )
  }
}

// Seslendirmen sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    
    // Seslendirmeni bul
    const voiceActor = await prisma.voiceActor.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!voiceActor) {
      return NextResponse.json(
        { error: 'Seslendirmen bulunamadı' },
        { status: 404 }
      )
    }

    // Seslendirmeni sil (ilişkili metinler cascade ile silinecek veya SetNull olacak)
    await prisma.voiceActor.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({
      message: 'Seslendirmen başarıyla silindi',
    })
  } catch (error: any) {
    console.error('Error deleting voice actor:', error)
    return NextResponse.json(
      { error: `Seslendirmen silinemedi: ${error.message}` },
      { status: 500 }
    )
  }
}
