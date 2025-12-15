import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, getVoiceActorByEmail } from '@/lib/auth'
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
    let voiceActor = await getVoiceActorByEmail(normalizedEmail)
    
    // Bulunamazsa, case-insensitive arama yap (PostgreSQL için)
    if (!voiceActor) {
      const { prisma } = await import('@/lib/prisma')
      const allVoiceActors = await prisma.voiceActor.findMany({
        where: {
          email: { not: null },
        },
      })
      voiceActor = allVoiceActors.find(va => va.email?.toLowerCase().trim() === normalizedEmail) || null
    }

    console.log('Voice actor login attempt:', {
      email: normalizedEmail,
      voiceActorFound: !!voiceActor,
      hasPassword: !!voiceActor?.password,
      isActive: voiceActor?.isActive,
    })

    if (!voiceActor) {
      return NextResponse.json(
        { error: 'Bu email adresi ile kayıtlı seslendirmen bulunamadı' },
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
    
    console.log('Password verification:', {
      isValid,
      voiceActorId: voiceActor.id,
    })

    if (!isValid) {
      return NextResponse.json(
        { error: 'Şifre hatalı. Lütfen tekrar deneyin.' },
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
    })

    return NextResponse.json({
      voiceActor: {
        id: voiceActor.id,
        email: voiceActor.email,
        name: voiceActor.name,
      },
    })
  } catch (error: any) {
    console.error('Voice actor login error:', error)
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



