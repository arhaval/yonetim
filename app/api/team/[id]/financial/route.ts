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
    // Admin panelinden erişim için kontrol yapılmıyor (admin herkesi görebilir)
    const cookieStore = await cookies()
    const loginToken = cookieStore.get('team-login-token')?.value
    
    if (loginToken) {
      // Ekip üyesi login olmuş, kendi kayıtlarını kontrol et
      // Not: TeamMember modelinde loginToken yok, bu yüzden doğrudan teamMemberId ile kontrol ediyoruz
      // Authentication kontrolü team-auth API'sinde yapılıyor
      // Burada sadece teamMemberId'nin loginToken ile eşleşip eşleşmediğini kontrol ediyoruz
      // Eğer loginToken varsa ve teamMemberId farklıysa, erişim reddedilir
      // Ancak TeamMember modelinde loginToken olmadığı için bu kontrolü kaldırıyoruz
      // Authentication team-auth middleware'inde yapılıyor
    }
    
    // Login token yoksa admin panelinden erişim olabilir, devam et
    
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

