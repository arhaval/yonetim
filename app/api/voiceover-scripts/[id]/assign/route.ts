import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Seslendirmen işi üstlenir (voiceActorId'yi currentUserId yapar)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const scriptId = resolvedParams.id
    
    const cookieStore = await cookies()
    const voiceActorId = cookieStore.get('voice-actor-id')?.value

    // Auth: login zorunlu, role fark etmiyor (seslendiren üstlenebilsin)
    if (!voiceActorId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    // Metni kontrol et
    const script = await prisma.voiceoverScript.findUnique({
      where: { id: scriptId },
      include: {
        voiceActor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!script) {
      return NextResponse.json(
        { error: 'Metin bulunamadı' },
        { status: 404 }
      )
    }

    // Conflict kontrolü: Eğer zaten başka birine atanmışsa 409 dön
    if (script.voiceActorId && script.voiceActorId !== voiceActorId) {
      return NextResponse.json(
        { error: 'Bu iş başka birine atanmış' },
        { status: 409 }
      )
    }

    // Zaten kendisine atanmışsa başarılı dön
    if (script.voiceActorId === voiceActorId) {
      return NextResponse.json({
        message: 'İş üstlenildi',
        script: {
          ...script,
          voiceActor: script.voiceActor,
        },
      })
    }

    // voiceActorId'yi currentUserId yap
    const updatedScript = await prisma.voiceoverScript.update({
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
      message: 'İş üstlenildi',
      script: updatedScript,
    })
  } catch (error: any) {
    console.error('Error assigning script:', error)
    return NextResponse.json(
      { error: error.message || 'Metin atanamadı' },
      { status: 500 }
    )
  }
}

