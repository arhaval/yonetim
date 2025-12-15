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
    
    // İsim zorunlu
    if (!data.name || !data.name.trim()) {
      return NextResponse.json(
        { error: 'İsim gereklidir' },
        { status: 400 }
      )
    }
    
    // Email ve şifre zorunlu
    if (!data.email || !data.email.trim()) {
      return NextResponse.json(
        { error: 'Email gereklidir' },
        { status: 400 }
      )
    }

    if (!data.password || !data.password.trim()) {
      return NextResponse.json(
        { error: 'Şifre gereklidir' },
        { status: 400 }
      )
    }
    
    // Şifre hash'le
    const hashedPassword = await hashPassword(data.password.trim())

    // Email'i normalize et (küçük harfe çevir ve trim yap)
    const normalizedEmail = data.email.toLowerCase().trim()

    // Mevcut yayıncı var mı kontrol et (case-insensitive)
    const existingStreamers = await prisma.streamer.findMany({
      where: { email: { not: null } },
    })
    
    const existingStreamer = existingStreamers.find(
      s => s.email && s.email.toLowerCase().trim() === normalizedEmail
    )

    if (existingStreamer) {
      // Mevcut kaydı güncelle
      const updated = await prisma.streamer.update({
        where: { id: existingStreamer.id },
        data: {
          name: data.name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          profilePhoto: data.profilePhoto || existingStreamer.profilePhoto,
          iban: data.iban || existingStreamer.iban,
          phone: data.phone || existingStreamer.phone,
        },
        include: {
          teamRates: true,
        },
      })
      
      const { password, ...streamerWithoutPassword } = updated
      return NextResponse.json({
        message: 'Yayıncı güncellendi',
        streamer: streamerWithoutPassword,
      })
    }

    const streamer = await prisma.streamer.create({
      data: {
        name: data.name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
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

