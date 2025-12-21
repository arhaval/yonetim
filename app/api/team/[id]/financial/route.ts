import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamMemberId = params.id
    
    const financialRecords = await prisma.financialRecord.findMany({
      where: { teamMemberId },
      orderBy: { date: 'desc' },
    })

    console.log(`[Financial API] Team member ${teamMemberId}: Found ${financialRecords.length} financial records`)
    
    return NextResponse.json({ financialRecords })
  } catch (error) {
    console.error('Error fetching financial records:', error)
    return NextResponse.json(
      { error: 'Finansal kayıtlar getirilemedi' },
      { status: 500 }
    )
  }
}

