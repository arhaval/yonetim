import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-check'

export const dynamic = 'force-dynamic'

// Yayıncı detaylarını getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    
    const streamer = await prisma.streamer.findUnique({
      where: { id: resolvedParams.id },
      include: {
        teamRates: true,
      },
    })

    if (!streamer) {
      return NextResponse.json(
        { error: 'Yayıncı bulunamadı' },
        { status: 404 }
      )
    }

    const { password, ...streamerWithoutPassword } = streamer
    return NextResponse.json(streamerWithoutPassword)
  } catch (error: any) {
    console.error('Error fetching streamer:', error)
    return NextResponse.json(
      { error: `Yayıncı getirilemedi: ${error.message}` },
      { status: 500 }
    )
  }
}

// Yayıncı güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  // Admin kontrolü
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const resolvedParams = await Promise.resolve(params)
    const data = await request.json()
    
    // Yayıncıyı bul
    const streamer = await prisma.streamer.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!streamer) {
      return NextResponse.json(
        { error: 'Yayıncı bulunamadı' },
        { status: 404 }
      )
    }

    // İsim kontrolü
    if (!data.name || !data.name.trim()) {
      return NextResponse.json(
        { error: 'İsim gereklidir' },
        { status: 400 }
      )
    }

    // Mevcut teamRates'i sil ve yenilerini oluştur
    if (data.teamRates && Array.isArray(data.teamRates)) {
      // Önce mevcut teamRates'i sil
      await prisma.streamerTeamRate.deleteMany({
        where: { streamerId: resolvedParams.id },
      })

      // Yeni teamRates'i oluştur
      if (data.teamRates.length > 0) {
        await prisma.streamerTeamRate.createMany({
          data: data.teamRates.map((tr: { teamName: string; hourlyRate: number }) => ({
            streamerId: resolvedParams.id,
            teamName: tr.teamName.trim(),
            hourlyRate: tr.hourlyRate || 0,
          })),
        })
      }
    }

    // Yayıncıyı güncelle
    const updated = await prisma.streamer.update({
      where: { id: resolvedParams.id },
      data: {
        name: data.name.trim(),
        profilePhoto: data.profilePhoto || null,
        iban: data.iban || null,
      },
      include: {
        teamRates: true,
      },
    })

    const { password, ...streamerWithoutPassword } = updated
    return NextResponse.json(streamerWithoutPassword)
  } catch (error: any) {
    console.error('Error updating streamer:', error)
    return NextResponse.json(
      { error: `Yayıncı güncellenemedi: ${error.message}` },
      { status: 500 }
    )
  }
}

// Yayıncı sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  // Admin kontrolü
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const resolvedParams = await Promise.resolve(params)
    
    // Yayıncıyı bul
    const streamer = await prisma.streamer.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!streamer) {
      return NextResponse.json(
        { error: 'Yayıncı bulunamadı' },
        { status: 404 }
      )
    }
    
    // Yayıncıyı sil (ilişkili yayınlar, ödemeler cascade ile silinecek)
    await prisma.streamer.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({
      message: 'Yayıncı başarıyla silindi',
    })
  } catch (error: any) {
    console.error('Error deleting streamer:', error)
    return NextResponse.json(
      { error: `Yayıncı silinemedi: ${error.message}` },
      { status: 500 }
    )
  }
}
