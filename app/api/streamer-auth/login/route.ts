import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, getStreamerByEmail } from '@/lib/auth'
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
    let streamer = await getStreamerByEmail(normalizedEmail)
    
    // Bulunamazsa, case-insensitive arama yap (SQLite için)
    if (!streamer) {
      const { prisma } = await import('@/lib/prisma')
      const allStreamers = await prisma.streamer.findMany({
        where: {
          email: { not: null },
        },
      })
      streamer = allStreamers.find(s => s.email?.toLowerCase().trim() === normalizedEmail) || null
    }

    console.log('Streamer login attempt:', {
      email: normalizedEmail,
      streamerFound: !!streamer,
      hasPassword: !!streamer?.password,
      isActive: streamer?.isActive,
    })

    if (!streamer) {
      return NextResponse.json(
        { error: 'Bu email adresi ile kayıtlı yayıncı bulunamadı' },
        { status: 401 }
      )
    }

    if (!streamer.password) {
      return NextResponse.json(
        { error: 'Bu yayıncı için şifre ayarlanmamış. Lütfen admin ile iletişime geçin.' },
        { status: 401 }
      )
    }

    if (!streamer.isActive) {
      return NextResponse.json(
        { error: 'Hesabınız aktif değil. Lütfen admin ile iletişime geçin.' },
        { status: 403 }
      )
    }

    const isValid = await verifyPassword(password, streamer.password)
    
    console.log('Password verification:', {
      isValid,
      streamerId: streamer.id,
    })

    if (!isValid) {
      return NextResponse.json(
        { error: 'Şifre hatalı. Lütfen tekrar deneyin.' },
        { status: 401 }
      )
    }

    // Session yönetimi
    const cookieStore = await cookies()
    cookieStore.set('streamer-id', streamer.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 gün
    })

    return NextResponse.json({
      streamer: {
        id: streamer.id,
        email: streamer.email,
        name: streamer.name,
      },
    })
  } catch (error: any) {
    console.error('Streamer login error:', error)
    return NextResponse.json(
      { error: `Bir hata oluştu: ${error.message || 'Bilinmeyen hata'}` },
      { status: 500 }
    )
  }
}


