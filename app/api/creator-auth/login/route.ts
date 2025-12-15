import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, getContentCreatorByEmail } from '@/lib/auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

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
    let creator = await getContentCreatorByEmail(normalizedEmail)
    
    // Bulunamazsa, case-insensitive arama yap (PostgreSQL için)
    if (!creator) {
      const { prisma } = await import('@/lib/prisma')
      const allCreators = await prisma.contentCreator.findMany({
        where: {
          email: { not: null },
        },
      })
      creator = allCreators.find(c => c.email?.toLowerCase().trim() === normalizedEmail) || null
    }

    console.log('Creator login attempt:', {
      email: normalizedEmail,
      creatorFound: !!creator,
      hasPassword: !!creator?.password,
      isActive: creator?.isActive,
    })

    if (!creator) {
      // Debug: Tüm creator'ları listele
      const { prisma } = await import('@/lib/prisma')
      const allCreators = await prisma.contentCreator.findMany({
        select: { email: true, name: true, password: true, isActive: true },
      })
      
      console.log('Creator not found. All creators:', allCreators.map(c => ({
        email: c.email,
        normalized: c.email?.toLowerCase().trim(),
        searched: normalizedEmail,
        matches: c.email?.toLowerCase().trim() === normalizedEmail
      })))
      
      return NextResponse.json(
        { 
          error: 'Bu email adresi ile kayıtlı içerik üreticisi bulunamadı',
          debug: process.env.NODE_ENV === 'development' ? {
            searchedEmail: normalizedEmail,
            totalCreators: allCreators.length,
            creatorsWithEmail: allCreators.filter(c => c.email).map(c => ({
              email: c.email,
              normalized: c.email?.toLowerCase().trim(),
              matches: c.email?.toLowerCase().trim() === normalizedEmail
            }))
          } : undefined
        },
        { status: 401 }
      )
    }

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
    
    console.log('Password verification:', {
      isValid,
      creatorId: creator.id,
    })

    if (!isValid) {
      return NextResponse.json(
        { error: 'Şifre hatalı. Lütfen tekrar deneyin.' },
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
    })

    return NextResponse.json({
      creator: {
        id: creator.id,
        email: creator.email,
        name: creator.name,
      },
    })
  } catch (error: any) {
    console.error('Content creator login error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })
    return NextResponse.json(
      { 
        error: `Bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}



