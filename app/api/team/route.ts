import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function GET() {
  try {
    const members = await prisma.teamMember.findMany({
      include: {
        _count: {
          select: {
            tasks: true,
            payments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Ekip üyeleri getirilemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Şifre varsa hash'le
    let hashedPassword = null
    if (data.password && data.password.trim()) {
      hashedPassword = await hashPassword(data.password)
    }

    // Email'i normalize et (küçük harfe çevir ve trim yap)
    const normalizedEmail = data.email ? data.email.toLowerCase().trim() : null

    const member = await prisma.teamMember.create({
      data: {
        name: data.name,
        email: normalizedEmail,
        password: hashedPassword,
        phone: data.phone || null,
        iban: data.iban || null,
        role: data.role,
        baseSalary: data.baseSalary || 0,
        notes: data.notes || null,
      },
    })
    
    // Şifreyi response'dan çıkar
    const { password, ...memberWithoutPassword } = member
    return NextResponse.json(memberWithoutPassword)
  } catch (error: any) {
    console.error('Error creating team member:', error)
    
    // Email unique constraint hatası
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanılıyor' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Ekip üyesi oluşturulamadı' },
      { status: 500 }
    )
  }
}





