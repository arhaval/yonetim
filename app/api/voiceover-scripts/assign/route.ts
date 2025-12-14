import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Seslendirmene metin ata
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const voiceActorId = cookieStore.get('voice-actor-id')?.value

    if (!voiceActorId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const { scriptId } = await request.json()

    if (!scriptId) {
      return NextResponse.json(
        { error: 'Metin ID gereklidir' },
        { status: 400 }
      )
    }

    const script = await prisma.voiceoverScript.update({
      where: { id: scriptId },
      data: {
        voiceActorId,
      },
      include: {
        creator: {
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
      },
    })

    return NextResponse.json({
      message: 'Metin başarıyla size atandı',
      script,
    })
  } catch (error: any) {
    console.error('Error assigning script:', error)
    return NextResponse.json(
      { error: error.message || 'Metin atanamadı' },
      { status: 500 }
    )
  }
}







