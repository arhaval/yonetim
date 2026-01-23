import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [
      userCount,
      streamerCount,
      streamCount,
      creatorCount,
      voiceActorCount,
      teamCount,
      streamers,
      streams,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.streamer.count(),
      prisma.stream.count(),
      prisma.contentCreator.count(),
      prisma.voiceActor.count(),
      prisma.teamMember.count(),
      prisma.streamer.findMany({
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          _count: {
            select: {
              streams: true,
            }
          }
        }
      }),
      prisma.stream.findMany({
        take: 10,
        select: {
          id: true,
          matchInfo: true,
          date: true,
          duration: true,
          streamerEarning: true,
          paymentStatus: true,
          streamer: {
            select: {
              name: true,
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      }),
    ])

    return NextResponse.json({
      counts: {
        users: userCount,
        streamers: streamerCount,
        streams: streamCount,
        creators: creatorCount,
        voiceActors: voiceActorCount,
        teamMembers: teamCount,
      },
      streamers,
      recentStreams: streams,
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}

