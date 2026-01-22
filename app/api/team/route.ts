import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

// Cache GET requests for 30 seconds
export const revalidate = 30

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Sadece gereken alanları çek (ilişkileri çekme - N+1 önleme)
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
        // _count kaldırıldı - performans için
      },
      where: {
        isActive: true, // Sadece aktif üyeleri göster
      },
      orderBy: { createdAt: 'asc' }, // Eski → Yeni sıralama
      take: limit,
      skip: offset,
    })
    
    const total = await prisma.teamMember.count({
      where: { isActive: true },
    })
    
    const duration = Date.now() - startTime
    console.log(`[Team API] Fetched ${members.length} members in ${duration}ms (limit: ${limit}, offset: ${offset})`)
    
    return NextResponse.json(members, {
      headers: {
        'X-Total-Count': total.toString(),
        'X-Limit': limit.toString(),
        'X-Offset': offset.toString(),
      },
    })
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
        avatar: data.avatar || null,
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





