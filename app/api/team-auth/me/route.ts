import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const memberId = cookieStore.get('team-member-id')?.value

    if (!memberId) {
      return NextResponse.json({ member: null })
    }

    const member = await prisma.teamMember.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        iban: true,
        baseSalary: true,
        isActive: true,
      },
    })

    if (!member || !member.isActive) {
      return NextResponse.json({ member: null })
    }

    return NextResponse.json({ member })
  } catch (error) {
    console.error('Error fetching team member:', error)
    return NextResponse.json({ member: null })
  }
}


