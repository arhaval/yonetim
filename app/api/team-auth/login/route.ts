import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, getTeamMemberByEmail } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gereklidir' },
        { status: 400 }
      )
    }

    // Email'i normalize et (küçük harfe çevir ve trim yap)
    const normalizedEmail = email.toLowerCase().trim()

    // Önce normalize edilmiş email ile ara
    let member = await getTeamMemberByEmail(normalizedEmail)
    
    // Bulunamazsa, case-insensitive arama yap (SQLite için)
    if (!member) {
      const { prisma } = await import('@/lib/prisma')
      const allMembers = await prisma.teamMember.findMany({
        where: {
          email: { not: null },
        },
      })
      member = allMembers.find(m => m.email?.toLowerCase().trim() === normalizedEmail) || null
    }
    
    console.log('Login attempt:', {
      email: normalizedEmail,
      memberFound: !!member,
      hasPassword: !!member?.password,
      isActive: member?.isActive,
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Bu email adresi ile kayıtlı ekip üyesi bulunamadı' },
        { status: 401 }
      )
    }

    if (!member.password) {
      return NextResponse.json(
        { error: 'Bu ekip üyesi için şifre belirlenmemiş. Lütfen admin ile iletişime geçin.' },
        { status: 401 }
      )
    }

    if (!member.isActive) {
      return NextResponse.json(
        { error: 'Hesabınız aktif değil. Lütfen admin ile iletişime geçin.' },
        { status: 403 }
      )
    }

    const isValid = await verifyPassword(password, member.password)
    
    console.log('Password verification:', {
      isValid,
      memberId: member.id,
    })

    if (!isValid) {
      return NextResponse.json(
        { error: 'Şifre hatalı. Lütfen tekrar deneyin.' },
        { status: 401 }
      )
    }

    const cookieStore = await cookies()
    cookieStore.set('team-member-id', member.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 gün
    })

    return NextResponse.json({
      member: {
        id: member.id,
        email: member.email,
        name: member.name,
        role: member.role,
      },
    })
  } catch (error: any) {
    console.error('Team member login error:', error)
    return NextResponse.json(
      { error: `Bir hata oluştu: ${error.message || 'Bilinmeyen hata'}` },
      { status: 500 }
    )
  }
}

