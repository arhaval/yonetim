import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Debug endpoint - Sadece development için
 * Email ile ekip üyesi bilgilerini kontrol eder (şifre hariç)
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email parametresi gerekli' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Tüm team memberları listele
    const allMembers = await prisma.teamMember.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        hasPassword: true, // SQL'de password IS NOT NULL kontrolü
        isActive: true,
      },
    })

    // Email ile arama
    const member = await prisma.teamMember.findFirst({
      where: {
        email: normalizedEmail,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        password: true, // Debug için şifre varlığını kontrol et
      },
    })

    return NextResponse.json({
      searchedEmail: normalizedEmail,
      member: member ? {
        id: member.id,
        name: member.name,
        email: member.email,
        isActive: member.isActive,
        hasPassword: !!member.password,
      } : null,
      allMembers: allMembers.map(m => ({
        id: m.id,
        name: m.name,
        email: m.email,
        isActive: m.isActive,
      })),
    })
  } catch (error: any) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: `Hata: ${error.message}` },
      { status: 500 }
    )
  }
}


