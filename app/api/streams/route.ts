import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-error-handler'

// Cache'i kapat - her zaman fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const streams = await prisma.stream.findMany({
      select: {
        id: true,
        date: true,
        duration: true,
        matchInfo: true,
        teamName: true,
        totalRevenue: true,
        streamerEarning: true,
        paymentStatus: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        streamer: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 200,
    })
    
    return NextResponse.json(streams)
  } catch (error) {
    return handleApiError(error, 'GET /api/streams')
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const stream = await prisma.stream.create({
      data: {
        streamerId: data.streamerId,
        date: new Date(data.date),
        duration: data.duration,
        matchInfo: data.matchInfo || null,
        teamName: data.teamName || null,
        totalRevenue: data.totalRevenue || 0,
        streamerEarning: data.streamerEarning || 0,
        arhavalProfit: data.arhavalProfit || 0,
        teams: data.teams || null,
        cost: data.cost || 0,
        notes: data.notes || null,
        status: 'approved',
      },
    })

    return NextResponse.json(stream)
  } catch (error) {
    return handleApiError(error, 'POST /api/streams')
  }
}

