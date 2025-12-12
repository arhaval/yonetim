import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getContentCreatorByEmail, verifyPassword } from '@/lib/auth'

// Test endpoint - Creator login'i test et
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gereklidir' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    
    // Tüm creator'ları listele
    const allCreators = await prisma.contentCreator.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        isActive: true,
      },
    })

    // Creator'ı bul
    const creator = await getContentCreatorByEmail(normalizedEmail)

    const result = {
      searchedEmail: normalizedEmail,
      creatorFound: !!creator,
      allCreators: allCreators.map(c => ({
        email: c.email,
        name: c.name,
        isActive: c.isActive,
        hasPassword: !!c.password,
        emailMatches: c.email?.toLowerCase().trim() === normalizedEmail,
      })),
    }

    if (creator) {
      result.creator = {
        id: creator.id,
        email: creator.email,
        name: creator.name,
        isActive: creator.isActive,
        hasPassword: !!creator.password,
      }

      if (creator.password) {
        const isValid = await verifyPassword(password, creator.password)
        result.passwordValid = isValid
      } else {
        result.passwordValid = false
        result.error = 'Creator has no password'
      }
    } else {
      result.error = 'Creator not found'
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Test login error:', error)
    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

