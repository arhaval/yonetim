import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-error-handler'

// Cache'i kapat - her zaman fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const startTime = Date.now()
    console.log('[Payments Summary API] Starting fetch...')
    
    const result: any[] = []

    // 1. Tüm yayıncıları çek
    const streamers = await prisma.streamer.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        profilePhoto: true,
      },
    })
    console.log(`[Payments Summary] Found ${streamers.length} streamers`)

    // 2. Tüm yayınları çek (ödenmemiş olanları hesapla)
    const streams = await prisma.stream.findMany({
      where: {
        paymentStatus: { not: 'paid' },
        streamerEarning: { gt: 0 },
      },
      select: {
        id: true,
        streamerId: true,
        streamerEarning: true,
        matchInfo: true,
        date: true,
      },
    })
    console.log(`[Payments Summary] Found ${streams.length} unpaid streams`)

    // Yayıncıları ekle
    for (const streamer of streamers) {
      const streamerStreams = streams.filter(s => s.streamerId === streamer.id)
      const totalAmount = streamerStreams.reduce((sum, s) => sum + (s.streamerEarning || 0), 0)
      
      result.push({
        personId: streamer.id,
        personName: streamer.name,
        personType: 'streamer',
        profilePhoto: streamer.profilePhoto,
        totalAmount,
        itemCount: streamerStreams.length,
      })
    }

    // 3. Tüm seslendirmenleri çek
    const voiceActors = await prisma.voiceActor.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        profilePhoto: true,
      },
    })

    // Seslendirme ödemelerini hesapla (ContentRegistry'den)
    const voicePayments = await prisma.contentRegistry.findMany({
      where: {
        voicePrice: { gt: 0 },
        OR: [
          { voicePaid: false },
          { voicePaid: null },
        ],
      },
      select: {
        id: true,
        voiceActorId: true,
        streamerId: true,
        voicePrice: true,
        title: true,
      },
    })
    console.log(`[Payments Summary] Found ${voicePayments.length} unpaid voice works`)

    for (const va of voiceActors) {
      const vaPayments = voicePayments.filter(p => p.voiceActorId === va.id)
      const totalAmount = vaPayments.reduce((sum, p) => sum + (p.voicePrice || 0), 0)
      
      result.push({
        personId: va.id,
        personName: va.name,
        personType: 'voiceActor',
        profilePhoto: va.profilePhoto,
        totalAmount,
        itemCount: vaPayments.length,
      })
    }

    // 4. Tüm ekip üyelerini çek (video editörler)
    const teamMembers = await prisma.teamMember.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      },
    })

    // Kurgu ödemelerini hesapla
    const editPayments = await prisma.contentRegistry.findMany({
      where: {
        editPrice: { gt: 0 },
        OR: [
          { editPaid: false },
          { editPaid: null },
        ],
      },
      select: {
        id: true,
        editorId: true,
        editPrice: true,
        title: true,
      },
    })
    console.log(`[Payments Summary] Found ${editPayments.length} unpaid edit works`)

    for (const member of teamMembers) {
      const memberPayments = editPayments.filter(p => p.editorId === member.id)
      const totalAmount = memberPayments.reduce((sum, p) => sum + (p.editPrice || 0), 0)
      
      result.push({
        personId: member.id,
        personName: member.name,
        personType: 'teamMember',
        profilePhoto: null,
        totalAmount,
        itemCount: memberPayments.length,
      })
    }

    // 5. Tüm içerik üreticilerini çek
    const creators = await prisma.contentCreator.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        profilePhoto: true,
      },
    })

    for (const creator of creators) {
      result.push({
        personId: creator.id,
        personName: creator.name,
        personType: 'contentCreator',
        profilePhoto: creator.profilePhoto,
        totalAmount: 0,
        itemCount: 0,
      })
    }

    // Borcu en çok olan üstte olacak şekilde sırala
    result.sort((a, b) => b.totalAmount - a.totalAmount)

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error, 'GET /api/payments/summary')
  }
}

