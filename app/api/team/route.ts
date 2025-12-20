import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

// Cache GET requests for 30 seconds
export const revalidate = 30

export async function GET() {
  try {
    const members = await prisma.teamMember.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        iban: true,
        role: true,
        baseSalary: true,
        isActive: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
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
  } catch (error: any) {
    console.error('❌ Error fetching team members:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    })
    // Hata durumunda boş array döndür ama detaylı log ekle
    return NextResponse.json([], { 
      status: 200,
      headers: {
        'X-Error': error.message || 'Unknown error'
      }
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Email ve şifre zorunlu
    if (!data.email || !data.email.trim()) {
      return NextResponse.json(
        { error: 'Email gereklidir' },
        { status: 400 }
      )
    }

    if (!data.password || !data.password.trim()) {
      return NextResponse.json(
        { error: 'Şifre gereklidir' },
        { status: 400 }
      )
    }
    
    // Şifre hash'le
    const hashedPassword = await hashPassword(data.password.trim())

    // Email'i normalize et (küçük harfe çevir ve trim yap)
    const normalizedEmail = data.email.toLowerCase().trim()

    const member = await prisma.teamMember.create({
      data: {
        name: data.name,
        // avatar kolonu veritabanında yok, kaldırıldı
        email: normalizedEmail,
        password: hashedPassword, // Artık zorunlu, null olamaz
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





