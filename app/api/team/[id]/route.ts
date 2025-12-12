import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const member = await prisma.teamMember.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        iban: true,
        role: true,
        baseSalary: true,
        notes: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Ekip üyesi bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error fetching team member:', error)
    return NextResponse.json(
      { error: 'Ekip üyesi getirilemedi' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    // Şifre varsa hash'le
    let hashedPassword = undefined
    if (data.password && data.password.trim()) {
      hashedPassword = await hashPassword(data.password)
    }

    // Email'i normalize et (küçük harfe çevir ve trim yap)
    const normalizedEmail = data.email ? data.email.toLowerCase().trim() : null

    const updateData: any = {
      name: data.name,
      email: normalizedEmail,
      phone: data.phone || null,
      iban: data.iban || null,
      role: data.role,
      baseSalary: data.baseSalary || 0,
      notes: data.notes || null,
    }

    // Şifre varsa ekle
    if (hashedPassword) {
      updateData.password = hashedPassword
    }

    const member = await prisma.teamMember.update({
      where: { id: params.id },
      data: updateData,
    })

    // Şifreyi response'dan çıkar
    const { password, ...memberWithoutPassword } = member
    return NextResponse.json(memberWithoutPassword)
  } catch (error: any) {
    console.error('Error updating team member:', error)
    
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanılıyor' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Ekip üyesi güncellenemedi' },
      { status: 500 }
    )
  }
}

