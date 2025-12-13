import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const creatorId = cookieStore.get('creator-id')?.value

    if (!creatorId) {
      return NextResponse.json({ creator: null })
    }

    const creator = await prisma.contentCreator.findUnique({
      where: { id: creatorId },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        platform: true,
        channelUrl: true,
        isActive: true,
      },
    })

    if (!creator || !creator.isActive) {
      return NextResponse.json({ creator: null })
    }

    return NextResponse.json({ creator })
  } catch (error) {
    console.error('Error fetching creator:', error)
    return NextResponse.json({ creator: null })
  }
}



