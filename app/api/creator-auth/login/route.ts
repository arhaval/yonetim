import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, getContentCreatorByEmail } from '@/lib/auth'
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

    // Email'i normalize et
    const normalizedEmail = email.toLowerCase().trim()
    console.log('Login attempt for email:', normalizedEmail)
    
    const creator = await getContentCreatorByEmail(normalizedEmail)
    console.log('Creator found:', creator ? `Yes - ${creator.name}` : 'No')
    
    if (!creator) {
      // Tüm creator'ları listele (debug için)
      const { prisma } = await import('@/lib/prisma')
      const allCreators = await prisma.contentCreator.findMany({
        select: { email: true, name: true },
      })
      console.log('All creators in DB:', allCreators.map(c => ({ email: c.email, name: c.name })))
      
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      )
    }

    console.log('Creator isActive:', creator.isActive)
    console.log('Creator has password:', !!creator.password)
    
    if (!creator.password) {
      return NextResponse.json(
        { error: 'Bu içerik üreticisi için şifre ayarlanmamış. Lütfen admin ile iletişime geçin.' },
        { status: 401 }
      )
    }

    if (!creator.isActive) {
      return NextResponse.json(
        { error: 'Hesabınız aktif değil. Lütfen admin ile iletişime geçin.' },
        { status: 403 }
      )
    }

    const isValid = await verifyPassword(password, creator.password)
    console.log('Password valid:', isValid)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      )
    }

    // Session yönetimi
    const cookieStore = await cookies()
    cookieStore.set('creator-id', creator.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 gün
      path: '/',
    })
    
    console.log('Cookie set for creator:', creator.id)
    console.log('Cookie value:', cookieStore.get('creator-id')?.value)

    const response = NextResponse.json({
      creator: {
        id: creator.id,
        email: creator.email,
        name: creator.name,
      },
    })
    
    // Response'a da cookie ekle (bazı durumlarda gerekli)
    response.cookies.set('creator-id', creator.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Content creator login error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}



