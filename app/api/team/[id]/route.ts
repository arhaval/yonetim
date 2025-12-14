import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params)
    const data = await request.json()
    
    // Email ve şifre güncelleme
    const updateData: any = {}
    
    if (data.email !== undefined) {
      if (!data.email || !data.email.trim()) {
        return NextResponse.json(
          { error: 'Email boş olamaz' },
          { status: 400 }
        )
      }
      updateData.email = data.email.toLowerCase().trim()
    }
    
    if (data.password !== undefined && data.password.trim()) {
      updateData.password = await hashPassword(data.password.trim())
    }
    
    if (data.name !== undefined) {
      updateData.name = data.name
    }
    
    if (data.phone !== undefined) {
      updateData.phone = data.phone || null
    }
    
    if (data.iban !== undefined) {
      updateData.iban = data.iban || null
    }
    
    if (data.role !== undefined) {
      updateData.role = data.role
    }
    
    if (data.baseSalary !== undefined) {
      updateData.baseSalary = parseFloat(data.baseSalary) || 0
    }

    // Eğer güncellenecek bir şey yoksa hata döndür
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Güncellenecek bir alan belirtilmedi' },
        { status: 400 }
      )
    }

    const member = await prisma.teamMember.update({
      where: { id },
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
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Ekip üyesi bulunamadı' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Ekip üyesi güncellenemedi' },
      { status: 500 }
    )
  }
}
