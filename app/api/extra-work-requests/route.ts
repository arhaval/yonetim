import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Ekstra iş taleplerini getir
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || 'pending'

    const requests = await prisma.extraWorkRequest.findMany({
      where: { status },
      include: {
        contentCreator: {
          select: { id: true, name: true },
        },
        voiceActor: {
          select: { id: true, name: true },
        },
        streamer: {
          select: { id: true, name: true },
        },
        teamMember: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching extra work requests:', error)
    return NextResponse.json(
      { error: 'Talepler getirilemedi' },
      { status: 500 }
    )
  }
}

// Yeni ekstra iş talebi oluştur
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const creatorId = cookieStore.get('creator-id')?.value
    const voiceActorId = cookieStore.get('voice-actor-id')?.value
    const streamerId = cookieStore.get('streamer-id')?.value
    const teamMemberId = cookieStore.get('team-member-id')?.value

    if (!creatorId && !voiceActorId && !streamerId && !teamMemberId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { workType, amount, description } = body

    if (!workType || !amount || !description) {
      return NextResponse.json(
        { error: 'Tüm alanlar gereklidir' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Tutar 0\'dan büyük olmalıdır' },
        { status: 400 }
      )
    }

    // Talep eden kişiyi belirle
    const requesterData: any = {}
    if (creatorId) requesterData.contentCreatorId = creatorId
    else if (voiceActorId) requesterData.voiceActorId = voiceActorId
    else if (streamerId) requesterData.streamerId = streamerId
    else if (teamMemberId) requesterData.teamMemberId = teamMemberId

    const extraWorkRequest = await prisma.extraWorkRequest.create({
      data: {
        ...requesterData,
        workType,
        amount: parseFloat(amount),
        description,
        status: 'pending',
      },
    })

    return NextResponse.json({
      message: 'Talep başarıyla oluşturuldu',
      request: extraWorkRequest,
    })
  } catch (error: any) {
    console.error('Error creating extra work request:', error)
    return NextResponse.json(
      { error: error.message || 'Talep oluşturulamadı' },
      { status: 500 }
    )
  }
}

