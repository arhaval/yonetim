import { NextRequest, NextResponse } from 'next/server'
// Diğer yardımcı fonksiyonları da buraya ekledik:
import { 
  verifyPassword, 
  getUserByEmail, 
  getStreamerByEmail, 
  getContentCreatorByEmail, 
  getVoiceActorByEmail, 
  getTeamMemberByEmail 
} from '@/lib/auth'
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

    // Email'i normalize et
    const normalizedEmail = email.toLowerCase().trim()

    let account = null
    let role = ''
    let type = ''
    let checkActive = false

    // 1. ADIM: Admin/User Kontrolü
    const user = await getUserByEmail(normalizedEmail)
    if (user) {
      // Admin login için sadece admin@arhaval.com email'i kabul edilir
      if (normalizedEmail === 'admin@arhaval.com') {
        // Admin email kontrolü - sadece admin role'üne sahip olmalı
        if (user.role !== 'admin' && user.role !== 'ADMIN') {
          return NextResponse.json(
            { error: 'Bu email adresi admin yetkisine sahip değil' },
            { status: 403 }
          )
        }
        account = user
        role = user.role
        type = 'user'
        checkActive = false
      } else {
        // Normal kullanıcılar için (ekip üyeleri) - admin olmayanlar da giriş yapabilir
        account = user
        role = user.role
        type = 'user'
        checkActive = false
      }
    }

    // 2. ADIM: Eğer Admin değilse, Yayıncı mı diye bak
    if (!account) {
      const streamer = await getStreamerByEmail(normalizedEmail)
      if (streamer) {
        account = streamer
        role = 'STREAMER'
        type = 'streamer'
        checkActive = true // Yayıncı aktif mi diye bakılmalı
      }
    }

    // 3. ADIM: Creator mı diye bak
    if (!account) {
      const creator = await getContentCreatorByEmail(normalizedEmail)
      if (creator) {
        account = creator
        role = 'CONTENT_CREATOR'
        type = 'content-creator'
        checkActive = true
      }
    }

    // 4. ADIM: Seslendirmen mi diye bak
    if (!account) {
      const voiceActor = await getVoiceActorByEmail(normalizedEmail)
      if (voiceActor) {
        account = voiceActor
        role = 'VOICE_ACTOR'
        type = 'voice-actor'
        checkActive = true
      }
    }

    // 5. ADIM: Ekip Üyesi mi diye bak
    if (!account) {
      const teamMember = await getTeamMemberByEmail(normalizedEmail)
      if (teamMember) {
        account = teamMember
        role = teamMember.role || 'TEAM'
        type = 'team'
        checkActive = false // Ekip tablosunda isActive var mı bilmiyoruz, varsa true yap
      }
    }

    // --- KONTROLLER ---

    // Kimse bulunamadıysa
    if (!account) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      )
    }

    // Hesap Pasif mi? (Sadece checkActive true olanlar için)
    // @ts-ignore - TypeScript bazen dinamik tiplerde kızabilir, ama mantık doğru
    if (checkActive && account.isActive === false) {
      return NextResponse.json(
        { error: 'Hesabınız pasif durumdadır. Yönetici ile iletişime geçin.' },
        { status: 403 }
      )
    }

    // Şifre Var mı?
    if (!account.password) {
      console.error('Account has no password:', normalizedEmail)
      return NextResponse.json(
        { error: 'Hesap şifresi bulunamadı.' },
        { status: 500 }
      )
    }

    // Şifre Doğru mu?
    const isValid = await verifyPassword(password, account.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      )
    }

    // --- GİRİŞ BAŞARILI ---

    const cookieStore = await cookies()
    
    // User ID çerezi
    cookieStore.set('user-id', account.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 gün
    })

    // User Type çerezi (Bunu da ekledim ki sistem kimin girdiğini bilsin)
    cookieStore.set('user-type', type, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    // User Role çerezi (Admin kontrolü için)
    cookieStore.set('user-role', role.toLowerCase(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    return NextResponse.json({
      user: {
        id: account.id,
        email: account.email,
        name: account.name,
        role: role,
        type: type, // Frontend'e tip bilgisini de dönüyoruz
      },
    })

  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu: ' + (error.message || 'Bilinmeyen hata') },
      { status: 500 }
    )
  }
}