import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Tüm ödeme taleplerini getir
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value
    const creatorId = cookieStore.get('creator-id')?.value
    const voiceActorId = cookieStore.get('voice-actor-id')?.value
    const streamerId = cookieStore.get('streamer-id')?.value
    const teamMemberId = cookieStore.get('team-member-id')?.value

    if (!userId && !creatorId && !voiceActorId && !streamerId && !teamMemberId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    // Where clause oluştur
    const whereClause: any = {}

    // Admin değilse sadece kendi taleplerini görebilir
    if (!userId) {
      const orConditions: any[] = []
      if (creatorId) orConditions.push({ contentCreatorId: creatorId })
      if (voiceActorId) orConditions.push({ voiceActorId })
      if (streamerId) orConditions.push({ streamerId })
      if (teamMemberId) orConditions.push({ teamMemberId })
      
      if (orConditions.length > 0) {
        whereClause.OR = orConditions
      }
    }

    // Status filtresi
    if (status && status !== 'all') {
      whereClause.status = status
    }

    const requests = await prisma.paymentRequest.findMany({
      where: whereClause,
      include: {
        contentCreator: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
        voiceActor: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
        streamer: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
        teamMember: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        content: {
          select: {
            id: true,
            title: true,
            platform: true,
          },
        },
        contentRegistry: {
          select: {
            id: true,
            title: true,
            platform: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching payment requests:', error)
    return NextResponse.json(
      { error: 'Ödeme talepleri getirilemedi' },
      { status: 500 }
    )
  }
}

// Yeni ödeme talebi oluştur
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
    const {
      type,
      amount,
      description,
      contentId,
      contentRegistryId,
      attachmentUrl,
    } = body

    if (!type || !amount || !description) {
      return NextResponse.json(
        { error: 'Tip, tutar ve açıklama gereklidir' },
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

    const paymentRequest = await prisma.paymentRequest.create({
      data: {
        ...requesterData,
        type,
        amount: parseFloat(amount),
        description,
        contentId: contentId || null,
        contentRegistryId: contentRegistryId || null,
        attachmentUrl: attachmentUrl || null,
        status: 'PENDING',
      },
      include: {
        contentCreator: {
          select: {
            id: true,
            name: true,
          },
        },
        voiceActor: {
          select: {
            id: true,
            name: true,
          },
        },
        streamer: {
          select: {
            id: true,
            name: true,
          },
        },
        teamMember: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Ödeme talebi başarıyla oluşturuldu',
      request: paymentRequest,
    })
  } catch (error: any) {
    console.error('Error creating payment request:', error)
    return NextResponse.json(
      { error: error.message || 'Ödeme talebi oluşturulamadı' },
      { status: 500 }
    )
  }
}

