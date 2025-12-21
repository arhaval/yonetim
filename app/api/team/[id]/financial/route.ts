import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const financialRecords = await prisma.financialRecord.findMany({
      where: { teamMemberId: params.id },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ financialRecords })
  } catch (error) {
    console.error('Error fetching financial records:', error)
    return NextResponse.json(
      { error: 'Finansal kayıtlar getirilemedi' },
      { status: 500 }
    )
  }
}

