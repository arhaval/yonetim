import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const streamer = await prisma.streamer.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        iban: true,
        profilePhoto: true,
        platform: true,
        channelUrl: true,
        hourlyRate: true,
        commissionRate: true,
        isActive: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        teamRates: true,
      },
    })
    if (!streamer) {
      return NextResponse.json({ error: 'Yayıncı bulunamadı' }, { status: 404 })
    }
    return NextResponse.json(streamer)
  } catch (error) {
    console.error('Error fetching streamer:', error)
    return NextResponse.json(
      { error: 'Yayıncı getirilemedi' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    
    // Şifre varsa hash'le
    let hashedPassword = undefined
    if (data.password && data.password.trim()) {
      hashedPassword = await hashPassword(data.password)
    }

    // Email'i normalize et (küçük harfe çevir ve trim yap)
    const normalizedEmail = data.email ? data.email.toLowerCase().trim() : null
    
    // Önce mevcut teamRates'leri sil
    await prisma.streamerTeamRate.deleteMany({
      where: { streamerId: params.id },
    })

    const updateData: any = {
      name: data.name,
      email: normalizedEmail,
      profilePhoto: data.profilePhoto || null,
      iban: data.iban || null,
      phone: data.phone || null,
      teamRates: data.teamRates && data.teamRates.length > 0
        ? {
            create: data.teamRates.map((tr: { teamName: string; hourlyRate: number }) => ({
              teamName: tr.teamName,
              hourlyRate: tr.hourlyRate,
            })),
          }
        : undefined,
    }

    // Şifre varsa ekle
    if (hashedPassword) {
      updateData.password = hashedPassword
    }

    // Yayıncıyı güncelle
    const streamer = await prisma.streamer.update({
      where: { id: params.id },
      data: updateData,
      include: {
        teamRates: true,
      },
    })

    // Şifreyi response'dan çıkar
    const { password, ...streamerWithoutPassword } = streamer
    return NextResponse.json(streamerWithoutPassword)
  } catch (error: any) {
    console.error('Error updating streamer:', error)
    
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanılıyor' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Yayıncı güncellenemedi' },
      { status: 500 }
    )
  }
}

