import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, getVoiceActorByEmail } from '@/lib/auth'
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
    const voiceActor = await getVoiceActorByEmail(normalizedEmail)
    if (!voiceActor) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      )
    }

    if (!voiceActor.password) {
      return NextResponse.json(
        { error: 'Bu seslendirmen için şifre ayarlanmamış. Lütfen admin ile iletişime geçin.' },
        { status: 401 }
      )
    }

    if (!voiceActor.isActive) {
      return NextResponse.json(
        { error: 'Hesabınız aktif değil. Lütfen admin ile iletişime geçin.' },
        { status: 403 }
      )
    }

    const isValid = await verifyPassword(password, voiceActor.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      )
    }

    // Session yönetimi
    const cookieStore = await cookies()
    cookieStore.set('voice-actor-id', voiceActor.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 gün
      path: '/', // Cookie'nin tüm site genelinde geçerli olması için
    })

    const response = NextResponse.json({
      voiceActor: {
        id: voiceActor.id,
        email: voiceActor.email,
        name: voiceActor.name,
      },
    })
    
    // Response'a da cookie ekle (bazı durumlarda gerekli)
    response.cookies.set('voice-actor-id', voiceActor.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Voice actor login error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}



