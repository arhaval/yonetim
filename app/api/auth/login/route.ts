import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, getUserByEmail } from '@/lib/auth'
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

    try {
      const user = await getUserByEmail(normalizedEmail)
      
      if (!user) {
        return NextResponse.json(
          { error: 'Geçersiz email veya şifre' },
          { status: 401 }
        )
      }

      if (!user.password) {
        console.error('User has no password:', user.email)
        return NextResponse.json(
          { error: 'Kullanıcı şifresi bulunamadı' },
          { status: 500 }
        )
      }

      const isValid = await verifyPassword(password, user.password)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Geçersiz email veya şifre' },
          { status: 401 }
        )
      }

      // Basit session yönetimi (production'da JWT kullanılmalı)
      const cookieStore = await cookies()
      cookieStore.set('user-id', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 gün
      })

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      })
    } catch (dbError: any) {
      console.error('Database error in login:', dbError)
      return NextResponse.json(
        { error: 'Veritabanı hatası: ' + (dbError.message || 'Bilinmeyen hata') },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu: ' + (error.message || 'Bilinmeyen hata') },
      { status: 500 }
    )
  }
}









