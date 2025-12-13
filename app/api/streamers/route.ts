import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const streamers = await prisma.streamer.findMany({
      include: {
        _count: {
          select: {
            streams: true,
            externalStreams: true,
          },
        },
        teamRates: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(streamers)
  } catch (error) {
    console.error('Error fetching streamers:', error)
    return NextResponse.json(
      { error: 'Yayıncılar getirilemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Şifre varsa hash'le
    let hashedPassword = null
    if (data.password && data.password.trim()) {
      hashedPassword = await hashPassword(data.password)
    }

    // Email'i normalize et (küçük harfe çevir ve trim yap)
    const normalizedEmail = data.email ? data.email.toLowerCase().trim() : null

    const streamer = await prisma.streamer.create({
      data: {
        name: data.name,
        email: normalizedEmail,
        password: hashedPassword,
        profilePhoto: data.profilePhoto || null,
        iban: data.iban || null,
        platform: data.platform || 'Twitch',
        teamRates: data.teamRates && data.teamRates.length > 0
          ? {
              create: data.teamRates.map((tr: { teamName: string; hourlyRate: number }) => ({
                teamName: tr.teamName,
                hourlyRate: tr.hourlyRate,
              })),
            }
          : undefined,
      },
      include: {
        teamRates: true,
      },
    })
    
    // Şifreyi response'dan çıkar
    const { password, ...streamerWithoutPassword } = streamer
    return NextResponse.json(streamerWithoutPassword)
  } catch (error: any) {
    console.error('Error creating streamer:', error)
    
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanılıyor' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Yayıncı oluşturulamadı', details: error },
      { status: 500 }
    )
  }
}

