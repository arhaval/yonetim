import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cache GET requests for 10 seconds (ödemeler sık değişebilir)
export const revalidate = 10

export const dynamic = 'force-dynamic'

// Kişiye özel yayınlar ve içerikleri getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ personType: string; personId: string }> | { personType: string; personId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const { personType, personId } = resolvedParams

    console.log('[Payment Approval API] Request:', { personType, personId })

    if (!personType || !personId) {
      return NextResponse.json(
        { error: 'Kişi tipi ve ID gereklidir' },
        { status: 400 }
      )
    }

    const result: any = {
      personType,
      personId,
      streams: [],
      scripts: [],
      teamPayments: [],
      personInfo: null,
    }

    if (personType === 'streamer') {
      // Yayıncı bilgilerini getir
      const streamer = await prisma.streamer.findUnique({
        where: { id: personId },
        select: {
          id: true,
          name: true,
          profilePhoto: true,
          email: true,
        },
      })

      if (!streamer) {
        return NextResponse.json(
          { error: 'Yayıncı bulunamadı' },
          { status: 404 }
        )
      }

      result.personInfo = streamer

      // Onaylanmış ve ödenmemiş yayınları getir
      const streams = await prisma.stream.findMany({
        where: {
          streamerId: personId,
          status: 'approved',
          paymentStatus: { not: 'paid' }, // pending veya null olanlar
          streamerEarning: { gt: 0 },
        },
        orderBy: {
          date: 'desc',
        },
      })

      result.streams = streams.map(s => ({
        id: s.id,
        date: s.date,
        duration: s.duration,
        teamName: s.teamName,
        matchInfo: s.matchInfo,
        streamerEarning: s.streamerEarning,
        paymentStatus: s.paymentStatus || 'pending',
        notes: s.notes,
      }))

    } else if (personType === 'voiceActor') {
      // Seslendirmen bilgilerini getir
      const voiceActor = await prisma.voiceActor.findUnique({
        where: { id: personId },
        select: {
          id: true,
          name: true,
          profilePhoto: true,
          email: true,
        },
      })

      if (!voiceActor) {
        return NextResponse.json(
          { error: 'Seslendirmen bulunamadı' },
          { status: 404 }
        )
      }

      result.personInfo = voiceActor

      // Onaylanmış ve ödenmemiş seslendirme metinlerini getir
      const scripts = await prisma.voiceoverScript.findMany({
        where: {
          voiceActorId: personId,
          status: 'APPROVED', // Onaylanmış ama ödenmemiş
          price: { gt: 0 },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      result.scripts = scripts.map(s => ({
        id: s.id,
        title: s.title,
        price: s.price,
        status: s.status,
        createdAt: s.createdAt,
        notes: s.notes,
      }))

    } else if (personType === 'contentCreator') {
      // İçerik üreticisi bilgilerini getir
      const creator = await prisma.contentCreator.findUnique({
        where: { id: personId },
        select: {
          id: true,
          name: true,
          profilePhoto: true,
          email: true,
        },
      })

      if (!creator) {
        return NextResponse.json(
          { error: 'İçerik üreticisi bulunamadı' },
          { status: 404 }
        )
      }

      result.personInfo = creator

      // İçerik üreticisi için şu an için sadece seslendirme metinleri var
      // (Content modeli ödeme takibi için kullanılmıyor gibi görünüyor)
      const scripts = await prisma.voiceoverScript.findMany({
        where: {
          creatorId: personId,
          status: 'APPROVED',
          price: { gt: 0 },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      result.scripts = scripts.map(s => ({
        id: s.id,
        title: s.title,
        price: s.price,
        status: s.status,
        createdAt: s.createdAt,
        notes: s.notes,
      }))
    } else if (personType === 'teamMember') {
      console.log('[Payment Approval API] Fetching team member:', personId)
      
      // Ekip üyesi bilgilerini getir
      const teamMember = await prisma.teamMember.findUnique({
        where: { id: personId },
        select: {
          id: true,
          name: true,
          avatar: true,
          email: true,
          role: true,
        },
      })

      if (!teamMember) {
        console.error('[Payment Approval API] Team member not found:', personId)
        return NextResponse.json(
          { error: 'Ekip üyesi bulunamadı' },
          { status: 404 }
        )
      }

      console.log('[Payment Approval API] Team member found:', teamMember.name)

      result.personInfo = {
        id: teamMember.id,
        name: teamMember.name,
        profilePhoto: teamMember.avatar,
        email: teamMember.email,
        role: teamMember.role,
      }

      // Ödenmemiş ekip üyesi ödemelerini getir (paidAt null olanlar)
      const teamPayments = await prisma.teamPayment.findMany({
        where: {
          teamMemberId: personId,
          paidAt: null, // Ödenmemiş olanlar
          amount: { gt: 0 },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      console.log('[Payment Approval API] Found team payments:', teamPayments.length)

      result.teamPayments = teamPayments.map(tp => ({
        id: tp.id,
        amount: tp.amount,
        type: tp.type,
        period: tp.period,
        description: tp.description,
        createdAt: tp.createdAt,
      }))
    } else {
      return NextResponse.json(
        { error: 'Geçersiz kişi tipi' },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error fetching payment approval data:', error)
    return NextResponse.json(
      { error: error.message || 'Veri getirilemedi' },
      { status: 500 }
    )
  }
}

