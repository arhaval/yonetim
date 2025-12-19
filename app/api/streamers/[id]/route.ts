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
  try {
    // Admin kontrolü
    const adminCheck = await requireAdmin()
    if (adminCheck) {
      console.error('Admin check failed:', adminCheck.status)
      return adminCheck
    }

    const resolvedParams = await Promise.resolve(params)
    console.log('Deleting streamer with ID:', resolvedParams.id)
    
    // Yayıncıyı bul ve ilişkili verileri kontrol et
    const streamer = await prisma.streamer.findUnique({
      where: { id: resolvedParams.id },
      include: {
        streams: { take: 1 },
        payments: { take: 1 },
        externalStreams: { take: 1 },
        financialRecords: { take: 1 },
        teamRates: true,
      },
    })

    if (!streamer) {
      return NextResponse.json(
        { error: 'Yayıncı bulunamadı' },
        { status: 404 }
      )
    }

    console.log('Streamer found:', {
      id: streamer.id,
      name: streamer.name,
      streamsCount: streamer.streams.length,
      paymentsCount: streamer.payments.length,
      externalStreamsCount: streamer.externalStreams.length,
      financialRecordsCount: streamer.financialRecords.length,
    })
    
    // İlişkili tüm kayıtları manuel olarak sil (cascade güvenilir olmayabilir)
    try {
      // 1. Financial Records'u sil
      await prisma.financialRecord.deleteMany({
        where: { streamerId: resolvedParams.id },
      })
      console.log('Financial records deleted')
    } catch (error: any) {
      console.warn('Financial records deletion warning:', error.message)
    }

    try {
      // 2. Payments'ı sil
      await prisma.payment.deleteMany({
        where: { streamerId: resolvedParams.id },
      })
      console.log('Payments deleted')
    } catch (error: any) {
      console.warn('Payments deletion warning:', error.message)
    }

    try {
      // 3. External Streams'i sil
      await prisma.externalStream.deleteMany({
        where: { streamerId: resolvedParams.id },
      })
      console.log('External streams deleted')
    } catch (error: any) {
      console.warn('External streams deletion warning:', error.message)
    }

    try {
      // 4. Streams'i sil
      await prisma.stream.deleteMany({
        where: { streamerId: resolvedParams.id },
      })
      console.log('Streams deleted')
    } catch (error: any) {
      console.warn('Streams deletion warning:', error.message)
    }

    try {
      // 5. Team Rates'i sil
      await prisma.streamerTeamRate.deleteMany({
        where: { streamerId: resolvedParams.id },
      })
      console.log('Team rates deleted')
    } catch (error: any) {
      console.warn('Team rates deletion warning:', error.message)
    }
    
    // Son olarak yayıncıyı sil
    await prisma.streamer.delete({
      where: { id: resolvedParams.id },
    })

    console.log('Streamer deleted successfully')
    return NextResponse.json({
      message: 'Yayıncı başarıyla silindi',
    })
  } catch (error: any) {
    console.error('Error deleting streamer:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    })
    
    // Daha açıklayıcı hata mesajları
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Yayıncı silinemedi: Bu yayıncıya bağlı kayıtlar var. Lütfen önce ilişkili kayıtları silin.' },
        { status: 400 }
      )
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Yayıncı bulunamadı veya zaten silinmiş' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        error: `Yayıncı silinemedi: ${error.message || 'Bilinmeyen bir hata oluştu'}`,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
