import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const streamerId = cookieStore.get('streamer-id')?.value

    if (!streamerId) {
      return NextResponse.json({ streamer: null })
    }

    const streamer = await prisma.streamer.findUnique({
      where: { id: streamerId },
      select: {
        id: true,
        email: true,
        name: true,
        profilePhoto: true,
        isActive: true,
      },
    })

    if (!streamer || !streamer.isActive) {
      return NextResponse.json({ streamer: null })
    }

    return NextResponse.json({ streamer })
  } catch (error) {
    return NextResponse.json({ streamer: null })
  }
}



















