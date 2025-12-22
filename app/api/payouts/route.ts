import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Veri doğrulama
    if (!data.amount || !data.date) {
      return NextResponse.json(
        { error: 'Tutar ve tarih gereklidir' },
        { status: 400 }
      )
    }

    // Payout için recipientType ve recipientId zorunlu
    let recipientType: string | null = null
    let recipientId: string | null = null

    if (data.streamerId) {
      recipientType = 'streamer'
      recipientId = data.streamerId
    } else if (data.teamMemberId) {
      recipientType = 'teamMember'
      recipientId = data.teamMemberId
    } else if (data.contentCreatorId) {
      recipientType = 'contentCreator'
      recipientId = data.contentCreatorId
    } else if (data.voiceActorId) {
      recipientType = 'voiceActor'
      recipientId = data.voiceActorId
    }

    if (!recipientType || !recipientId) {
      return NextResponse.json(
        { error: 'Ödeme kaydı için "Kime Ödendi?" alanı zorunludur' },
        { status: 400 }
      )
    }

    const amount = Math.abs(parseFloat(data.amount)) // Her zaman pozitif
    const status = data.payoutStatus || 'paid'
    const paidAt = status === 'paid' ? new Date(data.date) : null

    console.log(`[Payout API] Creating payout:`, {
      recipientType,
      recipientId,
      amount,
      status,
      paidAt,
    })

    // Payout oluştur
    const payout = await prisma.payout.create({
      data: {
        recipientType,
        recipientId,
        amount,
        status,
        source: 'manual',
        note: data.description || null,
        paidAt,
        referenceId: null,
      },
    })

    console.log(`[Payout API] ✅ Created payout:`, payout.id)

    // İlgili kullanıcının profil sayfasını revalidate et
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      let revalidatePath = ''
      
      if (recipientType === 'streamer') {
        revalidatePath = `/streamers/${recipientId}`
      } else if (recipientType === 'teamMember') {
        revalidatePath = `/team/${recipientId}`
      } else if (recipientType === 'contentCreator') {
        revalidatePath = `/content-creators/${recipientId}`
      } else if (recipientType === 'voiceActor') {
        revalidatePath = `/voice-actors/${recipientId}`
      }

      if (revalidatePath) {
        await fetch(`${baseUrl}/api/revalidate?path=${revalidatePath}`, {
          method: 'POST',
        }).catch(() => {})
      }
    } catch (e) {
      // Ignore revalidate errors
    }

    return NextResponse.json({
      ...payout,
      streamerId: recipientType === 'streamer' ? recipientId : null,
      teamMemberId: recipientType === 'teamMember' ? recipientId : null,
      contentCreatorId: recipientType === 'contentCreator' ? recipientId : null,
      voiceActorId: recipientType === 'voiceActor' ? recipientId : null,
    })
  } catch (error: any) {
    console.error('Error creating payout:', error)
    return NextResponse.json(
      { error: 'Ödeme kaydı oluşturulamadı', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const recipientType = searchParams.get('recipientType')
    const recipientId = searchParams.get('recipientId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (recipientType && recipientId) {
      where.recipientType = recipientType
      where.recipientId = recipientId
    }

    const payouts = await prisma.payout.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    return NextResponse.json({
      payouts,
      total: payouts.length,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('Error fetching payouts:', error)
    return NextResponse.json(
      { error: 'Ödeme kayıtları getirilemedi', details: error.message },
      { status: 500 }
    )
  }
}

