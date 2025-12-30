import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Params'ı resolve et (Next.js App Router'da Promise olabilir)
    const resolvedParams = await Promise.resolve(params)
    let teamMemberId = resolvedParams.id
    
    // Authentication kontrolü - ekip üyesi sadece kendi kayıtlarını görebilmeli
    const cookieStore = await cookies()
    const cookieMemberId = cookieStore.get('team-member-id')?.value
    
    // Eğer cookie'de team-member-id varsa, onu kullan (ekip üyesi login olmuş)
    if (cookieMemberId) {
      teamMemberId = cookieMemberId
    }
    
    // Önce bu teamMemberId ile kayıtları kontrol et
    const financialRecords = await prisma.financialRecord.findMany({
      where: { 
        teamMemberId: teamMemberId 
      },
      orderBy: { date: 'asc' }, // Eski → Yeni sıralama
    })

    console.log(`[Financial API] Team member ${teamMemberId}: Found ${financialRecords.length} financial records`)
    console.log(`[Financial API] Sample records:`, financialRecords.slice(0, 3).map(r => ({
      id: r.id,
      type: r.type,
      category: r.category,
      amount: r.amount,
      teamMemberId: r.teamMemberId,
      date: r.date,
    })))
    
    // Eğer kayıt bulunamazsa, tüm finansal kayıtları kontrol et (debug için)
    if (financialRecords.length === 0) {
      const allRecords = await prisma.financialRecord.findMany({
        where: {},
        select: {
          id: true,
          teamMemberId: true,
          type: true,
          category: true,
          amount: true,
          date: true,
        },
        take: 20,
        orderBy: { date: 'asc' }, // Eski → Yeni sıralama
      })
      console.log(`[Financial API] Debug: Total financial records in DB:`, allRecords.length)
      console.log(`[Financial API] Debug: Records with teamMemberId:`, allRecords.filter(r => r.teamMemberId))
      console.log(`[Financial API] Debug: Looking for teamMemberId: "${teamMemberId}"`)
      console.log(`[Financial API] Debug: Matching records:`, allRecords.filter(r => r.teamMemberId === teamMemberId))
      
      // Ayrıca bu teamMemberId'nin var olup olmadığını kontrol et
      const memberExists = await prisma.teamMember.findUnique({
        where: { id: teamMemberId },
        select: { id: true, name: true },
      })
      console.log(`[Financial API] Debug: Team member exists:`, memberExists)
    }
    
    return NextResponse.json({ financialRecords })
  } catch (error: any) {
    console.error('Error fetching financial records:', error)
    return NextResponse.json(
      { error: 'Finansal kayıtlar getirilemedi', details: error.message },
      { status: 500 }
    )
  }
}

