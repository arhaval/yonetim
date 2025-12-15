import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const externalStream = await prisma.externalStream.create({
      data: {
        streamerId: data.streamerId,
        teamName: data.teamName,
        date: new Date(data.date),
        duration: data.duration,
        payment: data.payment,
        notes: data.notes || null,
      },
    })
    return NextResponse.json(externalStream)
  } catch (error) {
    console.error('Error creating external stream:', error)
    return NextResponse.json(
      { error: 'Dış yayın oluşturulamadı' },
      { status: 500 }
    )
  }
}











