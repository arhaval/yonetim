import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// İş gönderimlerini getir
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

    const submissions = await prisma.workSubmission.findMany({
      where: { status },
      include: {
        voiceActor: {
          select: { id: true, name: true },
        },
        teamMember: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error('Error fetching work submissions:', error)
    return NextResponse.json(
      { error: 'İşler getirilemedi' },
      { status: 500 }
    )
  }
}

// Yeni iş gönderimi oluştur
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const voiceActorId = cookieStore.get('voice-actor-id')?.value
    const teamMemberId = cookieStore.get('team-member-id')?.value

    if (!voiceActorId && !teamMemberId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { workType, workName, description } = body

    if (!workType || !workName) {
      return NextResponse.json(
        { error: 'İş tipi ve ismi gereklidir' },
        { status: 400 }
      )
    }

    const submitterData: any = {}
    if (voiceActorId) submitterData.voiceActorId = voiceActorId
    else if (teamMemberId) submitterData.teamMemberId = teamMemberId

    const workSubmission = await prisma.workSubmission.create({
      data: {
        ...submitterData,
        workType,
        workName,
        description: description || null,
        status: 'pending',
      },
    })

    return NextResponse.json({
      message: 'İş başarıyla gönderildi',
      submission: workSubmission,
    })
  } catch (error: any) {
    console.error('Error creating work submission:', error)
    return NextResponse.json(
      { error: error.message || 'İş gönderilemedi' },
      { status: 500 }
    )
  }
}

