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
    const teamMemberId = resolvedParams.id
    
    // Authentication kontrolü - ekip üyesi sadece kendi kayıtlarını görebilmeli
    const cookieStore = await cookies()
    const loginToken = cookieStore.get('team-login-token')?.value
    
    if (loginToken) {
      // Ekip üyesi login olmuş, kendi kayıtlarını kontrol et
      const teamMember = await prisma.teamMember.findUnique({
        where: { loginToken },
        select: { id: true },
      })
      
      if (teamMember && teamMember.id !== teamMemberId) {
        // Farklı bir ekip üyesinin kayıtlarını görmeye çalışıyor
        return NextResponse.json(
          { error: 'Bu kayıtlara erişim yetkiniz yok' },
          { status: 403 }
        )
      }
    }
    
    const financialRecords = await prisma.financialRecord.findMany({
      where: { teamMemberId },
      orderBy: { date: 'desc' },
    })

    console.log(`[Financial API] Team member ${teamMemberId}: Found ${financialRecords.length} financial records`)
    
    return NextResponse.json({ financialRecords })
  } catch (error: any) {
    console.error('Error fetching financial records:', error)
    return NextResponse.json(
      { error: 'Finansal kayıtlar getirilemedi', details: error.message },
      { status: 500 }
    )
  }
}

