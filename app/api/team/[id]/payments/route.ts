import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payments = await prisma.teamPayment.findMany({
      where: { teamMemberId: params.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Ödemeler getirilemedi' },
      { status: 500 }
    )
  }
}











