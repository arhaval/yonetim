import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { handleApiError } from '@/lib/api-error-handler'

// Cache'i kapat - her zaman fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
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
      },
      where: {
        isActive: true,
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: offset,
    })
    
    const total = await prisma.teamMember.count({
      where: { isActive: true },
    })
    
    return NextResponse.json(members, {
      headers: {
        'X-Total-Count': total.toString(),
        'X-Limit': limit.toString(),
        'X-Offset': offset.toString(),
      },
    })
  } catch (error) {
    return handleApiError(error, 'GET /api/team')
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
  } catch (error) {
    return handleApiError(error, 'POST /api/team')
  }
}





