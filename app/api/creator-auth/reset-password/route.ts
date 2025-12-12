import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { cookies } from 'next/headers'

// Admin için: İçerik üreticisi şifresini sıfırla/güncelle
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    // Admin kontrolü
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      )
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gereklidir' },
        { status: 400 }
      )
    }

    // Email'i normalize et
    const normalizedEmail = email.toLowerCase().trim()

    // İçerik üreticisini bul
    const creator = await prisma.contentCreator.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive',
        },
      },
    })

    if (!creator) {
      // Tüm creator'ları listele
      const allCreators = await prisma.contentCreator.findMany({
        select: { email: true, name: true },
      })
      return NextResponse.json(
        { 
          error: 'İçerik üreticisi bulunamadı',
          availableCreators: allCreators.map(c => ({ email: c.email, name: c.name }))
        },
        { status: 404 }
      )
    }

    // Şifreyi hash'le ve güncelle
    const hashedPassword = await hashPassword(password)
    await prisma.contentCreator.update({
      where: { id: creator.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({
      message: 'Şifre başarıyla güncellendi',
      creator: {
        id: creator.id,
        email: creator.email,
        name: creator.name,
      },
    })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: error.message || 'Şifre güncellenemedi' },
      { status: 500 }
    )
  }
}

