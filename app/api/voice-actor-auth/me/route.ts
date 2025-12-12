import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const voiceActorId = cookieStore.get('voice-actor-id')?.value

    if (!voiceActorId) {
      return NextResponse.json({ voiceActor: null })
    }

    const voiceActor = await prisma.voiceActor.findUnique({
      where: { id: voiceActorId },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        isActive: true,
      },
    })

    return NextResponse.json({ voiceActor })
  } catch (error) {
    console.error('Error fetching voice actor:', error)
    return NextResponse.json({ voiceActor: null })
  }
}



