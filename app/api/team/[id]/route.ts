import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Ekip üyesi güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const data = await request.json()

    // Ekip üyesini bul
    const member = await prisma.teamMember.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Ekip üyesi bulunamadı' },
        { status: 404 }
      )
    }

    // Şifre varsa hash'le
    let hashedPassword = member.password
    if (data.password && data.password.trim()) {
      hashedPassword = await hashPassword(data.password.trim())
    }

    // Email'i normalize et
    const normalizedEmail = data.email ? data.email.toLowerCase().trim() : member.email

    // Güncelle
    const updated = await prisma.teamMember.update({
      where: { id: resolvedParams.id },
      data: {
        name: data.name || member.name,
        avatar: data.avatar !== undefined ? data.avatar : member.avatar,
        email: normalizedEmail,
        password: hashedPassword,
        phone: data.phone !== undefined ? data.phone : member.phone,
        iban: data.iban !== undefined ? data.iban : member.iban,
        role: data.role || member.role,
        baseSalary: data.baseSalary !== undefined ? parseFloat(data.baseSalary) : member.baseSalary,
        notes: data.notes !== undefined ? data.notes : member.notes,
      },
    })

    const { password, ...memberWithoutPassword } = updated
    return NextResponse.json(memberWithoutPassword)
  } catch (error: any) {
    console.error('Error updating team member:', error)
    return NextResponse.json(
      { error: `Ekip üyesi güncellenemedi: ${error.message}` },
      { status: 500 }
    )
  }
}

// Ekip üyesi sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    
    // Ekip üyesini bul
    const member = await prisma.teamMember.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Ekip üyesi bulunamadı' },
        { status: 404 }
      )
    }
    
    // Ekip üyesini sil (ilişkili görevler ve ödemeler cascade ile silinecek)
    await prisma.teamMember.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({
      message: 'Ekip üyesi başarıyla silindi',
    })
  } catch (error: any) {
    console.error('Error deleting team member:', error)
    return NextResponse.json(
      { error: `Ekip üyesi silinemedi: ${error.message}` },
      { status: 500 }
    )
  }
}
